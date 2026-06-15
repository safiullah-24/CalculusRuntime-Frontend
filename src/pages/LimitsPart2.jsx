import { useEffect } from "react";
import { useProgress } from "../context/ProgressContext";
import BookmarkButton from "../components/BookmarkButton";
import SectionCompleteBar from "../components/SectionCompleteBar";
import LimitsGuide from "./LimitsGuide";
import "./GuidePart.css";

function LimitsPart2() {
  const { recordVisit } = useProgress();

  useEffect(() => {
    recordVisit("limits-2");
  }, [recordVisit]);

  return (
    <div className="guide-part-wrapper">
      <div className="guide-part-topbar">
        <div className="guide-part-info">
          <span className="guide-part-badge">Part 2 of 2</span>
          <span className="guide-part-title">
            Limits & Continuity — Continuity of Multivariable Functions
          </span>
        </div>
        <BookmarkButton
          id="limits-2"
          title="Limits & Continuity — Part 2"
          path="/limits-continuity/2"
        />
      </div>
      <LimitsGuide part={2} />
      <SectionCompleteBar
        sectionId="limits-2"
        nextPath="/partial-derivatives/1"
        nextLabel="Partial Derivatives Part 1"
      />
    </div>
  );
}

export default LimitsPart2;