import { withAuth } from "../../../utils/withAuth";
import { salable } from "../../salable";
import { salableProductUuid } from "../../constants";
import { NextRequest } from "next/server";
import { State } from "../entitlements/check/route";
import { Subscription, Plan } from "@salable/node-sdk/dist/src/types";

export type SubscriptionExpandedPlan = Subscription & {
  plan: Plan;
};

export type GetAllSubscriptionsExpandedPlan = {
  first: string;
  last: string;
  data: SubscriptionExpandedPlan[];
};

export const GET = withAuth(async (_state: State, request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    const data = (await salable.subscriptions.getAll({
      email: email || undefined,
      expand: ["plan"],
      sort: "desc",
      productUuid: salableProductUuid,
    })) as GetAllSubscriptionsExpandedPlan;

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: "Failed to fetch subscriptions" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
});

