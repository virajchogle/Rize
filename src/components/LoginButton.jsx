import { useAuth0 } from "@auth0/auth0-react";

export default function LoginButton() {
  const { loginWithRedirect, isLoading } = useAuth0();
  return (
    <button
      onClick={() => loginWithRedirect()}
      disabled={isLoading}
      className="button login"
    >
      {isLoading ? "Loading..." : "Log In"}
    </button>
  );
}
