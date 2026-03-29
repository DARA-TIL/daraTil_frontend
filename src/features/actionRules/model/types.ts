import type { AchievementAction } from "@/features/achievements/model/actions";

export type ActionRulesMap = Record<string, boolean>;

export interface ActionRule {
  action: AchievementAction;
  rules: ActionRulesMap;
}

export type ActionRuleCreateDto = ActionRule;
export type ActionRuleUpdateDto = ActionRule;
