import { useEffect, useRef } from "react";
import renderMathInElement from "katex/contrib/auto-render";
import "katex/dist/katex.min.css";

const integrationStyles = `
.study-guide-page {
  min-height: 100vh;
}

.partial-derivatives-guide .sidebar {
  top: 64px;
  height: calc(100vh - 64px);
}

.vector-calculus-guide nav {
  top: 64px;
}

.partial-derivatives-guide .main,
.vector-calculus-guide > div > main {
  box-shadow: 0 1px 0 rgba(255, 255, 255, 0.55) inset;
}

@media (max-width: 920px) {
  .vector-calculus-guide nav {
    top: 0;
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
