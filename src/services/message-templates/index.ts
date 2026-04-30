import { getSuggestedTemplates, getTemplatesForRole } from "./mock";

export type { MessageTemplate } from "./types";

export const messageTemplatesService = {
  getTemplatesForRole,
  getSuggestedTemplates,
};

