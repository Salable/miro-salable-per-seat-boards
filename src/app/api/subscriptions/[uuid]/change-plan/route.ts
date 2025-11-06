import { withAuth } from "../../../../../utils/withAuth";
import { salable } from "../../../../salable";
import initMiroApi from "../../../../../utils/init-miro-api";
import { z } from "zod";
import { NextRequest } from "next/server";
import { State } from "../../../entitlements/check/route";
import { cookies } from "next/headers";

const schema = z.object({
  planUuid: z.string(),
  boardId: z.string(),
});

export const POST = withAuth(async (state: State, request: NextRequest, context) => {
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

    const { planUuid, boardId } = parseResult.data;

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

