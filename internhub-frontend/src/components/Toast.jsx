import { useEffect } from "react";

const Toast = ({ message, type = "success", onClose, duration = 2000 }) => {
  useEffect(() => {
    if (!onClose || type === "loading") return;
    const t = setTimeout(onClose, duration);
    return () => clearTimeout(t);
  }, [onClose, duration, type]);

  const styles = {
    success: "bg-green-600",
    loading: "bg-indigo-600",
    error: "bg-red-600",
  };

  return (
    <div
      className={`fixed bottom-5 right-5 z-50 ${styles[type] || styles.success} text-white text-sm font-medium px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2`}
    >
      {type === "loading" && (
        <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin inline-block" />
      )}
      {type === "success" && (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      )}
      {type === "error" && (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      )}
      {message}
    </div>
  );
};

export default Toast;