'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/authContext';
import { api  } from '@/services/api';
import { TaskStats } from '@/services/api';
import { ProtectedRoute } from '@/layout/PrivateRoute';
import { Navbar } from '@/layout/navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import {
  CheckCircle2,
  Clock,
  ListTodo,
  AlertCircle,
  TrendingUp,
  Loader2
} from 'lucide-react';

export default function DashboardPage() {
  const { token } = useAuth();
  const [stats, setStats] = useState<TaskStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!token) return;

      try {
        const data = await api.getTaskStats(token);
        setStats(data);
      } catch (error) {
        toast.error('Failed to load statistics');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [token]);

  if (isLoading) {
    return (
      <ProtectedRoute>
        <Navbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <Loader2 className="h-8 w-8 animate-spin text-slate-600" />
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Navbar />
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
            <p className="text-slate-600 mt-1">Track your task progress and statistics</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="shadow-sm border-slate-200 hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Total Tasks</CardTitle>
                <ListTodo className="h-5 w-5 text-slate-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900">{stats?.total || 0}</div>
                <p className="text-xs text-slate-600 mt-1">All your tasks</p>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-green-200 hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-green-700">Completed</CardTitle>
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-700">{stats?.completed || 0}</div>
                <p className="text-xs text-green-600 mt-1">
                  {stats?.total ? `${Math.round((stats.completed / stats.total) * 100)}%` : '0%'} completion rate
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-amber-200 hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-amber-700">Pending</CardTitle>
                <Clock className="h-5 w-5 text-amber-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-amber-700">{stats?.pending || 0}</div>
                <p className="text-xs text-amber-600 mt-1">Tasks in progress</p>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-slate-200 hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Progress</CardTitle>
                <TrendingUp className="h-5 w-5 text-slate-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900">
                  {stats?.total ? `${Math.round((stats.completed / stats.total) * 100)}%` : '0%'}
                </div>
                <p className="text-xs text-slate-600 mt-1">Overall completion</p>
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5" />
                <span>Tasks by Priority</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="h-3 w-3 rounded-full bg-red-500"></div>
                    <span className="text-sm font-medium text-slate-700">High Priority</span>
                  </div>
                  <span className="text-2xl font-bold text-slate-900">
                    {stats?.byPriority?.high || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="h-3 w-3 rounded-full bg-amber-500"></div>
                    <span className="text-sm font-medium text-slate-700">Medium Priority</span>
                  </div>
                  <span className="text-2xl font-bold text-slate-900">
                    {stats?.byPriority?.medium || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="h-3 w-3 rounded-full bg-green-500"></div>
                    <span className="text-sm font-medium text-slate-700">Low Priority</span>
                  </div>
                  <span className="text-2xl font-bold text-slate-900">
                    {stats?.byPriority?.low || 0}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}
