import { useState } from 'react';
import { useTaskStore } from '@/hooks/useTaskStore';
import { Task } from '@/types/workspace';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, Clock, Calendar, Play, CheckCircle2, 
  Circle, AlertCircle, Loader2, Trash2, Edit, Timer, Filter
} from 'lucide-react';
import { toast } from 'sonner';

interface TaskSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export const TaskSidebar = ({ isOpen, onToggle }: TaskSidebarProps) => {
  const { tasks, loading, addTask, updateTask, deleteTask, updateProgress, addTimeSpent } = useTaskStore();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    estimatedCompletionTime: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
  });
  const [filter, setFilter] = useState<'all' | 'todo' | 'in-progress' | 'completed'>('all');

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      estimatedCompletionTime: '',
      priority: 'medium',
    });
    setEditingTask(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.estimatedCompletionTime) {
      toast.error('Please fill in title and estimated completion time');
      return;
    }

    setSubmitting(true);
    
    try {
      if (editingTask) {
        await updateTask(editingTask.id, formData);
        toast.success('Task updated successfully');
      } else {
        await addTask({
          ...formData,
          progress: 0,
          timeSpent: 0,
          status: 'todo',
          createdAt: new Date().toISOString(),
        });
        toast.success('Task added successfully');
      }

      setDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error('Failed to save task');
      console.error('Error saving task:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description,
      estimatedCompletionTime: task.estimatedCompletionTime,
      priority: task.priority,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTask(id);
        toast.success('Task deleted successfully');
      } catch (error) {
        toast.error('Failed to delete task');
      }
    }
  };

  const handleProgressChange = async (taskId: string, newProgress: number) => {
    try {
      await updateProgress(taskId, newProgress);
      toast.success('Progress updated');
    } catch (error) {
      toast.error('Failed to update progress');
    }
  };

  const handleAddTime = async (taskId: string) => {
    const minutes = prompt('How many minutes did you work on this task?');
    if (minutes && !isNaN(Number(minutes))) {
      try {
        await addTimeSpent(taskId, Number(minutes));
        toast.success('Time logged successfully');
      } catch (error) {
        toast.error('Failed to log time');
      }
    }
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string, progress: number) => {
    if (status === 'completed' || progress === 100) {
      return <CheckCircle2 className="w-5 h-5 text-green-500" />;
    } else if (status === 'in-progress' || progress > 0) {
      return <Play className="w-5 h-5 text-blue-500" />;
    }
    return <Circle className="w-5 h-5 text-gray-400" />;
  };

  // Filter tasks based on selected filter
  const filteredTasks = tasks.filter(task => {
    switch (filter) {
      case 'todo':
        return task.status === 'todo';
      case 'in-progress':
        return task.status === 'in-progress';
      case 'completed':
        return task.status === 'completed';
      default:
        return true;
    }
  });

  return (
    <div className={`fixed right-0 top-0 h-full bg-slate-800 text-white transition-all duration-300 z-40 ${
      isOpen ? 'w-[30%] min-w-[400px]' : 'w-0 overflow-hidden'
    }`}>
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Task Management
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
              className="text-white hover:bg-slate-700"
            >
              ✕
            </Button>
          </div>
          
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                onClick={() => { resetForm(); setDialogOpen(true); }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add New Task
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>{editingTask ? 'Edit Task' : 'Add New Task'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Task Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter task title"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Enter task description"
                    className="resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="estimatedTime">Estimated Completion Time</Label>
                  <Input
                    id="estimatedTime"
                    type="datetime-local"
                    value={formData.estimatedCompletionTime}
                    onChange={(e) => setFormData({ ...formData, estimatedCompletionTime: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select value={formData.priority} onValueChange={(value: 'low' | 'medium' | 'high') => setFormData({ ...formData, priority: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low Priority</SelectItem>
                      <SelectItem value="medium">Medium Priority</SelectItem>
                      <SelectItem value="high">High Priority</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {editingTask ? 'Updating...' : 'Adding...'}
                      </>
                    ) : (
                      editingTask ? 'Update' : 'Add'
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
          
          {/* Filter Section */}
          <div className="mt-4">
            <div className="flex items-center gap-2 mb-3">
              <Filter className="w-4 h-4 text-white/70" />
              <span className="text-sm text-white/70">Filter Tasks</span>
            </div>
            <Select value={filter} onValueChange={(value: 'all' | 'todo' | 'in-progress' | 'completed') => setFilter(value)}>
              <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tasks ({tasks.length})</SelectItem>
                <SelectItem value="todo">To Do ({tasks.filter(t => t.status === 'todo').length})</SelectItem>
                <SelectItem value="in-progress">In Progress ({tasks.filter(t => t.status === 'in-progress').length})</SelectItem>
                <SelectItem value="completed">Completed ({tasks.filter(t => t.status === 'completed').length})</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Task List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              Loading tasks...
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>{filter === 'all' ? 'No tasks yet. Create your first task to get started!' : `No ${filter} tasks found.`}</p>
            </div>
          ) : (
            filteredTasks.map((task) => (
              <Card key={task.id} className="bg-slate-700 border-slate-600 text-white">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(task.status, task.progress)}
                      <CardTitle className="text-sm">{task.title}</CardTitle>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(task)}
                        className="h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-slate-600"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(task.id)}
                        className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-slate-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <Badge className={`text-xs w-fit ${getPriorityColor(task.priority)}`}>
                    {task.priority.toUpperCase()}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-3">
                  {task.description && (
                    <p className="text-sm text-slate-300 leading-relaxed">{task.description}</p>
                  )}
                  
                  {/* Progress Section */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">Progress</span>
                      <span className="font-medium">{task.progress}%</span>
                    </div>
                    <Progress value={task.progress} className="h-2 bg-slate-600" />
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleProgressChange(task.id, Math.min(100, task.progress + 25))}
                        className="flex-1 text-xs bg-slate-600 border-slate-500 hover:bg-slate-500"
                      >
                        +25%
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleProgressChange(task.id, 100)}
                        className="flex-1 text-xs bg-green-600 border-green-500 hover:bg-green-500"
                      >
                        Complete
                      </Button>
                    </div>
                  </div>

                  {/* Time & Date Info */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-slate-400">
                        <Calendar className="w-3 h-3" />
                        <span>Created</span>
                      </div>
                      <div className="text-white">{formatDate(task.createdAt)}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-slate-400">
                        <Clock className="w-3 h-3" />
                        <span>Due</span>
                      </div>
                      <div className="text-white">{formatDate(task.estimatedCompletionTime)}</div>
                    </div>
                  </div>

                  {/* Time Spent */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-slate-400">
                      <Timer className="w-4 h-4" />
                      <span className="text-xs">Time Spent: {formatTime(task.timeSpent)}</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddTime(task.id)}
                      className="text-xs bg-slate-600 border-slate-500 hover:bg-slate-500"
                    >
                      Log Time
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};