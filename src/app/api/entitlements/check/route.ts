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

export const POST = withAuth(async (_state: State, request: NextRequest) => {
  try {
    const body = await request.json();
    const { granteeIds } = body;

    if (!granteeIds || !Array.isArray(granteeIds)) {
      return new Response(JSON.stringify({ error: "Missing or invalid granteeIds" }), {
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

