import Avatar from "../components/Avatar";
import Badge from "../components/Badge";
import StatCard from "../components/StatCard";
import { MOCK_APPLICATIONS, avatarColors } from "../components/data/mockData";

const DashboardHome = ({ user, setPage }) => {
  const total    = MOCK_APPLICATIONS.length;
  const accepted = MOCK_APPLICATIONS.filter(a => a.status === "accepted").length;
  const rejected = MOCK_APPLICATIONS.filter(a => a.status === "rejected").length;
  const pending  = MOCK_APPLICATIONS.filter(a => a.status === "pending").length;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          Good morning, {user?.name?.split(" ")[0]} 👋
        </h2>
        <p className="text-sm text-gray-400 mt-1">Here's what's happening with your applications.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Applied"  value={total}    color="text-indigo-600" bg="bg-indigo-50" />
        <StatCard label="Pending"        value={pending}  color="text-amber-600"  bg="bg-amber-50" />
        <StatCard label="Accepted"       value={accepted} color="text-green-600"  bg="bg-green-50" />
        <StatCard label="Rejected"       value={rejected} color="text-red-500"    bg="bg-red-50" />
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800">Recent Applications</h3>
          <button onClick={() => setPage("applications")}
            className="text-xs text-indigo-600 font-medium hover:text-indigo-700">
            View all →
          </button>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50">
          {MOCK_APPLICATIONS.slice(0, 3).map((app, i) => (
            <div key={app.id} className="flex items-center justify-between px-5 py-4">
              <div className="flex items-center gap-3">
                <Avatar initials={app.company.slice(0,2).toUpperCase()} color={avatarColors[i % avatarColors.length]} />
                <div>
                  <p className="text-sm font-semibold text-gray-800">{app.title}</p>
                  <p className="text-xs text-gray-400">{app.company} · {app.appliedDate}</p>
                </div>
              </div>
              <Badge status={app.status} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;