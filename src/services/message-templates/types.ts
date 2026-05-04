export interface MessageTemplate {
  id: string;
  roleScope: "buyer" | "seller" | "store_owner" | "all";
  /** Короткая подпись для кнопки / списка. */
  label: string;
  /** Текст, который подставляется в поле ввода. */
  body: string;
  category: "greeting" | "availability" | "delivery" | "price" | "follow_up";
}
