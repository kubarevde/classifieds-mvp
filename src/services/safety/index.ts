export type {
  ReportReason,
  ReportTargetType,
  SafetyCaseStatus,
  SafetyEvidence,
  SafetyGuideArticle,
  SafetyReport,
} from "./types";
export type { CreateSafetyReportInput, QuickSafetyTip } from "./mock";
export {
  createSafetyReport,
  getQuickSafetyTips,
  getSafetyGuideBySlug,
  getSafetyGuides,
  getSafetyReportById,
  getSafetyReportForUser,
  getUserSafetyReports,
  resetSafetyReportsForTests,
  safetyStatusLabelRu,
} from "./mock";
