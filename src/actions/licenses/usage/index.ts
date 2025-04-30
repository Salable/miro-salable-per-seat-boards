'use server'
import {salable} from "../../../app/salable";
import {salableProductUuid} from "../../../app/constants";
import {AllowedShapes, createShape} from "../../shapes";

export type Result<T> =
  | { data: T; error: null }
  | { data: null; error: string };

type CreateShapeArgs  = {
  userId: string;
  boardId: string;
  shape: AllowedShapes;
}

export async function updateUsageAndCreateShape({userId, boardId, shape}: CreateShapeArgs): Promise<Result<null>> {
  try {
    const check = await salable.licenses.check({
      productUuid: salableProductUuid,
      granteeIds: [userId, boardId],
    })
    const capabilities = check?.capabilities
    const hasShapeCapability = capabilities?.find((c) => c.capability === shape)
    if (!hasShapeCapability) {
      return {
        data: null,
        error: 'Unauthorised'
      }
    }
    await createShape(boardId, shape)
    return {
      data: null,
      error: null
    }
  } catch (e) {
    console.log(e)
    return {
      data: null,
      error: "Failed to create shape"
    }
  }
}