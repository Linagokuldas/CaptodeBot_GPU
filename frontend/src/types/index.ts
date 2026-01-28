export interface User {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  balance: number;
  createdAt: string;
}

export interface Session {
  id: string;
  userId: string;
  startTime: number;
  endTime?: number;
  gpuTime: number;
  cost: number;
  status: "active" | "completed" | "failed";
}

export interface NotebookCell {
  id: string;
  content: string;
  output: string;
  isRunning: boolean;
}

export interface GPUMetrics {
  utilization: number;
  memoryUsed: number;
  memoryTotal: number;
  temperature: number;
  powerUsage: number;
}

export interface BillingInfo {
  isActive: boolean;
  startTime: number | null;
  cost: number;
  rate: number;
}
