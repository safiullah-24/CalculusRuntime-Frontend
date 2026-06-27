import { create, all } from 'mathjs';

const math = create(all);

function evaluateNumeric(compiled, scope) {
  try {
    const result = compiled.evaluate(scope);
    if (typeof result === 'number' && Number.isFinite(result)) {
      return result;
    }
    if (math.typeOf(result) === 'Complex' && Number.isFinite(result.re) && result.im === 0) {
      return result.re;
    }
    if (math.typeOf(result) === 'BigNumber') {
      const numberResult = result.toNumber();
      if (Number.isFinite(numberResult)) {
        return numberResult;
      }
    }
  } catch {
    return null;
  }
  return null;
}

export function sampleExpression(expression, range = [-10, 10], points = 500, variable = 'x', scope = {}) {
  const node = math.parse(expression);
  const compiled = node.compile();
  const [min, max] = range;
  const step = (max - min) / Math.max(points - 1, 1);

  const xValues = new Array(points);
  const yValues = new Array(points);

  for (let index = 0; index < points; index += 1) {
    const x = min + step * index;
    xValues[index] = x;
    yValues[index] = evaluateNumeric(compiled, { ...scope, [variable]: x });
  }

  return { xValues, yValues };
}

export function buildSurfaceData(
  expression,
  xRange = [-5, 5],
  yRange = [-5, 5],
  points = 50,
  scope = {},
  xVar = 'x',
  yVar = 'y',
) {
  const node = math.parse(expression);
  const compiled = node.compile();
  const [xMin, xMax] = xRange;
  const [yMin, yMax] = yRange;
  const xStep = (xMax - xMin) / Math.max(points - 1, 1);
  const yStep = (yMax - yMin) / Math.max(points - 1, 1);

  const xValues = new Array(points);
  const yValues = new Array(points);
  const zValues = new Array(points);

  for (let i = 0; i < points; i += 1) {
    xValues[i] = xMin + xStep * i;
  }
  for (let j = 0; j < points; j += 1) {
    yValues[j] = yMin + yStep * j;
  }

  for (let j = 0; j < points; j += 1) {
    const row = new Array(points);
    const y = yValues[j];
    for (let i = 0; i < points; i += 1) {
      const x = xValues[i];
      row[i] = evaluateNumeric(compiled, { ...scope, [xVar]: x, [yVar]: y });
    }
    zValues[j] = row;
  }

  return { xValues, yValues, zValues };
}

export function buildCrossSectionData(
  expression,
  { orientation = 'x', fixedValue = 0, range = [-5, 5], points = 200, scope = {}, xVar = 'x', yVar = 'y' },
) {
  const node = math.parse(expression);
  const compiled = node.compile();
  const [min, max] = range;
  const step = (max - min) / Math.max(points - 1, 1);

  const xValues = new Array(points);
  const yValues = new Array(points);

  for (let index = 0; index < points; index += 1) {
    const t = min + step * index;
    xValues[index] = t;

    if (orientation === 'x') {
      // Cross-section at x = fixedValue, sweep y
      yValues[index] = evaluateNumeric(compiled, { ...scope, [xVar]: fixedValue, [yVar]: t });
    } else {
      // Cross-section at y = fixedValue, sweep x
      yValues[index] = evaluateNumeric(compiled, { ...scope, [xVar]: t, [yVar]: fixedValue });
    }
  }

  return { xValues, yValues };
}
