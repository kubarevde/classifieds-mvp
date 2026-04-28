export type PaymentRecord = {
  id: string;
  storeId: string;
  createdAt: string;
  amount: number;
  currency: "RUB";
  status: "paid" | "failed" | "pending";
  method: "card";
  description: string;
};

export type InvoiceRecord = {
  id: string;
  storeId: string;
  createdAt: string;
  periodStart: string;
  periodEnd: string;
  amount: number;
  currency: "RUB";
  status: "paid" | "open" | "void";
  number: string;
};

export const paymentHistoryMock: PaymentRecord[] = [
  {
    id: "pay_1001",
    storeId: "store-demo",
    createdAt: "2026-04-12T09:15:00.000Z",
    amount: 990,
    currency: "RUB",
    status: "paid",
    method: "card",
    description: "Продление тарифа Старт",
  },
  {
    id: "pay_1000",
    storeId: "store-demo",
    createdAt: "2026-03-12T09:11:00.000Z",
    amount: 990,
    currency: "RUB",
    status: "paid",
    method: "card",
    description: "Подписка Старт",
  },
];

export const invoicesMock: InvoiceRecord[] = [
  {
    id: "inv_2026_04",
    storeId: "store-demo",
    createdAt: "2026-04-12T09:10:00.000Z",
    periodStart: "2026-04-12T00:00:00.000Z",
    periodEnd: "2026-05-11T23:59:59.000Z",
    amount: 990,
    currency: "RUB",
    status: "paid",
    number: "CL-2026-0004",
  },
  {
    id: "inv_2026_03",
    storeId: "store-demo",
    createdAt: "2026-03-12T09:10:00.000Z",
    periodStart: "2026-03-12T00:00:00.000Z",
    periodEnd: "2026-04-11T23:59:59.000Z",
    amount: 990,
    currency: "RUB",
    status: "paid",
    number: "CL-2026-0003",
  },
];
