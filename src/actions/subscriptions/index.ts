'use server'
import {
  PaginatedSubscriptionInvoice,
  Plan,
  PlanCurrency,
  Subscription
} from "@salable/node-sdk/dist/src/types";
import {Result} from "../licenses/check";
import {salableProPlanUuid, salableProductUuid} from "../../app/constants";
import {salable} from "../../app/salable";
import {revalidatePath} from "next/cache";
import {redirect} from "next/navigation";
import initMiroApi from "../../utils/init-miro-api";
import {SalableResponseError} from "@salable/node-sdk";
import {isBoardOwner} from "../board";
import {getOneEvent} from "../events";

export type SubscriptionExpandedPlan = Subscription & {
  plan: Plan
}

export type GetAllSubscriptionsExpandedPlan = {
  first: string;
  last: string;
  data: SubscriptionExpandedPlan[]
}

export async function getAllSubscriptions(email: string): Promise<Result<GetAllSubscriptionsExpandedPlan>> {
  try {
    const data = await salable.subscriptions.getAll({
      email,
      expand: ['plan'],
      sort: 'desc',
      productUuid: salableProductUuid,
    }) as GetAllSubscriptionsExpandedPlan
    return {
      data, error: null
    }
  } catch (e) {
    console.log(e)
    return {
      data: null,
      error: 'Failed to fetch subscriptions',
    }
  }
}

export type SubscriptionExpandedPlanCurrency = Subscription & {
  plan: Plan & {
    currencies: PlanCurrency[]
  }
}

export const cancelSubscription = async (subscriptionUuid: string) => {
  try {
    await salable.subscriptions.cancel(subscriptionUuid, {when: 'now'})
    await new Promise<void>(async (resolve) => {
      while (true) {
        try {
          const subscription = await getOneSubscription(subscriptionUuid)
          if (subscription.data?.status === 'CANCELED') {
            resolve()
            break
          }
          await new Promise(r => setTimeout(r, 500));
        } catch (e) {
          console.log(e)
          break
        }
      }
    })
  } catch (e) {
    console.log(e)
    return {
      data: null,
      error: 'Failed to cancel subscription'
    }
  }
  revalidatePath(`/`)
  revalidatePath(`/dashboard/subscriptions/${subscriptionUuid}`)
  redirect(`/dashboard/subscriptions/${subscriptionUuid}`)
}

export async function getOneSubscription(uuid: string, boardId?: string): Promise<Result<SubscriptionExpandedPlanCurrency | null>> {
  const {userId, miro} = initMiroApi()
  try {
    const data = await salable.subscriptions.getOne(uuid, {expand: ['plan.currencies']}) as SubscriptionExpandedPlanCurrency
    if (data.planUuid === salableProPlanUuid && boardId) {
      const api = miro.as(userId)
      const board = await api.getBoard(boardId)
      if (board.owner?.id !== userId) {
        return {
          data: null,
          error: 'Unauthorised',
        }
      }
    }
    return {
      data, error: null
    }
  } catch (e) {
    if (e instanceof SalableResponseError && e.code === 'S1002') {
      return {
        data: null,
        error: null
      }
    }
    console.log(e)
    return {
      data: null,
      error: 'Failed to fetch subscription',
    }
  }
}

export async function getSubscriptionInvoices(uuid: string, boardId: string): Promise<Result<PaginatedSubscriptionInvoice>> {
  const {userId, miro} = initMiroApi()
  try {
    const subscription = await salable.subscriptions.getOne(uuid)
    if (subscription.planUuid === salableProPlanUuid && boardId) {
      const api = miro.as(userId)
      const board = await api.getBoard(boardId)
      if (board.owner?.id !== userId) {
        return {
          data: null,
          error: 'Unauthorised',
        }
      }
    }
    const data = await salable.subscriptions.getInvoices(uuid)
    return {
      data, error: null
    }
  } catch (e) {
    console.log(e)
    return {
      data: null,
      error: 'Failed to fetch subscription',
    }
  }
}

export const changeSubscription = async (subscriptionUuid: string, planUuid: string, boardId: string) => {
  const {userId, miro} = initMiroApi()
  try {
    const api = miro.as(userId)
    const board = await api.getBoard(boardId)
    if (board.owner?.id !== userId) {
      return {
        data: null,
        error: 'Unauthorised',
      }
    }
    await salable.subscriptions.changePlan(subscriptionUuid, {planUuid, proration: 'always_invoice'});
    await new Promise<void>(async (resolve) => {
      while (true) {
        try {
          const subscription = await getOneSubscription(subscriptionUuid)
          if (subscription.data?.planUuid === planUuid) {
            resolve()
            break
          }
          await new Promise(r => setTimeout(r, 500));
        } catch (e) {
          console.log(e)
          break
        }
      }
    })
  } catch (e) {
    console.log(e)
    return {
      data: null,
      error: 'Failed to update subscription'
    }
  }
  revalidatePath(`/dashboard/subscriptions/${subscriptionUuid}`)
  redirect(`/dashboard/subscriptions/${subscriptionUuid}`)
}

export const addSeats = async ({
    uuid,
    increment,
    boardId
  }: {
    uuid: string,
    increment: number,
    boardId: string
}) => {
  try {
    const isAdmin = await isBoardOwner(boardId);
    if (!isAdmin) {
      return {
        data: null,
        error: 'Unauthorised',
      }
    }
    const create = await salable.subscriptions.addSeats(uuid, {increment})
    await pollSalableEvent(create.eventUuid)
  } catch (error) {
    console.log(error)
    return {
      data: null,
      error: 'Failed to add seats'
    }
  }
  revalidatePath(`/dashboard/subscriptions/${uuid}`)
  redirect(`/dashboard/subscriptions/${uuid}`)
}

export const removeSeats = async ({
  uuid,
  decrement,
  boardId
}: {
  uuid: string,
  decrement: number,
  boardId: string
}) => {
  try {
    const isAdmin = await isBoardOwner(boardId);
    if (!isAdmin) {
      return {
        data: null,
        error: 'Unauthorised',
      }
    }
    const remove = await salable.subscriptions.removeSeats(uuid, {decrement})
    await pollSalableEvent(remove.eventUuid)
  } catch (error) {
    console.log(error)
    return {
      data: null,
      error: 'Failed to add seats'
    }
  }
  revalidatePath(`/dashboard/subscriptions/${uuid}`)
  redirect(`/dashboard/subscriptions/${uuid}`)
}

const pollSalableEvent = async (uuid: string) => {
  await new Promise<void>(async (resolve) => {
    while (true) {
      try {
        const event = await getOneEvent(uuid)
        if (event.data?.status === 'success' || event.data?.status === 'failed') {
          resolve()
          break
        }
        await new Promise(r => setTimeout(r, 500));
      } catch (e) {
        console.log(e)
        break
      }
    }
  })
}