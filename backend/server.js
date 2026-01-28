const express = require('express');
const { spawn } = require('child_process');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Enhanced CORS configuration
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Python code execution endpoint
app.post('/api/execute', async (req, res) => {
  console.log('Received Python execution request');
  
  const { code, inputs = [] } = req.body;
  
  if (!code) {
    return res.status(400).json({ 
      success: false, 
      error: 'No code provided' 
    });
  }

  try {
    // Prepare Python code with input handling
    let processedCode = code;
    let inputIndex = 0;
    
    // Replace input() calls with provided values or create a mock input function
    if (inputs.length > 0) {
      processedCode = code.replace(/input\(\s*['"`]([^'"`]*?)['"`]\s*\)/g, (match, prompt) => {
        const value = inputs[inputIndex] || '';
        inputIndex++;
        return `"${value}"`;
      });
    } else {
      // Check if code needs input but no inputs provided
      const inputMatches = code.match(/input\(/g);
      if (inputMatches && inputMatches.length > 0) {
        // Extract prompts from input() calls
        const prompts = [];
        code.replace(/input\(\s*['"`]([^'"`]*?)['"`]\s*\)/g, (match, prompt) => {
          prompts.push(prompt || 'Enter input:');
          return match;
        });
        
        return res.json({
          success: false,
          needsInput: true,
          inputPrompts: prompts,
          output: '',
          error: 'User input required'
        });
      }
    }
    
    // Execute Python code
    const pythonProcess = spawn('python', ['-c', processedCode], {
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: 15000 // 15 second timeout
    });
    
    let stdout = '';
    let stderr = '';
    
    pythonProcess.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    
    pythonProcess.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    
    pythonProcess.on('close', (code) => {
      console.log('Python execution completed with exit code:', code);
      
      if (code === 0) {
        res.json({
          success: true,
          output: stdout.trim(),
          error: null,
          needsInput: false
        });
      } else {
        res.json({
          success: false,
          output: stdout.trim(),
          error: stderr.trim() || `Process exited with code ${code}`,
          needsInput: false
        });
      }
    });
    
    pythonProcess.on('error', (error) => {
      console.error('Python process error:', error);
      res.status(500).json({
        success: false,
        output: '',
        error: `Python execution error: ${error.message}`,
        needsInput: false
      });
    });

    pythonProcess.on('timeout', () => {
      console.error('Python process timeout');
      pythonProcess.kill();
      res.status(500).json({
        success: false,
        output: '',
        error: 'Python execution timeout (15 seconds)',
        needsInput: false
      });
    });
    
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({
      success: false,
      output: '',
      error: `Server error: ${error.message}`,
      needsInput: false
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  console.log('Health check requested');
  res.json({ status: 'Server is running' });
});

// Test endpoint
app.get('/api/test', (req, res) => {
  console.log('Test endpoint requested');
  res.json({ message: 'Backend is working!' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`CORS enabled for http://localhost:3000`);
});
