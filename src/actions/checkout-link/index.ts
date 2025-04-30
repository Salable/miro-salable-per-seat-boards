'use server'
import {PlanCheckout} from "@salable/node-sdk/dist/src/types";
import {Result} from "../licenses/check";
import {salable} from "../../app/salable";
import initMiroApi from "../../utils/init-miro-api";

export async function getCheckoutLink(
  planUuid: string,
  options: {
    email: string,
    granteeId: string,
    successUrl: string,
    cancelUrl: string,
  }): Promise<Result<PlanCheckout>> {
  try {
    const {userId, miro} = initMiroApi()
    const api = miro.as(userId)
    const board = await api.getBoard(options.granteeId)
    if (!board.team?.id) {
      return {
        data: null,
        error: 'Failed to fetch checkout link'
      }
    }
    const data = await salable.plans.getCheckoutLink(planUuid, {
      customerEmail: options.email,
      granteeId: options.granteeId,
      owner: board.team.id,
      successUrl: options.successUrl,
      cancelUrl: options.cancelUrl,
    })
    return {
      data, error: null
    }
  } catch (e) {
    console.log(e)
    return {
      data: null,
      error: 'Failed to fetch checkout link'
    }
  }
}