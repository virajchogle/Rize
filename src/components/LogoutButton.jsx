import { useAuth0 } from "@auth0/auth0-react";

export default function LogoutButton() {
  const { logout } = useAuth0();
  return (
    <button
      onClick={() =>
        logout({ logoutParams: { returnTo: window.location.origin } })
      }
      className="px-3 py-1.5 text-sm font-medium bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
    >
      Log Out
    </button>
  );
}
