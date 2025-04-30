'use server'
import {Result} from "../licenses/check";
import initMiroApi from "../../utils/init-miro-api";

export type BoardData = {
  id: string;
  name: string;
  ownerId: string | null;
  imageUrl: string | null;
}

export const isBoardOwner = async (boardId: string): Promise<Result<boolean>> => {
  try {
    const {userId, miro} = initMiroApi()
    const api = miro.as(userId)
    const board = await api.getBoard(boardId)
    return {
      data: board.owner?.id === userId,
      error: null
    }
  } catch (e) {
    console.log(e)
    return {
      data: null,
      error: 'Failed to verify board owner'
    }
  }
}

export const getAllBoards = async (): Promise<Result<BoardData[]>> => {
  try {
    const {userId, miro} = initMiroApi()
    const api = miro.as(userId)
    const userToken = await api.tokenInfo()
    const boards: BoardData[] = []
    for await (const b of api.getAllBoards({ teamId: userToken.team.id })) {
      boards.push({
        id: b.id,
        name: b.name,
        ownerId: b.owner?.id ?? null,
        imageUrl: b.picture?.imageURL ?? null,
      })
    }
    return {
      data: boards,
      error: null
    }
  } catch (e) {
    return {
      data: null,
      error: 'Failed to get all boards'
    }
  }
}