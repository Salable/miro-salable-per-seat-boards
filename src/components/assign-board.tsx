'use client'
import React, {useRef, useState} from "react";
import {useOnClickOutside} from "usehooks-ts";
import {License} from "@salable/node-sdk/dist/src/types";
import {BoardData} from "../actions/board";
import LoadingSpinner from "./loading-spinner";
import {updateLicense} from "../actions/licenses/update";

export const AssignBoard = (
  {
    assignedBoard,
    nonLicensedBoards,
    subscriptionStatus,
    license,
    setRefetch
  }: {
    assignedBoard: BoardData | null,
    nonLicensedBoards: BoardData[],
    subscriptionStatus: string,
    license: License,
    setRefetch: React.Dispatch<React.SetStateAction<boolean>>
  },
) => {
  const ref = useRef(null)
  const [showBoards, setShowBoards] = useState<boolean>(false);
  const [isUpdatingUser, setIsUpdatingUser] = useState<boolean>(false);
  const clickOutside = () => {
    setShowBoards(false)
  }
  useOnClickOutside(ref, clickOutside)
  const handleClickAssignSeat = (granteeId: string) => async () => {
    try {
      setShowBoards(false)
      setIsUpdatingUser(true)
      await updateLicense({
        uuid: license.uuid,
        granteeId
      })
      // if (updateUser?.error) toast.error(updateUser.error)
      setIsUpdatingUser(false)
      setRefetch(true)
    } catch (e) {
      console.error(e)
      // toast.error('Failed to update license')
      setIsUpdatingUser(false)
    }
  }
  const handleClickUnassignBoard = async () => {
    try {
      setShowBoards(false)
      setIsUpdatingUser(true)
      await updateLicense({
        uuid: license.uuid,
        granteeId: null
      })
      // if (updateUser?.error) toast.error(updateUser.error)
      setIsUpdatingUser(false)
      setRefetch(true)
    } catch (e) {
      console.error(e)
      // toast.error('Failed to update license')
      setIsUpdatingUser(false)
    }
  }
  return (
    <div className='bg-white mb-3 flex justify-between items-center shadow rounded-sm p-3 relative'>
      <div className='flex justify-between w-full'>
        <div>
          <div
            className='flex items-center'
            aria-label={assignedBoard?.name ? 'Reassign seat' : 'Assign seat'}
          >
            <div className='rounded-full mr-3'>
              {assignedBoard?.imageUrl ? (
                <img src={assignedBoard?.imageUrl} className='w-[38px] h-[38px] rounded-full' alt={assignedBoard?.name} />
              ) : (
                <div className='w-[38px] h-[38px] rounded-full bg-blue-200 leading-none flex items-center justify-center'>
                  <span>?</span>
                </div>
              )}
            </div>
            <div className='text-left' ref={ref}>
              {assignedBoard?.name ? (
                <div>{assignedBoard.name}</div>
              ) : null}
              {!assignedBoard && nonLicensedBoards.length ? (
                <>
                  {isUpdatingUser ? (
                    <div className='h-[14px] w-[14px]'><LoadingSpinner fill='#000000'/></div>
                  ) : (
                    <button
                      className='p-2 border-2 rounded-md text-gray-500 text-xs cursor-pointer'
                      onClick={() => {
                        setShowBoards(!showBoards)
                      }}
                      disabled={subscriptionStatus === 'CANCELED'}
                    >
                      Assign board
                    </button>
                  )}
                  {showBoards ? (
                    <div className='absolute z-10 bg-white shadow rounded-md'>
                      {nonLicensedBoards.map((board, i) => (
                        <button
                          className='flex items-center p-2 cursor-pointer hover:bg-gray-200 text-xs w-full' key={`${i}_assign_users`}
                          aria-label={`Assign seat to user ${board.name}`}
                          onClick={handleClickAssignSeat(board.id)}
                        >
                          <div className='rounded-full mr-2'>
                            {board?.imageUrl ? (
                              <img src={board?.imageUrl} className='w-[24px] h-[24px] rounded-full' alt={board?.name} />
                            ) : (
                              <div className='w-[24px] h-[24px] text-sm cursor-pointer rounded-full bg-blue-200 leading-none flex items-center justify-center'>
                                <span className='text-xs'>{board.name[0].toUpperCase()}</span>
                              </div>
                            )}
                          </div>
                          <div>{board.name}</div>
                        </button>
                      ))}
                    </div>
                  ) : null}
                </>
              ) : null}
            </div>
          </div>
        </div>
        <div className='flex items-center'>
          {subscriptionStatus !== 'CANCELED' ? (
            <>
              {license.granteeId ? (
                <>
                  {isUpdatingUser ? (
                    <div className='h-[14px] w-[14px]'><LoadingSpinner fill='#000000'/></div>
                  ) : (
                    <button className='p-2 border-2 rounded-md text-gray-500 text-xs cursor-pointer' onClick={handleClickUnassignBoard}>
                      Unassign Board
                    </button>
                  )}
                </>
              ) : null}
            </>
          ) : null}
        </div>
      </div>
    </div>
  )
}