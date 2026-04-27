export type PaymentStatus = "pending" | "paid" | "failed";

export interface PaymentRecord {
  createdAt: number;
  description: string;
  recipient: string;
  status: PaymentStatus;
  token: "WLD";
  tokenAmount: string;
  txHash?: string;
  userId?: string;
}

const paymentStore = new Map<string, PaymentRecord>();

export const createPaymentRecord = (
  reference: string,
  record: PaymentRecord,
) => {
  paymentStore.set(reference, record);
};

export const updatePaymentRecord = (
  reference: string,
  patch: Partial<PaymentRecord>,
) => {
  const existing = paymentStore.get(reference);
  if (!existing) return undefined;

  const updated: PaymentRecord = {
    ...existing,
    ...patch,
  };

  paymentStore.set(reference, updated);
  return updated;
};

export const getPaymentRecord = (reference: string) =>
  paymentStore.get(reference);
