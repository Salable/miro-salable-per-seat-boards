'use client'
import React, {useEffect, useState, Dispatch, SetStateAction} from "react";
import LoadingSpinner from "./loading-spinner";
import {SubscriptionExpandedPlanCurrency} from "../app/api/subscriptions/[uuid]/route";
import axios from "axios";
import { KeyedMutator } from "swr";

export const UpdateSubscription = ({
  seatCount,
  subscription,
  setFetchSeats,
  mutate
}: {
  seatCount: number;
  subscription: SubscriptionExpandedPlanCurrency;
  setFetchSeats: Dispatch<SetStateAction<boolean>>;
  mutate: KeyedMutator<SubscriptionExpandedPlanCurrency>;
}) => {
  const [updatedSeatCount, setUpdatedSeatCount] = useState<number>(seatCount)
  const [isChangingSeatCount, setIsChangingSeatCount] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  
  const handleClickUpdateSubscription = async () => {
    if (updatedSeatCount) {
      const token = await miro.board.getIdToken();
      setIsChangingSeatCount(true)
      setError(null)
      
      try {
        await axios.post(
          `/api/subscriptions/${subscription.uuid}/update-seat-count`,
          {
            seatCount: updatedSeatCount
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        await new Promise<void>(async (resolve) => {
          while (true) {
            try {
              const subscriptionResponse = await axios.get(
                `/api/subscriptions/${subscription.uuid}`,
                { headers: { Authorization: `Bearer ${token}` } }
              );
              if (subscriptionResponse.data?.quantity === updatedSeatCount) {
                await mutate();
                setFetchSeats(true);
                resolve();
                break;
              }
              await new Promise((r) => setTimeout(r, 500));
            } catch (e) {
              break;
            }
          }
        });
      } catch (error) {
        setUpdatedSeatCount(seatCount);
        
        if (axios.isAxiosError(error) && error.response?.data?.error) {
          const errorMessage = error.response.data.error;
          setError(errorMessage);
        } else {
          setError("Failed to update seat count. Please try again.");
        }
      } finally {
        setIsChangingSeatCount(false)
      }
    }
  }
  const handleClickAddSeats = () => {
    if (updatedSeatCount) {
      setUpdatedSeatCount(updatedSeatCount + 1);
    }
  }
  const handleClickRemoveSeats = () => {
    if (updatedSeatCount && updatedSeatCount > 1) {
      setUpdatedSeatCount(updatedSeatCount - 1);
    }
  }
  useEffect(() => {
    setUpdatedSeatCount(seatCount);
    setIsChangingSeatCount(false);
    setError(null);
  }, [seatCount])

  return (
    <div>
      {error && (
        <div className='mb-3 p-3 rounded-md bg-red-50 border border-red-200'>
          <div className='text-red-700 text-sm'>{error}</div>
        </div>
      )}
      <div className='inline-flex relative p-4 border-2 border-gray-500 rounded-lg'>
        <div className='text-gray-500 text-left absolute top-[-10px] bg-gray-100 left-0 px-2 ml-2'>Boards</div>
        <div className='flex rounded-md items-center'>
          <div className='flex justify-center items-center mr-3'>
            <div className='flex items-center justify-center'>
              <button
                className={`cursor-pointer flex items-center justify-center leading-none text-xl p-3 text-white rounded-full h-[38px] w-[38px] font-bold bg-blue-700 hover:bg-blue-800 transition disabled:bg-gray-400`}
                disabled={updatedSeatCount <= 1 || subscription.status === 'CANCELED'}
                onClick={handleClickRemoveSeats}>
                -
              </button>
              <div className='px-3 text-xl'>{updatedSeatCount}</div>
              <button
                className={`cursor-pointer flex items-center justify-center leading-none text-xl p-3 text-white rounded-full h-[38px] w-[38px] font-bold bg-blue-700 hover:bg-blue-800 transition disabled:bg-gray-400`}
                onClick={handleClickAddSeats}
                disabled={subscription.status === 'CANCELED'}
              >
                +
              </button>
            </div>
          </div>
          <div>
            <button
              className={`w-full p-2 text-xs cursor-pointer rounded-md leading-none flex items-center justify-center text-white bg-blue-700 hover:bg-blue-800 transition disabled:bg-gray-400 disabled:cursor-auto`}
              onClick={handleClickUpdateSubscription}
              disabled={updatedSeatCount === seatCount || subscription.status === 'CANCELED'}
            >
              {isChangingSeatCount ? (<div className='w-[14px] mr-2'><LoadingSpinner fill="white"/></div>) : ''}
              Update boards
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}