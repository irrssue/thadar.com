// charts — animated SVG chart primitives for the student surface.
// Ported from the Claude Design handoff (student-charts.jsx) and typed for
// strict mode. Every chart draws itself in on mount, so the animation replays
// each time a page (and its charts) is opened. All respect prefers-reduced-
// motion via the CSS in student.css (the `.reveal`/`.stagger` wrappers) and the
// guard in `useEnter`.

export { useEnter } from "./useEnter";
export { CountUp } from "./CountUp";
export { RadialGauge } from "./RadialGauge";
export { AreaTrend } from "./AreaTrend";
export { VBars, type Bar } from "./VBars";
export { BarRow } from "./BarRow";
export { Donut, type Segment } from "./Donut";
export { Heatmap } from "./Heatmap";
export { MiniRing } from "./MiniRing";
export { MiniSpark } from "./MiniSpark";
export { Reveal } from "./Reveal";
