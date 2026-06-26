// metrics — derive the teacher dashboard's gauges, trends, distributions,
// roster flags, grading queue and heatmap from one /api/teacher/overview
// payload. Everything here is a *derived view of real data*: mastery is the
// mean of real graded percents, "late" counts real submissions past their due
// date, turnaround is real gradedAt − submittedAt. Nothing is invented.

export type {
  SubStatus,
  Sub,
  Asg,
  Person,
  Member,
  OClass,
  Totals,
  Overview,
} from "./types";
export { type ClassMetrics, classMetrics } from "./classMetrics";
export { type QueueItem, gradingQueue } from "./gradingQueue";
export { type Flag, type RosterRow, roster } from "./roster";
export { type Band, type FlagCounts, masteryBands, flagCounts } from "./distribution";
export { turnaroundTrend } from "./turnaround";
export { submissionHeatmap } from "./heatmap";
export { avgMastery, submissionRate, avgTurnaround } from "./cohort";
