export function DashboardPage() {
  return (
    <div>
      <h2 className="text-3xl font-bold tracking-tight mb-8">Welcome back, User</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-[#0A1628] border border-white/10 rounded-xl p-6">
          <h3 className="text-white/60 font-medium text-sm mb-2">Upcoming Meetings</h3>
          <p className="text-3xl font-bold">3</p>
        </div>
        <div className="bg-[#0A1628] border border-white/10 rounded-xl p-6">
          <h3 className="text-white/60 font-medium text-sm mb-2">Pending Tasks</h3>
          <p className="text-3xl font-bold">12</p>
        </div>
        <div className="bg-[#0A1628] border border-white/10 rounded-xl p-6">
          <h3 className="text-white/60 font-medium text-sm mb-2">Unread Messages</h3>
          <p className="text-3xl font-bold text-emerald-400">5</p>
        </div>
      </div>

      <div className="bg-[#0A1628] border border-white/10 rounded-xl p-8 min-h-[400px] flex items-center justify-center">
        <p className="text-white/40">Dashboard Widgets Placeholder 🚧</p>
      </div>
    </div>
  );
}
