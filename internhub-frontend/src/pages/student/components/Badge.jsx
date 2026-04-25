const Badge = ({ status }) => {
  const map = {
    pending:  "bg-amber-50 text-amber-600 border-amber-200",
    accepted: "bg-green-50 text-green-600 border-green-200",
    rejected: "bg-red-50 text-red-600 border-red-200",
  };
  return (
    <span className={`text-xs font-semibold px-3 py-1 rounded-full border capitalize ${map[status]}`}>
      {status}
    </span>
  );
};

export default Badge;