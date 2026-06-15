import { useEffect } from "react";
import { useProgress } from "../context/ProgressContext";
import BookmarkButton from "../components/BookmarkButton";
import SectionCompleteBar from "../components/SectionCompleteBar";
import LimitsGuide from "./LimitsGuide";
import "./GuidePart.css";

function LimitsPart1() {
  const { recordVisit } = useProgress();

  useEffect(() => {
    recordVisit("limits-1");
  }, [recordVisit]);

  return (
    <div className="guide-part-wrapper">
      <div className="guide-part-topbar">
        <div className="guide-part-info">
          <span className="guide-part-badge">Part 1 of 2</span>
          <span className="guide-part-title">
            Limits & Continuity — Limits of Multivariable Functions
          </span>
        </div>
        <BookmarkButton
          id="limits-1"
          title="Limits & Continuity — Part 1"
          path="/limits-continuity/1"
        />
      </div>
      <LimitsGuide part={1} />
      <SectionCompleteBar
        sectionId="limits-1"
        nextPath="/limits-continuity/2"
        nextLabel="Part 2: Continuity"
      />
    </div>
  );
}

export default LimitsPart1;