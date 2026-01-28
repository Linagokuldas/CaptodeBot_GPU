import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Play, Pause, Plus, Trash2, Save, Upload, Download, 
  Code, Zap, DollarSign, Activity, Users, LogOut,
  ChevronRight, ArrowRight, Sparkles, Cpu, Clock,
  FileText, Settings, BarChart3
} from "lucide-react";
import Editor from "@monaco-editor/react";
import AIAssistant from "./AIAssistant";
import { NotebookCell, GPUMetrics, BillingInfo } from "../types";
import toast from "react-hot-toast";

const UserDashboard: React.FC = () => {
  const [cells, setCells] = useState<NotebookCell[]>([
    { id: "1", content: "# Welcome to your GPU Workspace\nimport numpy as np\nprint('Hello from GPU!')", output: "", isRunning: false }
  ]);
  const [selectedCell, setSelectedCell] = useState<string>("1");
  const [gpuMetrics, setGpuMetrics] = useState<GPUMetrics>({
    utilization: 0,
    memoryUsed: 0,
    memoryTotal: 16384,
    temperature: 45,
    powerUsage: 0
  });
  const [billing, setBilling] = useState<BillingInfo>({
    isActive: false,
    startTime: null,
    cost: 0,
    rate: 0.002
  });
  const navigate = useNavigate();

  const addCell = () => {
    const newCell: NotebookCell = {
      id: Date.now().toString(),
      content: "",
      output: "",
      isRunning: false
    };
    setCells([...cells, newCell]);
    setSelectedCell(newCell.id);
  };

  const deleteCell = (cellId: string) => {
    if (cells.length > 1) {
      setCells(cells.filter(cell => cell.id !== cellId));
      if (selectedCell === cellId) {
        setSelectedCell(cells[0].id);
      }
    }
  };

  const updateCellContent = (cellId: string, content: string) => {
    setCells(cells.map(cell => 
      cell.id === cellId ? { ...cell, content } : cell
    ));
  };

  const runCell = (cellId: string) => {
    const cell = cells.find(c => c.id === cellId);
    if (!cell) return;

    setCells(cells.map(c => 
      c.id === cellId ? { ...c, isRunning: true } : c
    ));

    setBilling(prev => ({
      ...prev,
      isActive: true,
      startTime: Date.now()
    }));

    setGpuMetrics({
      utilization: 85,
      memoryUsed: 12288,
      memoryTotal: 16384,
      temperature: 72,
      powerUsage: 280
    });

    setTimeout(() => {
      const output = cell.content.includes('print') 
        ? cell.content.match(/print\(['"`]([^'"`]+)['"`]\)/)?.[1] || "Code executed successfully on GPU!"
        : "Code executed successfully on GPU!";
      
      setCells(cells.map(c => 
        c.id === cellId ? { ...c, isRunning: false, output } : c
      ));

      setGpuMetrics({
        utilization: 0,
        memoryUsed: 0,
        memoryTotal: 16384,
        temperature: 45,
        powerUsage: 0
      });

      setBilling(prev => ({
        ...prev,
        isActive: false,
        cost: prev.cost + 0.08
      }));
    }, 3000);
  };

  const handleLogout = () => {
    toast.success("Logged out successfully");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black">
      <header className="glass-morphism border-b border-purple-500/30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Code className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                  CaptodeBot
                </h1>
              </div>
              <span className="text-sm text-gray-400">User Dashboard</span>
            </div>
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

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            <div className="glass-morphism rounded-2xl border border-purple-500/30 overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-gray-700">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Code className="w-5 h-5 text-blue-400" />
                  GPU Notebook Workspace
                </h2>
                <div className="flex items-center gap-2">
                  <button className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
                    <Save className="w-4 h-4 text-gray-400" />
                  </button>
                  <button className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
                    <Upload className="w-4 h-4 text-gray-400" />
                  </button>
                  <button className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
                    <Download className="w-4 h-4 text-gray-400" />
                  </button>
                  <button
                    onClick={addCell}
                    className="p-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>

              <div className="p-4 space-y-4 max-h-[600px] overflow-y-auto">
                <AnimatePresence>
                  {cells.map((cell, index) => (
                    <motion.div
                      key={cell.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className={`border rounded-lg overflow-hidden transition-all ${
                        selectedCell === cell.id 
                          ? 'border-purple-500 shadow-lg shadow-purple-500/20' 
                          : 'border-gray-700'
                      }`}
                    >
                      <div className="flex items-center justify-between p-3 bg-gray-800">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-400">[{index}]</span>
                          <button
                            onClick={() => runCell(cell.id)}
                            disabled={cell.isRunning}
                            className="p-1 bg-green-600 hover:bg-green-700 rounded transition-colors disabled:opacity-50"
                          >
                            {cell.isRunning ? (
                              <Pause className="w-3 h-3 text-white" />
                            ) : (
                              <Play className="w-3 h-3 text-white" />
                            )}
                          </button>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedCell(cell.id)}
                            className="p-1 hover:bg-gray-700 rounded transition-colors"
                          >
                            <Code className="w-3 h-3 text-gray-400" />
                          </button>
                          {cells.length > 1 && (
                            <button
                              onClick={() => deleteCell(cell.id)}
                              className="p-1 hover:bg-red-600 rounded transition-colors"
                            >
                              <Trash2 className="w-3 h-3 text-red-400" />
                            </button>
                          )}
                        </div>
                      </div>
                      
                      <Editor
                        height="150px"
                        language="python"
                        value={cell.content}
                        onChange={(value) => updateCellContent(cell.id, value || "")}
                        theme="vs-dark"
                        options={{
                          minimap: { enabled: false },
                          fontSize: 14,
                          lineNumbers: 'off',
                          folding: false,
                          scrollBeyondLastLine: false,
                        }}
                      />

                      {cell.output && (
                        <div className="p-3 bg-gray-900 border-t border-gray-700">
                          <div className="text-sm text-green-400 font-mono">{cell.output}</div>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="glass-morphism rounded-2xl p-6 border border-purple-500/30">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Cpu className="w-5 h-5 text-orange-400" />
                GPU Performance
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Utilization</span>
                    <span>{gpuMetrics.utilization}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${gpuMetrics.utilization}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Memory</span>
                    <span>{(gpuMetrics.memoryUsed / 1024).toFixed(1)}GB / {(gpuMetrics.memoryTotal / 1024).toFixed(1)}GB</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-400 to-purple-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(gpuMetrics.memoryUsed / gpuMetrics.memoryTotal) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-400">Temperature</div>
                    <div className="text-orange-400">{gpuMetrics.temperature}°C</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Power</div>
                    <div className="text-yellow-400">{gpuMetrics.powerUsage}W</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-morphism rounded-2xl p-6 border border-purple-500/30">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-400" />
                Session Billing
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Status</span>
                  <span className={billing.isActive ? "text-green-400" : "text-gray-400"}>
                    {billing.isActive ? "Running" : "Idle"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Rate</span>
                  <span>${billing.rate}/sec</span>
                </div>
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total Cost</span>
                  <span className="text-green-400">${billing.cost.toFixed(4)}</span>
                </div>
                {billing.isActive && (
                  <div className="text-xs text-gray-400">
                    Session started at {new Date(billing.startTime!).toLocaleTimeString()}
                  </div>
                )}
              </div>
            </div>

            <div className="glass-morphism rounded-2xl p-6 border border-purple-500/30">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-400" />
                Quick Actions
              </h3>
              <div className="space-y-3">
                <button className="w-full p-3 bg-gray-800 hover:bg-gray-700 rounded-lg text-left transition-colors">
                  <div className="font-semibold text-white">New Notebook</div>
                  <div className="text-sm text-gray-400">Create a fresh workspace</div>
                </button>
                <button className="w-full p-3 bg-gray-800 hover:bg-gray-700 rounded-lg text-left transition-colors">
                  <div className="font-semibold text-white">Browse Files</div>
                  <div className="text-sm text-gray-400">Access your saved files</div>
                </button>
                <button className="w-full p-3 bg-gray-800 hover:bg-gray-700 rounded-lg text-left transition-colors">
                  <div className="font-semibold text-white">Usage History</div>
                  <div className="text-sm text-gray-400">View past sessions</div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <AIAssistant selectedCell={selectedCell} cells={cells} />
    </div>
  );
};

export default UserDashboard;
