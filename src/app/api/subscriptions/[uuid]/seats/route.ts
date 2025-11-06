import { withAuth } from "../../../../../utils/withAuth";
import { salable } from "../../../../salable";
import { NextRequest } from "next/server";
import { State } from "../../../entitlements/check/route";
import { GetSubscriptionSeatsOptions } from "@salable/node-sdk/dist/src/types";

export const GET = withAuth(async (_state: State, request: NextRequest, context: { params: Promise<Record<string, string>> }) => {
  try {
    const { uuid } = await context.params;
    const { searchParams } = new URL(request.url);
    
    const cursor = searchParams.get("cursor");
    const take = searchParams.get("take");
    
    const options: GetSubscriptionSeatsOptions = {};
    if (cursor) options.cursor = cursor;
    if (take) options.take = parseInt(take, 10);

    const data = await salable.subscriptions.getSeats(uuid, options);

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    console.log(e);
    return new Response(JSON.stringify({ error: "Failed to fetch subscription seats" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
});

