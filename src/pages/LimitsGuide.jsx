import { useState } from "react";
import { useProgress } from "../context/ProgressContext";
import StudyGuideShell from "./StudyGuideShell";
import "./PartialDerivativesGuide.css";

function Divider() {
  return <hr className="divider" />;
}

function GuideSidebarPart1() {
  return (
    <nav className="sidebar">
      <div className="sb-brand">
        <div className="sb-title">{"Limits & Continuity · Part 1"}</div>
      </div>
      <a className="sb-link" href="#lc-1">{"Limits of Two Variables"}</a>
      <a className="sb-link" href="#lc-2">{"Two-Path Test"}</a>
      <a className="sb-link" href="#lc-3">{"Squeeze Theorem"}</a>
      <a className="sb-link" href="#lc-quiz1">{"Practice Quiz"}</a>
    </nav>
  );
}

function GuideSidebarPart2() {
  return (
    <nav className="sidebar">
      <div className="sb-brand">
        <div className="sb-title">{"Limits & Continuity · Part 2"}</div>
      </div>
      <a className="sb-link" href="#lc-4">{"Continuity at a Point"}</a>
      <a className="sb-link" href="#lc-5">{"Continuity on a Region"}</a>
      <a className="sb-link" href="#lc-quiz2">{"Practice Quiz"}</a>
    </nav>
  );
}

function GuideHeaderPart1() {
  return (
    <div className="ch-hdr">
      <p className="ch-eye">{"MULTIVARIABLE CALCULUS STUDY GUIDE · PART 1 OF 2"}</p>
      <h1 className="ch-title">{"Limits & Continuity"}</h1>
      <p className="ch-sub">{"Limits of Multivariable Functions, Path Dependence & The Squeeze Theorem"}</p>
      <p className="ch-orn">{"✦ \u00a0 ✦ \u00a0 ✦"}</p>
    </div>
  );
}

function GuideHeaderPart2() {
  return (
    <div className="ch-hdr">
      <p className="ch-eye">{"MULTIVARIABLE CALCULUS STUDY GUIDE · PART 2 OF 2"}</p>
      <h1 className="ch-title">{"Continuity"}</h1>
      <p className="ch-sub">{"Continuity at a Point, Continuity on a Region & Compositions"}</p>
      <p className="ch-orn">{"✦ \u00a0 ✦ \u00a0 ✦"}</p>
    </div>
  );
}

function TableOfContentsPart1() {
  return (
    <div className="toc">
      <p className="toc-h">{"CONTENTS — PART 1 OF 2"}</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
        <a className="toc-a" href="#lc-1">{"Limits of Two Variables"}</a>
        <a className="toc-a" href="#lc-2">{"Two-Path Test"}</a>
        <a className="toc-a" href="#lc-3">{"Squeeze Theorem"}</a>
        <a className="toc-a" href="#lc-quiz1">{"Practice Quiz"}</a>
      </div>
    </div>
  );
}

function TableOfContentsPart2() {
  return (
    <div className="toc">
      <p className="toc-h">{"CONTENTS — PART 2 OF 2"}</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
        <a className="toc-a" href="#lc-4">{"Continuity at a Point"}</a>
        <a className="toc-a" href="#lc-5">{"Continuity on a Region"}</a>
        <a className="toc-a" href="#lc-quiz2">{"Practice Quiz"}</a>
      </div>
    </div>
  );
}

function SectionLC1() {
  return (
    <section className="section" id="lc-1">
      <div className="sec-badge">{"Section"}</div>
      <h2 className="sec-title">{"Limits of Functions of Two Variables"}</h2>
      <p>
        {"We say $\\lim_{(x,y)\\to(a,b)} f(x,y) = L$ if $f(x,y)$ can be made arbitrarily close to $L$ by taking $(x,y)$ sufficiently close to $(a,b)$, regardless of the direction of approach."}
      </p>
      <div className="box def">
        <div className="box-lbl">{"Definition \u2014 Limit"}</div>
        <p>
          {"For every $\\varepsilon > 0$ there exists $\\delta > 0$ such that $0 < \\sqrt{(x-a)^2+(y-b)^2} < \\delta \\Rightarrow |f(x,y)-L| < \\varepsilon$."}
        </p>
      </div>
      <h3 className="subsec">{"Direct Substitution"}</h3>
      <p>
        {"If $f$ is a polynomial or rational function and the denominator is non-zero at $(a,b)$, simply substitute directly."}
      </p>
      <div className="box exm">
        <div className="box-lbl">{"Example"}</div>
        <div className="exm-title">
          {"Find $\\lim_{(x,y)\\to(1,2)} (3x^2 + y)$"}
        </div>
        <div className="sol">
          <div className="sol-lbl">{"Solution"}</div>
          <p>{"Substitute directly: $3(1)^2 + 2 = 5$."}</p>
          <div className="fml">{"$$\\lim_{(x,y)\\to(1,2)} (3x^2+y) = 5$$"}</div>
        </div>
      </div>
    </section>
  );
}

function SectionLC2() {
  return (
    <section className="section" id="lc-2">
      <div className="sec-badge">{"Section"}</div>
      <h2 className="sec-title">{"Two-Path Test"}</h2>
      <p>
        {"If two different paths to $(a,b)$ give different limit values, the overall limit does not exist."}
      </p>
      <div className="box exm">
        <div className="box-lbl">{"Example"}</div>
        <div className="exm-title">
          {"Show $\\lim_{(x,y)\\to(0,0)} \\dfrac{xy}{x^2+y^2}$ does not exist."}
        </div>
        <div className="sol">
          <div className="sol-lbl">{"Solution"}</div>
          <p>{"Along $y=0$: limit $= 0$."}</p>
          <p>{"Along $y=x$: limit $= \\dfrac{1}{2}$."}</p>
          <p>{"Two paths give different values \u2014 limit does not exist."}</p>
        </div>
      </div>
    </section>
  );
}

function SectionLC3() {
  return (
    <section className="section" id="lc-3">
      <div className="sec-badge">{"Section"}</div>
      <h2 className="sec-title">{"Squeeze Theorem for Two Variables"}</h2>
      <p>
        {"If $|f(x,y)| \\leq g(x,y)$ near $(a,b)$ and $\\lim g = 0$, then $\\lim f = 0$."}
      </p>
      <div className="box exm">
        <div className="box-lbl">{"Example"}</div>
        <div className="exm-title">
          {"Evaluate $\\lim_{(x,y)\\to(0,0)} \\dfrac{x^2 y}{x^2+y^2}$"}
        </div>
        <div className="sol">
          <div className="sol-lbl">{"Solution"}</div>
          <p>
            {"Since $x^2 \\leq x^2+y^2$, we get $\\left|\\dfrac{x^2 y}{x^2+y^2}\\right| \\leq |y| \\to 0$."}
          </p>
          <div className="fml">
            {"$$\\lim_{(x,y)\\to(0,0)} \\frac{x^2 y}{x^2+y^2} = 0$$"}
          </div>
        </div>
      </div>
    </section>
  );
}

function SectionLC4() {
  return (
    <section className="section" id="lc-4">
      <div className="sec-badge">{"Section"}</div>
      <h2 className="sec-title">{"Continuity at a Point"}</h2>
      <div className="box def">
        <div className="box-lbl">{"Definition \u2014 Continuity"}</div>
        <p>{"$f$ is continuous at $(a,b)$ if all three hold:"}</p>
        <ol>
          <li>{"$f(a,b)$ is defined."}</li>
          <li>{"$\\lim_{(x,y)\\to(a,b)} f(x,y)$ exists."}</li>
          <li>{"The limit equals $f(a,b)$."}</li>
        </ol>
      </div>
      <div className="box exm">
        <div className="box-lbl">{"Example"}</div>
        <div className="exm-title">
          {"Is $f(x,y) = \\dfrac{x^2-y^2}{x^2+y^2}$ continuous at $(0,0)$?"}
        </div>
        <div className="sol">
          <div className="sol-lbl">{"Solution"}</div>
          <p>{"Along $y=0$: limit $=1$. Along $x=0$: limit $=-1$."}</p>
          <p>{"Limit does not exist \u2014 not continuous at the origin."}</p>
        </div>
      </div>
    </section>
  );
}

function SectionLC5() {
  return (
    <section className="section" id="lc-5">
      <div className="sec-badge">{"Section"}</div>
      <h2 className="sec-title">{"Continuity on a Region"}</h2>
      <p>
        {"$f$ is continuous on an open set $D$ if it is continuous at every point in $D$. Polynomials, rational functions (away from denominator zeros), and compositions of continuous functions are all continuous on their domains."}
      </p>
      <div className="box def">
        <div className="box-lbl">{"Key Fact"}</div>
        <p>
          {"If $f$ and $g$ are continuous at $(a,b)$, then so are $f+g$, $f \\cdot g$, and $f/g$ (provided $g(a,b) \\neq 0$)."}
        </p>
      </div>
    </section>
  );
}

function LimitsQuiz({ part }) {
  const { saveQuizScore } = useProgress();
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const QUIZ_DATA = {
    1: [
      {
        q: "Which condition must hold for a multivariable limit to exist?",
        options: [
          "The limit along every path must be equal.",
          "The limit along x-axis must equal limit along y-axis only.",
          "f(a,b) must be defined.",
          "The function must be differentiable at (a,b).",
        ],
        answer: 0,
      },
      {
        q: "For f(x,y) = xy / (x^2 + y^2), the limit as (x,y) approaches (0,0):",
        options: ["equals 0", "equals 1", "equals 1/2", "does not exist"],
        answer: 3,
      },
      {
        q: "The Squeeze Theorem: if |f(x,y)| <= g(x,y) and lim g = 0, then:",
        options: ["lim f = 1", "lim f = 0", "lim f does not exist", "f is continuous"],
        answer: 1,
      },
    ],
    2: [
      {
        q: "f(x,y) is continuous at (a,b) if:",
        options: [
          "It is defined at (a,b) only.",
          "The limit exists but may differ from f(a,b).",
          "f(a,b) is defined, the limit exists, and they are equal.",
          "It is differentiable at (a,b).",
        ],
        answer: 2,
      },
      {
        q: "Is f(x,y) = (x^2 - y^2)/(x^2 + y^2) continuous at the origin?",
        options: [
          "Yes, it is a rational function.",
          "No, the limit does not exist at the origin.",
          "Yes, because f(0,0) = 0.",
          "No, the domain excludes the origin.",
        ],
        answer: 1,
      },
      {
        q: "Compositions of continuous functions are:",
        options: [
          "Always discontinuous",
          "Continuous wherever the composition is defined",
          "Only continuous on closed sets",
          "Differentiable but not continuous",
        ],
        answer: 1,
      },
    ],
  };

  const questions = QUIZ_DATA[part];
  const quizId = "limits-" + part;

  function handleSelect(qIdx, oIdx) {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [qIdx]: oIdx }));
  }

  function handleSubmit() {
    if (Object.keys(answers).length < questions.length) {
      alert("Please answer all questions before submitting.");
      return;
    }
    setSubmitted(true);
    const score = questions.filter((q, i) => answers[i] === q.answer).length;
    saveQuizScore(quizId, score, questions.length);
  }

  function handleReset() {
    setAnswers({});
    setSubmitted(false);
  }

  const score = questions.filter((q, i) => answers[i] === q.answer).length;

  return (
    <section className="mcq-section" id={"lc-quiz" + part}>
      <div className="mcq-section-badge">{"Practice"}</div>
      <h2 className="mcq-section-title">{"Part " + part + " Quiz"}</h2>
      {questions.map((q, i) => (
        <div
          key={i}
          className={"mcq-card" + (submitted ? (answers[i] === q.answer ? " correct" : " wrong") : "")}
        >
          <p className="mcq-q">{q.q}</p>
          <ul className="mcq-options">
            {q.options.map((opt, j) => (
              <li key={j}>
                <button
                  className={"mcq-opt" + (answers[i] === j ? " selected" : "") + (submitted && j === q.answer ? " correct" : "")}
                  onClick={() => handleSelect(i, j)}
                  disabled={submitted}
                >
                  {opt}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}
      {!submitted ? (
        <button className="quiz-submit" onClick={handleSubmit}>
          {"Submit answers"}
        </button>
      ) : (
        <div className="quiz-result">
          <p>{"Score: "}<strong>{score + " / " + questions.length}</strong></p>
          <button className="quiz-retry" onClick={handleReset}>{"Try again"}</button>
        </div>
      )}
    </section>
  );
}

function GuideFooter() {
  return (
    <div className="pg-foot">
      <p>{"End of Limits & Continuity guide."}</p>
    </div>
  );
}

function LimitsContent({ part }) {
  if (part === 1) {
    return (
      <>
        <GuideSidebarPart1 />
        <main className="main">
          <GuideHeaderPart1 />
          <TableOfContentsPart1 />
          <Divider />
          <SectionLC1 />
          <Divider />
          <SectionLC2 />
          <Divider />
          <SectionLC3 />
          <Divider />
          <LimitsQuiz part={1} />
          <GuideFooter />
        </main>
      </>
    );
  }

  return (
    <>
      <GuideSidebarPart2 />
      <main className="main">
        <GuideHeaderPart2 />
        <TableOfContentsPart2 />
        <Divider />
        <SectionLC4 />
        <Divider />
        <SectionLC5 />
        <Divider />
        <LimitsQuiz part={2} />
        <GuideFooter />
      </main>
    </>
  );
}

function LimitsGuide({ part }) {
  return (
    <StudyGuideShell guideClass="partial-derivatives-guide">
      <LimitsContent part={part} />
    </StudyGuideShell>
  );
}

export default LimitsGuide;