import type {NextRequest} from 'next/server';
import {redirect} from 'next/navigation';
import initMiroApi from '../../../utils/init-miro-api';

export async function GET(request: NextRequest) {
  const {miro, userId} = initMiroApi();

  const code = request.nextUrl.searchParams.get('code');
  const boardId = request.nextUrl.searchParams.get('boardId');

  if (typeof code !== 'string') {
    redirect('/?missing-code');
  }

  try {
    await miro.exchangeCodeForAccessToken(userId, code);
  } catch (error) {
    redirect('/?error');
  }
  redirect(`/?auth=redirect&boardId=${boardId}`);
}

