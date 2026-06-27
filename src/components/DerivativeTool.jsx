import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as Plotly from 'plotly.js-dist-min';
import { computeDerivative, getExpressionVariables, normalizeExpression, parseFunction } from './derivativeEngine';
import { generateTaylorSeries } from './taylorSeries';
import { buildCrossSectionData, buildSurfaceData, sampleExpression } from './graphUtils';
import './DerivativeTool.css';

const EXAMPLE_EXPRESSIONS = [
  { label: 'sin(x) + x²', value: 'sin(x) + x^2', note: 'Classic 1D Taylor example' },
  { label: 'sin(x)·cos(y)', value: 'sin(x) * cos(y)', note: 'Wave surface in x and y' },
  { label: 'x² + y²', value: 'x^2 + y^2', note: 'Paraboloid bowl' },
  { label: 'exp(−x²)', value: 'exp(-x^2)', note: 'Simple Gaussian curve' },
  { label: 'sin(x + y)', value: 'sin(x + y)', note: 'Diagonal ripples' },
];

const VIEW_MODES = [
  { id: '2d', label: '2D Curves' },
  { id: '3d', label: '3D Surface' },
  { id: 'contour', label: 'Contour Map' },
  { id: 'cross', label: 'Cross Sections' },
  { id: 'compare', label: 'Surface Comparison' },
];

const VARIABLE_OPTIONS = ['x', 'y', 'z', 't'];
const SURFACE_RANGE = [-5, 5];
const SURFACE_POINTS = 45;
const CURVE_RANGE = [-10, 10];
const CURVE_POINTS = 500;

const MODE_EXPLANATIONS = {
  '2d': 'The blue curve is f, green is the derivative f′, and red is the Taylor polynomial. Near the center point, a higher-degree Taylor polynomial hugs the original function more closely.',
  '3d': 'Each point on the surface shows z = f(x, y). Drag to rotate, scroll to zoom, and hover to read coordinates. Peaks and valleys reveal how the function changes in both directions.',
  contour: 'Contour lines connect points with equal height (level curves). Tighter spacing means a steeper slope. Colors show height — follow a single color band to stay at one level.',
  cross: 'Fixing y = c gives the slice z = f(x, c) (vary x). Fixing x = c gives z = f(c, y) (vary y). These curves show how the surface looks when you cut it with vertical planes.',
  compare: 'Blue is the true surface; red is the Taylor approximation in the active variable. The approximation is most accurate near the expansion center — watch the red surface peel away farther out.',
};

const IDLE_ASSISTANT = 'Hi, I’m TaylorX — your interactive instructor for derivatives, Taylor series, and multivariable surfaces. Pick an example or type your own function using mathjs syntax.';

function useDarkMode() {
  const [isDark, setIsDark] = useState(
    () => typeof document !== 'undefined' && document.documentElement.dataset.theme === 'dark',
  );

  useEffect(() => {
    const root = document.documentElement;
    const observer = new MutationObserver(() => {
      setIsDark(root.dataset.theme === 'dark');
    });
    observer.observe(root, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  return isDark;
}

function getPlotTheme(isDark) {
  return {
    text: isDark ? '#e2e8f0' : '#1e293b',
    grid: isDark ? '#334155' : '#e2e8f0',
    plotBg: isDark ? 'rgba(15,23,42,0.5)' : 'rgba(248,250,252,0.6)',
    paperBg: 'transparent',
  };
}

function getModeAssistant(mode, hasData, activeVariable, degree, otherVariables, scope) {
  if (!hasData) {
    const hints = {
      '2d': 'In 2D Curves mode I’ll plot f, f′, and the Taylor polynomial along the active variable.',
      '3d': 'In 3D Surface mode I’ll graph z = f(x, y). Try sin(x)*cos(y) or x^2 + y^2 after you compute.',
      contour: 'Contour Map mode shows level curves — great for spotting ridges and bowls in f(x, y).',
      cross: 'Cross Sections mode lets you slice the surface with sliders for x = const and y = const.',
      compare: 'Surface Comparison overlays the true surface with its Taylor approximation so you can see where they match.',
    };
    return hints[mode] || IDLE_ASSISTANT;
  }

  const scopeText = otherVariables.length > 0
    ? ` Other variables are held at ${otherVariables.map((v) => `${v} = ${scope[v]}`).join(', ')}.`
    : '';

  const assistants = {
    '2d': `2D view: blue is f, green is ∂/∂${activeVariable}, red is the degree-${degree} Taylor polynomial centered at ${activeVariable} = ${scope[activeVariable] ?? 'a'}.${scopeText} Increase the degree to tighten the fit near the center.`,
    '3d': `This is the graph of z = f(x, y). Rotate to see peaks and valleys, zoom into detail, and hover for coordinates. The surface shows how f changes in both x and y simultaneously.${scopeText}`,
    contour: `Each contour line is a level curve where f(x, y) is constant. Where lines are close together the surface is steep; where they spread out it is flatter. Trace one color band to follow a single height.${scopeText}`,
    cross: `Cross sections slice the surface: the blue curve fixes y and sweeps x; the green curve fixes x and sweeps y. Compare these slices to the 3D surface to build intuition for partial change.${scopeText}`,
    compare: `Blue is the original surface; red is the Taylor approximation in ${activeVariable} (degree ${degree}). They agree best near the expansion center — increase n or zoom in to see the match improve.${scopeText}`,
  };

  return assistants[mode] || IDLE_ASSISTANT;
}

function DerivativeTool() {
  const isDark = useDarkMode();
  const theme = useMemo(() => getPlotTheme(isDark), [isDark]);

  const [expression, setExpression] = useState('sin(x) + x^2');
  const [activeVariable, setActiveVariable] = useState('x');
  const [fixedValues, setFixedValues] = useState({ y: '0', z: '0', t: '0' });
  const [center, setCenter] = useState('0');
  const [degree, setDegree] = useState(3);
  const [viewMode, setViewMode] = useState('2d');
  const [crossSectionX, setCrossSectionX] = useState(0);
  const [crossSectionY, setCrossSectionY] = useState(0);
  const [error, setError] = useState('');
  const [isComputing, setIsComputing] = useState(false);
  const [assistantMessage, setAssistantMessage] = useState(IDLE_ASSISTANT);
  const [derivativeExpression, setDerivativeExpression] = useState('');
  const [taylorExpression, setTaylorExpression] = useState('');
  const [dataSets, setDataSets] = useState(null);
  const plotRef = useRef(null);

  const normalizedExpression = useMemo(() => normalizeExpression(expression), [expression]);

  const detectedVariables = useMemo(() => {
    try {
      return getExpressionVariables(normalizedExpression);
    } catch {
      return [];
    }
  }, [normalizedExpression]);

  useEffect(() => {
    if (detectedVariables.length > 0 && !detectedVariables.includes(activeVariable)) {
      setActiveVariable(detectedVariables[0]);
    }
  }, [detectedVariables, activeVariable]);

  const otherVariables = detectedVariables.filter((name) => name !== activeVariable);

  const validation = useMemo(() => {
    const trimmed = normalizedExpression.trim();
    if (!trimmed) {
      return { status: 'idle', message: 'Enter a function to get started.' };
    }

    try {
      parseFunction(trimmed, activeVariable);
      const scopeHint = otherVariables.length > 0
        ? ` Other variables (${otherVariables.join(', ')}) will be held at the values you set below.`
        : '';
      return {
        status: 'valid',
        message: `Looks good! Taylor series and derivative will be computed with respect to ${activeVariable}.${scopeHint}`,
      };
    } catch (caught) {
      return { status: 'invalid', message: caught.message };
    }
  }, [normalizedExpression, activeVariable, otherVariables]);

  const buildScope = useCallback(() => {
    const scope = {};
    otherVariables.forEach((name) => {
      const raw = fixedValues[name] ?? '0';
      const numeric = Number(String(raw).trim());
      if (!Number.isFinite(numeric)) {
        throw new Error(`Please enter a numeric value for ${name} (got "${raw}").`);
      }
      scope[name] = numeric;
    });
    return scope;
  }, [otherVariables, fixedValues]);

  const handleCompute = async () => {
    setError('');
    setIsComputing(true);

    try {
      const trimmedExpression = normalizedExpression.trim();
      const trimmedCenter = center.trim();
      const numericCenter = Number(trimmedCenter);

      if (trimmedExpression.length === 0) {
        throw new Error('Please enter a valid function expression.');
      }

      if (!Number.isFinite(numericCenter)) {
        throw new Error('Center point must be a finite number.');
      }

      parseFunction(trimmedExpression, activeVariable);
      const scope = buildScope();

      const derivative = computeDerivative(trimmedExpression, activeVariable);
      const taylor = generateTaylorSeries(trimmedExpression, numericCenter, degree, activeVariable, scope);

      const originalData = sampleExpression(trimmedExpression, CURVE_RANGE, CURVE_POINTS, activeVariable, scope);
      const derivativeData = sampleExpression(derivative, CURVE_RANGE, CURVE_POINTS, activeVariable, scope);
      const taylorData = sampleExpression(taylor, CURVE_RANGE, CURVE_POINTS, activeVariable, scope);

      const surfaceScope = { ...scope };
      const surfaceData = buildSurfaceData(
        trimmedExpression,
        SURFACE_RANGE,
        SURFACE_RANGE,
        SURFACE_POINTS,
        surfaceScope,
      );
      const taylorSurfaceData = buildSurfaceData(
        taylor,
        SURFACE_RANGE,
        SURFACE_RANGE,
        SURFACE_POINTS,
        surfaceScope,
      );

      setDerivativeExpression(derivative);
      setTaylorExpression(taylor);
      setDataSets({
        originalData,
        derivativeData,
        taylorData,
        surfaceData,
        taylorSurfaceData,
        scope,
        numericCenter,
        expression: trimmedExpression,
      });
    } catch (caught) {
      const message = caught.message || 'Unable to compute the requested visualization.';
      setError(message);
      setDataSets(null);
      setDerivativeExpression('');
      setTaylorExpression('');
      setAssistantMessage(
        `I found a problem: ${message} Tip: use lowercase function names with parentheses — sin(x), cos(x), exp(x) — and ^ for powers (x^2).`,
      );
    } finally {
      setIsComputing(false);
    }
  };

  useEffect(() => {
    if (!dataSets && !error && validation.status === 'idle') {
      setAssistantMessage(
        getModeAssistant(viewMode, false, activeVariable, degree, otherVariables, {}),
      );
    }
  }, [expression, center, degree, dataSets, error, validation.status, viewMode, activeVariable, otherVariables]);

  useEffect(() => {
    if (dataSets) {
      setAssistantMessage(
        getModeAssistant(viewMode, true, activeVariable, degree, otherVariables, dataSets.scope),
      );
    } else if (!error && validation.status !== 'invalid') {
      setAssistantMessage(getModeAssistant(viewMode, false, activeVariable, degree, otherVariables, {}));
    }
  }, [viewMode, dataSets, activeVariable, degree, otherVariables, error, validation.status]);

  const crossSectionAtY = useMemo(() => {
    if (!dataSets?.expression) {
      return null;
    }
    return buildCrossSectionData(dataSets.expression, {
      orientation: 'y',
      fixedValue: crossSectionY,
      range: SURFACE_RANGE,
      points: 200,
      scope: dataSets.scope,
    });
  }, [dataSets, crossSectionY]);

  const crossSectionAtX = useMemo(() => {
    if (!dataSets?.expression) {
      return null;
    }
    return buildCrossSectionData(dataSets.expression, {
      orientation: 'x',
      fixedValue: crossSectionX,
      range: SURFACE_RANGE,
      points: 200,
      scope: dataSets.scope,
    });
  }, [dataSets, crossSectionX]);

  const plotPayload = useMemo(() => {
    if (!dataSets) {
      return null;
    }

    const config = {
      responsive: true,
      displayModeBar: true,
      scrollZoom: true,
      displaylogo: false,
      modeBarButtonsToRemove: ['lasso2d', 'select2d'],
      doubleClick: 'reset',
    };

    if (viewMode === '2d') {
      return {
        traces: [
          {
            x: dataSets.originalData.xValues,
            y: dataSets.originalData.yValues,
            mode: 'lines',
            name: `f(${activeVariable})`,
            line: { color: '#2563eb', width: 3, shape: 'spline' },
            connectgaps: false,
          },
          {
            x: dataSets.derivativeData.xValues,
            y: dataSets.derivativeData.yValues,
            mode: 'lines',
            name: `f'(${activeVariable})`,
            line: { color: '#16a34a', width: 2, dash: 'dash', shape: 'spline' },
            connectgaps: false,
          },
          {
            x: dataSets.taylorData.xValues,
            y: dataSets.taylorData.yValues,
            mode: 'lines',
            name: `Taylor (n=${degree})`,
            line: { color: '#dc2626', width: 3, dash: 'dot', shape: 'spline' },
            connectgaps: false,
          },
        ],
        layout: {
          title: { text: `Derivative & Taylor Series in ${activeVariable}`, font: { size: 16, color: theme.text } },
          xaxis: { title: activeVariable, zeroline: true, gridcolor: theme.grid, color: theme.text },
          yaxis: { title: 'f', zeroline: true, gridcolor: theme.grid, color: theme.text },
          legend: { orientation: 'h', xanchor: 'center', x: 0.5, y: -0.18, font: { color: theme.text } },
          margin: { l: 50, r: 20, t: 60, b: 70 },
          hovermode: 'closest',
          plot_bgcolor: theme.plotBg,
          paper_bgcolor: theme.paperBg,
          font: { color: theme.text },
        },
        config,
      };
    }

    if (viewMode === '3d') {
      return {
        traces: [
          {
            type: 'surface',
            x: dataSets.surfaceData.xValues,
            y: dataSets.surfaceData.yValues,
            z: dataSets.surfaceData.zValues,
            colorscale: isDark
              ? [[0, '#1e3a5f'], [0.5, '#2563eb'], [1, '#93c5fd']]
              : [[0, '#dbeafe'], [0.5, '#2563eb'], [1, '#1e3a8a']],
            opacity: 0.95,
            name: 'f(x, y)',
            showscale: true,
            colorbar: { title: 'z', titleside: 'right', tickfont: { color: theme.text } },
            hovertemplate: 'x=%{x:.3f}<br>y=%{y:.3f}<br>z=%{z:.3f}<extra></extra>',
          },
        ],
        layout: {
          title: { text: 'Surface z = f(x, y)', font: { size: 16, color: theme.text } },
          scene: {
            xaxis: { title: 'x', gridcolor: theme.grid, color: theme.text },
            yaxis: { title: 'y', gridcolor: theme.grid, color: theme.text },
            zaxis: { title: 'z', gridcolor: theme.grid, color: theme.text },
            bgcolor: theme.plotBg,
          },
          margin: { l: 0, r: 0, t: 50, b: 0 },
          paper_bgcolor: theme.paperBg,
          font: { color: theme.text },
        },
        config,
      };
    }

    if (viewMode === 'contour') {
      return {
        traces: [
          {
            type: 'contour',
            x: dataSets.surfaceData.xValues,
            y: dataSets.surfaceData.yValues,
            z: dataSets.surfaceData.zValues,
            colorscale: isDark ? 'Viridis' : 'Blues',
            contours: { showlines: true, coloring: 'fill' },
            line: { width: 1, color: isDark ? '#e2e8f0' : '#1e293b' },
            colorbar: { title: 'f(x, y)', tickfont: { color: theme.text } },
            hovertemplate: 'x=%{x:.3f}<br>y=%{y:.3f}<br>f=%{z:.3f}<extra></extra>',
            name: 'Level curves',
          },
        ],
        layout: {
          title: { text: 'Contour Map — Level Curves of f(x, y)', font: { size: 16, color: theme.text } },
          xaxis: { title: 'x', zeroline: true, gridcolor: theme.grid, color: theme.text },
          yaxis: { title: 'y', zeroline: true, gridcolor: theme.grid, color: theme.text, scaleanchor: 'x' },
          legend: { font: { color: theme.text } },
          margin: { l: 50, r: 20, t: 60, b: 60 },
          hovermode: 'closest',
          plot_bgcolor: theme.plotBg,
          paper_bgcolor: theme.paperBg,
          font: { color: theme.text },
        },
        config,
      };
    }

    if (viewMode === 'cross') {
      if (!crossSectionAtY || !crossSectionAtX) {
        return null;
      }
      return {
        traces: [
          {
            x: crossSectionAtY.xValues,
            y: crossSectionAtY.yValues,
            mode: 'lines',
            name: `y = ${crossSectionY.toFixed(2)}`,
            line: { color: '#2563eb', width: 3 },
            connectgaps: false,
            hovertemplate: `${activeVariable}=%{x:.3f}<br>z=%{y:.3f}<extra></extra>`,
          },
          {
            x: crossSectionAtX.xValues,
            y: crossSectionAtX.yValues,
            mode: 'lines',
            name: `x = ${crossSectionX.toFixed(2)}`,
            line: { color: '#16a34a', width: 3 },
            connectgaps: false,
            hovertemplate: 'y=%{x:.3f}<br>z=%{y:.3f}<extra></extra>',
          },
        ],
        layout: {
          title: { text: 'Cross Sections', font: { size: 16, color: theme.text } },
          xaxis: { title: 'axis value', zeroline: true, gridcolor: theme.grid, color: theme.text },
          yaxis: { title: 'z = f(x, y)', zeroline: true, gridcolor: theme.grid, color: theme.text },
          legend: { orientation: 'h', xanchor: 'center', x: 0.5, y: -0.18, font: { color: theme.text } },
          margin: { l: 50, r: 20, t: 60, b: 70 },
          hovermode: 'closest',
          plot_bgcolor: theme.plotBg,
          paper_bgcolor: theme.paperBg,
          font: { color: theme.text },
        },
        config,
      };
    }

    if (viewMode === 'compare') {
      return {
        traces: [
          {
            type: 'surface',
            x: dataSets.surfaceData.xValues,
            y: dataSets.surfaceData.yValues,
            z: dataSets.surfaceData.zValues,
            colorscale: [[0, '#93c5fd'], [1, '#1d4ed8']],
            opacity: 0.75,
            name: 'Original f(x, y)',
            showscale: false,
            hovertemplate: 'Original<br>x=%{x:.3f}<br>y=%{y:.3f}<br>z=%{z:.3f}<extra></extra>',
          },
          {
            type: 'surface',
            x: dataSets.taylorSurfaceData.xValues,
            y: dataSets.taylorSurfaceData.yValues,
            z: dataSets.taylorSurfaceData.zValues,
            colorscale: [[0, '#fca5a5'], [1, '#dc2626']],
            opacity: 0.55,
            name: `Taylor (n=${degree})`,
            showscale: false,
            hovertemplate: 'Taylor<br>x=%{x:.3f}<br>y=%{y:.3f}<br>z=%{z:.3f}<extra></extra>',
          },
        ],
        layout: {
          title: { text: `Surface Comparison — f vs Taylor in ${activeVariable}`, font: { size: 16, color: theme.text } },
          scene: {
            xaxis: { title: 'x', gridcolor: theme.grid, color: theme.text },
            yaxis: { title: 'y', gridcolor: theme.grid, color: theme.text },
            zaxis: { title: 'z', gridcolor: theme.grid, color: theme.text },
            bgcolor: theme.plotBg,
          },
          legend: { font: { color: theme.text } },
          margin: { l: 0, r: 0, t: 50, b: 0 },
          paper_bgcolor: theme.paperBg,
          font: { color: theme.text },
        },
        config,
      };
    }

    return null;
  }, [
    dataSets,
    viewMode,
    activeVariable,
    degree,
    theme,
    isDark,
    crossSectionAtY,
    crossSectionAtX,
    crossSectionX,
    crossSectionY,
  ]);

  useEffect(() => {
    if (!plotRef.current) {
      return;
    }

    if (!plotPayload) {
      Plotly.purge(plotRef.current);
      return;
    }

    Plotly.react(plotRef.current, plotPayload.traces, plotPayload.layout, plotPayload.config);
  }, [plotPayload]);

  const applyExample = (example) => {
    setExpression(example.value);
    setError('');
    setDataSets(null);
    setDerivativeExpression('');
    setTaylorExpression('');
  };

  const updateFixedValue = (name, value) => {
    setFixedValues((prev) => ({ ...prev, [name]: value }));
  };

  const visualizationSubtitle = {
    '2d': 'Compare the original function, its derivative, and the Taylor approximation in one graph.',
    '3d': 'Explore the surface z = f(x, y) — rotate, zoom, and hover for coordinates.',
    contour: 'View level curves where f(x, y) is constant.',
    cross: 'Slice the surface by holding x or y constant and watch the curves update live.',
    compare: 'Overlay the original surface with its Taylor approximation.',
  };

  const placeholderContent = {
    '2d': 'Enter a function and click Compute to see f, f′, and the Taylor approximation.',
    '3d': 'Compute a function like sin(x)*cos(y) or x^2 + y^2 to explore its 3D surface.',
    contour: 'Compute a two-variable function to see its contour map and level curves.',
    cross: 'Compute a function, then use the sliders below to slice the surface at x = const and y = const.',
    compare: 'Compute to compare the true surface (blue) with the Taylor approximation (red).',
  };

  const showCrossSliders = viewMode === 'cross';

  return (
    <main className="derivative-tool">
      <section className="derivative-tool__hero">
        <div className="derivative-tool__hero-copy">
          <span className="derivative-tool__eyebrow">Taylor series made intuitive</span>
          <h1 className="derivative-tool__title">TaylorX</h1>
          <p className="derivative-tool__hero-tagline">
            Derivative &amp; Taylor series visualizer with interactive 2D curves, 3D surfaces, contours, and cross-sections.
          </p>
          <div className="derivative-tool__formula-grid">
            <div className="derivative-tool__formula-card">
              <div className="derivative-tool__formula-label">Derivative formula</div>
              <div className="derivative-tool__formula-text">f&apos;(x) = lim<sub>h→0</sub> [f(x + h) - f(x)] / h</div>
            </div>
            <div className="derivative-tool__formula-card">
              <div className="derivative-tool__formula-label">Taylor series formula</div>
              <div className="derivative-tool__formula-text">Tₙ(x) = Σ<sub>k=0</sub><sup>n</sup> f⁽ᵏ⁾(a) / k! · (x - a)ᵏ</div>
            </div>
          </div>
          <div className="derivative-tool__hero-notes">
            <span>Functions: sin, cos, tan, exp, log, ln, sqrt, abs</span>
            <span>Variables: x, y, z, t</span>
          </div>
        </div>

        <div className="derivative-tool__hero-card">
          <h2>How it works</h2>
          <p>
            Enter a function, choose the active variable, set the expansion center, and TaylorX will compute the symbolic derivative and Taylor polynomial for you.
          </p>
          <p>
            Switch between 2D curves, 3D surfaces, contour maps, cross-sections, and surface comparison to build deep intuition for multivariable calculus.
          </p>
        </div>
      </section>

      <section className="derivative-tool__examples-card">
        <div className="derivative-tool__examples-header">
          <div>
            <h2>Try an example</h2>
            <p>Load one of these sample functions instantly to see how TaylorX works.</p>
          </div>
        </div>
        <div className="derivative-tool__example-chips">
          {EXAMPLE_EXPRESSIONS.map((example) => (
            <button
              key={example.value}
              type="button"
              className={`derivative-tool__chip${expression === example.value ? ' derivative-tool__chip--active' : ''}`}
              onClick={() => applyExample(example)}
              title={example.note || example.value}
            >
              {example.label}
            </button>
          ))}
        </div>
        <div className="derivative-tool__syntax-card derivative-tool__syntax-card--inline">
          <div className="derivative-tool__syntax-card-title">Input guide</div>
          <ul className="derivative-tool__syntax-list">
            <li>Use parentheses for functions like sin(x) and sqrt(x).</li>
            <li>Use ^ for powers such as x^2 or y^3.</li>
            <li>Try simple two-variable examples such as sin(x) * cos(y).</li>
          </ul>
          <div className="derivative-tool__syntax-note">
            Supported functions: <strong>sin, cos, tan, exp, log, ln, sqrt, abs</strong>.
          </div>
        </div>
      </section>

      <section className="derivative-tool__controls">
        <div className="derivative-tool__controls-grid">
          <div className="derivative-tool__control-panel derivative-tool__control-panel--setup">
            <h2>Function setup</h2>
            <div className="derivative-tool__setup-form">
              <div className="derivative-tool__group">
                <label htmlFor="function-input">Function f</label>
                <input
                  id="function-input"
                  type="text"
                  value={expression}
                  onChange={(event) => setExpression(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      handleCompute();
                    }
                  }}
                  placeholder="e.g. sin(x) * cos(y)"
                  spellCheck={false}
                  autoComplete="off"
                />
                <small className="derivative-tool__hint">Supported variables: x, y, z, t.</small>
              </div>

              <div className="derivative-tool__group">
                <label htmlFor="variable-select">Active variable</label>
                <select
                  id="variable-select"
                  value={activeVariable}
                  onChange={(event) => setActiveVariable(event.target.value)}
                >
                  {VARIABLE_OPTIONS.map((name) => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
                <small className="derivative-tool__hint">Derivative and Taylor series use this variable.</small>
              </div>

              {otherVariables.length > 0 && (
                <div className="derivative-tool__group derivative-tool__group--fixed">
                  <h3>Fixed variables</h3>
                  {otherVariables.map((name) => (
                    <div key={name} className="derivative-tool__fixed-row">
                      <label htmlFor={`fixed-${name}`}>{name}</label>
                      <input
                        id={`fixed-${name}`}
                        type="text"
                        value={fixedValues[name] ?? '0'}
                        onChange={(event) => updateFixedValue(name, event.target.value)}
                        placeholder="0"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="derivative-tool__right-stack">
            <div className="derivative-tool__control-panel">
              <h2>Taylor settings</h2>

              <div className="derivative-tool__group">
                <label htmlFor="center-input">Center point a</label>
                <input
                  id="center-input"
                  type="text"
                  value={center}
                  onChange={(event) => setCenter(event.target.value)}
                  placeholder="0"
                />
              </div>

              <div className="derivative-tool__group">
                <div className="derivative-tool__slider-label">
                  <label htmlFor="degree-slider">Taylor degree n</label>
                  <span className="derivative-tool__degree-value">{degree}</span>
                </div>
                <input
                  id="degree-slider"
                  type="range"
                  min="1"
                  max="10"
                  value={degree}
                  onChange={(event) => setDegree(Number(event.target.value))}
                />
              </div>

              <button
                className={`derivative-tool__button${isComputing ? ' derivative-tool__button--loading' : ''}`}
                type="button"
                onClick={handleCompute}
                disabled={isComputing || validation.status === 'invalid'}
              >
                {isComputing ? 'Computing…' : 'Compute'}
              </button>
            </div>

          </div>
        </div>
      </section>

      {error && <div className="derivative-tool__error">{error}</div>}

      <section className="derivative-tool__workspace">
        <article className={`derivative-tool__visual-box${dataSets ? ' derivative-tool__visual-box--active' : ''}`}>
          <div className="derivative-tool__box-header">
            <h2 className="derivative-tool__box-title">Visualization</h2>
            <p>{visualizationSubtitle[viewMode]}</p>
          </div>

          <div className="derivative-tool__view-tabs" role="tablist" aria-label="Visualization mode">
            {VIEW_MODES.map((mode) => (
              <button
                key={mode.id}
                type="button"
                role="tab"
                aria-selected={viewMode === mode.id}
                className={`derivative-tool__view-tab${viewMode === mode.id ? ' derivative-tool__view-tab--active' : ''}`}
                onClick={() => setViewMode(mode.id)}
              >
                {mode.label}
              </button>
            ))}
          </div>

          {showCrossSliders && (
            <div className="derivative-tool__cross-controls">
              <div className="derivative-tool__cross-slider">
                <div className="derivative-tool__slider-label">
                  <label htmlFor="cross-y-slider">y = constant</label>
                  <span className="derivative-tool__degree-value">{crossSectionY.toFixed(2)}</span>
                </div>
                <input
                  id="cross-y-slider"
                  type="range"
                  min={SURFACE_RANGE[0]}
                  max={SURFACE_RANGE[1]}
                  step="0.1"
                  value={crossSectionY}
                  onChange={(event) => setCrossSectionY(Number(event.target.value))}
                  disabled={!dataSets}
                />
                <small className="derivative-tool__hint">Blue curve: z = f(x, {crossSectionY.toFixed(2)})</small>
              </div>
              <div className="derivative-tool__cross-slider">
                <div className="derivative-tool__slider-label">
                  <label htmlFor="cross-x-slider">x = constant</label>
                  <span className="derivative-tool__degree-value">{crossSectionX.toFixed(2)}</span>
                </div>
                <input
                  id="cross-x-slider"
                  type="range"
                  min={SURFACE_RANGE[0]}
                  max={SURFACE_RANGE[1]}
                  step="0.1"
                  value={crossSectionX}
                  onChange={(event) => setCrossSectionX(Number(event.target.value))}
                  disabled={!dataSets}
                />
                <small className="derivative-tool__hint">Green curve: z = f({crossSectionX.toFixed(2)}, y)</small>
              </div>
            </div>
          )}

          <div className="derivative-tool__plot-container">
            {!dataSets && (
              <div className="derivative-tool__plot-placeholder">
                <strong>{VIEW_MODES.find((m) => m.id === viewMode)?.label}</strong>
                <span>{placeholderContent[viewMode]}</span>
                <span className="derivative-tool__plot-placeholder-hint">Try an example above, then click Compute.</span>
              </div>
            )}
            <div className={`derivative-tool__plot${dataSets ? ' derivative-tool__plot--visible' : ''}`} ref={plotRef} />
          </div>

          <div className="derivative-tool__edu-note">
            <h3>What you&apos;re seeing</h3>
            <p>{MODE_EXPLANATIONS[viewMode]}</p>
          </div>
        </article>

        <article className={`derivative-tool__summary-box${dataSets ? ' derivative-tool__summary-box--active' : ''}`}>
          <div className="derivative-tool__box-header">
            <h2 className="derivative-tool__box-title">Results</h2>
            <p>View the symbolic expressions for your derivative and the Taylor polynomial.</p>
          </div>

          <div className={`derivative-tool__assistant-tutor${validation.status === 'valid' ? ' derivative-tool__assistant-tutor--ready' : ''}`}>
            <div className="derivative-tool__assistant-tutor-header">
              <span className="derivative-tool__assistant-pill">Interactive tutor</span>
              <span className="derivative-tool__assistant-pill derivative-tool__assistant-pill--subtle">
                {viewMode === '2d' ? '2D' : viewMode === '3d' ? '3D' : viewMode === 'contour' ? 'Contour' : viewMode === 'cross' ? 'Cross-sections' : 'Compare'}
              </span>
            </div>
            <p>{assistantMessage}</p>
            <div className="derivative-tool__assistant-tutor-meta">
              <span>Variable: {activeVariable}</span>
              <span>Center: {center || '0'}</span>
              <span>Degree: {degree}</span>
            </div>
          </div>

          <div className="derivative-tool__result-card">
            <h3>Symbolic derivative ∂/∂{activeVariable}</h3>
            <pre className="derivative-tool__expression">
              {derivativeExpression || 'Click Compute to generate the symbolic derivative.'}
            </pre>
          </div>

          <div className="derivative-tool__result-card">
            <h3>Taylor approximation (degree {degree})</h3>
            <pre className="derivative-tool__expression">
              {taylorExpression || 'Click Compute to generate the Taylor series expression.'}
            </pre>
          </div>

          <div className="derivative-tool__result-card derivative-tool__result-card--info">
            <h3>Graph guide</h3>
            {viewMode === '2d' && (
              <p>
                <strong>Blue</strong> — original function. <strong>Green</strong> — derivative. <strong>Red</strong> — Taylor polynomial.
                Use higher degree values to improve accuracy closer to the center point.
              </p>
            )}
            {viewMode === '3d' && (
              <p>
                <strong>Surface</strong> — z = f(x, y). Drag to rotate, scroll to zoom, double-click to reset the camera.
              </p>
            )}
            {viewMode === 'contour' && (
              <p>
                <strong>Contour lines</strong> connect equal heights. Color shows magnitude; hover for exact f(x, y) values.
              </p>
            )}
            {viewMode === 'cross' && (
              <p>
                <strong>Blue</strong> — slice at fixed y. <strong>Green</strong> — slice at fixed x. Move sliders to explore the surface layer by layer.
              </p>
            )}
            {viewMode === 'compare' && (
              <p>
                <strong>Blue</strong> — original surface. <strong>Red</strong> — Taylor approximation. Best match near the expansion center in {activeVariable}.
              </p>
            )}
          </div>
        </article>
      </section>
    </main>
  );
}

export default DerivativeTool;
