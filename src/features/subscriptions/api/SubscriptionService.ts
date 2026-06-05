import $api from "@/shared/api/http";
import { isRecord, unwrapApiData } from "@/shared/lib/unknownRecord";
import type {
  Payment,
  Subscription,
  SubscriptionCreateDto,
  SubscriptionPlan,
  SubscriptionPlanCreateDto,
  SubscriptionPlanQuery,
  SubscriptionPlanUpdateDto,
  SubscriptionQuery,
  SubscriptionUpdateDto,
} from "../model/types";

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function asNullableString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null;
}

function asNumber(value: unknown): number {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : 0;
}

function asBoolean(value: unknown): boolean {
  return Boolean(value);
}

function normalizePlan(payload: unknown): SubscriptionPlan {
  const source = isRecord(payload) ? payload : {};

  return {
    id: asNumber(source.id ?? source.ID),
    name: asString(source.name ?? source.Name),
    description: asNullableString(source.description ?? source.Description),
    price: asNumber(source.price ?? source.Price),
    durationDays: asNumber(source.durationDays ?? source.DurationDays),
    isActive: asBoolean(source.isActive ?? source.IsActive),
    createdAt: asString(source.createdAt ?? source.CreatedAt),
    updatedAt: asString(source.updatedAt ?? source.UpdatedAt),
  };
}

function normalizeSubscription(payload: unknown): Subscription {
  const source = isRecord(payload) ? payload : {};
  const planSource = source.plan ?? source.Plan;

  return {
    id: asNumber(source.id ?? source.ID),
    userId: asNumber(source.userId ?? source.UserID),
    status: asString(source.status ?? source.Status),
    planId: asNumber(source.planId ?? source.PlanID),
    plan: isRecord(planSource) ? normalizePlan(planSource) : null,
    activeUntil: asString(source.activeUntil ?? source.ActiveUntil),
    cancelledAt: asNullableString(source.cancelledAt ?? source.CancelledAt),
    createdAt: asString(source.createdAt ?? source.CreatedAt),
    updatedAt: asString(source.updatedAt ?? source.UpdatedAt),
  };
}

function normalizePayment(payload: unknown): Payment {
  const source = isRecord(payload) ? payload : {};

  return {
    id: asNumber(source.id ?? source.ID),
    userId: asNumber(source.userId ?? source.UserID),
    planId: asNumber(source.planId ?? source.PlanID),
    amount: asNumber(source.amount ?? source.Amount),
    currency: asString(source.currency ?? source.Currency),
    status: asString(source.status ?? source.Status),
    provider: asString(source.provider ?? source.Provider),
    providerPaymentId: asNullableString(
      source.providerPaymentId ?? source.ProviderPaymentID,
    ),
    paymentUrl: asNullableString(source.paymentUrl ?? source.PaymentURL),
    paidAt: asNullableString(source.paidAt ?? source.PaidAt),
    createdAt: asString(source.createdAt ?? source.CreatedAt),
    updatedAt: asString(source.updatedAt ?? source.UpdatedAt),
  };
}

function unwrapList(payload: unknown): unknown[] {
  const value = unwrapApiData(payload);
  return Array.isArray(value) ? value : [];
}

function cleanParams(params: object) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== "" && value != null),
  );
}

const SubscriptionService = {
  async listPlans(query: SubscriptionPlanQuery = {}): Promise<SubscriptionPlan[]> {
    const response = await $api.get<unknown>("/subscription-plans", {
      params: cleanParams(query),
    });
    return unwrapList(response.data).map(normalizePlan);
  },

  async getPlanById(id: number): Promise<SubscriptionPlan> {
    const response = await $api.get<unknown>(`/subscription-plans/${id}`);
    return normalizePlan(unwrapApiData(response.data));
  },

  async createPlan(payload: SubscriptionPlanCreateDto): Promise<SubscriptionPlan> {
    const response = await $api.post<unknown>("/subscription-plans", payload);
    return normalizePlan(unwrapApiData(response.data));
  },

  async updatePlan(
    id: number,
    payload: SubscriptionPlanUpdateDto,
  ): Promise<SubscriptionPlan> {
    const response = await $api.patch<unknown>(
      `/subscription-plans/${id}`,
      payload,
    );
    return normalizePlan(unwrapApiData(response.data));
  },

  async deletePlan(id: number): Promise<void> {
    await $api.delete(`/subscription-plans/${id}`);
  },

  async listSubscriptions(query: SubscriptionQuery = {}): Promise<Subscription[]> {
    const response = await $api.get<unknown>("/subscriptions", {
      params: cleanParams(query),
    });
    return unwrapList(response.data).map(normalizeSubscription);
  },

  async getSubscriptionById(id: number): Promise<Subscription> {
    const response = await $api.get<unknown>(`/subscriptions/${id}`);
    return normalizeSubscription(unwrapApiData(response.data));
  },

  async getActiveByUserId(userId: number): Promise<Subscription | null> {
    try {
      const response = await $api.get<unknown>(
        `/subscriptions/users/${userId}/active`,
      );
      return normalizeSubscription(unwrapApiData(response.data));
    } catch {
      return null;
    }
  },

  async createSubscription(
    payload: SubscriptionCreateDto,
  ): Promise<Subscription> {
    const response = await $api.post<unknown>("/subscriptions", payload);
    return normalizeSubscription(unwrapApiData(response.data));
  },

  async updateSubscription(
    id: number,
    payload: SubscriptionUpdateDto,
  ): Promise<Subscription> {
    const response = await $api.patch<unknown>(`/subscriptions/${id}`, payload);
    return normalizeSubscription(unwrapApiData(response.data));
  },

  async deleteSubscription(id: number): Promise<void> {
    await $api.delete(`/subscriptions/${id}`);
  },

  async cancelSubscription(id: number): Promise<void> {
    await $api.patch(`/subscriptions/${id}/cancel`);
  },

  async expireSubscription(id: number): Promise<void> {
    await $api.patch(`/subscriptions/${id}/expire`);
  },

  async createPayment(planId: number): Promise<Payment> {
    const response = await $api.post<unknown>("/payments", { planId });
    return normalizePayment(unwrapApiData(response.data));
  },

  async mockPay(paymentId: number): Promise<Subscription> {
    const response = await $api.get<unknown>(`/payments/${paymentId}/mock-pay`);
    return normalizeSubscription(unwrapApiData(response.data));
  },
};

export default SubscriptionService;
