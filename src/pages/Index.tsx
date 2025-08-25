import { useState } from 'react';
import { useWorkspaceStore } from '@/hooks/useWorkspaceStore';
import { WorkspaceCard } from '@/components/WorkspaceCard';
import { TaskSidebar } from '@/components/TaskSidebar';
import { Button } from '@/components/ui/button';
import { Settings, Plus, Loader2, ListTodo } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Index() {
  const { items, loading } = useWorkspaceStore();
  const navigate = useNavigate();
  const [taskSidebarOpen, setTaskSidebarOpen] = useState(true); // Default open
  
  // Filter to show only top-level items (not nested children)
  const topLevelItems = items.filter(item => !item.parentId || item.parentId === '' || item.parentId === 'none');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-2 text-gray-600">
          <Loader2 className="w-5 h-5 animate-spin" />
          Loading workspace...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 transition-all duration-300">
      {/* Header */}
      <header className={`bg-white shadow-sm border-b transition-all duration-300 ${
        taskSidebarOpen ? 'mr-[30%]' : 'mr-0'
      }`}>
        <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-300 ${
          taskSidebarOpen ? 'max-w-5xl' : 'max-w-7xl'
        }`}>
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Workspace</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setTaskSidebarOpen(!taskSidebarOpen)}
                variant={taskSidebarOpen ? "default" : "outline"}
                size="sm"
                className="flex items-center gap-2"
              >
                <ListTodo className="w-4 h-4" />
                {taskSidebarOpen ? 'Hide Tasks' : 'Show Tasks'}
              </Button>
              <Button
                onClick={() => navigate('/admin')}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={`transition-all duration-300 ${
        taskSidebarOpen ? 'mr-[30%]' : 'mr-0'
      } px-4 sm:px-6 lg:px-8 py-8`}>
        <div className={`max-w-7xl mx-auto transition-all duration-300 ${
          taskSidebarOpen ? 'max-w-5xl' : 'max-w-7xl'
        }`}>
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Work Areas</h2>
            <p className="text-gray-600">Select your work area to start productive work</p>
          </div>

        {topLevelItems.length === 0 ? (
          <div className="text-center py-20">
            <div className="relative w-32 h-32 mx-auto mb-8">
              <div className="w-32 h-32 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-3xl flex items-center justify-center backdrop-blur-sm border border-white/20 shadow-2xl">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center">
                  <Plus className="w-8 h-8 text-white" />
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-3xl blur-xl opacity-50" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text">No Work Areas</h3>
            <p className="text-gray-600 mb-8 text-lg">Create your first workspace to begin your productive journey</p>
            <Button 
              onClick={() => navigate('/admin')} 
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-8 py-3 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Get Started
            </Button>
          </div>
        ) : (
            <div className={`grid gap-6 transition-all duration-300 ${
              taskSidebarOpen 
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5' 
                : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5'
            }`}>
              {topLevelItems.map((item) => (
                <WorkspaceCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Task Management Sidebar */}
      <TaskSidebar 
        isOpen={taskSidebarOpen} 
        onToggle={() => setTaskSidebarOpen(!taskSidebarOpen)} 
      />
    </div>
  );
}