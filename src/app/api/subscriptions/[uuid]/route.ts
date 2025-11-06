import { withAuth } from "../../../../utils/withAuth";
import { salable } from "../../../salable";
import { SalableResponseError } from "@salable/node-sdk";
import initMiroApi from "../../../../utils/init-miro-api";
import { salableProPlanUuid } from "../../../constants";
import { NextRequest } from "next/server";
import { State } from "../../entitlements/check/route";
import { SubscriptionExpandedPlanCurrency } from "../types";
import { cookies } from "next/headers";

export const GET = withAuth(async (state: State, request: NextRequest, context: { params: Promise<Record<string, string>> }) => {
  try {
    const { uuid } = await context.params;
    const { searchParams } = new URL(request.url);
    const boardId = searchParams.get("boardId");

    const data = (await salable.subscriptions.getOne(uuid, {
      expand: ["plan"],
    })) as SubscriptionExpandedPlanCurrency;

    if (data.planUuid === salableProPlanUuid && boardId) {
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

