import { withAuth } from "../../../../utils/withAuth";
import { salable } from "../../../salable";
import { salableProductUuid } from "../../../constants";
import { AllowedShapes, createShape } from "../../../../utils/shapes";
import { NextRequest } from "next/server";
import { State } from "../../entitlements/check/route";
import { z } from "zod";

const schema = z.object({
  boardId: z.string(),
  shape: z.enum(["rectangle", "triangle", "circle"]),
});

export const POST = withAuth(async (_state: State, request: NextRequest) => {
  try {
    const body = await request.json();
    const parseResult = schema.safeParse(body);

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

    const { boardId, shape } = parseResult.data;

    const check = await salable.entitlements.check({
      productUuid: salableProductUuid,
      granteeIds: [boardId],
    });

    const features = check?.features;
    const hasFeature = features?.find((f) => f.feature === shape);

    if (!hasFeature) {
      return new Response(JSON.stringify({ error: "Unauthorised" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    await createShape(boardId, shape as AllowedShapes);

    return new Response(null, {
      status: 200,
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: "Failed to create shape" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
});

