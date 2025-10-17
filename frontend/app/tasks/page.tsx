'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/authContext';
import { api, Task } from '@/services/api';
import { ProtectedRoute } from '@/layout/PrivateRoute';
import { Navbar } from '@/layout/navbar';
import { TaskList } from '@/components/tasks/tasklist';
import { TaskFilters } from '@/components/tasks/TaskFilters';
import { TaskForm } from '@/components/tasks/TaskForm';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { Plus, Loader2 } from 'lucide-react';

export default function TasksPage() {
  const { token } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [priority, setPriority] = useState('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [deleteTaskId, setDeleteTaskId] = useState<string | null>(null);

  const fetchTasks = async () => {
    if (!token) return;

    setIsLoading(true);
    try {
      const filters = {
        ...(status !== 'all' && { status }),
        ...(priority !== 'all' && { priority }),
        ...(search && { search }),
      };
      const data = await api.getTasks(token, filters);
      setTasks(data);
    } catch (error) {
      toast.error('Failed to load tasks');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [token, status, priority, search]);

  const handleCreateTask = async (taskData: Omit<Task, '_id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!token) return;

    try {
      await api.createTask(token, taskData);
      toast.success('Task created successfully');
      fetchTasks();
    } catch (error) {
      toast.error('Failed to create task');
      throw error;
    }
  };

  const handleUpdateTask = async (taskData: Omit<Task, '_id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!token || !editingTask?._id) return;

    try {
      await api.updateTask(token, editingTask._id, taskData);
      toast.success('Task updated successfully');
      fetchTasks();
    } catch (error) {
      toast.error('Failed to update task');
      throw error;
    }
  };

  const handleDeleteTask = async () => {
    if (!token || !deleteTaskId) return;

    try {
      await api.deleteTask(token, deleteTaskId);
      toast.success('Task deleted successfully');
      setDeleteTaskId(null);
      fetchTasks();
    } catch (error) {
      toast.error('Failed to delete task');
    }
  };

  const openCreateForm = () => {
    setEditingTask(undefined);
    setIsFormOpen(true);
  };

  const openEditForm = (task: Task) => {
    setEditingTask(task);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingTask(undefined);
  };

  return (
    <ProtectedRoute>
      <Navbar />
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Tasks</h1>
              <p className="text-slate-600 mt-1">Manage and track all your tasks</p>
            </div>
            <Button onClick={openCreateForm}>
              <Plus className="h-4 w-4 mr-2" />
              New Task
            </Button>
          </div>

          <div className="space-y-6">
            <TaskFilters
              search={search}
              status={status}
              priority={priority}
              onSearchChange={setSearch}
              onStatusChange={setStatus}
              onPriorityChange={setPriority}
            />

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-slate-600" />
              </div>
            ) : (
              <TaskList tasks={tasks} onEdit={openEditForm} onDelete={setDeleteTaskId} />
            )}
          </div>
        </div>
      </div>

      <TaskForm
        task={editingTask}
        open={isFormOpen}
        onClose={closeForm}
        onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
      />

      <AlertDialog open={!!deleteTaskId} onOpenChange={() => setDeleteTaskId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the task.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTask} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ProtectedRoute>
  );
}
