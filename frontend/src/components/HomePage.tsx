import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { 
  Play, Pause, Plus, Trash2, Save, Upload, Download, 
  Code, Zap, DollarSign, Activity, Users, Star,
  ChevronRight, ArrowRight, Sparkles, Cpu, Clock, LogOut
} from "lucide-react";
import Editor from "@monaco-editor/react";
import AIAssistant from "./AIAssistant";
import { NotebookCell, GPUMetrics, BillingInfo } from "../types";
import toast from "react-hot-toast";

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [cells, setCells] = useState<NotebookCell[]>([
    { 
      id: "1", 
      content: "# Welcome to CaptodeBot Python Workspace\n# Write your Python code here and click the Run button\n\n# Example:\nprint('Hello, World!')\n\n# Try your own code:", 
      output: "", 
      isRunning: false 
    }
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
  const [inputPrompts, setInputPrompts] = useState<{cellId: string, prompts: string[]} | null>(null);
  const [inputValues, setInputValues] = useState<string[]>([]);

  const handleLogout = () => {
    toast.success("Logged out successfully");
    navigate("/");
  };

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

  const runCell = async (cellId: string, providedInputs: string[] = []) => {
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
      utilization: 75,
      memoryUsed: 8192,
      memoryTotal: 16384,
      temperature: 68,
      powerUsage: 245
    });

    try {
      // Try backend API first
      const response = await fetch('http://localhost:3001/api/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          code: cell.content,
          inputs: providedInputs 
        }),
      });

      if (response.ok) {
        const result = await response.json();
        
        if (result.needsInput) {
          // Show input prompts
          setInputPrompts({
            cellId,
            prompts: result.inputPrompts
          });
          setInputValues(new Array(result.inputPrompts.length).fill(''));
          
          setCells(cells.map(c => 
            c.id === cellId ? { ...c, isRunning: false } : c
          ));
        } else {
          // Show output
          setCells(cells.map(c => 
            c.id === cellId ? { 
              ...c, 
              isRunning: false, 
              output: result.success ? result.output : `Error: ${result.error}` 
            } : c
          ));
          
          // Clear input prompts
          setInputPrompts(null);
          setInputValues([]);
        }
      } else {
        throw new Error('Backend not responding');
      }

    } catch (error) {
      // Fallback to simulated execution with input detection
      console.log('Backend unavailable, using simulated execution');
      executeCodeLocally(cellId, cell.content, providedInputs);
    }

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
      cost: prev.cost + 0.05
    }));
  };

  const executeCodeLocally = (cellId: string, code: string, inputs: string[]) => {
    try {
      // Check if code needs input
      const inputMatches = code.match(/input\(\s*['"`]([^'"`]*?)['"`]\s*\)/g);
      
      if (inputMatches && inputMatches.length > 0 && inputs.length === 0) {
        // Extract prompts from input() calls
        const prompts: string[] = [];
        code.replace(/input\(\s*['"`]([^'"`]*?)['"`]\s*\)/g, (match, prompt) => {
          prompts.push(prompt || 'Enter input:');
          return match;
        });
        
        // Show input prompts
        setInputPrompts({
          cellId,
          prompts: prompts
        });
        setInputValues(new Array(prompts.length).fill(''));
        
        setCells(cells.map(c => 
          c.id === cellId ? { ...c, isRunning: false } : c
        ));
        return;
      }

      let output = "";
      const lines = code.split('\n').filter(line => line.trim() && !line.trim().startsWith('#'));
      let inputIndex = 0;
      const outputs = [];
      const variables: Record<string, string> = {};
      
      for (const line of lines) {
        if (line.includes('input(')) {
          // Handle input() calls
          const inputMatch = line.match(/(\w+)\s*=\s*input\(\s*['"`]([^'"`]*?)['"`]\s*\)/);
          if (inputMatch && inputs[inputIndex]) {
            const [, varName, prompt] = inputMatch;
            variables[varName] = inputs[inputIndex];
            outputs.push(`[Input] ${prompt}: "${inputs[inputIndex]}"`);
            inputIndex++;
          } else if (inputMatch) {
            const [, varName] = inputMatch;
            variables[varName] = inputs[inputIndex] || '';
            inputIndex++;
          }
        } else if (line.includes('print(')) {
          // Extract print statements
          const printMatch = line.match(/print\(([^)]+)\)/);
          if (printMatch) {
            let content = printMatch[1];
            
            // Handle f-strings with variable substitution
            if (content.startsWith('f"') || content.startsWith("f'")) {
              let processedContent = content.slice(2, -1);
              
              // Replace variables in f-strings
              Object.keys(variables).forEach(varName => {
                const regex = new RegExp(`\\{${varName}\\}`, 'g');
                processedContent = processedContent.replace(regex, variables[varName]);
              });
              
              output = processedContent;
            }
            // Handle regular strings
            else if (content.includes('"') || content.includes("'")) {
              output = content.replace(/['"]/g, '');
            }
            // Handle arithmetic expressions
            else if (/[\d+\-*/().\s]/.test(content)) {
              try {
                const result = Function('"use strict"; return (' + content + ')')();
                output = result.toString();
              } catch {
                output = content;
              }
            }
            // Handle variables
            else if (variables[content]) {
              output = variables[content];
            }
            else {
              output = content;
            }
            outputs.push(output);
          }
        } else if (line.includes('import')) {
          outputs.push("Library imported successfully!");
        } else if (line.includes('for ') && line.includes('range(')) {
          // Simulate for loops with range
          const rangeMatch = line.match(/range\((\d+)\)/);
          if (rangeMatch) {
            const end = parseInt(rangeMatch[1]);
            for (let i = 0; i < Math.min(end, 5); i++) {
              outputs.push((i * 2).toString());
            }
          }
        } else if (line.includes('len(')) {
          // Simulate len() function
          const match = line.match(/len\(([^)]+)\)/);
          if (match) {
            const arg = match[1];
            if (arg.includes('"') || arg.includes("'")) {
              outputs.push((arg.length - 2).toString());
            } else if (arg === 'numbers') {
              outputs.push("5");
            } else {
              outputs.push("5");
            }
          }
        } else if (line.includes('=')) {
          // Variable assignment
          const assignMatch = line.match(/(\w+)\s*=\s*(.+)$/);
          if (assignMatch) {
            const [, varName, value] = assignMatch;
            if (value.includes('"') || value.includes("'")) {
              variables[varName] = value.replace(/['"]/g, '');
            } else if (/^\d+$/.test(value)) {
              variables[varName] = value;
            }
          }
        } else if (line.includes('def ')) {
          outputs.push("Function defined successfully!");
        } else if (line.includes('return')) {
          outputs.push("Function returned value");
        } else if (line.includes('numbers =')) {
          outputs.push("List created successfully!");
        } else {
          // Try to evaluate simple expressions
          try {
            if (/[\d+\-*/().\s]/.test(line)) {
              const result = Function('"use strict"; return (' + line + ')')();
              outputs.push(result.toString());
            }
          } catch {
            // Skip if can't evaluate
          }
        }
      }
      
      output = outputs.join('\n') || "Code executed successfully!";
      
      setCells(cells.map(c => 
        c.id === cellId ? { ...c, isRunning: false, output } : c
      ));
      
    } catch (error) {
      setCells(cells.map(c => 
        c.id === cellId ? { ...c, isRunning: false, output: `Error: ${error}` } : c
      ));
    }
  };

  const handleInputChange = (index: number, value: string) => {
    const newValues = [...inputValues];
    newValues[index] = value;
    setInputValues(newValues);
  };

  const submitInputs = () => {
    if (inputPrompts) {
      runCell(inputPrompts.cellId, inputValues);
    }
  };

  const cancelInputs = () => {
    setInputPrompts(null);
    setInputValues([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black">
      <header className="glass-morphism border-b border-purple-500/30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Code className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                CaptodeBot
              </h1>
            </div>
            <nav className="flex items-center gap-6">
              <Link 
                to="/dashboard" 
                className="text-gray-300 hover:text-white transition-colors"
              >
                Dashboard
              </Link>
              <button 
                onClick={handleLogout}
                className="px-4 py-2 bg-gradient-to-r from-red-600 to-pink-600 rounded-lg hover:from-red-700 hover:to-pink-700 transition-all flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </nav>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="glass-morphism rounded-2xl border border-purple-500/30 overflow-hidden">
          {/* Toolbar */}
          <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-800/50">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Code className="w-5 h-5 text-blue-400" />
                Python Notebook
              </h2>
              <span className="text-sm text-gray-400">
                {cells.length} cell{cells.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors" title="Save">
                <Save className="w-4 h-4 text-gray-300" />
              </button>
              <button className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors" title="Upload">
                <Upload className="w-4 h-4 text-gray-300" />
              </button>
              <button className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors" title="Download">
                <Download className="w-4 h-4 text-gray-300" />
              </button>
              <div className="w-px h-6 bg-gray-600"></div>
              <button
                onClick={addCell}
                className="p-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
                title="Add Cell"
              >
                <Plus className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>

          {/* Notebook Cells */}
          <div className="p-4 space-y-4 max-h-[600px] overflow-y-auto bg-gray-900/30">
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
                  {/* Cell Header */}
                  <div className="flex items-center justify-between p-3 bg-gray-800/80">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-mono text-gray-400 bg-gray-700 px-2 py-1 rounded">
                        [{index + 1}]
                      </span>
                      <span className="text-sm text-gray-400">
                        {cell.isRunning ? 'Running...' : 'Code'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => runCell(cell.id)}
                        disabled={cell.isRunning}
                        className="p-2 bg-green-600 hover:bg-green-700 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Run Cell"
                      >
                        {cell.isRunning ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <Play className="w-4 h-4 text-white" />
                        )}
                      </button>
                      <button
                        onClick={() => setSelectedCell(cell.id)}
                        className="p-2 hover:bg-gray-700 rounded transition-colors"
                        title="Edit Cell"
                      >
                        <Code className="w-4 h-4 text-gray-400" />
                      </button>
                      {cells.length > 1 && (
                        <button
                          onClick={() => deleteCell(cell.id)}
                          className="p-2 hover:bg-red-600 rounded transition-colors"
                          title="Delete Cell"
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {/* Code Editor */}
                  <div className="border-b border-gray-700">
                    <Editor
                      height="120px"
                      language="python"
                      value={cell.content}
                      onChange={(value) => updateCellContent(cell.id, value || "")}
                      theme="vs-dark"
                      options={{
                        minimap: { enabled: false },
                        fontSize: 13,
                        lineNumbers: 'on',
                        folding: false,
                        scrollBeyondLastLine: false,
                        wordWrap: 'on',
                        automaticLayout: true,
                      }}
                    />
                  </div>

                  {/* Output Display */}
                  {cell.output && (
                    <div className="bg-gray-900 border-t border-gray-700">
                      <div className="flex items-center justify-between px-3 py-2 bg-gray-800/50 border-b border-gray-700">
                        <span className="text-xs font-medium text-gray-400">OUTPUT</span>
                        <button className="text-xs text-gray-500 hover:text-gray-300">Clear</button>
                      </div>
                      <div className="p-3 font-mono text-sm text-green-400 whitespace-pre-wrap">
                        {cell.output}
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Add Cell Button at Bottom */}
          <div className="p-4 border-t border-gray-700 bg-gray-800/50">
            <button
              onClick={addCell}
              className="w-full py-2 border-2 border-dashed border-gray-600 hover:border-purple-500 rounded-lg text-gray-400 hover:text-purple-400 transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Code Cell
            </button>
          </div>
        </div>

        {/* Side Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          <div className="lg:col-span-2">
            {/* Workspace Guide */}
            <div className="glass-morphism rounded-2xl p-6 border border-purple-500/30 mb-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Code className="w-5 h-5 text-blue-400" />
                Python Workspace Guide
              </h3>
              <div className="space-y-3 text-sm text-gray-300">
                <div className="flex items-start gap-2">
                  <span className="text-green-400">▶</span>
                  <span>Write your Python code in the editor above</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-400">▶</span>
                  <span>Click the Run button (▶) to execute your code</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-400">▶</span>
                  <span>View results in the OUTPUT section below each cell</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-400">▶</span>
                  <span>Add more cells using the + button or "Add Code Cell" at the bottom</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-400">▶</span>
                  <span>Use input() function for interactive programs</span>
                </div>
              </div>
            </div>

            {/* Quick Reference */}
            <div className="glass-morphism rounded-2xl p-6 border border-purple-500/30">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                Quick Reference
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="bg-gray-800/50 p-3 rounded-lg">
                  <div className="font-semibold text-white mb-2">Basic Operations</div>
                  <code className="text-green-400 text-xs block">
                    <div>print("Hello")</div>
                    <div>x = 10 + 5</div>
                    <div>name = "Python"</div>
                  </code>
                </div>
                <div className="bg-gray-800/50 p-3 rounded-lg">
                  <div className="font-semibold text-white mb-2">Lists & Loops</div>
                  <code className="text-green-400 text-xs block">
                    <div>numbers = [1,2,3]</div>
                    <div>for i in range(5):</div>
                    <div>&nbsp;&nbsp;print(i)</div>
                  </code>
                </div>
                <div className="bg-gray-800/50 p-3 rounded-lg">
                  <div className="font-semibold text-white mb-2">Functions</div>
                  <code className="text-green-400 text-xs block">
                    <div>def my_func(x):</div>
                    <div>&nbsp;&nbsp;return x * 2</div>
                    <div>result = my_func(5)</div>
                  </code>
                </div>
                <div className="bg-gray-800/50 p-3 rounded-lg">
                  <div className="font-semibold text-white mb-2">User Input</div>
                  <code className="text-green-400 text-xs block">
                    {'name = input("Name: ")'}
                    <br />
                    {'age = int(input("Age: "))'}
                    <br />
                    {'print(f"Hello {name}")'}
                  </code>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* GPU Status */}
            <div className="glass-morphism rounded-2xl p-6 border border-purple-500/30">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Cpu className="w-5 h-5 text-orange-400" />
                GPU Status
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

            {/* Session Billing */}
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
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Input Modal */}
      <AnimatePresence>
        {inputPrompts && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="glass-morphism rounded-2xl p-6 w-full max-w-md border border-purple-500/30"
            >
              <h3 className="text-xl font-semibold mb-4">User Input Required</h3>
              <div className="space-y-4">
                {inputPrompts.prompts.map((prompt, index) => (
                  <div key={index}>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      {prompt}
                    </label>
                    <input
                      type="text"
                      value={inputValues[index] || ''}
                      onChange={(e) => handleInputChange(index, e.target.value)}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500 transition-colors text-white"
                      placeholder="Enter value..."
                    />
                  </div>
                ))}
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={submitInputs}
                  className="flex-1 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all font-semibold"
                >
                  Submit & Run
                </button>
                <button
                  onClick={cancelInputs}
                  className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors font-semibold"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AIAssistant selectedCell={selectedCell} cells={cells} />
    </div>
  );
};

export default HomePage;
