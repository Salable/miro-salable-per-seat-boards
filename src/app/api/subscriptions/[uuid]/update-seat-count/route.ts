import { withAuth } from "../../../../../utils/withAuth";
import { State } from "../../../entitlements/check/route";
import { salable } from "../../../../salable";
import { NextRequest } from "next/server";
import { z } from "zod";

const schema = z.object({
  seatCount: z.number().int().positive().min(1),
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
      return new Response(null, {
        status: 200,
      });
    }

    const options: { increment?: number; decrement?: number } = {};
    if (difference > 0) {
      options.increment = difference;
    } else {
      options.decrement = Math.abs(difference);
    }

    await salable.subscriptions.updateSeatCount(uuid, options);

    return new Response(null, {
      status: 200,
    });
  } catch (error) {
    let errorMessage = "Failed to update seat count";
    
    if (error && typeof error === 'object' && 'data' in error) {
      const errorData = (error as { data?: unknown }).data;
      if (errorData && typeof errorData === 'object' && 'error' in errorData && typeof errorData.error === 'string') {
        errorMessage = errorData.error;
      }
    }
    
    if (errorMessage === "Failed to update seat count" && error instanceof Error && error.message) {
      try {
        const parsed = JSON.parse(error.message);
        if (parsed?.data?.error && typeof parsed.data.error === 'string') {
          errorMessage = parsed.data.error;
        } else {
          errorMessage = error.message;
        }
      } catch {
        errorMessage = error.message;
      }
    }
    
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
});

