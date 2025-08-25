import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { WorkspaceItem } from '@/types/workspace';
import { useWorkspaceStore } from '@/hooks/useWorkspaceStore';
import { WorkspaceCard } from '@/components/WorkspaceCard';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, FolderKanban } from 'lucide-react';

export default function NestedPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { items, loading, getItem } = useWorkspaceStore();
  const [parentItem, setParentItem] = useState<WorkspaceItem | null>(null);
  
  useEffect(() => {
    if (id && !loading) {
      const item = getItem(id);
      if (item) {
        setParentItem(item);
      } else {
        navigate('/');
      }
    }
  }, [id, loading, getItem, navigate]);

  // Filter child items
  const childItems = items.filter(item => 
    item.parentId && item.parentId !== 'none' && item.parentId === id
  );

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
      {/* Header with back button */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="flex items-center gap-2 mr-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Workspaces
            </Button>
            
            {parentItem && (
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg ${parentItem.color || 'bg-gradient-to-br from-blue-500 to-indigo-600'} flex items-center justify-center text-white shadow-sm`}>
                  <FolderKanban className="w-5 h-5" />
                </div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {parentItem.title}
                </h1>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {childItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {childItems.map((item) => (
              <WorkspaceCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <FolderKanban className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h2 className="text-xl font-medium text-gray-700 mb-2">No Items Found</h2>
            <p className="text-gray-500 mb-6">
              This folder doesn't contain any workspace items yet.
            </p>
            <Button onClick={() => navigate('/')}>
              Return to Workspaces
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}