'use server'
import {salable} from "../../app/salable";
import {CurrentUsageRecord, PaginatedUsageRecords} from "@salable/node-sdk/dist/src/types";
import {Result} from "../licenses/check";
import initMiroApi from "../../utils/init-miro-api";
import {salableProPlanUuid} from "../../app/constants";

export async function getUsageRecords({planUuid, subscriptionUuid, boardId}: {planUuid: string, boardId: string; subscriptionUuid: string}): Promise<Result<PaginatedUsageRecords>> {
  try {
    const {userId} = initMiroApi()
    const records = await salable.usage.getAllUsageRecords({
      granteeId: planUuid === salableProPlanUuid ? boardId : userId,
      planUuid,
      subscriptionUuid
    });
    return {
      data: records,
      error: null
    }
  } catch (e) {
    console.log(e)
    return {
      data: null,
      error: 'Failed to fetch usage records'
    }
  }
}

export async function getCurrentUsage(planUuid: string, boardId: string): Promise<Result<CurrentUsageRecord>> {
  try {
    const {userId} = initMiroApi()
    const currentUsage = await salable.usage.getCurrentUsageRecord({
      granteeId: planUuid === salableProPlanUuid ? boardId : userId,
      planUuid
    });
    return {
      data: currentUsage,
      error: null
    }
  } catch (e) {
    console.log(e)
    return {
      data: null,
      error: 'Failed to fetch current usage record'
    }
  }
}