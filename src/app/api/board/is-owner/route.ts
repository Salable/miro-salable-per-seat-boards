import { withAuth } from "../../../../utils/withAuth";
import initMiroApi from "../../../../utils/init-miro-api";
import { State } from "../../entitlements/check/route";
import { cookies } from "next/headers";

export const GET = withAuth(async (state: State, request) => {
  try {
    const { searchParams } = new URL(request.url);
    const boardId = searchParams.get("boardId");
    
    if (!boardId) {
      return new Response(JSON.stringify({ error: "Missing boardId" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    
    const cookieInstance = cookies();
    const tokenCookie = cookieInstance.get("MIRO_SALABLE_TOKEN_USAGE");
    
    if (!tokenCookie?.value) {
      return new Response(JSON.stringify({ isOwner: false }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
    
    try {
      const { miro } = initMiroApi();
      const api = miro.as(state.user);
      const board = await api.getBoard(boardId);
      const isOwner = board.owner?.id === state.user;
      
      return new Response(JSON.stringify({ isOwner }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (e) {
      return new Response(JSON.stringify({ isOwner: false }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
  } catch (e) {
    return new Response(JSON.stringify({ error: "Failed to verify board owner" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
});

