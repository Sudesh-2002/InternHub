const StatCard = ({ label, value, color, bg }) => (
  <div className={`${bg} rounded-2xl p-5 flex flex-col gap-1`}>
    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</span>
    <span className={`text-3xl font-bold ${color}`}>{value}</span>
  </div>
);

export default StatCard;