import { withAuth } from "../../../../../utils/withAuth";
import initMiroApi from "../../../../../utils/init-miro-api";
import { State } from "../../../entitlements/check/route";
import { salable } from "../../../../salable";
import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";

const schema = z.object({
  seatCount: z.number(),
  boardId: z.string(),
});

export const POST = withAuth(async (state: State, request: NextRequest, context: { params: Promise<Record<string, string>> }) => {
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

    const { seatCount, boardId } = parseResult.data;

    const cookieInstance = cookies();
    const tokenCookie = cookieInstance.get("MIRO_SALABLE_TOKEN_USAGE");
    
    if (!tokenCookie?.value) {
      return new Response(JSON.stringify({ error: "No access token available" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { miro } = initMiroApi();
    const api = miro.as(state.user);
    const board = await api.getBoard(boardId);
    
    if (board.owner?.id !== state.user) {
      return new Response(JSON.stringify({ error: "Unauthorised" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    const subscription = await salable.subscriptions.getOne(uuid);
    const currentSeatCount = subscription.quantity || 0;
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

