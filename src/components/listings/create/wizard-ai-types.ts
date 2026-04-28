/** Контекст шага визарда для step-aware AI drawer. */
export type WizardAiDrawerContext = "basics" | "details" | "auction" | "photos" | "contacts" | "preview";

export function wizardStepToAiContext(step: number, saleMode: "fixed" | "auction" | "free"): WizardAiDrawerContext {
  if (step === 1) return "basics";
  if (step === 2) return "details";
  if (step === 3 && saleMode === "auction") return "auction";
  if (step === (saleMode === "auction" ? 4 : 3)) return "photos";
  if (step === (saleMode === "auction" ? 5 : 4)) return "contacts";
  return "preview";
}
