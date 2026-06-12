import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { Calendar, Clock, CheckCircle, TrendingUp, Users } from 'lucide-react';

const data = [
  { name: 'Mon', meetings: 4, hours: 2.5 },
  { name: 'Tue', meetings: 3, hours: 1.8 },
  { name: 'Wed', meetings: 6, hours: 4.2 },
  { name: 'Thu', meetings: 2, hours: 1.2 },
  { name: 'Fri', meetings: 5, hours: 3.5 },
];

const sentimentData = [
  { name: 'Positive', value: 65, color: '#10b981' },
  { name: 'Neutral', value: 25, color: '#64748b' },
  { name: 'Tense', value: 10, color: '#ef4444' },
];

export function Analytics() {
  return (
    <div className="space-y-12">
        <header className="mb-12">
            <h2 className="text-4xl font-black tracking-tighter text-white mb-2">Workspace Insights</h2>
            <p className="text-white/40">Analyzing your meeting efficiency and team collaboration over time.</p>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-[#050B14] border border-white/5 p-8 rounded-3xl relative overflow-hidden group hover:border-white/20 transition-all">
                <div className="absolute right-[-10px] top-[-10px] w-24 h-24 bg-white/5 blur-3xl group-hover:bg-white/10 transition-all" />
                <Calendar size={20} className="text-white/40 mb-6" />
                <h3 className="text-white/40 font-black text-xs uppercase tracking-widest mb-2">Total Meetings</h3>
                <p className="text-4xl font-black text-white">42</p>
                <div className="flex items-center space-x-2 mt-4 text-emerald-400 text-xs font-black">
                    <TrendingUp size={12} />
                    <span>+12% this week</span>
                </div>
            </div>
            <div className="bg-[#050B14] border border-white/5 p-8 rounded-3xl group hover:border-white/20 transition-all">
                <Clock size={20} className="text-white/40 mb-6" />
                <h3 className="text-white/40 font-black text-xs uppercase tracking-widest mb-2">Avg. Duration</h3>
                <p className="text-4xl font-black text-white">34m</p>
            </div>
            <div className="bg-[#050B14] border border-white/5 p-8 rounded-3xl group hover:border-white/20 transition-all">
                <CheckCircle size={20} className="text-white/40 mb-6" />
                <h3 className="text-white/40 font-black text-xs uppercase tracking-widest mb-2">Action Tasks Resulted</h3>
                <p className="text-4xl font-black text-white">156</p>
            </div>
            <div className="bg-[#050B14] border border-white/5 p-8 rounded-3xl group hover:border-white/20 transition-all">
                <Users size={20} className="text-white/40 mb-6" />
                <h3 className="text-white/40 font-black text-xs uppercase tracking-widest mb-2">Team Engagement</h3>
                <p className="text-4xl font-black text-white">88%</p>
            </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-[#050B14] border border-white/5 p-10 rounded-[2.5rem] min-h-[500px] flex flex-col">
                <div className="flex items-center justify-between mb-12">
                    <h3 className="font-black text-xl text-white">Meeting Frequency</h3>
                    <div className="bg-white/5 px-4 py-2 rounded-xl text-white/50 text-xs font-black border border-white/5">This Week</div>
                </div>
                <div className="flex-1 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data}>
                            <defs>
                                <linearGradient id="colorMeetings" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#ffffff" stopOpacity={0.1}/>
                                    <stop offset="95%" stopColor="#ffffff" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                            <XAxis 
                                dataKey="name" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fill: '#ffffff40', fontWeight: 'black', fontSize: 10 }} 
                            />
                            <YAxis hide />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#050B14', border: '1px solid #ffffff10', borderRadius: '15px' }}
                                itemStyle={{ color: '#22d3ee' }}
                            />
                            <Area type="monotone" dataKey="meetings" stroke="#22d3ee" strokeWidth={3} fillOpacity={1} fill="url(#colorMeetings)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="bg-[#050B14] border border-white/5 p-10 rounded-[2.5rem] flex flex-col">
                <div className="flex items-center justify-between mb-12">
                    <h3 className="font-black text-xl text-white">Collaboration Sentiment</h3>
                </div>
                <div className="flex-1 items-center justify-center flex">
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={sentimentData}
                                cx="50%"
                                cy="50%"
                                innerRadius={80}
                                outerRadius={110}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {sentimentData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#050B14', border: '1px solid #ffffff10', borderRadius: '15px' }}
                            />
                            <Legend align="center" verticalAlign="bottom" iconType="circle" />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    </div>
  );
}
