/** Админ-модель пользователя (backoffice). */
export type AdminUserStatus = "active" | "suspended" | "banned";
export type AdminUserRole = "buyer" | "seller" | "store" | "staff";

export type AdminUser = {
  id: string;
  displayName: string;
  email: string;
  role: AdminUserRole;
  status: AdminUserStatus;
  registeredAt: string;
  listingsCount: number;
  storesCount: number;
  trustScore: number;
  verificationStatus: "none" | "pending" | "verified" | "rejected";
  flagsCount: number;
  reportsCount: number;
  currentPlanLabel: string;
  linkedSellerIds: string[];
};

export type AdminUserFilters = {
  role?: AdminUserRole | "all";
  status?: AdminUserStatus | "all";
  verification?: AdminUser["verificationStatus"] | "all";
  hasStore?: "all" | "yes" | "no";
  search?: string;
};

export type AdminListingStatus = "active" | "draft" | "removed" | "pending_review";

export type AdminListing = {
  id: string;
  title: string;
  sellerUserId: string;
  sellerLabel: string;
  status: AdminListingStatus;
  world: string;
  worldLabel: string;
  categoryLabel: string;
  priceLabel: string;
  createdAt: string;
  flagsCount: number;
  isBoosted: boolean;
  isPromoted: boolean;
  trustHint: string;
};

export type AdminListingFilters = {
  status?: AdminListingStatus | "all";
  world?: string;
  flaggedOnly?: boolean;
  promotedOnly?: boolean;
  search?: string;
};

export type AdminStoreStatus = "active" | "pending_review" | "suspended";

export type AdminStore = {
  id: string;
  name: string;
  ownerUserId: string;
  ownerLabel: string;
  status: AdminStoreStatus;
  verified: boolean;
  planLabel: string;
  activeListings: number;
  trustScore: number;
  createdAt: string;
  worldFocus: string;
};

export type AdminStoreFilters = {
  status?: AdminStoreStatus | "all";
  verified?: "all" | "yes" | "no";
  plan?: string;
  search?: string;
};

export type AdminRequestStatus = "active" | "closed" | "fulfilled" | "removed";

export type AdminRequest = {
  id: string;
  title: string;
  buyerUserId: string;
  buyerLabel: string;
  worldLabel: string;
  budgetLabel: string;
  status: AdminRequestStatus;
  urgency: "low" | "normal" | "high";
  responsesCount: number;
  flagsCount: number;
  createdAt: string;
};

export type AdminRequestFilters = {
  status?: AdminRequestStatus | "all";
  world?: string;
  urgentOnly?: boolean;
  flaggedOnly?: boolean;
  search?: string;
};

export type AdminSupportTicketRow = {
  id: string;
  subject: string;
  userId: string;
  userLabel: string;
  category: string;
  status: string;
  priority: string;
  createdAt: string;
  assignedTo: string | null;
};

export type AdminSupportFilters = {
  status?: string;
  priority?: string;
  category?: string;
  assigned?: string;
  search?: string;
};

export type AdminSubscriptionStatus = "active" | "past_due" | "paused" | "canceled";
export type AdminBillingCycle = "monthly" | "annual";

export type AdminSubscription = {
  id: string;
  accountLabel: string;
  accountType: "store" | "user";
  accountRefId: string;
  currentPlanId: string;
  currentPlanLabel: string;
  status: AdminSubscriptionStatus;
  billingCycle: AdminBillingCycle;
  nextBillingAt: string | null;
  amountMonthlyRub: number;
  paymentStatus: "ok" | "failed" | "pending";
};

export type AdminInvoice = {
  id: string;
  accountLabel: string;
  amountRub: number;
  status: "draft" | "open" | "paid" | "void";
  issuedAt: string;
  paidAt: string | null;
  downloadable: boolean;
};

export type AdminPayout = {
  id: string;
  storeLabel: string;
  storeId: string;
  amountRub: number;
  status: "pending" | "processing" | "paid" | "on_hold";
  periodLabel: string;
  method: string;
  holdReason: string | null;
};

export type AdminPlanRow = {
  id: string;
  name: string;
  priceMonthlyRub: number;
  priceAnnualRub: number;
  status: "active" | "inactive";
  featureSummary: string;
  limitsSummary: string;
};

export type AdminRevenueSummary = {
  mrrRub: number;
  arrRub: number;
  paidSubscriptions: number;
  failedPayments7d: number;
  pendingPayoutsRub: number;
};

export type AdminMarketplaceStats = {
  totalUsers: number;
  activeListings: number;
  newRequests7d: number;
  openSupportTickets: number;
  moderationCasesOpen: number;
  storesPendingReview: number;
  revenue: AdminRevenueSummary;
};

export type AdminAuditEvent = {
  id: string;
  at: string;
  actor: string;
  action: string;
  detail: string;
};

export type AdminInternalNote = {
  id: string;
  at: string;
  author: string;
  text: string;
};

export type AdminBulkListingAction = "approve" | "reject" | "remove" | "mark_reviewed" | "unflag";

export type AdminTimeSeriesPoint = { label: string; value: number };

export type AdminFeatureGateRow = { key: string; label: string; enabled: boolean; scope: string };
