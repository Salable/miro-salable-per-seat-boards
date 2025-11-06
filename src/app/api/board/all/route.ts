import { withAuth } from "../../../../utils/withAuth";
import initMiroApi from "../../../../utils/init-miro-api";
import { State } from "../../entitlements/check/route";
import { cookies } from "next/headers";

export type BoardData = {
  id: string;
  name: string;
  ownerId: string | null;
  imageUrl: string | null;
};

export const GET = withAuth(async (state: State, _request) => {
  try {
    const cookieInstance = cookies();
    const tokenCookie = cookieInstance.get("MIRO_SALABLE_TOKEN_USAGE");
    
    if (!tokenCookie?.value) {
      return new Response(JSON.stringify({ error: "No access token available" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
    
    const { miro } = initMiroApi();
    const api = miro.as(state.user);
    const userToken = await api.tokenInfo();
    const boards: BoardData[] = [];
    
    for await (const b of api.getAllBoards({ teamId: userToken.team.id })) {
      boards.push({
        id: b.id,
        name: b.name,
        ownerId: b.owner?.id ?? null,
        imageUrl: b.picture?.imageURL ?? null,
      });
    }
    
    return new Response(JSON.stringify({ boards }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: "Failed to get all boards" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
});

