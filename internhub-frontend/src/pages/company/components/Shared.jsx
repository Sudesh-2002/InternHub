// src/pages/company/components/Shared.jsx

import { useState } from "react";
import { statusConfig } from "../data/mockData";

// ── Inline SVG icon ───────────────────────────────────────────────────────────
export const Ico = ({ d, size = 18, sw = 1.7, color = "currentColor", fill = "none", className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={color}
    strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" className={className}>
    {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
  </svg>
);

// ── Status badge ──────────────────────────────────────────────────────────────
export const StatusBadge = ({ status }) => {
  const cfg = statusConfig[status] || statusConfig.pending;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
};

// ── Confirm modal ─────────────────────────────────────────────────────────────
export const ConfirmModal = ({ title, body, onConfirm, onCancel, danger = false }) => (
  <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
    <div className="bg-white border border-gray-100 rounded-2xl w-full max-w-sm p-6 shadow-2xl">
      <h4 className="text-gray-900 font-semibold text-base mb-2">{title}</h4>
      <p className="text-gray-500 text-sm mb-6">{body}</p>
      <div className="flex gap-3 justify-end">
        <button onClick={onCancel}
          className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 font-medium transition">
          Cancel
        </button>
        <button onClick={onConfirm}
          className={`px-5 py-2 text-sm font-semibold rounded-xl transition ${
            danger
              ? "bg-red-500 hover:bg-red-600 text-white"
              : "bg-indigo-600 hover:bg-indigo-700 text-white"
          }`}>
          Confirm
        </button>
      </div>
    </div>
  </div>
);

// ── Toast system ──────────────────────────────────────────────────────────────
let _tid = 0;

export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const add = (msg, type = "success") => {
    const id = ++_tid;
    setToasts(p => [...p, { id, msg, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3200);
  };

  return { toasts, add };
};

export const Toasts = ({ toasts }) => (
  <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-2 pointer-events-none">
    {toasts.map(t => (
      <div key={t.id}
        className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-medium shadow-2xl animate-[slideUp_0.25s_ease] pointer-events-auto ${
          t.type === "success" ? "bg-emerald-500 text-white" :
          t.type === "error"   ? "bg-red-500 text-white"     :
                                 "bg-gray-800 text-gray-100"
        }`}>
        {t.type === "success" && <Ico d="M20 6L9 17l-5-5" size={15} sw={2.5} />}
        {t.type === "error"   && <Ico d="M18 6L6 18M6 6l12 12" size={15} sw={2.5} />}
        {t.msg}
      </div>
    ))}
  </div>
);