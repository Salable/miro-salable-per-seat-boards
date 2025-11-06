import { withAuth } from "../../../../../utils/withAuth";
import { salable } from "../../../../salable";
import { NextRequest } from "next/server";
import { State } from "../../../entitlements/check/route";
import { ManageSeatOptions } from "@salable/node-sdk/dist/src/types";

export const PATCH = withAuth(async (_state: State, request: NextRequest, context: { params: Promise<Record<string, string>> }) => {
  try {
    const { uuid } = await context.params;
    const body = await request.json();
    const options = body as ManageSeatOptions[];
    
    await salable.subscriptions.manageSeats(uuid, options);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to manage seats" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
});

