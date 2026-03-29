import $api from "@/shared/api/http";
import type {
  ActionRule,
  ActionRuleCreateDto,
  ActionRuleUpdateDto,
} from "../model/types";
import {
  unwrapActionRuleListPayload,
  unwrapActionRulePayload,
} from "../model/normalize";

const ActionRulesService = {
  async getAll(): Promise<ActionRule[]> {
    const res = await $api.get<unknown>("/actionRules/getAll");
    return unwrapActionRuleListPayload(res.data);
  },

  async getByAction(action: string): Promise<ActionRule> {
    const res = await $api.get<unknown>(
      `/actionRules/get/${encodeURIComponent(action)}`,
    );
    const rule = unwrapActionRulePayload(res.data);
    if (!rule) throw new Error("Get action rule: invalid response");
    return rule;
  },

  async create(payload: ActionRuleCreateDto): Promise<ActionRule> {
    const res = await $api.post<unknown>("/actionRules/create", payload);
    return unwrapActionRulePayload(res.data) ?? payload;
  },

  async createMulti(payload: ActionRuleCreateDto[]): Promise<ActionRule[]> {
    const res = await $api.post<unknown>("/actionRules/createMulti", payload);
    const rules = unwrapActionRuleListPayload(res.data);
    return rules.length > 0 ? rules : payload;
  },

  async update(payload: ActionRuleUpdateDto): Promise<ActionRule> {
    const res = await $api.patch<unknown>("/actionRules/update", payload);
    return unwrapActionRulePayload(res.data) ?? payload;
  },

  async delete(action: string): Promise<void> {
    await $api.delete(`/actionRules/delete/${encodeURIComponent(action)}`);
  },
};

export default ActionRulesService;
