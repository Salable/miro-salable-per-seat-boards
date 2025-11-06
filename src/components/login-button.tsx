'use client'

export const LoginButton = ({authUrl}: {authUrl: string}) => {
  return (
    <a
      className="button button-primary"
      href={authUrl}
      target="_blank"
    >
      Login
    </a>
  );
}