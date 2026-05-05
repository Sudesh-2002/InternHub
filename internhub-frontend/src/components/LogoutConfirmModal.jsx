// src/components/LogoutConfirmModal.jsx
import { useEffect } from "react";

/**
 * Beautiful logout confirmation dialog — works for admin, student & company.
 *
 * Props:
 *  - isOpen   {boolean}  – whether the dialog is visible
 *  - onCancel {function} – called when user dismisses
 *  - onConfirm{function} – called when user confirms logout
 *  - loading  {boolean}  – show spinner on confirm button while logging out
 */
const LogoutConfirmModal = ({ isOpen, onCancel, onConfirm, loading = false }) => {
  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === "Escape") onCancel(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center p-4"
      style={{ fontFamily: "'Inter', 'DM Sans', sans-serif" }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
        style={{ animation: "fadeIn 0.2s ease" }}
      />

      {/* Card */}
      <div
        className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden"
        style={{ animation: "slideUp 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)" }}
      >
        {/* Top gradient strip */}
        <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

        {/* Body */}
        <div className="px-8 pt-8 pb-6 text-center">

          {/* Icon */}
          <div className="mx-auto mb-5 w-16 h-16 rounded-2xl bg-gradient-to-br from-red-50 to-orange-50 border border-red-100 flex items-center justify-center">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
              stroke="#ef4444" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </div>

          {/* Heading */}
          <h2 className="text-gray-900 text-xl font-bold tracking-tight mb-2">
            Sign out?
          </h2>
          <p className="text-gray-500 text-sm leading-relaxed">
            You're about to sign out of your account.
            <br />
            Any unsaved changes will be lost.
          </p>
        </div>

        {/* Divider */}
        <div className="h-px bg-gray-100 mx-6" />

        {/* Buttons */}
        <div className="px-8 py-5 flex gap-3">
          {/* Cancel */}
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm font-semibold
                       hover:bg-gray-50 hover:border-gray-300 transition-all duration-150
                       disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-gray-200"
          >
            Stay signed in
          </button>

          {/* Confirm */}
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-semibold
                       hover:from-red-600 hover:to-red-700 transition-all duration-150 shadow-sm shadow-red-200
                       disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-red-400
                       flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Signing out…
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                Yes, sign out
              </>
            )}
          </button>
        </div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes fadeIn  { from { opacity:0 } to { opacity:1 } }
        @keyframes slideUp { from { opacity:0; transform:translateY(20px) scale(0.96) } to { opacity:1; transform:translateY(0) scale(1) } }
      `}</style>
    </div>
  );
};

export default LogoutConfirmModal;
