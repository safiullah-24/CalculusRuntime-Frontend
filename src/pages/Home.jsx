import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useProgress } from "../context/ProgressContext";

const guideCards = [
  {
    title: "Simple Concepts",
    description:
      "Plain-language notes for dimensions, quadric surfaces, partial derivatives, Taylor ideas, and double or triple integrals.",
    path: "/simple-concepts",
    meta: "Syllabus overview · Self-reading notes",
    icon: "ƒ",
    color: "gold",
  },
  {
    title: "Partial Derivatives",
    description:
      "Limits, continuity, gradients, tangent planes, differentials, and optimization for functions of several variables.",
    path: "/partial-derivatives/1",
    meta: "2 parts · MCQ practice · Formula review",
    icon: "∂",
    color: "teal",
  },
  {
    title: "Vector Calculus",
    description:
      "Vector-valued functions, line integrals, conservative fields, Green's theorem, surfaces, and surface area.",
    path: "/vector-calculus/1",
    meta: "2 parts · Worked examples · Quick reference",
    icon: "∇",
    color: "blue",
  },
{
    title: "Limits & Continuity",
    description:
      "Multivariable limits, path-dependence, the squeeze theorem, and continuity for functions of two or more variables.",
    path: "/limits-continuity/1",
    meta: "2 parts · MCQ practice · Path analysis",
    icon: "lim",
    color: "purple",
  },
];

const toolLinks = [
  {
    label: "Continuity Finder",
    path: "/test",
    icon: "≈",
    desc: "Analyze continuity of multi-variable functions",
  },
  {
    label: "Extreme Value Finder",
    path: "/extreme",
    icon: "⬆",
    desc: "Find maxima and minima using second derivative test",
  },
  {
    label: "Volume Calculator",
    path: "/volumecalculator",
    icon: "∬",
    desc: "Evaluate double integrals with full step-by-step",
  },
  {
    label: "AI Calculus Solver",
    path: "/ai-solver",
    icon: "🤖",
    desc: "Neural solver for derivatives, integrals, gradients and more",
  },
];

const allItems = [
  ...guideCards.map((g) => ({ ...g, type: "guide" })),
  ...toolLinks.map((t) => ({ ...t, type: "tool" })),
];

function Home() {
  const [query, setQuery] = useState("");
  const { user } = useAuth();
  const { stats } = useProgress();

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return allItems;
    return allItems.filter(
      (item) =>
        item.title?.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q) ||
        item.desc?.toLowerCase().includes(q) ||
        item.label?.toLowerCase().includes(q),
    );
  }, [query]);

  const filteredGuides = filtered.filter((i) => i.type === "guide");
  const filteredTools = filtered.filter((i) => i.type === "tool");

  return (
    <main className="home-page">
      {/* Hero */}
      <section className="home-hero">
        <div className="hero-copy">
          <p className="eyebrow">Multivariable Calculus Studio</p>
          <h1>Study guides, practice, and calculators in one place.</h1>
          <p>
            A focused home for the calculus pages in this site: clean topic
            navigation, readable notes, interactive checks, and companion tools
            when you need to compute instead of scroll.
          </p>
          <div className="hero-actions">
            <Link className="primary-action" to="/partial-derivatives/1">
              Start studying
            </Link>
            {user ? (
              <Link className="secondary-action" to="/dashboard">
                My dashboard
              </Link>
            ) : (
              <Link className="secondary-action" to="/signup">
                Create free account
              </Link>
            )}
          </div>
          {user && stats.completedCount > 0 && (
            <p className="hero-progress-note">
              You've completed {stats.completedCount} of {stats.totalSections} sections. Keep it up!
            </p>
          )}
        </div>
        <div className="hero-panel" aria-label="Calculus topic map">
          <div className="orbit-grid">
            <span>f(x,y)</span>
            <span>grad f</span>
            <span>int C</span>
            <span>curl</span>
            <span>dA</span>
            <span>flux</span>
          </div>
        </div>
      </section>

      {/* Search */}
      <div className="home-search-wrap">
        <div className="home-search">
          <span className="home-search-icon">⌕</span>
          <input
            type="search"
            placeholder="Search guides and tools…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search topics and tools"
          />
          {query && (
            <button
              className="home-search-clear"
              onClick={() => setQuery("")}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* No results */}
      {filtered.length === 0 && (
        <div className="home-no-results">
          <span>Nothing matched "{query}".</span>
        </div>
      )}

      {/* Study Guides */}
      {filteredGuides.length > 0 && (
        <section className="guide-section" aria-labelledby="guide-heading">
          <div className="section-kicker">Study Guides</div>
          <h2 id="guide-heading">Choose a path</h2>
          <div className="guide-grid">
            {filteredGuides.map((guide) => (
              <Link
                className={`guide-card guide-card--${guide.color}`}
                key={guide.path}
                to={guide.path}
              >
                <div className="guide-card-icon">{guide.icon}</div>
                <span>{guide.meta}</span>
                <h3>{guide.title}</h3>
                <p>{guide.description}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Tools */}
      {filteredTools.length > 0 && (
        <section className="tool-strip" aria-labelledby="tools-heading">
          <div>
            <div className="section-kicker">Companion Tools</div>
            <h2 id="tools-heading">Calculate while you learn</h2>
          </div>
          <div className="tool-links">
            {filteredTools.map((tool) => (
              <Link key={tool.path} to={tool.path} title={tool.desc}>
                <span className="tool-link-icon">{tool.icon}</span>
                {tool.label}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* AI Solver feature banner */}
      {!query && (
        <section className="ai-feature-banner">
          <div className="ai-feature-content">
            <span className="ai-feature-icon">🤖</span>
            <div>
              <div className="ai-feature-title">AI Calculus Solver</div>
              <div className="ai-feature-desc">
                Neural tree-to-tree transformer trained on 5.5M problems. Solves derivatives, integrals, gradients, Lagrange multipliers — with step-by-step explanations.
              </div>
            </div>
          </div>
          <Link to="/ai-solver" className="ai-feature-btn">Try the solver →</Link>
        </section>
      )}

      {/* Sign up CTA for guests */}
      {!user && !query && (
        <section className="home-cta">
          <div className="home-cta-content">
            <h2>Track your progress for free</h2>
            <p>Create an account to bookmark sections, save quiz scores, and pick up where you left off — just like freeCodeCamp.</p>
            <div className="home-cta-actions">
              <Link to="/signup" className="primary-action">Create free account</Link>
              <Link to="/login" className="secondary-action">Sign in</Link>
            </div>
          </div>
        </section>
      )}

      {/* Stats strip */}
      <div className="home-stats">
        <div className="stat-item">
          <span className="stat-num">3</span>
          <span className="stat-label">Study Guides</span>
        </div>
        <div className="stat-divider" />
        <div className="stat-item">
          <span className="stat-num">4</span>
          <span className="stat-label">Interactive Tools</span>
        </div>
        <div className="stat-divider" />
        <div className="stat-item">
          <span className="stat-num">AI</span>
          <span className="stat-label">Neural Solver</span>
        </div>
        <div className="stat-divider" />
        <div className="stat-item">
          <span className="stat-num">∞</span>
          <span className="stat-label">Practice Problems</span>
        </div>
      </div>
    </main>
  );
}

export default Home;
