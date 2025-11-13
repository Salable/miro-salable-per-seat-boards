'use client'
import {Rectangle} from "./icons/rectangle";
import {TriangleIcon} from "./icons/triangle";
import {Circle} from "./icons/circle";
import React, {useEffect, useState} from "react";
import {PlanButton} from "./plan-button";
import {salableBasicPlanUuid, salableProPlanUuid} from "../app/constants";
import {EntitlementCheck} from "@salable/node-sdk/dist/src/types";
import Link from "next/link";
import axios from "axios";

export const PricingTable = () => {
  const [check, setCheck] = useState<EntitlementCheck | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    async function fetchData() {
      try {
        const boardInfo = await miro.board.getInfo()
        const token = await miro.board.getIdToken();
        
        const entitlementsResponse = await axios.get(
          `/api/entitlements/check?granteeIds=${encodeURIComponent(boardInfo.id)}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (entitlementsResponse.data) setCheck(entitlementsResponse.data)
        setLoading(false)
      } catch (e) {
        setLoading(false)
        if (axios.isAxiosError(e) && e.response?.data?.error) {
          setError(e.response.data.error);
        } else {
          setError('Failed to fetch pricing data. Please try again.');
        }
      }
    }
    fetchData()
  }, []);
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
            isSubscribed={!!check?.features.find((f) => f.feature === 'basic_board')}
            hasSubscriptions={!!(check?.features && check?.features?.length > 0)}
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
            isSubscribed={!!check?.features.find((f) => f.feature === 'pro_board')}
            hasSubscriptions={!!(check?.features && check?.features?.length > 0)}
          />
        </div>

      </div>
      {error && (
        <div className='mt-6 p-3 rounded-md bg-red-50 border border-red-200'>
          <div className='text-red-700 text-sm'>{error}</div>
        </div>
      )}
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

const ProPlanPricingTableButton = ({isSubscribed, hasSubscriptions}: {isSubscribed: boolean; hasSubscriptions: boolean}) => {
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
