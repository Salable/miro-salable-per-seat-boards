import { withAuth } from "../../../../../utils/withAuth";
import { salable } from "../../../../salable";
import initMiroApi from "../../../../../utils/init-miro-api";
import { salableProPlanUuid } from "../../../../constants";
import { NextRequest } from "next/server";
import { State } from "../../../entitlements/check/route";
import { cookies } from "next/headers";

export const GET = withAuth(async (state: State, request: NextRequest, context) => {
  try {
    const { uuid } = await context.params;
    const { searchParams } = new URL(request.url);
    const boardId = searchParams.get("boardId");

    if (!boardId) {
      return new Response(JSON.stringify({ error: "Missing boardId" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const subscription = await salable.subscriptions.getOne(uuid);
    if (subscription.planUuid === salableProPlanUuid && boardId) {
      const cookieInstance = cookies();
      const tokenCookie = cookieInstance.get("MIRO_SALABLE_TOKEN_USAGE");
      
      if (tokenCookie?.value) {
        try {
          const { miro } = initMiroApi();
          const api = miro.as(state.user);
          const board = await api.getBoard(boardId);
          if (board.owner?.id !== state.user) {
            return new Response(JSON.stringify({ error: "Unauthorised" }), {
              status: 403,
              headers: { "Content-Type": "application/json" },
            });
          }
        } catch (e) {
          console.log(e);
        }
      }
    }

    const data = await salable.subscriptions.getInvoices(uuid);
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: "Failed to fetch invoices" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
});

