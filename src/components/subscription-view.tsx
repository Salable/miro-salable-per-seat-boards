'use client'
import {CancelPlanButton} from "./cancel-plan-button";
import {FetchError} from "./fetch-error";
import React, {useEffect, useState} from "react";
import {SubscriptionExpandedPlanCurrency} from "../app/api/subscriptions/[uuid]/route";
import {notFound} from "next/navigation";
import Link from "next/link";
import {BoardData} from "../app/api/board/all/route";
import {Seat, PaginatedSeats} from "@salable/node-sdk/dist/src/types";
import axios from "axios";
import {AssignBoard} from "./assign-board";
import {UpdateSubscription} from "./update-subscription";
import {ChangePlanButton} from "./change-plan-button";
import {salableBasicPlanUuid, salableProPlanUuid} from "../app/constants";
import useSWR from "swr";

export const SubscriptionView = ({uuid}: {uuid: string}) => {
  const [boardId, setBoardId] = useState<string | null>(null);
  
  useEffect(() => {
    miro.board.getInfo().then(board => setBoardId(board.id));
  }, []);

  const { data: subscription, isLoading, error, mutate } = useSWR<SubscriptionExpandedPlanCurrency>(
    boardId ? `/api/subscriptions/${uuid}?boardId=${boardId}` : null
  );

  const [fetchSeats, setFetchSeats] = useState<boolean>(true)
  
  if (isLoading || !subscription) return <Loading />
  if (error) return <FetchError error="Failed to load subscription"/>
  if (!subscription) return notFound()
  return (
    <>
      <Link href='/dashboard/subscriptions' className='text-sm text-blue-700 hover:underline'>Back to subscriptions</Link>
      <h1 className='text-3xl mb-6 flex items-center'>
        Subscription
        <span className={`px-2 ml-2 py-2 rounded-md leading-none ${subscription.status === 'CANCELED' ? 'bg-red-200 text-red-500' : 'bg-green-200 text-green-700'} uppercase text-lg font-bold`}>
          {subscription.status}
        </span>
      </h1>
      <div className='mb-3'>
        <div className='flex justify-between items-end mb-3'>
          <div>
            <div className='text-gray-500'>Plan</div>
            <div className='text-xl'>{subscription.plan.displayName}</div>
          </div>
        </div>
      </div>
      {subscription.status !== 'CANCELED' ? (
        <div className='flex space-x-2'>
          <CancelPlanButton subscriptionUuid={uuid} mutate={mutate}/>
          <ChangePlanButton
            subscriptionUuid={uuid}
            planUuid={subscription.planUuid === salableBasicPlanUuid ? salableProPlanUuid : salableBasicPlanUuid}
            planName={subscription.planUuid === salableBasicPlanUuid ? 'Pro' : 'Basic'}
            mutate={mutate}
          />
        </div>
      ) : null}
      <div className='mt-6'>
        <UpdateSubscription
          subscription={subscription}
          seatCount={subscription.quantity}
          setFetchSeats={setFetchSeats}
        />
      </div>
      <div className='mt-6'>
        <Seats
          uuid={uuid}
          subscription={subscription}
          fetchSeats={fetchSeats}
          setFetchSeats={setFetchSeats}
        />
      </div>
    </>
  )
}

const Seats = ({
  uuid,
  subscription,
  fetchSeats,
  setFetchSeats,
}: {
  uuid: string;
  subscription: SubscriptionExpandedPlanCurrency;
  fetchSeats: boolean;
  setFetchSeats: React.Dispatch<React.SetStateAction<boolean>>,
}) => {
  const [loading, setLoading] = useState(true)
  const [boards, setBoards] = useState<BoardData[] | null>(null)
  const [nonLicensedBoards, setNonLicensedBoards] = useState<BoardData[] | null>(null)
  const [boardsError, setBoardsError] = useState<string | null>(null)
  const [subscriptionSeats, setSubscriptionSeats] = useState<PaginatedSeats | null>(null)
  useEffect(() => {
    async function fetchData() {
      if (!fetchSeats) return
      try {
        const token = await miro.board.getIdToken();
        
        const seatsResponse = await axios.get(
          `/api/subscriptions/${uuid}/seats`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        const boardsResponse = await axios.get(
          '/api/board/all',
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (boardsResponse.data.boards) {
          setBoards(boardsResponse.data.boards);
        }
        if (boardsResponse.data.error) {
          setBoardsError(boardsResponse.data.error);
        }
        
        setSubscriptionSeats(seatsResponse.data)
        
        const nonLicensedBoards = boardsResponse.data.boards?.reduce((arr: BoardData[], b: BoardData) => {
          if (!seatsResponse.data?.data.find((s: Seat) => s.granteeId === b.id)) arr.push(b)
          return arr
        }, [])
        if (nonLicensedBoards) setNonLicensedBoards(nonLicensedBoards)
        setLoading(false)
        setFetchSeats(false)
      } catch (e) {
        setLoading(false)
        setFetchSeats(false)
      }
    }
    fetchData()
  }, [fetchSeats]);
  if (loading) return <LoadingSeats />
  if (boardsError) return <FetchError error={boardsError}/>

  return (
    <>
      <div className='mb-6 md:mb-0'>
        {subscriptionSeats && nonLicensedBoards && boards ? (
          <>
            <div className='flex flex-col rounded-sm'>
              {subscriptionSeats.data.sort((a, b) => {
                if (a.granteeId === null) return 1
                if (b.granteeId === null) return -1
                return 0
              }).map((l, i) => {
                if (l.granteeId === null && subscription.status === 'CANCELED') return null
                const assignedBoards = boards.find((u) => u.id === l.granteeId) ?? null
                return (
                  <React.Fragment key={`seat_${l.uuid}`}>
                    <AssignBoard
                      assignedBoard={assignedBoards}
                      seat={l}
                      subscriptionStatus={subscription.status}
                      nonLicensedBoards={nonLicensedBoards}
                      subscriptionUuid={uuid}
                      key={`assign_users_${i}`}
                      setRefetch={setFetchSeats}
                    />
                  </React.Fragment>
                );
              })}
            </div>
          </>
        ) : null}
      </div>
    </>
  )
}


const Loading = () => {
  return (
    <div>
      <Link href='/dashboard/subscriptions' className='text-sm text-blue-700 hover:underline'>Back to subscriptions</Link>
      <div>
        <div className="flex items-center mb-6">
          <h1 className='text-3xl flex items-center'>
            Subscription
            <div className="ml-2 h-[34px] w-[95px] bg-slate-300 rounded-md animate-pulse"></div>
          </h1>
        </div>
        <div className='mb-3'>
          <div className='flex justify-between items-end'>
            <div>
              <div className='text-gray-500'>Plan</div>
              <div className="mr-2 h-[28px] bg-slate-300 rounded w-[100px]"></div>
            </div>
          </div>
        </div>
      </div>
      <div className='mt-6'>
        <div className='inline-flex mb-6 relative p-4 border-2 border-gray-500 rounded-lg'>
          <div className='text-gray-500 text-left absolute top-[-10px] bg-gray-100 left-0 px-2 ml-2'>Boards</div>
          <div className='flex rounded-md items-center'>
            <div className='flex justify-center items-center mr-3'>
              <div className='flex items-center justify-center'>
                <div className={`rounded-full h-[38px] w-[38px] bg-slate-300 animate-pulse`}/>
                <div className='h-[30px] w-[20px] bg-slate-300 animate-pulse rounded-md mx-3' />
                <div className={`rounded-full h-[38px] w-[38px] bg-slate-300 animate-pulse`}/>
              </div>
            </div>
            <div>
              <div className={`w-[100px] h-[28px] rounded-md bg-slate-300 animate-pulse`}/>
            </div>
          </div>
        </div>
      </div>
      <div className='mt-6'>
        <LoadingSeats />
      </div>
    </div>
  )
}

const LoadingSeats = () => (
  <>
    {[...new Array(2)].map((_, index) => (
      <div className='bg-white mb-3 flex justify-between items-center shadow rounded-sm p-3 relative' key={`loading-board-${index}`}>
        <div className='flex w-full items-center'>
          <div className='w-[38px] h-[38px] rounded-full bg-slate-300 animate-pulse mr-3' />
          <div className='w-[65px] h-[20px] rounded-md bg-slate-300 animate-pulse' />
        </div>
      </div>
    ))}
  </>
)