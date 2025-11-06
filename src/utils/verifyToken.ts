import * as jwt from 'jsonwebtoken';

export function verifyToken<T>(token: string, secret: jwt.Secret): T | null {
  try {
    return jwt.verify(token, secret) as T;
  } catch (err) {
    console.log(err);
    return null;
  }
}