import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Users, TrendingUp, Target, AlertCircle } from 'lucide-react';
import { leadsApi } from '../../api';
import { Lead, LeadStatus } from '../../types';
import { Badge, Spinner, EmptyState } from '../../components/ui';
import { Layout } from '../../components/layout/Layout';
import { useAuthStore } from '../../store/authStore';

const STATUS_LIST: LeadStatus[] = ['New', 'Contacted', 'Qualified', 'Lost'];

const StatCard: React.FC<{
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}> = ({ label, value, icon, color }) => (
  <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  </div>
);

export const DashboardPage: React.FC = () => {
  const { user } = useAuthStore();

  const { data, isLoading } = useQuery({
    queryKey: ['leads', 'dashboard'],
    queryFn: () => leadsApi.getAll({ limit: 100 }).then((r) => r.data),
  });

  const leads: Lead[] = data?.data || [];

  const counts = STATUS_LIST.reduce((acc, s) => {
    acc[s] = leads.filter((l) => l.status === s).length;
    return acc;
  }, {} as Record<LeadStatus, number>);

  const recentLeads = [...leads]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Good day, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-gray-500 mt-1">Here's your leads overview</p>
      </div>

      {isLoading ? (
        <Spinner className="py-20" />
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              label="Total Leads"
              value={leads.length}
              icon={<Users className="w-6 h-6 text-indigo-600" />}
              color="bg-indigo-50"
            />
            <StatCard
              label="Qualified"
              value={counts.Qualified}
              icon={<Target className="w-6 h-6 text-green-600" />}
              color="bg-green-50"
            />
            <StatCard
              label="In Progress"
              value={counts.Contacted}
              icon={<TrendingUp className="w-6 h-6 text-yellow-600" />}
              color="bg-yellow-50"
            />
            <StatCard
              label="Lost"
              value={counts.Lost}
              icon={<AlertCircle className="w-6 h-6 text-red-500" />}
              color="bg-red-50"
            />
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Recent Leads</h2>
            {recentLeads.length === 0 ? (
              <EmptyState title="No leads yet" description="Start adding leads to see them here" />
            ) : (
              <div className="space-y-3">
                {recentLeads.map((lead) => (
                  <div
                    key={lead._id}
                    className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
                  >
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{lead.name}</p>
                      <p className="text-xs text-gray-500">{lead.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge type="source" value={lead.source} />
                      <Badge type="status" value={lead.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </Layout>
  );
};
