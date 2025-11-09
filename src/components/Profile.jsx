import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useRef, useState } from "react";

// Compact profile avatar + dropdown menu, styled to match the app's Tailwind theme
const Profile = () => {
  const { user, isAuthenticated, isLoading, logout } = useAuth0();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function onClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", onClickOutside);
    }
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  if (!isAuthenticated || isLoading || !user) return null;

  const initials = (user.name || user.email || "?")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="relative" ref={menuRef}>
      {/* Avatar button */}
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="group inline-flex items-center justify-center w-8 h-8 rounded-full ring-1 ring-gray-200 bg-white shadow-sm hover:ring-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        title={user.name || user.email}
      >
        {user.picture ? (
          <img
            src={user.picture}
            alt={user.name || "User"}
            className="w-8 h-8 rounded-full object-cover"
            referrerPolicy="no-referrer"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        ) : (
          <span className="w-8 h-8 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center text-xs font-semibold">
            {initials}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div
          role="menu"
          aria-label="Profile menu"
          className="absolute right-0 mt-2 w-64 origin-top-right rounded-lg border border-gray-100 bg-white shadow-lg ring-1 ring-black/5 focus:outline-none animate-slide-in"
        >
          <div className="p-3 border-b border-gray-100">
            <div className="flex items-center gap-3">
              {user.picture ? (
                <img
                  src={user.picture}
                  alt={user.name || "User"}
                  className="w-9 h-9 rounded-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span className="w-9 h-9 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center text-xs font-semibold">
                  {initials}
                </span>
              )}
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user.name || "Account"}
                </p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>
            </div>
          </div>
          <div className="py-1">
            {/* Placeholder for future navigation items */}
            <button
              onClick={() =>
                logout({ logoutParams: { returnTo: window.location.origin } })
              }
              className="w-full text-left text-sm px-4 py-2 text-gray-700 hover:bg-gray-50"
              role="menuitem"
            >
              Log out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
