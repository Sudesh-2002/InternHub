const rules = [
  {
    id: "length",
    label: "At least 8 characters",
    test: (v) => v.length >= 8,
  },
  {
    id: "lower",
    label: "One lowercase letter (a–z)",
    test: (v) => /[a-z]/.test(v),
  },
  {
    id: "upper",
    label: "One uppercase letter (A–Z)",
    test: (v) => /[A-Z]/.test(v),
  },
  {
    id: "number",
    label: "One number (0–9)",
    test: (v) => /[0-9]/.test(v),
  },
];

const PasswordStrengthChecker = ({ password }) => {
  if (!password) return null;

  const passed = rules.filter((r) => r.test(password)).length;
  const total = rules.length;

  const strengthColor =
    passed <= 1
      ? "#ef4444"
      : passed === 2
      ? "#f97316"
      : passed === 3
      ? "#eab308"
      : "#22c55e";

  return (
    <div className="mt-2 space-y-1.5">
      {/* Strength bar */}
      <div className="flex gap-1 h-1.5">
        {rules.map((_, i) => (
          <div
            key={i}
            className="flex-1 rounded-full transition-all duration-300"
            style={{
              backgroundColor: i < passed ? strengthColor : "#e5e7eb",
            }}
          />
        ))}
      </div>

      {/* Rule checklist */}
      <div className="space-y-1 pt-0.5">
        {rules.map((r) => {
          const ok = r.test(password);
          return (
            <div
              key={r.id}
              className="flex items-center gap-1.5 text-xs transition-colors duration-200"
              style={{ color: ok ? "#16a34a" : "#ef4444" }}
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {ok ? (
                  <path d="M20 6L9 17l-5-5" />
                ) : (
                  <>
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </>
                )}
              </svg>
              <span>{r.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const isPasswordStrong = (password) =>
  rules.every((r) => r.test(password));

export default PasswordStrengthChecker;
