import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Building2, Users, TrendingUp, DollarSign, Plus, Sparkles, ArrowUpRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Link } from 'react-router-dom';
import StatCard from '@/components/StatCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Button } from '@/components/ui/button';
import type { AnalyticsOverview } from '@/types';
import api from '@/lib/api';

const chartData = [
  { month: 'Jan', leads: 65, sold: 4 },
  { month: 'Feb', leads: 78, sold: 6 },
  { month: 'Mar', leads: 90, sold: 8 },
  { month: 'Apr', leads: 110, sold: 5 },
  { month: 'May', leads: 130, sold: 11 },
  { month: 'Jun', leads: 156, sold: 14 },
];

const DashboardPage = () => {
  const [data, setData] = useState<AnalyticsOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const res = await api.get('/api/analytics/overview');
        const overview = res.data?.data || {};
        setData({
          totalProperties: overview.totalProperties || 0,
          totalLeads: overview.totalLeads || 0,
          hotLeads: overview.hotLeads || 0,
          soldProperties: overview.soldProperties || 0,
          conversionRate: overview.conversionRate || 0,
          revenue: overview.revenue || 0,
          leadsThisMonth: overview.leadsThisMonth || 0,
          propertiesThisMonth: overview.propertiesThisMonth || 0,
        });
      } catch {
        setData({
          totalProperties: 0,
          totalLeads: 0,
          hotLeads: 0,
          soldProperties: 0,
          conversionRate: 0,
          revenue: 0,
          leadsThisMonth: 0,
          propertiesThisMonth: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchOverview();
  }, []);

  if (loading || !data) return <LoadingSpinner text="Loading dashboard..." />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl lg:text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">Your real estate performance at a glance</p>
        </div>
        <div className="flex gap-2">
          <Link to="/properties/new">
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" /> Add Property
            </Button>
          </Link>
          <Link to="/ai-tools">
            <Button size="sm" variant="outline" className="gap-2">
              <Sparkles className="h-4 w-4" /> AI Tools
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Properties" value={data.totalProperties} change={`+${data.propertiesThisMonth} this month`} changeType="positive" icon={Building2} delay={0} />
        <StatCard title="Total Leads" value={data.totalLeads.toLocaleString()} change={`+${data.leadsThisMonth} this month`} changeType="positive" icon={Users} iconColor="bg-info/10 text-info" delay={0.1} />
        <StatCard title="Hot Leads" value={data.hotLeads} change="AI-scored 80+" changeType="neutral" icon={TrendingUp} iconColor="bg-warning/10 text-warning" delay={0.2} />
        <StatCard title="Revenue" value={`$${(data.revenue / 1_000_000).toFixed(1)}M`} change={`${data.conversionRate}% conversion`} changeType="positive" icon={DollarSign} iconColor="bg-success/10 text-success" delay={0.3} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold">Lead Growth</h3>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <ArrowUpRight className="h-3 w-3 text-success" /> +24% vs last period
            </span>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="leadGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(222, 62%, 22%)" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="hsl(222, 62%, 22%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'hsl(220, 9%, 46%)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: 'hsl(220, 9%, 46%)' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid hsl(220, 13%, 91%)', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} />
              <Area type="monotone" dataKey="leads" stroke="hsl(222, 62%, 22%)" strokeWidth={2} fill="url(#leadGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold">Properties Sold</h3>
            <span className="text-xs text-muted-foreground">{data.soldProperties} total</span>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'hsl(220, 9%, 46%)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: 'hsl(220, 9%, 46%)' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid hsl(220, 13%, 91%)', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} />
              <Bar dataKey="sold" fill="hsl(38, 92%, 50%)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </div>
  );
};

export default DashboardPage;
