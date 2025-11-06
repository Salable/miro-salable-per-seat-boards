import { withAuth } from "../../../utils/withAuth";
import { salable } from "../../salable";
import { salableProPlanUuid } from "../../constants";
import { NextRequest } from "next/server";
import { State } from "../entitlements/check/route";

export const GET = withAuth(async (state: State, request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const planUuid = searchParams.get("planUuid");
    const subscriptionUuid = searchParams.get("subscriptionUuid");
    const boardId = searchParams.get("boardId");

    if (!planUuid || !subscriptionUuid || !boardId) {
      return new Response(
        JSON.stringify({ error: "Missing required parameters: planUuid, subscriptionUuid, boardId" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const granteeId = planUuid === salableProPlanUuid ? boardId : state.user;
    const records = await salable.usage.getAllUsageRecords({
      granteeId,
      planUuid,
      subscriptionUuid,
    });

    return new Response(JSON.stringify(records), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    console.log(e);
    return new Response(JSON.stringify({ error: "Failed to fetch usage records" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
});

