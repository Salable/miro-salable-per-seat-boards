'use server'
import {Result} from "../licenses/check";
import initMiroApi from "../../utils/init-miro-api";

export type AllowedShapes = 'rectangle' | 'triangle' | 'circle'
export const createShape = async (boardId: string, shape: AllowedShapes): Promise<Result<null>> => {
  try {
    const {userId, miro} = initMiroApi()
    const api = miro.as(userId)
    const board = await api.getBoard(boardId)
    await board.createShapeItem({
      data: {
        shape
      },
      style: {
        fillColor: getShapeColour(shape),
      },
      geometry: {
        width: 120,
        height: 120,
      }
    })
    return {
      data: null,
      error: null,
    }
  } catch (e) {
    console.log(e)
    return {
      data: null,
      error: 'Failed to create shape'
    }
  }
}

function getShapeColour(shape: AllowedShapes) {
  switch (shape) {
    case "rectangle": return '#fe9a00'
    case "triangle": return '#53eafd'
    case "circle": return '#ad46ff'
    default:
      throw new Error(`Unsupported shape ${shape}`)
  }
}