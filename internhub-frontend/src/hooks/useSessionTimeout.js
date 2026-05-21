import { useEffect, useRef, useCallback } from "react";
import API from "../services/api";

const IDLE_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes idle → auto logout
const WARNING_MS = 2 * 60 * 1000; // Show warning 2 minutes before

const ACTIVITY_EVENTS = [
  "mousedown", "mousemove", "keypress", "scroll", "touchstart", "click",
];

/**
 * useSessionTimeout
 *
 * @param {object} options
 * @param {boolean}  options.enabled   - Set false to disable (e.g. user not logged in)
 * @param {function} options.onWarning - Called when the warning countdown begins
 * @param {function} options.onExpire  - Called when the session actually expires
 * @param {function} options.onReset   - Called when activity is detected (hide modal)
 */
export function useSessionTimeout({ enabled = true, onWarning, onExpire, onReset }) {
  const warnTimer = useRef(null);
  const expireTimer = useRef(null);
  const warned = useRef(false);

  const clearTimers = useCallback(() => {
    clearTimeout(warnTimer.current);
    clearTimeout(expireTimer.current);
  }, []);

  const resetTimers = useCallback(() => {
    clearTimers();
    warned.current = false;

    warnTimer.current = setTimeout(() => {
      warned.current = true;
      onWarning?.();
    }, IDLE_TIMEOUT_MS - WARNING_MS);

    expireTimer.current = setTimeout(async () => {
      try {
        await API.post("/timeout");
      } catch (_) { /* token may already be invalid */ }
      onExpire?.();
    }, IDLE_TIMEOUT_MS);
  }, [clearTimers, onWarning, onExpire]);

  const handleActivity = useCallback(() => {
    if (!enabled) return;
    // If already in warning period don't reset (let user explicitly click Stay In)
    if (warned.current) return;
    resetTimers();
    onReset?.();
  }, [enabled, resetTimers, onReset]);

  const stayLoggedIn = useCallback(() => {
    warned.current = false;
    resetTimers();
    onReset?.();
  }, [resetTimers, onReset]);

  useEffect(() => {
    if (!enabled) return;
    resetTimers();

    ACTIVITY_EVENTS.forEach(evt =>
      window.addEventListener(evt, handleActivity, { passive: true })
    );

    return () => {
      clearTimers();
      ACTIVITY_EVENTS.forEach(evt =>
        window.removeEventListener(evt, handleActivity)
      );
    };
  }, [enabled, resetTimers, handleActivity, clearTimers]);

  return { stayLoggedIn, WARNING_SECONDS: Math.floor(WARNING_MS / 1000) };
}
