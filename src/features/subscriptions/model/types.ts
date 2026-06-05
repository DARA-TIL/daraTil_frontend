export type SubscriptionStatus = "active" | "expired" | "cancelled" | (string & {});
export type PaymentStatus = "pending" | "paid" | "failed" | "expired" | (string & {});
export type PaymentProvider = "mock" | "kaspi" | "stripe" | (string & {});

export interface SubscriptionPlan {
  id: number;
  name: string;
  description: string | null;
  price: number;
  durationDays: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Subscription {
  id: number;
  userId: number;
  status: SubscriptionStatus;
  planId: number;
  plan: SubscriptionPlan | null;
  activeUntil: string;
  cancelledAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: number;
  userId: number;
  planId: number;
  amount: number;
  currency: string;
  status: PaymentStatus;
  provider: PaymentProvider;
  providerPaymentId: string | null;
  paymentUrl: string | null;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionPlanQuery {
  search?: string;
  durationDays?: number | "";
  isActive?: boolean | "";
}

export interface SubscriptionQuery {
  userId?: number | "";
  planId?: number | "";
  status?: SubscriptionStatus | "";
  limit?: number | "";
  offset?: number | "";
}

export type SubscriptionPlanCreateDto = Pick<
  SubscriptionPlan,
  "name" | "description" | "price" | "durationDays" | "isActive"
>;

export type SubscriptionPlanUpdateDto = SubscriptionPlanCreateDto;

export interface SubscriptionCreateDto {
  userId: number;
  planId: number;
  activeUntil?: string | null;
}

export interface SubscriptionUpdateDto {
  status?: SubscriptionStatus;
  planId?: number;
  activeUntil?: string | null;
  cancelledAt?: string | null;
}
