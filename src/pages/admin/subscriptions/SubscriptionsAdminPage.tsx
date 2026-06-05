import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Chip,
  Divider,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import CreditCardRoundedIcon from "@mui/icons-material/CreditCardRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import SubscriptionService from "@/features/subscriptions/api/SubscriptionService";
import type {
  Subscription,
  SubscriptionPlan,
  SubscriptionStatus,
} from "@/features/subscriptions/model/types";
import { useUiStore } from "@/shared/store/useUiStore";
import { getApiErrorMessage } from "@/shared/lib/getApiErrorMessage";
import { requestConfirm } from "@/shared/store/useConfirmDialogStore";

const statusOptions: SubscriptionStatus[] = ["active", "expired", "cancelled"];

type PlanDraft = {
  id: number;
  name: string;
  description: string;
  price: number;
  durationDays: number;
  isActive: boolean;
};

type SubscriptionDraft = {
  id: number;
  userId: number;
  planId: number;
  status: SubscriptionStatus;
  activeUntil: string;
  cancelledAt: string;
};

function createPlanDraft(plan?: SubscriptionPlan | null): PlanDraft {
  return {
    id: plan?.id ?? 0,
    name: plan?.name ?? "",
    description: plan?.description ?? "",
    price: plan?.price ?? 0,
    durationDays: plan?.durationDays ?? 30,
    isActive: plan?.isActive ?? true,
  };
}

function createSubscriptionDraft(
  subscription?: Subscription | null,
): SubscriptionDraft {
  return {
    id: subscription?.id ?? 0,
    userId: subscription?.userId ?? 0,
    planId: subscription?.planId ?? 0,
    status: subscription?.status ?? "active",
    activeUntil: subscription?.activeUntil
      ? subscription.activeUntil.slice(0, 16)
      : "",
    cancelledAt: subscription?.cancelledAt
      ? subscription.cancelledAt.slice(0, 16)
      : "",
  };
}

function toIsoOrNull(value: string): string | null {
  if (!value.trim()) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toISOString();
}

function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

const SubscriptionsAdminPage: React.FC = () => {
  const showSnackbar = useUiStore((state) => state.showSnackbar);

  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [selectedSubscription, setSelectedSubscription] =
    useState<Subscription | null>(null);
  const [planDraft, setPlanDraft] = useState<PlanDraft>(createPlanDraft());
  const [subscriptionDraft, setSubscriptionDraft] =
    useState<SubscriptionDraft>(createSubscriptionDraft());
  const [plansSearch, setPlansSearch] = useState("");
  const [planActiveFilter, setPlanActiveFilter] = useState<string>("");
  const [subscriptionUserFilter, setSubscriptionUserFilter] = useState("");
  const [subscriptionStatusFilter, setSubscriptionStatusFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const planById = useMemo(
    () => new Map(plans.map((plan) => [plan.id, plan])),
    [plans],
  );

  const loadPlans = useCallback(async () => {
    const isActive =
      planActiveFilter === "" ? "" : planActiveFilter === "active";
    const loaded = await SubscriptionService.listPlans({
      search: plansSearch,
      isActive,
    });
    setPlans(loaded);
  }, [planActiveFilter, plansSearch]);

  const loadSubscriptions = useCallback(async () => {
    const loaded = await SubscriptionService.listSubscriptions({
      userId: subscriptionUserFilter ? Number(subscriptionUserFilter) : "",
      status: subscriptionStatusFilter as SubscriptionStatus | "",
      limit: 50,
    });
    setSubscriptions(loaded);
  }, [subscriptionStatusFilter, subscriptionUserFilter]);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([loadPlans(), loadSubscriptions()]);
    } catch (error) {
      showSnackbar(
        getApiErrorMessage(error) ?? "Failed to load subscription admin data",
        "error",
      );
    } finally {
      setLoading(false);
    }
  }, [loadPlans, loadSubscriptions, showSnackbar]);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  useEffect(() => {
    setPlanDraft(createPlanDraft(selectedPlan));
  }, [selectedPlan]);

  useEffect(() => {
    setSubscriptionDraft(createSubscriptionDraft(selectedSubscription));
  }, [selectedSubscription]);

  async function runAction(action: () => Promise<void>, success: string) {
    setActionLoading(true);
    try {
      await action();
      await loadAll();
      showSnackbar(success, "success");
    } catch (error) {
      showSnackbar(getApiErrorMessage(error) ?? "Action failed", "error");
    } finally {
      setActionLoading(false);
    }
  }

  async function savePlan() {
    const payload = {
      name: planDraft.name.trim(),
      description: planDraft.description.trim() || null,
      price: Math.max(0, Math.round(planDraft.price)),
      durationDays: Math.max(1, Math.round(planDraft.durationDays)),
      isActive: planDraft.isActive,
    };

    if (!payload.name) {
      showSnackbar("Plan name is required", "warning");
      return;
    }

    await runAction(async () => {
      const plan = planDraft.id
        ? await SubscriptionService.updatePlan(planDraft.id, payload)
        : await SubscriptionService.createPlan(payload);
      setSelectedPlan(plan);
    }, planDraft.id ? "Plan saved" : "Plan created");
  }

  async function deletePlan(id: number) {
    const ok = await requestConfirm({
      title: "Delete subscription plan",
      message: "Delete this subscription plan?",
      confirmLabel: "Delete",
      variant: "danger",
    });
    if (!ok) return;

    await runAction(async () => {
      await SubscriptionService.deletePlan(id);
      setSelectedPlan(null);
    }, "Plan deleted");
  }

  async function saveSubscription() {
    if (!subscriptionDraft.userId || !subscriptionDraft.planId) {
      showSnackbar("User ID and plan ID are required", "warning");
      return;
    }

    await runAction(async () => {
      const subscription = subscriptionDraft.id
        ? await SubscriptionService.updateSubscription(subscriptionDraft.id, {
            status: subscriptionDraft.status,
            planId: subscriptionDraft.planId,
            activeUntil: toIsoOrNull(subscriptionDraft.activeUntil),
            cancelledAt: toIsoOrNull(subscriptionDraft.cancelledAt),
          })
        : await SubscriptionService.createSubscription({
            userId: subscriptionDraft.userId,
            planId: subscriptionDraft.planId,
            activeUntil: toIsoOrNull(subscriptionDraft.activeUntil),
          });
      setSelectedSubscription(subscription);
    }, subscriptionDraft.id ? "Subscription saved" : "Subscription created");
  }

  async function deleteSubscription(id: number) {
    const ok = await requestConfirm({
      title: "Delete subscription",
      message: "Delete this user subscription?",
      confirmLabel: "Delete",
      variant: "danger",
    });
    if (!ok) return;

    await runAction(async () => {
      await SubscriptionService.deleteSubscription(id);
      setSelectedSubscription(null);
    }, "Subscription deleted");
  }

  return (
    <Box>
      <Stack
        direction={{ xs: "column", lg: "row" }}
        alignItems={{ xs: "stretch", lg: "center" }}
        justifyContent="space-between"
        gap={2}
        mb={2}
      >
        <Box>
          <Typography variant="h5" fontWeight={900}>
            Subscriptions admin
          </Typography>
          <Typography color="text.secondary">
            Manage subscription plans, user subscriptions, payment activation
            lifecycle, and admin overrides.
          </Typography>
        </Box>

        <Button
          variant="outlined"
          startIcon={<RefreshRoundedIcon />}
          disabled={loading}
          onClick={() => void loadAll()}
        >
          Refresh
        </Button>
      </Stack>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "minmax(0, 1fr)", xl: "1fr 1fr" },
          gap: 2,
          alignItems: "start",
        }}
      >
        <Paper sx={{ p: 2, border: "1px solid", borderColor: "divider" }}>
          <Stack gap={2}>
            <Stack
              direction={{ xs: "column", md: "row" }}
              justifyContent="space-between"
              gap={1.5}
            >
              <Stack direction="row" gap={1} alignItems="center">
                <CreditCardRoundedIcon color="primary" />
                <Typography fontWeight={900}>Plans</Typography>
              </Stack>

              <Button
                variant="contained"
                startIcon={<AddRoundedIcon />}
                onClick={() => setSelectedPlan(null)}
              >
                New plan
              </Button>
            </Stack>

            <Stack direction={{ xs: "column", md: "row" }} gap={1.5}>
              <TextField
                label="Search"
                value={plansSearch}
                onChange={(event) => setPlansSearch(event.target.value)}
                fullWidth
              />
              <TextField
                label="Active"
                value={planActiveFilter}
                onChange={(event) => setPlanActiveFilter(event.target.value)}
                select
                sx={{ minWidth: 160 }}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </TextField>
              <Button variant="outlined" onClick={() => void loadPlans()}>
                Apply
              </Button>
            </Stack>

            <Stack gap={1}>
              {plans.map((plan) => {
                const selected = selectedPlan?.id === plan.id;
                return (
                  <Paper
                    key={plan.id}
                    variant="outlined"
                    sx={{
                      p: 1.5,
                      borderColor: selected ? "primary.main" : "divider",
                    }}
                  >
                    <Stack
                      direction={{ xs: "column", md: "row" }}
                      justifyContent="space-between"
                      gap={1}
                    >
                      <Box>
                        <Typography fontWeight={900}>{plan.name}</Typography>
                        <Typography color="text.secondary">
                          #{plan.id} · {plan.price} KZT · {plan.durationDays} days
                        </Typography>
                      </Box>
                      <Stack direction="row" gap={1} flexWrap="wrap" useFlexGap>
                        <Chip
                          size="small"
                          color={plan.isActive ? "success" : "default"}
                          label={plan.isActive ? "Active" : "Inactive"}
                        />
                        <Button
                          variant={selected ? "contained" : "outlined"}
                          onClick={() => setSelectedPlan(plan)}
                        >
                          Edit
                        </Button>
                      </Stack>
                    </Stack>
                  </Paper>
                );
              })}
            </Stack>

            <Divider />

            <Typography fontWeight={900}>
              {planDraft.id ? `Edit plan #${planDraft.id}` : "Create plan"}
            </Typography>
            <Stack gap={1.5}>
              <TextField
                label="Name"
                value={planDraft.name}
                onChange={(event) =>
                  setPlanDraft((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
                fullWidth
              />
              <TextField
                label="Description"
                value={planDraft.description}
                onChange={(event) =>
                  setPlanDraft((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
                multiline
                minRows={2}
                fullWidth
              />
              <Stack direction={{ xs: "column", md: "row" }} gap={1.5}>
                <TextField
                  label="Price"
                  type="number"
                  value={planDraft.price}
                  onChange={(event) =>
                    setPlanDraft((current) => ({
                      ...current,
                      price: Number(event.target.value) || 0,
                    }))
                  }
                  fullWidth
                />
                <TextField
                  label="Duration days"
                  type="number"
                  value={planDraft.durationDays}
                  onChange={(event) =>
                    setPlanDraft((current) => ({
                      ...current,
                      durationDays: Number(event.target.value) || 1,
                    }))
                  }
                  fullWidth
                />
                <TextField
                  label="Active"
                  value={planDraft.isActive ? "true" : "false"}
                  onChange={(event) =>
                    setPlanDraft((current) => ({
                      ...current,
                      isActive: event.target.value === "true",
                    }))
                  }
                  select
                  fullWidth
                >
                  <MenuItem value="true">Active</MenuItem>
                  <MenuItem value="false">Inactive</MenuItem>
                </TextField>
              </Stack>

              <Stack direction={{ xs: "column", sm: "row" }} gap={1}>
                <Button
                  variant="contained"
                  startIcon={planDraft.id ? <SaveRoundedIcon /> : <AddRoundedIcon />}
                  disabled={actionLoading}
                  onClick={() => void savePlan()}
                >
                  {planDraft.id ? "Save plan" : "Create plan"}
                </Button>
                {planDraft.id ? (
                  <Button
                    color="error"
                    startIcon={<DeleteOutlineRoundedIcon />}
                    disabled={actionLoading}
                    onClick={() => void deletePlan(planDraft.id)}
                  >
                    Delete
                  </Button>
                ) : null}
              </Stack>
            </Stack>
          </Stack>
        </Paper>

        <Paper sx={{ p: 2, border: "1px solid", borderColor: "divider" }}>
          <Stack gap={2}>
            <Stack
              direction={{ xs: "column", md: "row" }}
              justifyContent="space-between"
              gap={1.5}
            >
              <Typography fontWeight={900}>User subscriptions</Typography>
              <Button
                variant="contained"
                startIcon={<AddRoundedIcon />}
                onClick={() => setSelectedSubscription(null)}
              >
                New subscription
              </Button>
            </Stack>

            <Stack direction={{ xs: "column", md: "row" }} gap={1.5}>
              <TextField
                label="User ID"
                value={subscriptionUserFilter}
                onChange={(event) =>
                  setSubscriptionUserFilter(event.target.value)
                }
                fullWidth
              />
              <TextField
                label="Status"
                value={subscriptionStatusFilter}
                onChange={(event) =>
                  setSubscriptionStatusFilter(event.target.value)
                }
                select
                sx={{ minWidth: 160 }}
              >
                <MenuItem value="">All</MenuItem>
                {statusOptions.map((status) => (
                  <MenuItem key={status} value={status}>
                    {status}
                  </MenuItem>
                ))}
              </TextField>
              <Button variant="outlined" onClick={() => void loadSubscriptions()}>
                Apply
              </Button>
            </Stack>

            <Stack gap={1}>
              {subscriptions.map((subscription) => {
                const selected = selectedSubscription?.id === subscription.id;
                const plan = subscription.plan ?? planById.get(subscription.planId);
                return (
                  <Paper
                    key={subscription.id}
                    variant="outlined"
                    sx={{
                      p: 1.5,
                      borderColor: selected ? "primary.main" : "divider",
                    }}
                  >
                    <Stack
                      direction={{ xs: "column", md: "row" }}
                      justifyContent="space-between"
                      gap={1}
                    >
                      <Box>
                        <Typography fontWeight={900}>
                          Subscription #{subscription.id}
                        </Typography>
                        <Typography color="text.secondary">
                          User #{subscription.userId} ·{" "}
                          {plan?.name ?? `Plan #${subscription.planId}`} · until{" "}
                          {formatDate(subscription.activeUntil)}
                        </Typography>
                      </Box>
                      <Stack direction="row" gap={1} flexWrap="wrap" useFlexGap>
                        <Chip size="small" label={subscription.status} />
                        <Button
                          variant={selected ? "contained" : "outlined"}
                          onClick={() => setSelectedSubscription(subscription)}
                        >
                          Edit
                        </Button>
                      </Stack>
                    </Stack>
                  </Paper>
                );
              })}
            </Stack>

            <Divider />

            <Typography fontWeight={900}>
              {subscriptionDraft.id
                ? `Edit subscription #${subscriptionDraft.id}`
                : "Create subscription"}
            </Typography>
            <Stack gap={1.5}>
              <Stack direction={{ xs: "column", md: "row" }} gap={1.5}>
                <TextField
                  label="User ID"
                  type="number"
                  value={subscriptionDraft.userId}
                  onChange={(event) =>
                    setSubscriptionDraft((current) => ({
                      ...current,
                      userId: Number(event.target.value) || 0,
                    }))
                  }
                  fullWidth
                />
                <TextField
                  label="Plan"
                  value={subscriptionDraft.planId || ""}
                  onChange={(event) =>
                    setSubscriptionDraft((current) => ({
                      ...current,
                      planId: Number(event.target.value) || 0,
                    }))
                  }
                  select
                  fullWidth
                >
                  {plans.map((plan) => (
                    <MenuItem key={plan.id} value={plan.id}>
                      #{plan.id} {plan.name}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  label="Status"
                  value={subscriptionDraft.status}
                  onChange={(event) =>
                    setSubscriptionDraft((current) => ({
                      ...current,
                      status: event.target.value as SubscriptionStatus,
                    }))
                  }
                  select
                  fullWidth
                  disabled={!subscriptionDraft.id}
                >
                  {statusOptions.map((status) => (
                    <MenuItem key={status} value={status}>
                      {status}
                    </MenuItem>
                  ))}
                </TextField>
              </Stack>

              <Stack direction={{ xs: "column", md: "row" }} gap={1.5}>
                <TextField
                  label="Active until"
                  type="datetime-local"
                  value={subscriptionDraft.activeUntil}
                  onChange={(event) =>
                    setSubscriptionDraft((current) => ({
                      ...current,
                      activeUntil: event.target.value,
                    }))
                  }
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
                <TextField
                  label="Cancelled at"
                  type="datetime-local"
                  value={subscriptionDraft.cancelledAt}
                  onChange={(event) =>
                    setSubscriptionDraft((current) => ({
                      ...current,
                      cancelledAt: event.target.value,
                    }))
                  }
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  disabled={!subscriptionDraft.id}
                />
              </Stack>

              <Stack direction={{ xs: "column", sm: "row" }} gap={1}>
                <Button
                  variant="contained"
                  startIcon={
                    subscriptionDraft.id ? <SaveRoundedIcon /> : <AddRoundedIcon />
                  }
                  disabled={actionLoading}
                  onClick={() => void saveSubscription()}
                >
                  {subscriptionDraft.id
                    ? "Save subscription"
                    : "Create subscription"}
                </Button>
                {subscriptionDraft.id ? (
                  <>
                    <Button
                      variant="outlined"
                      disabled={actionLoading}
                      onClick={() =>
                        void runAction(
                          () =>
                            SubscriptionService.cancelSubscription(
                              subscriptionDraft.id,
                            ),
                          "Subscription cancelled",
                        )
                      }
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="outlined"
                      disabled={actionLoading}
                      onClick={() =>
                        void runAction(
                          () =>
                            SubscriptionService.expireSubscription(
                              subscriptionDraft.id,
                            ),
                          "Subscription expired",
                        )
                      }
                    >
                      Expire
                    </Button>
                    <Button
                      color="error"
                      startIcon={<DeleteOutlineRoundedIcon />}
                      disabled={actionLoading}
                      onClick={() => void deleteSubscription(subscriptionDraft.id)}
                    >
                      Delete
                    </Button>
                  </>
                ) : null}
              </Stack>
            </Stack>
          </Stack>
        </Paper>
      </Box>
    </Box>
  );
};

export default SubscriptionsAdminPage;
