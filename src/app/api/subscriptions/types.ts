import { Plan, Subscription, PlanCurrency } from "@salable/node-sdk/dist/src/types";

export type SubscriptionExpandedPlan = Subscription & {
  plan: Plan;
};

export type GetAllSubscriptionsExpandedPlan = {
  first: string;
  last: string;
  data: SubscriptionExpandedPlan[];
};

export type SubscriptionExpandedPlanCurrency = Subscription & {
  plan: Plan & {
    currencies: PlanCurrency[];
  };
};
