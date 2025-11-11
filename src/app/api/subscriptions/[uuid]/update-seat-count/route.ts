import { withAuth } from "../../../../../utils/withAuth";
import { State } from "../../../entitlements/check/route";
import { salable } from "../../../../salable";
import { NextRequest } from "next/server";
import { z } from "zod";

const schema = z.object({
  seatCount: z.number(),
});

export const POST = withAuth(async (_state: State, request: NextRequest, context: { params: Promise<Record<string, string>> }) => {
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

    const { seatCount } = parseResult.data;

    const subscription = await salable.subscriptions.getOne(uuid);
    const currentSeatCount = subscription.quantity;
    const difference = seatCount - currentSeatCount;

    if (difference === 0) {
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const options: { increment?: number; decrement?: number } = {};
    if (difference > 0) {
      options.increment = difference;
    } else {
      options.decrement = Math.abs(difference);
    }

    await salable.subscriptions.updateSeatCount(uuid, options);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to update seat count" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
});

