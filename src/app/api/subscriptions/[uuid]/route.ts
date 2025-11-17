import { withAuth } from "../../../../utils/withAuth";
import { salable } from "../../../salable";
import { SalableResponseError } from "@salable/node-sdk";
import { NextRequest } from "next/server";
import { State } from "../../entitlements/check/route";
import { Subscription, Plan, PlanCurrency } from "@salable/node-sdk/dist/src/types";

export type SubscriptionExpandedPlanCurrency = Subscription & {
  plan: Plan & {
    currencies: PlanCurrency[];
  };
};

export const GET = withAuth(async (_state: State, _request: NextRequest, context: { params: Promise<Record<string, string>> }) => {
  try {
    const { uuid } = await context.params;

    const data = (await salable.subscriptions.getOne(uuid, {
      expand: ["plan"],
    })) as SubscriptionExpandedPlanCurrency;

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    if (e instanceof SalableResponseError && e.code === "S1002") {
      return new Response(JSON.stringify(null), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
    return new Response(JSON.stringify({ error: "Failed to fetch subscription" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
});

