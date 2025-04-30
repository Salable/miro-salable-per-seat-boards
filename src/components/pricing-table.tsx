'use client'
import {Rectangle} from "./icons/rectangle";
import {TriangleIcon} from "./icons/triangle";
import {Circle} from "./icons/circle";
import React, {useEffect, useState} from "react";
import {PlanButton} from "./plan-button";
import {salableBasicPlanUuid, salableProPlanUuid} from "../app/constants";
import {CheckLicensesCapabilitiesResponse} from "@salable/node-sdk/dist/src/types";
import {licenseCheck} from "../actions/licenses/check";
import {isBoardOwner} from "../actions/board";
import {FetchError} from "./fetch-error";
import Link from "next/link";

export const PricingTable = ({userId}: {userId: string}) => {
  const [check, setCheck] = useState<CheckLicensesCapabilitiesResponse | null>(null)
  const [isOwner, setIsOwner] = useState<boolean>(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    async function fetchData() {
      try {
        const boardInfo = await miro.board.getInfo()
        const isBoardOwnerData = await isBoardOwner(boardInfo.id)
        if (isBoardOwnerData.error) setError(isBoardOwnerData.error)
        if (isBoardOwnerData.data !== null) setIsOwner(isBoardOwnerData.data)
        const data = await licenseCheck([userId, boardInfo.id])
        console.log(data)
        if (data.data) setCheck(data.data)
        setLoading(false)
      } catch (e) {
        setLoading(false)
        console.log(e)
      }
    }
    fetchData()
  }, []);
  if (error) return <FetchError error={error} />
  if (loading) return <Loading />
  return (
    <div>
      <div className='md:grid md:grid-cols-3 md:gap-6 text-center'>
        <div className='p-6 rounded-lg bg-white shadow flex-col mb-6 md:mb-0'>
          <div className='mb-4'>
            <h2 className='mb-0 font-bold text-2xl'>Basic</h2>
          </div>

          <div className='mb-6'>
            <div className='flex items-center justify-center mb-1'>
              <div className='mr-2'><Rectangle fill='fill-amber-500' height={36} width={36} /></div>
              <div><TriangleIcon fill='fill-cyan-300' height={36} width={41} /></div>
            </div>
            <div className='flex items-end justify-center'>
              <div className='text-3xl mr-2'>
                <span className='font-bold'>£1</span>
                <span className='text-lg font-light'> / per board</span>
              </div>
            </div>
            <span className='text-xs font-light'>(per month)</span>
          </div>
          <BasicPlanPricingTableButton
            isSubscribed={!!check?.capabilities.find((c) => c.capability === 'basic_board')}
            hasSubscriptions={!!(check?.capabilities && check?.capabilities?.length > 0)}
          />
        </div>

        <div className='p-6 rounded-lg bg-white shadow flex-col mb-6 md:mb-0'>
          <div className='mb-4'>
            <h2 className='mb-0 font-bold text-2xl'>Pro</h2>
          </div>
          <div className='mb-6'>
            <div className='flex items-center justify-center mb-1'>
              <div className='mr-2'><Rectangle fill='fill-amber-500' height={36} width={36} /></div>
              <div className='mr-2'><TriangleIcon fill='fill-cyan-300' height={36} width={41} /></div>
              <div><Circle fill='fill-purple-500' height={36} width={36} /></div>
            </div>
            <div className='flex items-end justify-center'>
              <div className='text-3xl mr-2'>
                <span className='font-bold'>£2</span>
                <span className='text-lg font-light'> / per board</span>
              </div>
            </div>
            <span className='text-xs font-light'>(per month)</span>
          </div>
          <ProPlanPricingTableButton
            isBoardOwner={isOwner}
            isSubscribed={!!check?.capabilities.find((c) => c.capability === 'pro_board')}
            hasSubscriptions={!!(check?.capabilities && check?.capabilities?.length > 0)}
          />
        </div>

      </div>
    </div>
  )
}


const BasicPlanPricingTableButton = ({isSubscribed, hasSubscriptions}: {isSubscribed: boolean; hasSubscriptions: boolean}) => {
  if (isSubscribed) {
    return (
      <div
        className='border-2 border-blue-700 p-4 rounded-md leading-none font-light transition flex items-center justify-center w-full bg-white text-blue-700 text-sm'
      >
        Subscribed
      </div>
    )
  }
  if (hasSubscriptions) {
    return (
      <Link
        href={'/dashboard/subscriptions'}
        className='p-4 rounded-md leading-none font-light text-sm transition flex items-center justify-center w-full text-white bg-blue-700 border-2 border-solid border-blue-700 cursor-pointer hover:bg-blue-900'
      >
        Move to plan
      </Link>
    )
  }
  return <PlanButton planUuid={salableBasicPlanUuid} />
}

const ProPlanPricingTableButton = ({isBoardOwner, isSubscribed, hasSubscriptions}: {isBoardOwner: boolean; isSubscribed: boolean; hasSubscriptions: boolean}) => {
  if (!isBoardOwner) {
    return (
      <div
        className='p-4 rounded-md leading-none font-light text-sm transition flex items-center justify-center w-full bg-white text-blue-700 border-2 border-solid border-blue-700'
      >
        Contact board owner
      </div>
    )
  }
  if (isSubscribed) {
    return (
      <div
        className='p-4 rounded-md leading-none font-light text-sm transition flex items-center justify-center w-full bg-white text-blue-700 border-2 border-solid border-blue-700'
      >
        Subscribed
      </div>
    )
  }
  if (hasSubscriptions) {
    return (
      <Link
        href={'/dashboard/subscriptions'}
        className='p-4 rounded-md leading-none font-light text-sm transition flex items-center justify-center w-full text-white bg-blue-700 border-2 border-solid border-blue-700 cursor-pointer hover:bg-blue-900'
      >
        Move to plan
      </Link>
    )
  }
  return <PlanButton planUuid={salableProPlanUuid} />
}

const Loading = () => (
  <div className='md:grid md:grid-cols-3 md:gap-6 text-center'>
    <div className='p-6 rounded-lg bg-white shadow flex-col mb-6 md:mb-0'>
      <div className='mb-4'>
        <h2 className='mb-0 font-bold text-2xl'>Basic</h2>
      </div>

      <div className='mb-6'>
        <div className='flex items-center justify-center mb-1'>
          <div className='mr-2'><Rectangle fill='fill-amber-500' height={36} width={36} /></div>
          <div><TriangleIcon fill='fill-cyan-300' height={36} width={41} /></div>
          <div><Circle fill='fill-purple-500' height={36} width={36} /></div>
        </div>
        <div className='flex items-end justify-center'>
          <div className='text-3xl mr-2'>
            <span className='font-bold'>£1</span>
            <span className='text-lg font-light'> / per board</span>
          </div>
        </div>
        <span className='text-xs font-light'>(per month)</span>
      </div>
      <div className='h-[50px] w-full animate-pulse bg-slate-300 rounded-md'></div>
    </div>
    <div className='p-6 rounded-lg bg-white shadow flex-col mb-6 md:mb-0'>
      <div className='mb-4'>
        <h2 className='mb-0 font-bold text-2xl'>Pro</h2>
      </div>
      <div className='mb-6'>
        <div className='flex items-center justify-center mb-1'>
          <div className='mr-2'><Rectangle fill='fill-amber-500' height={36} width={36} /></div>
          <div className='mr-2'><TriangleIcon fill='fill-cyan-300' height={36} width={41} /></div>
          <div><Circle fill='fill-purple-500' height={36} width={36} /></div>
        </div>
        <div className='flex items-end justify-center'>
          <div className='text-3xl mr-2'>
            <span className='font-bold'>£2
            </span>
            <span className='text-lg font-light'> / per board</span>
          </div>
        </div>
        <span className='text-xs font-light'>(per month)</span>
      </div>
      <div className='h-[50px] w-full animate-pulse bg-slate-300 rounded-md'></div>
    </div>
  </div>
)
