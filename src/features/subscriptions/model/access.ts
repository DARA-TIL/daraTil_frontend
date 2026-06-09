import type { IUser } from "@/features/auth/model/IUser";
import type { Subscription } from "./types";

export function isActiveSubscription(
  subscription?: Subscription | null,
): subscription is Subscription {
  if (!subscription || subscription.status !== "active") return false;

  const activeUntil = new Date(subscription.activeUntil).getTime();
  return Number.isFinite(activeUntil) && activeUntil > Date.now();
}

export function hasActiveSubscription(user?: IUser | null): boolean {
  return isActiveSubscription(user?.subscription);
}
