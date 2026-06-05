import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import CreditCardRoundedIcon from "@mui/icons-material/CreditCardRounded";
import WorkspacePremiumRoundedIcon from "@mui/icons-material/WorkspacePremiumRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import SubscriptionService from "@/features/subscriptions/api/SubscriptionService";
import type {
  Payment,
  Subscription,
  SubscriptionPlan,
} from "@/features/subscriptions/model/types";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { useUiStore } from "@/shared/store/useUiStore";
import { getApiErrorMessage } from "@/shared/lib/getApiErrorMessage";

function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
}

function formatMoney(value: number): string {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "KZT",
    maximumFractionDigits: 0,
  }).format(value);
}

const SubscriptionsPage: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const showSnackbar = useUiStore((state) => state.showSnackbar);

  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [activeSubscription, setActiveSubscription] =
    useState<Subscription | null>(null);
  const [lastPayment, setLastPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionPlanId, setActionPlanId] = useState<number | null>(null);
  const [mockLoading, setMockLoading] = useState(false);

  const activePlans = useMemo(
    () => plans.filter((plan) => plan.isActive),
    [plans],
  );

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [loadedPlans, active] = await Promise.all([
        SubscriptionService.listPlans({ isActive: true }),
        user?.id
          ? SubscriptionService.getActiveByUserId(user.id)
          : Promise.resolve(null),
      ]);
      setPlans(loadedPlans);
      setActiveSubscription(active);
    } catch (error) {
      showSnackbar(
        getApiErrorMessage(error) ?? "Failed to load subscriptions",
        "error",
      );
    } finally {
      setLoading(false);
    }
  }, [showSnackbar, user?.id]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  async function startPayment(planId: number) {
    setActionPlanId(planId);
    try {
      const payment = await SubscriptionService.createPayment(planId);
      setLastPayment(payment);
      showSnackbar("Payment created", "success");

      if (payment.paymentUrl) {
        window.open(payment.paymentUrl, "_blank", "noopener,noreferrer");
      }
    } catch (error) {
      showSnackbar(
        getApiErrorMessage(error) ?? "Failed to create payment",
        "error",
      );
    } finally {
      setActionPlanId(null);
    }
  }

  async function confirmMockPayment() {
    if (!lastPayment) return;

    setMockLoading(true);
    try {
      const subscription = await SubscriptionService.mockPay(lastPayment.id);
      setActiveSubscription(subscription);
      setLastPayment(null);
      showSnackbar("Subscription activated", "success");
    } catch (error) {
      showSnackbar(
        getApiErrorMessage(error) ?? "Failed to confirm mock payment",
        "error",
      );
    } finally {
      setMockLoading(false);
    }
  }

  return (
    <Box>
      <Stack
        direction={{ xs: "column", md: "row" }}
        alignItems={{ xs: "stretch", md: "center" }}
        justifyContent="space-between"
        gap={2}
        mb={2}
      >
        <Box>
          <Typography variant="h5" fontWeight={900}>
            Subscriptions
          </Typography>
          <Typography color="text.secondary">
            Manage your active plan and start a payment for available plans.
          </Typography>
        </Box>

        <Button variant="outlined" onClick={() => void loadData()}>
          Refresh
        </Button>
      </Stack>

      {loading ? (
        <Stack direction="row" spacing={1.5} alignItems="center">
          <CircularProgress size={22} />
          <Typography color="text.secondary">Loading subscriptions...</Typography>
        </Stack>
      ) : (
        <Stack gap={2}>
          <Paper
            sx={{
              p: 2.5,
              border: "1px solid",
              borderColor: "divider",
              backgroundColor: "background.paper",
            }}
          >
            <Stack direction="row" gap={1.25} alignItems="center" mb={1.25}>
              <WorkspacePremiumRoundedIcon color="primary" />
              <Typography fontWeight={900}>Active subscription</Typography>
            </Stack>

            {activeSubscription ? (
              <Stack gap={1}>
                <Typography variant="h6" fontWeight={900}>
                  {activeSubscription.plan?.name ?? `Plan #${activeSubscription.planId}`}
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  <Chip
                    color="success"
                    icon={<CheckCircleRoundedIcon />}
                    label={activeSubscription.status}
                  />
                  <Chip
                    label={`Active until ${formatDate(activeSubscription.activeUntil)}`}
                  />
                  <Chip label={`User #${activeSubscription.userId}`} />
                </Stack>
              </Stack>
            ) : (
              <Typography color="text.secondary">
                No active subscription yet.
              </Typography>
            )}
          </Paper>

          {lastPayment ? (
            <Paper
              sx={{
                p: 2.5,
                border: "1px solid",
                borderColor: "divider",
                backgroundColor: "background.paper",
              }}
            >
              <Stack
                direction={{ xs: "column", md: "row" }}
                justifyContent="space-between"
                gap={1.5}
              >
                <Box>
                  <Typography fontWeight={900}>
                    Pending payment #{lastPayment.id}
                  </Typography>
                  <Typography color="text.secondary">
                    {formatMoney(lastPayment.amount)} · {lastPayment.provider}
                  </Typography>
                </Box>

                <Stack direction={{ xs: "column", sm: "row" }} gap={1}>
                  {lastPayment.paymentUrl ? (
                    <Button
                      variant="outlined"
                      startIcon={<OpenInNewRoundedIcon />}
                      onClick={() =>
                        window.open(
                          lastPayment.paymentUrl ?? "",
                          "_blank",
                          "noopener,noreferrer",
                        )
                      }
                    >
                      Open payment
                    </Button>
                  ) : null}
                  <Button
                    variant="contained"
                    disabled={mockLoading}
                    onClick={() => void confirmMockPayment()}
                  >
                    Confirm mock payment
                  </Button>
                </Stack>
              </Stack>
            </Paper>
          ) : null}

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "minmax(0, 1fr)",
                md: "repeat(2, minmax(0, 1fr))",
                xl: "repeat(3, minmax(0, 1fr))",
              },
              gap: 2,
            }}
          >
            {activePlans.map((plan) => (
              <Paper
                key={plan.id}
                sx={{
                  p: 2.5,
                  border: "1px solid",
                  borderColor: "divider",
                  backgroundColor: "background.paper",
                }}
              >
                <Stack gap={1.5}>
                  <Stack direction="row" justifyContent="space-between" gap={1}>
                    <Box>
                      <Typography variant="h6" fontWeight={900}>
                        {plan.name}
                      </Typography>
                      <Typography color="text.secondary">
                        {plan.description || "No description"}
                      </Typography>
                    </Box>
                    <CreditCardRoundedIcon color="primary" />
                  </Stack>

                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    <Chip label={formatMoney(plan.price)} color="primary" />
                    <Chip label={`${plan.durationDays} days`} />
                  </Stack>

                  <Button
                    variant="contained"
                    disabled={actionPlanId === plan.id}
                    onClick={() => void startPayment(plan.id)}
                  >
                    {actionPlanId === plan.id ? "Creating..." : "Start payment"}
                  </Button>
                </Stack>
              </Paper>
            ))}
          </Box>

          {activePlans.length === 0 ? (
            <Typography color="text.secondary">No active plans available.</Typography>
          ) : null}
        </Stack>
      )}
    </Box>
  );
};

export default SubscriptionsPage;
