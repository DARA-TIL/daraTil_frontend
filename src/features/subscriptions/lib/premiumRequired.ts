import axios from "axios";
import i18n from "@/shared/config/i18n/i18n";
import { getApiErrorMessage } from "@/shared/lib/getApiErrorMessage";
import { useUiStore } from "@/shared/store/useUiStore";

const PREMIUM_REQUIRED_ERROR = "premium required: free daily limit exceeded";

export function isPremiumRequiredError(error: unknown): boolean {
  const message =
    typeof error === "string" ? error : getApiErrorMessage(error) ?? "";

  return (
    (axios.isAxiosError(error) && error.response?.status === 423) ||
    message.toLowerCase().includes(PREMIUM_REQUIRED_ERROR)
  );
}

export function showPremiumRequired(error: unknown): boolean {
  if (!isPremiumRequiredError(error)) return false;

  useUiStore.getState().showSnackbar(
    i18n.t("premiumLimit.message", {
      ns: "subscriptions",
      defaultValue:
        "Free daily limit reached. Upgrade to Premium to continue without limits.",
    }),
    "warning",
    {
      actionLabel: i18n.t("premiumLimit.action", {
        ns: "subscriptions",
        defaultValue: "View plans",
      }),
      actionTo: "/app/subscriptions",
    },
  );

  return true;
}
