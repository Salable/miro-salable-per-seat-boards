import { withAuth } from "../../../../../utils/withAuth";
import { salable } from "../../../../salable";
import { z } from "zod";
import { NextRequest } from "next/server";
import { State } from "../../../entitlements/check/route";

const schema = z.object({
  planUuid: z.string(),
});

export const POST = withAuth(async (_state: State, request: NextRequest, context) => {
  try {
    const { uuid } = await context.params;
    const rawBody = await request.json();
    const parseResult = schema.safeParse(rawBody);

    if (!parseResult.success) {
      return new Response(
        JSON.stringify({
          error: "Validation errors",
          metadata: parseResult.error.flatten(),
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const { planUuid } = parseResult.data;

    await salable.subscriptions.changePlan(uuid, {
      planUuid,
      proration: "always_invoice",
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: "Failed to update subscription" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
});

