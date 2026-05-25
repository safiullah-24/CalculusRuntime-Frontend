import { useEffect, useRef } from "react";
import renderMathInElement from "katex/contrib/auto-render";
import "katex/dist/katex.min.css";

const integrationStyles = `
.study-guide-page {
  min-height: 100vh;
}

.partial-derivatives-guide .sidebar {
  align-items: center;
  background: #0f0e0d;
  border-bottom: 1px solid rgba(200, 146, 42, 0.3);
  border-right: 0;
  display: flex;
  gap: 0;
  height: auto;
  inset: auto;
  overflow-x: auto;
  overflow-y: hidden;
  padding: 0 2rem;
  position: sticky;
  scrollbar-width: thin;
  top: 64px;
  width: 100%;
  z-index: 120;
}

.vector-calculus-guide nav {
  top: 64px;
}

.vector-calculus-guide > div > main {
  box-shadow: 0 1px 0 rgba(255, 255, 255, 0.55) inset;
}

.partial-derivatives-guide .sb-brand {
  border-bottom: 0;
  border-right: 1px solid rgba(200, 146, 42, 0.3);
  flex: 0 0 auto;
  margin-right: 0.5rem;
  padding: 0.65rem 1.1rem 0.65rem 0;
}

.partial-derivatives-guide .sb-sub {
  display: none;
}

.partial-derivatives-guide .sb-title {
  color: #e8b84b;
  font-size: 0.9rem;
  font-style: normal;
  white-space: nowrap;
}

.partial-derivatives-guide .sb-group {
  display: none;
}

.partial-derivatives-guide .sb-link {
  border-bottom: 2px solid transparent;
  border-left: 0;
  color: rgba(250, 247, 242, 0.76);
  flex: 0 0 auto;
  font-family: 'Source Sans 3', system-ui, sans-serif;
  font-size: 0.78rem;
  letter-spacing: 0.05em;
  padding: 0.85rem 0.8rem;
  text-transform: uppercase;
  white-space: nowrap;
}

.partial-derivatives-guide .sb-link:hover,
.partial-derivatives-guide .sb-link.active {
  background: transparent;
  border-bottom-color: #c8922a;
  border-left-color: transparent;
  color: #e8b84b;
}

.partial-derivatives-guide .sb-link .sn {
  color: #c8922a;
  font-size: 0.68rem;
}

.partial-derivatives-guide .main {
  margin-left: 0;
  max-width: none;
  padding: 0;
}

.partial-derivatives-guide .ch-hdr {
  background:
    linear-gradient(135deg, rgba(15, 14, 13, 0.97), rgba(39, 53, 64, 0.97)),
    repeating-linear-gradient(45deg, transparent, transparent 40px, rgba(200, 146, 42, 0.06) 40px, rgba(200, 146, 42, 0.06) 41px);
  border-bottom: 0;
  color: #faf7f2;
  margin-bottom: 0;
  overflow: hidden;
  padding: 3.4rem 2rem 3rem;
  position: relative;
}

.partial-derivatives-guide .ch-hdr::after {
  background: linear-gradient(90deg, transparent, #c8922a, #2a5c45, transparent);
  content: "";
  height: 1px;
  inset: auto 0 0;
  opacity: 0.8;
  position: absolute;
}

.partial-derivatives-guide .ch-eye {
  color: #e8b84b;
  font-family: 'Source Sans 3', system-ui, sans-serif;
}

.partial-derivatives-guide .ch-title {
  color: #faf7f2;
  font-size: clamp(2rem, 5vw, 3.5rem);
}

.partial-derivatives-guide .ch-sub {
  color: rgba(250, 247, 242, 0.74);
}

.partial-derivatives-guide .ch-orn {
  color: #e8b84b;
}

.partial-derivatives-guide .main > p,
.partial-derivatives-guide .main > .toc,
.partial-derivatives-guide .main > .section,
.partial-derivatives-guide .main > .mcq-section,
.partial-derivatives-guide .main > .pg-foot {
  margin-left: auto;
  margin-right: auto;
  max-width: 1000px;
}

.partial-derivatives-guide .main > p {
  padding: 3rem 2rem 0;
}

.partial-derivatives-guide .main > .toc {
  background: #ffffff;
  border: 1px solid #d6cfc4;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
  margin-bottom: 3.5rem;
  margin-top: 2rem;
}

.partial-derivatives-guide .toc-h {
  color: #3d4f6b;
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 1rem;
}

.partial-derivatives-guide .toc-a {
  color: #3d4f6b;
}

.partial-derivatives-guide .main > .divider {
  margin-left: auto;
  margin-right: auto;
  max-width: 1000px;
}

.partial-derivatives-guide .section,
.partial-derivatives-guide .mcq-section {
  background: transparent;
  padding-left: 2rem;
  padding-right: 2rem;
}

.partial-derivatives-guide .sec-badge,
.partial-derivatives-guide .mcq-section-badge {
  color: #c8922a;
  font-family: 'Source Sans 3', system-ui, sans-serif;
}

.partial-derivatives-guide .sec-title,
.partial-derivatives-guide .mcq-section-title {
  color: #3d4f6b;
  font-family: 'Playfair Display', Georgia, serif;
}

.partial-derivatives-guide .box,
.partial-derivatives-guide .mcq-card,
.partial-derivatives-guide .sum-card {
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.partial-derivatives-guide .fml {
  background: #f7f4ff;
  border-left: 4px solid #3d4f6b;
  border-radius: 0 6px 6px 0;
}

.partial-derivatives-guide .pg-foot {
  color: #7a7268;
  padding-left: 2rem;
  padding-right: 2rem;
}

@media (max-width: 920px) {
  .partial-derivatives-guide .sidebar {
    top: 0;
  }

  .vector-calculus-guide nav {
    top: 0;
  }
}

@media (max-width: 640px) {
  .partial-derivatives-guide .sidebar {
    padding: 0 1rem;
  }

  .partial-derivatives-guide .sb-brand {
    display: none;
  }

  .partial-derivatives-guide .ch-hdr {
    padding: 2.4rem 1rem 2.2rem;
  }

  .partial-derivatives-guide .main > p,
  .partial-derivatives-guide .section,
  .partial-derivatives-guide .mcq-section,
  .partial-derivatives-guide .pg-foot {
    padding-left: 1rem;
    padding-right: 1rem;
  }
}
`;

function renderLatex(root) {
  renderMathInElement(root, {
    delimiters: [
      { left: "$$", right: "$$", display: true },
      { left: "\\[", right: "\\]", display: true },
      { left: "\\(", right: "\\)", display: false },
      { left: "$", right: "$", display: false },
    ],
    throwOnError: false,
    strict: false,
    ignoredTags: ["script", "noscript", "style", "textarea", "pre", "code"],
  });
}

function setupMcqs(root) {
  const cards = Array.from(root.querySelectorAll(".mcq-card"));
  if (!cards.length) return [];

  const scores = {};
  const totals = {};
  const state = {};
  const answered = {};
  const cleanups = [];

  cards.forEach((card) => {
    const section = card.dataset.section;
    totals[section] = (totals[section] || 0) + 1;
    scores[section] = 0;
  });

  const updateScoreDisplay = (section) => {
    const el = root.querySelector(`#score${section}`);
    if (el) el.textContent = `${scores[section] || 0} / ${totals[section] || 0}`;
  };

  const applyStyles = (card, chosen, correct, revealed) => {
    card.querySelectorAll(".mcq-opt").forEach((opt) => {
      const option = opt.dataset.opt;
      opt.classList.remove("correct", "wrong", "selected");
      if (!option) return;
      if (revealed) {
        if (option === correct) opt.classList.add("correct");
        else if (option === chosen) opt.classList.add("wrong");
      } else if (option === chosen) {
        opt.classList.add("selected");
      }
    });
  };

  cards.forEach((card) => {
    const section = card.dataset.section;
    const correctAnswer = card.dataset.answer;
    const key = `${section}-${card.dataset.q}`;
    const options = card.querySelector(".mcq-options");
    const revealButton = card.querySelector(".mcq-reveal-btn");
    const answerPanel = card.querySelector(".mcq-answer");

    state[key] = { chosen: null };
    answered[key] = false;

    const chooseOption = (event) => {
      if (answered[key]) return;
      const option = event.target.closest(".mcq-opt");
      if (!option) return;
      state[key].chosen = option.dataset.opt;
      applyStyles(card, state[key].chosen, correctAnswer, false);
    };

    const revealAnswer = () => {
      if (answered[key]) return;

      if (!state[key].chosen) {
        const original = revealButton.textContent;
        revealButton.textContent = "Pick an option first!";
        window.setTimeout(() => {
          revealButton.textContent = original;
        }, 1600);
        return;
      }

      answered[key] = true;
      revealButton.disabled = true;
      revealButton.textContent = "Revealed";
      applyStyles(card, state[key].chosen, correctAnswer, true);
      answerPanel?.classList.add("visible");

      if (state[key].chosen === correctAnswer) {
        scores[section] = (scores[section] || 0) + 1;
      }

      updateScoreDisplay(section);
      if (answerPanel) {
        renderLatex(answerPanel);
      }
    };

    options?.addEventListener("click", chooseOption);
    revealButton?.addEventListener("click", revealAnswer);
    cleanups.push(() => options?.removeEventListener("click", chooseOption));
    cleanups.push(() => revealButton?.removeEventListener("click", revealAnswer));
    updateScoreDisplay(section);
  });

  return cleanups;
}

function setupSidebar(root) {
  const sections = Array.from(root.querySelectorAll(".section[id], .mcq-section[id]"));
  const links = Array.from(root.querySelectorAll('.sb-link[href^="#"]'));
  if (!sections.length || !links.length || !window.IntersectionObserver) return () => {};

  let lastActive = null;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const link = root.querySelector(`.sb-link[href="#${entry.target.id}"]`);
      if (link && link !== lastActive) {
        links.forEach((item) => item.classList.remove("active"));
        link.classList.add("active");
        lastActive = link;
        link.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }
    });
  }, { rootMargin: "-10% 0px -65% 0px", threshold: 0 });

  sections.forEach((section) => observer.observe(section));
  return () => observer.disconnect();
}

function StudyGuideShell({ guideClass, styles, markup }) {
  const rootRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    const cleanups = [...setupMcqs(root), setupSidebar(root)];
    const topButton = root.querySelector("#top-btn");
    const scrollTop = () => window.scrollTo({ top: 0, behavior: "smooth" });
    topButton?.addEventListener("click", scrollTop);
    cleanups.push(() => topButton?.removeEventListener("click", scrollTop));

    renderLatex(root);

    return () => {
      cleanups.forEach((cleanup) => cleanup());
    };
  }, [markup]);

  return (
    <main className={`study-guide-page ${guideClass}`}>
      <style>{styles + integrationStyles}</style>
      <div ref={rootRef} dangerouslySetInnerHTML={{ __html: markup }} />
    </main>
  );
}

export default StudyGuideShell;
