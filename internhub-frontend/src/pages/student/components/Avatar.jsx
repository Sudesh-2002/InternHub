const Avatar = ({ initials, color = "bg-indigo-100 text-indigo-700" }) => (
  <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center text-sm font-bold flex-shrink-0`}>
    {initials}
  </div>
);

export default Avatar;