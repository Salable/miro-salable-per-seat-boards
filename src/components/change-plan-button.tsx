'use client'
import React, {useState} from "react";
import LoadingSpinner from "./loading-spinner";
import axios from "axios";
import { KeyedMutator } from "swr";
import { SubscriptionExpandedPlanCurrency } from "../app/api/subscriptions/[uuid]/route";

export const ChangePlanButton = ({
  subscriptionUuid,
  planUuid,
  planName,
  mutate,
}: {
  subscriptionUuid: string;
  planUuid: string;
  planName: string;
  mutate: KeyedMutator<SubscriptionExpandedPlanCurrency>;
}) => {
  const [isChangingSubscription, setIsChangingSubscription] = useState(false);

  const handleClick = async () => {
    setIsChangingSubscription(true);
    try {
      const board = await miro.board.getInfo();
      const token = await miro.board.getIdToken();
      await axios.post(
        `/api/subscriptions/${subscriptionUuid}/change-plan`,
        { planUuid },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      await new Promise<void>(async (resolve) => {
        while (true) {
          try {
            const subscriptionResponse = await axios.get(
              `/api/subscriptions/${subscriptionUuid}?boardId=${board.id}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            if (subscriptionResponse.data?.planUuid === planUuid) {
              await mutate();
              resolve();
              break;
            }
            await new Promise((r) => setTimeout(r, 500));
          } catch (e) {
            break;
          }
        }
      });
    } catch (e) {
      if (axios.isAxiosError(e) && e.response?.data?.error) {
      } else {
        console.error(e);
      }
    } finally {
      setIsChangingSubscription(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      className='p-4 text-white font-light rounded-md leading-none bg-blue-700 hover:bg-blue-900 transition flex items-center justify-center cursor-pointer'
      disabled={isChangingSubscription}
    >
      {isChangingSubscription ? (
        <div className='w-[14px] mr-2'><LoadingSpinner fill="white"/></div>
      ) : ''}
      Move to {planName}
    </button>
  )
}