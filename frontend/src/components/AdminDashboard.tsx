import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  Users, DollarSign, Activity, Server, TrendingUp, 
  Settings, LogOut, BarChart3, Clock, Zap, Cpu,
  ArrowUp, ArrowDown, MoreVertical, Search, Filter
} from "lucide-react";
import toast from "react-hot-toast";

const AdminDashboard: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("7d");
  const navigate = useNavigate();

  const stats = {
    totalUsers: 1247,
    activeUsers: 342,
    totalRevenue: 48592.50,
    dailyRevenue: 1247.80,
    gpuUtilization: 78.5,
    activeSessions: 89
  };

  const recentUsers = [
    { id: 1, name: "John Doe", email: "john@example.com", joined: "2024-01-27", status: "active", spent: 245.50 },
    { id: 2, name: "Jane Smith", email: "jane@example.com", joined: "2024-01-26", status: "active", spent: 189.25 },
    { id: 3, name: "Bob Johnson", email: "bob@example.com", joined: "2024-01-25", status: "inactive", spent: 67.80 }
  ];

  const revenueData = [
    { date: "2024-01-21", revenue: 1124.50 },
    { date: "2024-01-22", revenue: 1356.80 },
    { date: "2024-01-23", revenue: 987.20 },
    { date: "2024-01-24", revenue: 1456.90 },
    { date: "2024-01-25", revenue: 1234.60 },
    { date: "2024-01-26", revenue: 1567.30 },
    { date: "2024-01-27", revenue: 1247.80 }
  ];

  const handleLogout = () => {
    toast.success("Logged out successfully");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black">
      <header className="glass-morphism border-b border-purple-500/30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
            <div className="flex items-center gap-4">
              <button className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors">
                <Settings className="w-5 h-5" />
              </button>
              <button 
                onClick={handleLogout}
                className="p-2 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-400 transition-colors"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="glass-morphism rounded-xl p-6 border border-purple-500/30">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-400" />
                <span className="text-gray-400">Total Users</span>
              </div>
              <div className="flex items-center gap-1 text-green-400 text-sm">
                <ArrowUp className="w-4 h-4" />
                12.5%
              </div>
            </div>
            <div className="text-3xl font-bold text-white">{stats.totalUsers.toLocaleString()}</div>
            <div className="text-sm text-gray-400 mt-1">{stats.activeUsers} active now</div>
          </div>

          <div className="glass-morphism rounded-xl p-6 border border-purple-500/30">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-400" />
                <span className="text-gray-400">Total Revenue</span>
              </div>
              <div className="flex items-center gap-1 text-green-400 text-sm">
                <ArrowUp className="w-4 h-4" />
                8.3%
              </div>
            </div>
            <div className="text-3xl font-bold text-white">${stats.totalRevenue.toLocaleString()}</div>
            <div className="text-sm text-gray-400 mt-1">${stats.dailyRevenue} today</div>
          </div>

          <div className="glass-morphism rounded-xl p-6 border border-purple-500/30">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-purple-400" />
                <span className="text-gray-400">GPU Utilization</span>
              </div>
              <div className="flex items-center gap-1 text-yellow-400 text-sm">
                <ArrowDown className="w-4 h-4" />
                2.1%
              </div>
            </div>
            <div className="text-3xl font-bold text-white">{stats.gpuUtilization}%</div>
            <div className="text-sm text-gray-400 mt-1">{stats.activeSessions} active sessions</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="glass-morphism rounded-2xl p-6 border border-purple-500/30">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-400" />
                Revenue Overview
              </h2>
              <select 
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1 text-sm focus:outline-none focus:border-purple-500"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>
            </div>

            <div className="space-y-4">
              {revenueData.map((day, index) => (
                <div key={day.date} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full" />
                    <span className="text-sm text-gray-400">{day.date}</span>
                  </div>
                  <span className="font-semibold text-green-400">${day.revenue.toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-gray-700">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Total Period Revenue</span>
                <span className="text-xl font-bold text-green-400">
                  ${revenueData.reduce((sum, day) => sum + day.revenue, 0).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <div className="glass-morphism rounded-2xl p-6 border border-purple-500/30">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-400" />
                Recent Users
              </h2>
              <div className="flex gap-2">
                <button className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors">
                  <Search className="w-4 h-4" />
                </button>
                <button className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors">
                  <Filter className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {recentUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold">
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <div className="font-semibold text-white">{user.name}</div>
                      <div className="text-sm text-gray-400">{user.email}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        user.status === 'active' 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-gray-500/20 text-gray-400'
                      }`}>
                        {user.status}
                      </span>
                      <button className="p-1 hover:bg-gray-700 rounded transition-colors">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="text-sm text-gray-400 mt-1">${user.spent.toFixed(2)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="glass-morphism rounded-2xl p-6 border border-purple-500/30">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Server className="w-5 h-5 text-orange-400" />
              GPU Status
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Overall Utilization</span>
                  <span>{stats.gpuUtilization}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-orange-400 to-red-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${stats.gpuUtilization}%` }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-400">{stats.activeSessions}</div>
                  <div className="text-xs text-gray-400">Active Sessions</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">12</div>
                  <div className="text-xs text-gray-400">GPU Nodes</div>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-morphism rounded-2xl p-6 border border-purple-500/30">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              Performance Metrics
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Avg Response Time</span>
                <span className="text-green-400">124ms</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Success Rate</span>
                <span className="text-green-400">99.8%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Error Rate</span>
                <span className="text-yellow-400">0.2%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Uptime</span>
                <span className="text-green-400">99.9%</span>
              </div>
            </div>
          </div>

          <div className="glass-morphism rounded-2xl p-6 border border-purple-500/30">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-purple-400" />
              Quick Actions
            </h3>
            <div className="space-y-3">
              <button className="w-full p-3 bg-gray-800 hover:bg-gray-700 rounded-lg text-left transition-colors">
                <div className="font-semibold text-white">User Management</div>
                <div className="text-sm text-gray-400">View and manage all users</div>
              </button>
              <button className="w-full p-3 bg-gray-800 hover:bg-gray-700 rounded-lg text-left transition-colors">
                <div className="font-semibold text-white">Billing Overview</div>
                <div className="text-sm text-gray-400">Detailed billing analytics</div>
              </button>
              <button className="w-full p-3 bg-gray-800 hover:bg-gray-700 rounded-lg text-left transition-colors">
                <div className="font-semibold text-white">System Settings</div>
                <div className="text-sm text-gray-400">Configure platform settings</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
