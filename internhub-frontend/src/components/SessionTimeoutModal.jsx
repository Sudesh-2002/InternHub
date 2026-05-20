import { useEffect, useState } from "react";

const SessionTimeoutModal = ({ isOpen, secondsLeft: initialSeconds, onStay, onLogout }) => {
  const [seconds, setSeconds] = useState(initialSeconds);

  // Reset and countdown whenever the modal opens
  useEffect(() => {
    if (!isOpen) return;
    setSeconds(initialSeconds);

    const id = setInterval(() => {
      setSeconds(prev => {
        if (prev <= 1) {
          clearInterval(id);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(id);
  }, [isOpen, initialSeconds]);

  if (!isOpen) return null;

  const mins = Math.floor(seconds / 60);
  const secs = String(seconds % 60).padStart(2, "0");
  const pct = Math.min(100, (seconds / initialSeconds) * 100);

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: "20px",
          padding: "32px",
          width: "100%",
          maxWidth: "400px",
          boxShadow: "0 25px 60px rgba(0,0,0,0.18)",
          animation: "sessionModalIn 0.25s ease",
        }}
      >
        <style>{`
          @keyframes sessionModalIn {
            from { opacity: 0; transform: scale(0.94) translateY(8px); }
            to   { opacity: 1; transform: scale(1) translateY(0); }
          }
        `}</style>

        <div
          style={{
            width: 56, height: 56,
            borderRadius: "16px",
            background: "rgba(245, 158, 11, 0.1)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 20px",
          }}
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
            stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        </div>

        <h2 style={{ textAlign: "center", fontSize: "18px", fontWeight: 700, color: "#111827", margin: "0 0 6px" }}>
          Session Expiring Soon
        </h2>
        <p style={{ textAlign: "center", fontSize: "14px", color: "#6b7280", margin: "0 0 24px", lineHeight: 1.5 }}>
          You've been inactive. Your session will end in:
        </p>

        {/* Countdown */}
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <span
            style={{
              fontSize: "42px",
              fontWeight: 800,
              color: seconds <= 30 ? "#ef4444" : "#f59e0b",
              fontVariantNumeric: "tabular-nums",
              transition: "color 0.3s",
            }}
          >
            {mins > 0 ? `${mins}:${secs}` : `${seconds}`}
          </span>
          {mins === 0 && (
            <span style={{ fontSize: "14px", color: "#9ca3af", marginLeft: "4px" }}>sec</span>
          )}
        </div>

        {/* Progress bar */}
        <div
          style={{
            height: "6px", background: "#f3f4f6",
            borderRadius: "99px", overflow: "hidden", marginBottom: "28px",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${pct}%`,
              background: seconds <= 30 ? "#ef4444" : "#f59e0b",
              borderRadius: "99px",
              transition: "width 1s linear, background 0.3s",
            }}
          />
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: "12px" }}>
          <button
            onClick={onLogout}
            style={{
              flex: 1, padding: "11px 16px",
              borderRadius: "12px", border: "1px solid #e5e7eb",
              background: "#fff", color: "#6b7280",
              fontSize: "14px", fontWeight: 600, cursor: "pointer",
              transition: "background 0.15s",
            }}
            onMouseEnter={e => e.currentTarget.style.background = "#f9fafb"}
            onMouseLeave={e => e.currentTarget.style.background = "#fff"}
          >
            Logout Now
          </button>
          <button
            onClick={onStay}
            style={{
              flex: 1, padding: "11px 16px",
              borderRadius: "12px", border: "none",
              background: "#4f46e5", color: "#fff",
              fontSize: "14px", fontWeight: 600, cursor: "pointer",
              boxShadow: "0 4px 12px rgba(79,70,229,0.3)",
              transition: "background 0.15s, transform 0.1s",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = "#4338ca";
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = "#4f46e5";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            Stay Logged In
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionTimeoutModal;
