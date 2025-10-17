const rawBase = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(/\/$/, '');
const API_BASE_URL = rawBase.endsWith('/api') ? rawBase : `${rawBase}/api`;

export interface Task {
  _id?: string;
  title: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High';
  status: 'Todo' | 'In Progress' | 'Completed';
  dueDate: string;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TaskStats {
  total: number;
  completed: number;
  pending: number;
  byPriority: {
    low: number;
    medium: number;
    high: number;
  };
}

function getAuthHeaders(token: string | null) {
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}

export const api = {
  async getTasks(token: string, filters?: { status?: string; priority?: string; search?: string }) {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.priority) params.append('priority', filters.priority);
    if (filters?.search) params.append('search', filters.search);

    const response = await fetch(
      `${API_BASE_URL}/tasks?${params.toString()}`,
      {
        headers: getAuthHeaders(token),
      }
    );

    if (!response.ok) throw new Error('Failed to fetch tasks');
    return response.json();
  },

  async getTask(token: string, id: string) {
    const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
      headers: getAuthHeaders(token),
    });

    if (!response.ok) throw new Error('Failed to fetch task');
    return response.json();
  },

  async createTask(token: string, task: Omit<Task, '_id' | 'userId' | 'createdAt' | 'updatedAt'>) {
    const response = await fetch(`${API_BASE_URL}/tasks`, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify(task),
    });

    if (!response.ok) throw new Error('Failed to create task');
    return response.json();
  },

  async updateTask(token: string, id: string, task: Partial<Task>) {
    const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(token),
      body: JSON.stringify(task),
    });

    if (!response.ok) throw new Error('Failed to update task');
    return response.json();
  },

  async deleteTask(token: string, id: string) {
    const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(token),
    });

    if (!response.ok) throw new Error('Failed to delete task');
    return response.json();
  },

  async getTaskStats(token: string): Promise<TaskStats> {
  const response = await fetch(`${API_BASE_URL}/tasks/stats`, {
    headers: getAuthHeaders(token),
  });

  if (!response.ok) throw new Error('Failed to fetch task statistics');

  const data = await response.json();

  let byPriorityObj: { low: number; medium: number; high: number } = { low: 0, medium: 0, high: 0 };
  if (Array.isArray(data.byPriority)) {
    byPriorityObj = data.byPriority.reduce(
      (acc: { low: number; medium: number; high: number }, item: { _id: string; count: number }) => {
        const key = (item._id || '').toLowerCase();
        if (key === 'low' || key === 'medium' || key === 'high') {
          acc[key] = item.count;
        }
        return acc;
      },
      { low: 0, medium: 0, high: 0 }
    );
  } else if (data.byPriority && typeof data.byPriority === 'object') {
    byPriorityObj = {
      low: Number(data.byPriority.low) || 0,
      medium: Number(data.byPriority.medium) || 0,
      high: Number(data.byPriority.high) || 0,
    };
  }

  return {
    ...data,
    byPriority: byPriorityObj,
  };
} }
