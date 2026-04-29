export type { VerificationLevel, VerificationProfile, VerificationRequirement, VerificationStatus, VerificationSubjectType } from "./types";
export type { VerificationStartInput, VerificationStepSubmitInput } from "./mock";

export {
  getVerificationProfile,
  startVerification,
  submitVerificationStep,
  getVerificationChecklist,
  getVerificationBenefits,
  getVerificationSuggestedNextStep,
  getVerificationDerivedTrustedPlus,
  // `forceVerificationStatus` (debug helper) is exported below only in dev.
} from "./mock";

import { forceVerificationStatus as forceVerificationStatusImpl } from "./mock";

export const forceVerificationStatus =
  process.env.NODE_ENV === "development" ? forceVerificationStatusImpl : undefined;

