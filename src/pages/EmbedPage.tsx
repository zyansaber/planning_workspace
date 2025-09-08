import { useParams, useNavigate } from 'react-router-dom';
import { useWorkspaceStore } from '@/hooks/useWorkspaceStore';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { useEffect, useState } from 'react';
import { WorkspaceItem } from '@/types/workspace';

export default function EmbedPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { items } = useWorkspaceStore();
  const [workspace, setWorkspace] = useState<WorkspaceItem | null>(null);

  useEffect(() => {
    if (id && items.length > 0) {
      const found = items.find(item => item.id === id);
      setWorkspace(found || null);
    }
  }, [id, items]);

  if (!workspace) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Workspace Not Found</h1>
          <p className="text-gray-600 mb-6">The workspace you're looking for doesn't exist.</p>
          <Button onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black flex flex-col">
      {/* Minimalist floating header */}
      <header className="absolute top-4 left-4 right-4 z-50 bg-black/80 backdrop-blur-md rounded-2xl border border-white/10 px-6 py-3 flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-white hover:text-gray-300 hover:bg-white/10 rounded-xl"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-xl ${workspace.color || 'bg-gradient-to-br from-blue-500 to-indigo-600'} flex items-center justify-center text-white text-sm shadow-lg`}>
              {workspace.icon || '🔗'}
            </div>
            <h1 className="font-semibold text-white">{workspace.title}</h1>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => window.open(workspace.url, '_blank')}
          className="flex items-center gap-2 text-white hover:text-gray-300 hover:bg-white/10 rounded-xl"
        >
          <ExternalLink className="w-4 h-4" />
          Open in New Tab
        </Button>
      </header>

      {/* Full-screen embedded content */}
      <div className="w-full h-full pt-20">
        <iframe
          src={workspace.url}
          className="w-full h-full border-0 rounded-t-3xl"
          title={workspace.title}
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-top-navigation allow-pointer-lock allow-presentation"
          allow="accelerometer; autoplay; camera; clipboard-read; clipboard-write; encrypted-media; fullscreen; geolocation; gyroscope; magnetometer; microphone; midi; payment; picture-in-picture; sync-xhr; usb; web-share; xr-spatial-tracking"
        />
      </div>
    </div>
  );
}
