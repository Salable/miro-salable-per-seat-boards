'use client'
import React, {useEffect, useState, Dispatch, SetStateAction} from "react";
import LoadingSpinner from "./loading-spinner";
import {addSeats, removeSeats, SubscriptionExpandedPlanCurrency} from "../actions/subscriptions";

export const UpdateSubscription = ({
  seatCount,
  subscription,
  setFetchSeats
}: {
  seatCount: number;
  subscription: SubscriptionExpandedPlanCurrency;
  setFetchSeats: Dispatch<SetStateAction<boolean>>;
}) => {
  const [updatedSeatCount, setUpdatedSeatCount] = useState<number>(seatCount)
  const [isChangingSeatCount, setIsChangingSeatCount] = useState<boolean>(false)
  const handleClickUpdateSubscription = async () => {
    if (updatedSeatCount) {
      const board = await miro.board.getInfo()
      setIsChangingSeatCount(true)
      if (updatedSeatCount > seatCount) {
        await addSeats({
          increment: updatedSeatCount - seatCount,
          uuid: subscription.uuid,
          boardId: board.id
        })
        setFetchSeats(true)
      }
      if (updatedSeatCount < seatCount) {
        await removeSeats({
          decrement: Math.abs(updatedSeatCount - seatCount),
          uuid: subscription.uuid,
          boardId: board.id
        })
        setFetchSeats(true)
      }
    }
    setIsChangingSeatCount(false)
  }
  const handleClickAddSeats = () => {
    if (updatedSeatCount) {
      setUpdatedSeatCount(updatedSeatCount + 1);
    }
  }
  const handleClickRemoveSeats = () => {
    if (updatedSeatCount) {
      setUpdatedSeatCount(updatedSeatCount - 1);
    }
  }
  useEffect(() => {
    if (updatedSeatCount === seatCount) {
      setIsChangingSeatCount(false)
    }
  }, [seatCount, updatedSeatCount])

  return (
    <div className='inline-flex relative p-4 border-2 border-gray-500 rounded-lg'>
      <div className='text-gray-500 text-left absolute top-[-10px] bg-gray-100 left-0 px-2 ml-2'>Boards</div>
      <div className='flex rounded-md items-center'>
        <div className='flex justify-center items-center mr-3'>
          <div className='flex items-center justify-center'>
            <button
              className={`cursor-pointer flex items-center justify-center leading-none text-xl p-3 text-white rounded-full h-[38px] w-[38px] font-bold bg-blue-700 hover:bg-blue-800 transition disabled:bg-gray-400`}
              disabled={updatedSeatCount === subscription?.plan.perSeatAmount || subscription.status === 'CANCELED'}
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
  )
}