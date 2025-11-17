import {withAuth} from "../../../../utils/withAuth";
import { salable } from "../../../salable";
import { salableProductUuid } from "../../../constants";
import { NextRequest } from "next/server";

export type State = {
  sub: string;
  iss: string;
  team: string;
  exp: number;
  user: string;
  iat: number;
};

export const GET = withAuth(async (_state: State, request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const granteeIdsParam = searchParams.get("granteeIds");

    if (!granteeIdsParam) {
      return new Response(JSON.stringify({ error: "Missing granteeIds query parameter" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const granteeIds = granteeIdsParam.split(",").map((id) => id.trim()).filter(Boolean);

    if (granteeIds.length === 0) {
      return new Response(JSON.stringify({ error: "Invalid granteeIds query parameter" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const check = await salable.entitlements.check({
      productUuid: salableProductUuid,
      granteeIds,
    });

    return new Response(JSON.stringify(check), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: "Failed to check entitlements" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
});

