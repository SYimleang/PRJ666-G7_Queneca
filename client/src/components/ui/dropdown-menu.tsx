import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useUser } from "../../context/UserContext";

export default function Navbar() {
  const { user, setUser } = useUser();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!user) {
    // handle no user case if needed, e.g. show login/signup buttons
    return null;
  }

  return (
    <div ref={dropdownRef} className="relative inline-block text-left">
      <button
        onClick={() => setOpen(!open)}
        className="bg-red-500 text-white px-4 py-2 rounded"
      >
        {user.email}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-md z-10">
          <Link
            href="/edit-user"
            className="block px-4 py-2 hover:bg-gray-100"
            onClick={() => setOpen(false)}
          >
            Edit Profile
          </Link>
          <button
            onClick={() => {
              setUser(null);
              setOpen(false);
            }}
            className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
          >
            Log Out
          </button>
        </div>
      )}
    </div>
  );
}
