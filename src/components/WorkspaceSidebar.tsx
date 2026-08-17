import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutGrid, Menu, X } from 'lucide-react';
import { WorkspaceItem } from '@/types/workspace';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface WorkspaceSidebarProps {
  items: WorkspaceItem[];
  currentId?: string;
}

export function WorkspaceSidebar({ items, currentId }: WorkspaceSidebarProps) {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const topLevelItems = items.filter(item => !item.parentId || item.parentId === 'none');
  const childrenByParent = items.reduce<Record<string, WorkspaceItem[]>>((groups, item) => {
    if (item.parentId && item.parentId !== 'none') {
      (groups[item.parentId] ||= []).push(item);
    }
    return groups;
  }, {});

  const openItem = (item: WorkspaceItem) => {
    setMobileOpen(false);
    navigate(`/embed/${item.id}`);
  };

  const renderItem = (item: WorkspaceItem, nested = false) => {
    const active = currentId === item.id;

    return (
      <button
        key={item.id}
        type="button"
        onClick={() => openItem(item)}
        aria-current={active ? 'page' : undefined}
        className={cn(
          'group relative flex w-full items-center rounded-2xl border px-4 py-3.5 text-left transition-all duration-200',
          nested && 'ml-5 w-[calc(100%-1.25rem)]',
          active
            ? 'border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-sm shadow-blue-100'
            : 'border-transparent hover:border-slate-200 hover:bg-white hover:shadow-sm'
        )}
      >
        {active && <span className="absolute -left-px top-3 bottom-3 w-1 rounded-full bg-gradient-to-b from-blue-500 to-indigo-600" />}
        <span className="min-w-0 flex-1">
          <span className={cn('block truncate text-sm font-semibold', active ? 'text-blue-950' : 'text-slate-700')}>
            {item.title}
          </span>
          <span className={cn('mt-1 block truncate text-[11px]', active ? 'text-blue-500' : 'text-slate-400')}>
            {item.description || 'Open in workspace'}
          </span>
        </span>
      </button>
    );
  };

  const content = (
    <div className="flex h-full flex-col">
      <div className="flex h-[76px] items-center justify-between border-b border-slate-200/70 px-5">
        <button type="button" onClick={() => navigate('/')} className="flex items-center gap-3 rounded-xl text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-lg shadow-slate-300">
            <LayoutGrid className="h-5 w-5" />
          </span>
          <span>
            <span className="block text-sm font-bold tracking-tight text-slate-950">Workspace</span>
            <span className="block text-[11px] text-slate-500">Quick navigation</span>
          </span>
        </button>
        <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileOpen(false)} aria-label="Close navigation">
          <X className="h-5 w-5" />
        </Button>
      </div>
      <div className="px-5 pb-2 pt-5">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">All cards</p>
        <p className="mt-1 text-xs text-slate-500">Switch without leaving your work</p>
      </div>
      <ScrollArea className="min-h-0 flex-1 px-3 pb-5">
        <nav className="space-y-1.5 px-1 py-2" aria-label="Workspace cards">
          {topLevelItems.map(item => (
            <div key={item.id} className="space-y-1.5">
              {renderItem(item)}
              {(childrenByParent[item.id] || []).map(child => renderItem(child, true))}
            </div>
          ))}
        </nav>
      </ScrollArea>
      <div className="border-t border-slate-200/70 p-4">
        <Button variant="outline" onClick={() => navigate('/')} className="w-full justify-start gap-2 rounded-xl border-slate-200 bg-white/70">
          <LayoutGrid className="h-4 w-4" />
          View card overview
        </Button>
      </div>
    </div>
  );

  return (
    <>
      <aside className="sticky top-0 hidden h-screen w-[292px] shrink-0 overflow-hidden border-r border-white/80 bg-white/75 shadow-xl shadow-slate-300/20 backdrop-blur-2xl lg:block">
        {content}
      </aside>
      <Button
        size="icon"
        onClick={() => setMobileOpen(true)}
        className="fixed bottom-5 left-5 z-[60] h-12 w-12 rounded-2xl bg-slate-950 text-white shadow-xl lg:hidden"
        aria-label="Open workspace navigation"
      >
        <Menu className="h-5 w-5" />
      </Button>
      {mobileOpen && (
        <div className="fixed inset-0 z-[70] lg:hidden">
          <button className="absolute inset-0 bg-slate-950/35 backdrop-blur-sm" onClick={() => setMobileOpen(false)} aria-label="Close navigation" />
          <aside className="absolute inset-y-0 left-0 w-[min(88vw,320px)] overflow-hidden bg-slate-50 shadow-2xl">
            {content}
          </aside>
        </div>
      )}
    </>
  );
}
