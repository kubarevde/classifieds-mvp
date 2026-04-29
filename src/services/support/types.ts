export type SupportCategory = "account" | "listing" | "payment" | "safety" | "store" | "other";

export type TicketStatus = "open" | "in_progress" | "resolved" | "closed";

export type TicketMessageAuthorRole = "user" | "support";

export type TicketMessage = {
  id: string;
  ticketId: string;
  authorRole: TicketMessageAuthorRole;
  text: string;
  createdAt: string;
};

export type SupportTicket = {
  id: string;
  userId: string;
  category: SupportCategory;
  subject: string;
  message: string;
  status: TicketStatus;
  createdAt: string;
  updatedAt: string;
  messages: TicketMessage[];
};

export type HelpArticle = {
  id: string;
  /** Slug категории (совпадает с `SupportCategory` в текущем контенте). */
  categorySlug: string;
  slug: string;
  title: string;
  summary: string;
  content: string;
};

export type HelpCategory = {
  slug: SupportCategory;
  title: string;
  /** Имя иконки lucide-react */
  icon: "user" | "fileText" | "creditCard" | "shield" | "store" | "helpCircle";
  articleCount: number;
};
