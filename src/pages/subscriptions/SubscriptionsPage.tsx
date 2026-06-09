import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import CreditCardRoundedIcon from "@mui/icons-material/CreditCardRounded";
import LockClockRoundedIcon from "@mui/icons-material/LockClockRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import RecordVoiceOverRoundedIcon from "@mui/icons-material/RecordVoiceOverRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import SmartToyRoundedIcon from "@mui/icons-material/SmartToyRounded";
import TranslateRoundedIcon from "@mui/icons-material/TranslateRounded";
import WorkspacePremiumRoundedIcon from "@mui/icons-material/WorkspacePremiumRounded";
import { useTranslation } from "react-i18next";
import SubscriptionService from "@/features/subscriptions/api/SubscriptionService";
import { isActiveSubscription } from "@/features/subscriptions/model/access";
import type {
  Payment,
  Subscription,
  SubscriptionPlan,
} from "@/features/subscriptions/model/types";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { useUiStore } from "@/shared/store/useUiStore";
import { getApiErrorMessage } from "@/shared/lib/getApiErrorMessage";

type Benefit = {
  icon: React.ReactNode;
  title: string;
  description: string;
};

function BenefitRow({ benefit }: { benefit: Benefit }) {
  return (
    <Stack direction="row" spacing={1.25} alignItems="flex-start">
      <Box
        sx={{
          width: 34,
          height: 34,
          flex: "0 0 auto",
          display: "grid",
          placeItems: "center",
          borderRadius: 1,
          bgcolor: "action.hover",
          color: "primary.main",
          "& svg": { fontSize: 19 },
        }}
      >
        {benefit.icon}
      </Box>
      <Box minWidth={0}>
        <Typography fontWeight={800}>{benefit.title}</Typography>
        <Typography variant="body2" color="text.secondary">
          {benefit.description}
        </Typography>
      </Box>
    </Stack>
  );
}

const SubscriptionsPage: React.FC = () => {
  const theme = useTheme();
  const { t, i18n } = useTranslation("subscriptions");
  const user = useAuthStore((state) => state.user);
  const checkAuth = useAuthStore((state) => state.checkAuth);
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
  const premiumActive = isActiveSubscription(
    activeSubscription ?? user?.subscription,
  );

  const formatDate = useCallback(
    (value: string | null | undefined): string => {
      if (!value) return "—";
      const date = new Date(value);
      return Number.isNaN(date.getTime())
        ? value
        : new Intl.DateTimeFormat(i18n.language, {
            day: "numeric",
            month: "long",
            year: "numeric",
          }).format(date);
    },
    [i18n.language],
  );

  const formatMoney = useCallback(
    (value: number): string =>
      new Intl.NumberFormat(i18n.language, {
        style: "currency",
        currency: "KZT",
        maximumFractionDigits: 0,
      }).format(value),
    [i18n.language],
  );

  const freeBenefits: Benefit[] = [
    {
      icon: <SchoolRoundedIcon />,
      title: t("free.learning.title"),
      description: t("free.learning.description"),
    },
    {
      icon: <SmartToyRoundedIcon />,
      title: t("free.ai.title"),
      description: t("free.ai.description"),
    },
    {
      icon: <TranslateRoundedIcon />,
      title: t("free.explain.title"),
      description: t("free.explain.description"),
    },
    {
      icon: <RecordVoiceOverRoundedIcon />,
      title: t("free.speech.title"),
      description: t("free.speech.description"),
    },
  ];

  const premiumBenefits: Benefit[] = [
    {
      icon: <SmartToyRoundedIcon />,
      title: t("premium.ai.title"),
      description: t("premium.ai.description"),
    },
    {
      icon: <TranslateRoundedIcon />,
      title: t("premium.explain.title"),
      description: t("premium.explain.description"),
    },
    {
      icon: <RecordVoiceOverRoundedIcon />,
      title: t("premium.speech.title"),
      description: t("premium.speech.description"),
    },
    {
      icon: <CheckCircleRoundedIcon />,
      title: t("premium.everything.title"),
      description: t("premium.everything.description"),
    },
  ];

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
        getApiErrorMessage(error) ?? t("messages.loadFailed"),
        "error",
      );
    } finally {
      setLoading(false);
    }
  }, [showSnackbar, t, user?.id]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  async function startPayment(planId: number) {
    setActionPlanId(planId);
    try {
      const payment = await SubscriptionService.createPayment(planId);
      setLastPayment(payment);

      if (payment.provider === "mock") {
        showSnackbar(t("messages.mockCreated"), "info");
      } else if (payment.paymentUrl) {
        window.open(payment.paymentUrl, "_blank", "noopener,noreferrer");
        showSnackbar(t("messages.paymentOpened"), "success");
      } else {
        showSnackbar(t("messages.paymentCreated"), "success");
      }
    } catch (error) {
      showSnackbar(
        getApiErrorMessage(error) ?? t("messages.paymentFailed"),
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
      await checkAuth();
      showSnackbar(t("messages.activated"), "success");
    } catch (error) {
      showSnackbar(
        getApiErrorMessage(error) ?? t("messages.confirmFailed"),
        "error",
      );
    } finally {
      setMockLoading(false);
    }
  }

  return (
    <Stack gap={3}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        alignItems={{ xs: "stretch", sm: "center" }}
        justifyContent="space-between"
        gap={2}
      >
        <Box>
          <Typography variant="h5" fontWeight={900}>
            {t("title")}
          </Typography>
          <Typography color="text.secondary">{t("subtitle")}</Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<RefreshRoundedIcon />}
          onClick={() => void loadData()}
          disabled={loading}
        >
          {t("refresh")}
        </Button>
      </Stack>

      <Alert
        severity={premiumActive ? "success" : "info"}
        icon={
          premiumActive ? (
            <WorkspacePremiumRoundedIcon />
          ) : (
            <LockClockRoundedIcon />
          )
        }
        sx={{ alignItems: "center" }}
      >
        <Typography fontWeight={800}>
          {premiumActive ? t("status.premium") : t("status.free")}
        </Typography>
        <Typography variant="body2">
          {premiumActive
            ? t("status.activeUntil", {
                date: formatDate(
                  (activeSubscription ?? user?.subscription)?.activeUntil,
                ),
              })
            : t("status.freeDescription")}
        </Typography>
      </Alert>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "minmax(0, 1fr)", md: "repeat(2, minmax(0, 1fr))" },
          gap: 2,
          alignItems: "stretch",
        }}
      >
        <Paper
          variant="outlined"
          sx={{ p: { xs: 2, sm: 2.5 }, borderColor: "divider" }}
        >
          <Stack gap={2.25} height="100%">
            <Stack direction="row" justifyContent="space-between" gap={1}>
              <Box>
                <Typography variant="h6" fontWeight={900}>
                  {t("free.title")}
                </Typography>
                <Typography color="text.secondary">
                  {t("free.subtitle")}
                </Typography>
              </Box>
              <Chip label={t("free.price")} />
            </Stack>
            <Divider />
            <Stack gap={2}>
              {freeBenefits.map((benefit) => (
                <BenefitRow key={benefit.title} benefit={benefit} />
              ))}
            </Stack>
            <Alert severity="warning" icon={<LockClockRoundedIcon />} sx={{ mt: "auto" }}>
              {t("free.limit")}
            </Alert>
          </Stack>
        </Paper>

        <Paper
          sx={{
            p: { xs: 2, sm: 2.5 },
            border: "1px solid",
            borderColor: alpha(theme.palette.primary.main, 0.45),
            bgcolor: alpha(theme.palette.primary.main, 0.035),
            boxShadow: `0 14px 34px ${alpha(theme.palette.primary.main, 0.12)}`,
          }}
        >
          <Stack gap={2.25} height="100%">
            <Stack direction="row" justifyContent="space-between" gap={1}>
              <Box>
                <Stack direction="row" alignItems="center" gap={0.8}>
                  <WorkspacePremiumRoundedIcon color="primary" />
                  <Typography variant="h6" fontWeight={900}>
                    {t("premium.title")}
                  </Typography>
                </Stack>
                <Typography color="text.secondary">
                  {t("premium.subtitle")}
                </Typography>
              </Box>
              <Chip
                color={premiumActive ? "success" : "primary"}
                label={premiumActive ? t("premium.active") : t("premium.unlimited")}
              />
            </Stack>
            <Divider />
            <Stack gap={2}>
              {premiumBenefits.map((benefit) => (
                <BenefitRow key={benefit.title} benefit={benefit} />
              ))}
            </Stack>
          </Stack>
        </Paper>
      </Box>

      <Box>
        <Typography variant="h6" fontWeight={900}>
          {premiumActive ? t("plans.extendTitle") : t("plans.title")}
        </Typography>
        <Typography color="text.secondary" mb={2}>
          {premiumActive ? t("plans.extendSubtitle") : t("plans.subtitle")}
        </Typography>

        {loading ? (
          <Stack direction="row" spacing={1.5} alignItems="center">
            <CircularProgress size={22} />
            <Typography color="text.secondary">{t("loading")}</Typography>
          </Stack>
        ) : (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "minmax(0, 1fr)",
                sm: "repeat(2, minmax(0, 1fr))",
                xl: "repeat(3, minmax(0, 1fr))",
              },
              gap: 2,
            }}
          >
            {activePlans.map((plan) => (
              <Paper
                key={plan.id}
                variant="outlined"
                sx={{ p: 2.25, display: "flex", flexDirection: "column", gap: 2 }}
              >
                <Stack direction="row" justifyContent="space-between" gap={1}>
                  <Box minWidth={0}>
                    <Typography variant="h6" fontWeight={900}>
                      {plan.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {plan.description || t("plans.defaultDescription")}
                    </Typography>
                  </Box>
                  <CreditCardRoundedIcon color="primary" />
                </Stack>

                <Box>
                  <Typography variant="h5" fontWeight={900}>
                    {formatMoney(plan.price)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t("plans.duration", { count: plan.durationDays })}
                  </Typography>
                </Box>

                <Button
                  variant="contained"
                  disabled={actionPlanId !== null}
                  onClick={() => void startPayment(plan.id)}
                  sx={{ mt: "auto" }}
                >
                  {actionPlanId === plan.id
                    ? t("plans.creating")
                    : premiumActive
                      ? t("plans.extend")
                      : t("plans.choose")}
                </Button>
              </Paper>
            ))}
          </Box>
        )}

        {!loading && activePlans.length === 0 ? (
          <Alert severity="info">{t("plans.empty")}</Alert>
        ) : null}
      </Box>

      {lastPayment ? (
        <Paper
          variant="outlined"
          sx={{ p: 2.25, borderColor: alpha(theme.palette.info.main, 0.45) }}
        >
          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "stretch", md: "center" }}
            gap={2}
          >
            <Box>
              <Typography fontWeight={900}>{t("payment.title")}</Typography>
              <Typography color="text.secondary">
                {t("payment.details", {
                  id: lastPayment.id,
                  amount: formatMoney(lastPayment.amount),
                })}
              </Typography>
            </Box>
            <Stack direction={{ xs: "column", sm: "row" }} gap={1}>
              {lastPayment.provider !== "mock" && lastPayment.paymentUrl ? (
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
                  {t("payment.open")}
                </Button>
              ) : null}
              {lastPayment.provider === "mock" ? (
                <Button
                  variant="contained"
                  disabled={mockLoading}
                  onClick={() => void confirmMockPayment()}
                >
                  {mockLoading ? t("payment.activating") : t("payment.activate")}
                </Button>
              ) : null}
            </Stack>
          </Stack>
        </Paper>
      ) : null}
    </Stack>
  );
};

export default SubscriptionsPage;
