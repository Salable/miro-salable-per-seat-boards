'use client'
import {AllowedShapes} from "../utils/shapes";
import React, {useEffect, useState} from "react";
import {EntitlementCheck} from "@salable/node-sdk/dist/src/types";
import {TriangleIcon} from "./icons/triangle";
import {Circle} from "./icons/circle";
import {BoardInfo} from "@mirohq/websdk-types/stable/api/board";
import LoadingSpinner from "./loading-spinner";
import axios from "axios";

const shapes: AllowedShapes[] = ['rectangle', 'triangle', 'circle']

export const Shapes = () => {
  const [check, setCheck] = useState<EntitlementCheck | null>(null)
  const [loading, setLoading] = useState(true)
  const [board, setBoard] = useState<BoardInfo | null>(null)
  const [userId, setUserId] = useState<string>('')
  useEffect(() => {
    async function fetchData() {
      try {
        const token = await miro.board.getIdToken();
        const boardInfo = await miro.board.getInfo()
        const userInfo = await miro.board.getUserInfo()
        setBoard(boardInfo)
        setUserId(userInfo.id)
        
        const entitlementsResponse = await axios.post(
          '/api/entitlements/check',
          { granteeIds: [userInfo.id, boardInfo.id] },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (entitlementsResponse.data) setCheck(entitlementsResponse.data)
        setLoading(false)
      } catch (e) {
        setLoading(false)
      }
    }
    fetchData()
  }, []);

  if (loading) {
    return (
      <div>Loading...</div>
    )
  }
  if (!board) {
    return (
      <div>No board found</div>
    )
  }
  return (
    <>
      {shapes.map((shape, i) => {
        const hasFeatures = check?.features.find((f) => f.feature === shape)
        return (
          <div className='flex items-center justify-between p-6 mb-3 rounded-md bg-blue-50' key={`shape-${i}`}>
            <div className='mr-6 w-[120px]'>
              <Shape shape={shape} disabled={!hasFeatures}  />
            </div>
            <div className='flex flex-col justify-center grow'>
              <div className='flex justify-center'>
                <AddShapeButton userId={userId} boardId={board?.id} shape={shape} hasFeatures={!!hasFeatures} />
              </div>
            </div>
          </div>
        );
      })}
      {!check?.features.length ? (
        <div>
          <p>To start using shapes subscribe to our product and get started!</p>
          <button
            className='p-4 mt-3 rounded-md leading-none font-light transition flex items-center justify-center w-full bg-blue-700 hover:bg-blue-900 text-white cursor-pointer'
            onClick={async () => {
              await miro.board.ui.openModal({url: '/dashboard/pricing'})
            }}
          >
            Pricing
          </button>
        </div>
      ) : null}
    </>
  )
}

const Shape = ({shape, disabled}:{shape: string, disabled: boolean}) => {
  switch (shape) {
    case 'rectangle':
      return (
        <div className={`h-[120px] w-[120px] rounded-lg ${disabled ? 'bg-gray-500 opacity-50' : 'bg-amber-500'}`} />
      )
    case 'circle':
      return (
        <div className={disabled ? 'opacity-50' : ''}>
          <Circle fill={disabled ? 'fill-gray-500' : 'fill-purple-500'} />
        </div>
      )
    case 'triangle':
      return (
        <div className={disabled ? 'opacity-50' : ''}>
          <TriangleIcon fill={disabled ? 'fill-gray-500' : 'fill-cyan-300'} />
        </div>
      )
    default:
      return null
  }
}

const AddShapeButton = ({shape, boardId, userId, hasFeatures}: {shape: AllowedShapes; boardId: string; userId: string; hasFeatures: boolean}) => {
  const [isCreatingShape, setIsCreatingShape] = useState<boolean>(false)
  const handleClick = async () => {
    try {
      setIsCreatingShape(true)
      const token = await miro.board.getIdToken();
      await axios.post(
        '/api/shapes/create',
        { userId, boardId, shape },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsCreatingShape(false)
    } catch (e) {
      setIsCreatingShape(false)
    }
  }
  return (
    <button
      className={'py-2 px-4 mb-2 rounded-sm leading-none font-light bg-white border-2 border-solid border-blue-500 text-blue-500 disabled:text-gray-500 disabled:border-gray-500 disabled:opacity-50 cursor-pointer disabled:cursor-auto'}
      disabled={!hasFeatures}
      onClick={handleClick}
    >
      {isCreatingShape ? <div className='w-[16px]'><LoadingSpinner fill="#2B7FFF"/></div> : "Add shape"}
    </button>
  )
}