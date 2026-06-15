import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ProgressProvider } from "./context/ProgressContext";
import Layout from "./components/Layout";
import ScrollToTop from "./utils/ScrollToTop";

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import AISolver from "./pages/AISolver";

// Guide parts
import PartialPart1 from "./pages/PartialPart1";
import PartialPart2 from "./pages/PartialPart2";
import VectorPart1 from "./pages/VectorPart1";
import VectorPart2 from "./pages/VectorPart2";
import LimitsPart1 from "./pages/LimitsPart1";
import LimitsPart2 from "./pages/LimitsPart2";

// Tools
import ContinuityFinder from "./pages/ContinuityFinder";
import ExtremeValueFunction from "./pages/ExtremeValueFinder";
import VolumeCalculator from "./pages/VolumeCalculator";

function App() {
  return (
    <AuthProvider>
      <ProgressProvider>
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Layout body={<Home />} />} />

            {/* Auth */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/dashboard" element={<Layout body={<Dashboard />} />} />

            {/* AI Solver */}
            <Route path="/ai-solver" element={<Layout body={<AISolver />} />} />

            {/* Partial Derivatives */}
            <Route path="/partial-derivatives" element={<Navigate to="/partial-derivatives/1" replace />} />
            <Route path="/partial-derivatives/1" element={<Layout body={<PartialPart1 />} />} />
            <Route path="/partial-derivatives/2" element={<Layout body={<PartialPart2 />} />} />

            {/* Vector Calculus */}
            <Route path="/vector-calculus" element={<Navigate to="/vector-calculus/1" replace />} />
            <Route path="/vector-calculus/1" element={<Layout body={<VectorPart1 />} />} />
            <Route path="/vector-calculus/2" element={<Layout body={<VectorPart2 />} />} />

            {/* Limits & Continuity */}
            <Route path="/limits-continuity" element={<Navigate to="/limits-continuity/1" replace />} />
            <Route path="/limits-continuity/1" element={<Layout body={<LimitsPart1 />} />} />
            <Route path="/limits-continuity/2" element={<Layout body={<LimitsPart2 />} />} />

            {/* Tools */}
            <Route path="/test" element={<Layout body={<ContinuityFinder />} />} />
            <Route path="/extreme" element={<Layout body={<ExtremeValueFunction />} />} />
            <Route path="/volumecalculator" element={<Layout body={<VolumeCalculator />} />} />
          </Routes>
        </BrowserRouter>
      </ProgressProvider>
    </AuthProvider>
  );
}

export default App;