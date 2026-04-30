export interface MessageTemplate {
  id: string;
  roleScope: "buyer" | "seller" | "store_owner" | "all";
  title: string;
  text: string;
  category: "greeting" | "availability" | "delivery" | "price" | "follow_up";
}

