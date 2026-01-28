import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Bot, Sparkles } from "lucide-react";
import { NotebookCell } from "../types";

interface AIAssistantProps {
  selectedCell: string | null;
  cells: NotebookCell[];
}

const AIAssistant: React.FC<AIAssistantProps> = ({ selectedCell, cells }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([
    { 
      role: "assistant", 
      content: "Hi! I'm Astro, your AI coding assistant. I can help you debug code, explain concepts, and optimize your GPU usage. How can I help you today?" 
    }
  ]);
  const [input, setInput] = useState("");
  
  const selectedCellContent = cells.find(cell => cell.id === selectedCell)?.content || "";

  const generateResponse = (userMessage: string, cellContent: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes("hello") || lowerMessage.includes("hi")) {
      return "Hello! I'm here to help you with your coding. What would you like to work on today?";
    }
    
    if (lowerMessage.includes("error") || lowerMessage.includes("debug")) {
      return "I can help you debug! Could you share the error message you're seeing? Also, make sure your code is properly indented and all libraries are imported.";
    }
    
    if (lowerMessage.includes("gpu") || lowerMessage.includes("performance")) {
      return "For optimal GPU performance, consider: 1) Use vectorized operations with NumPy, 2) Minimize data transfers between CPU and GPU, 3) Use batch processing for ML models, 4) Monitor memory usage to avoid OOM errors.";
    }
    
    if (cellContent.includes("import") && (cellContent.includes("tensorflow") || cellContent.includes("torch"))) {
      return "I see you're using a deep learning framework! Make sure to check if GPU is available with `tf.config.list_physical_devices('GPU')` for TensorFlow or `torch.cuda.is_available()` for PyTorch.";
    }
    
    if (lowerMessage.includes("help")) {
      return "I can help you with:\n• Debugging Python code\n• Explaining ML concepts\n• GPU optimization tips\n• Code suggestions\n• Billing and usage questions\nWhat specific help do you need?";
    }
    
    return "That's interesting! Could you provide more details about what you'd like help with? I can assist with coding, debugging, GPU optimization, and more.";
  };

  const sendMessage = () => {
    if (!input.trim()) return;
    
    const userMessage = input;
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    
    setTimeout(() => {
      const response = generateResponse(userMessage, selectedCellContent);
      setMessages(prev => [...prev, { role: "assistant", content: response }]);
    }, 500);
  };

  return (
    <div className="fixed bottom-8 right-8 z-50">
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={() => setIsOpen(true)}
            className="w-14 h-14 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
          >
            <MessageCircle className="w-6 h-6 text-white" />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="w-96 h-[500px] glass-morphism rounded-2xl border border-purple-500/30 flex flex-col shadow-2xl"
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold">Astro AI</h3>
                  <p className="text-xs text-green-400 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Online
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-gray-700 rounded transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      message.role === "user"
                        ? "bg-purple-600 text-white"
                        : "bg-gray-800 text-gray-100 border border-gray-700"
                    }`}
                  >
                    {message.content}
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="p-4 border-t border-gray-700">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                  placeholder="Ask me anything about your code..."
                  className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500 transition-colors"
                />
                <button
                  onClick={sendMessage}
                  className="p-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
                >
                  <Send className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AIAssistant;
