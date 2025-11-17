import { withAuth } from "../../../utils/withAuth";
import { salable } from "../../salable";
import initMiroApi from "../../../utils/init-miro-api";
import { z } from "zod";
import { NextRequest } from "next/server";
import { State } from "../entitlements/check/route";
import { cookies } from "next/headers";

const schema = z.object({
  planUuid: z.string(),
  email: z.string(),
  granteeId: z.string(),
  successUrl: z.string(),
  cancelUrl: z.string(),
});

export const POST = withAuth(async (state: State, request: NextRequest) => {
  try {
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

    const { planUuid, email, granteeId, successUrl, cancelUrl } = parseResult.data;

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
    const board = await api.getBoard(granteeId);
    
    if (!board.team?.id) {
      return new Response(JSON.stringify({ error: "Failed to fetch checkout link" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const checkout = await salable.plans.getCheckoutLink(planUuid, {
      customerEmail: email,
      granteeId,
      owner: board.team.id,
      successUrl,
      cancelUrl,
    });

    return new Response(JSON.stringify(checkout), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    let errorMessage = "Failed to create checkout link";
    
    if (e && typeof e === 'object' && 'data' in e) {
      const errorData = (e as { data?: unknown }).data;
      if (errorData && typeof errorData === 'object' && 'error' in errorData && typeof errorData.error === 'string') {
        errorMessage = errorData.error;
      }
    }
    
    if (errorMessage === "Failed to create checkout link" && e instanceof Error && e.message) {
      try {
        const parsed = JSON.parse(e.message);
        if (parsed?.data?.error && typeof parsed.data.error === 'string') {
          errorMessage = parsed.data.error;
        } else {
          errorMessage = e.message;
        }
      } catch {
        errorMessage = e.message;
      }
    }
    
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
});

