import {Miro} from '@mirohq/miro-api';
import {cookies} from 'next/headers';
import {State} from '@mirohq/miro-api/dist/storage';

const tokensCookie = 'MIRO_SALABLE_TOKEN_USAGE';

export default function initMiroApi(redirectUrl?: string) {
  const cookieInstance = cookies();

  const getCookieValue = (key: string = tokensCookie) => {
    try {
      return JSON.parse(cookieInstance.get(key)?.value!) as State;
    } catch (err) {
      return null;
    }
  };

  return {
    miro: new Miro({
      storage: {
        get: async () => {
          return getCookieValue() ?? undefined;
        },
        set: (_, state) => {
          cookieInstance.set(tokensCookie, JSON.stringify(state), {
            path: '/',
            httpOnly: true,
            sameSite: 'none',
            secure: true,
          });
        },
      },
      ...(redirectUrl && { redirectUrl }),
    }),
    // User id might be undefined if the user is not logged in yet, we will know it after the redirect happened
    userId: getCookieValue()?.userId || '',
  };
}
