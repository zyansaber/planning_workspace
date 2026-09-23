import { useEffect, useMemo, useState } from 'react';
import { onValue, ref } from 'firebase/database';
import { useWorkspaceStore } from '@/hooks/useWorkspaceStore';
import { WorkspaceCard } from '@/components/WorkspaceCard';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Settings, Plus, Loader2, LogOut, ArrowRight, CalendarDays } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/auth/AuthProvider';
import { database } from '@/lib/firebase';

type NewsItem = {
  event_id: string;
  status?: string;
  importance?: { score?: number; level?: string };
  event_date?: string;
  category?: string;
  headline: string;
  brand?: string;
  summary?: string;
  what_happened?: string;
  why_it_matters?: string;
  sources?: Array<string | { title?: string; url?: string }>;
};

const levelColour: Record<string, string> = {
  critical: 'bg-red-500',
  high: 'bg-amber-500',
  important: 'bg-blue-500',
};

const formatDate = (value?: string) => {
  if (!value) return '';
  const date = new Date(`${value.slice(0, 10)}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('en-AU', { day: '2-digit', month: 'short', year: 'numeric' }).format(date);
};

export default function Index() {
  const { items, loading } = useWorkspaceStore();
  const navigate = useNavigate();
  const { user, logOut, isSettingsAdmin } = useAuth();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);

  useEffect(() => onValue(ref(database, 'rv_intelligence/latest/payload/items'), (snapshot) => {
    const value = snapshot.val() as NewsItem[] | Record<string, NewsItem> | null;
    setNews(value ? (Array.isArray(value) ? value.filter(Boolean) : Object.values(value)) : []);
    setNewsLoading(false);
  }, () => setNewsLoading(false)), []);

  const sortedNews = useMemo(() => [...news].sort((a, b) => {
    const importance = (b.importance?.score ?? 0) - (a.importance?.score ?? 0);
    if (importance !== 0) return importance;
    return (b.event_date ?? '').localeCompare(a.event_date ?? '');
  }), [news]);

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
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Workspace</h1>
            </div>
            <div className="flex items-center gap-2">
              <span className="hidden text-sm text-gray-600 md:inline">{user?.email}</span>
              {isSettingsAdmin && <Button
                onClick={() => navigate('/admin')}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                Settings
              </Button>}
              <Button onClick={logOut} variant="ghost" size="sm" className="flex items-center gap-2">
                <LogOut className="w-4 h-4" />
                Sign out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          <section className="mb-8 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3.5">
              <div>
                <h2 className="text-sm font-semibold text-gray-900">RV Industry Intelligence</h2>
                <p className="mt-0.5 text-xs text-gray-500">Latest Australian market updates</p>
              </div>
              {sortedNews.some((item) => item.status === 'new') && (
                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">New updates</span>
              )}
            </div>

            {newsLoading ? (
              <div className="flex items-center gap-2 px-5 py-5 text-sm text-gray-500"><Loader2 className="h-4 w-4 animate-spin" />Loading market updates...</div>
            ) : sortedNews.length === 0 ? (
              <div className="px-5 py-5 text-sm text-gray-500">No market updates are available today.</div>
            ) : (
              <div className="divide-y divide-gray-100">
                {sortedNews.map((item) => {
                  const level = item.importance?.level?.toLowerCase() ?? 'important';
                  return (
                    <button key={item.event_id} onClick={() => setSelectedNews(item)} className="group grid w-full grid-cols-[auto_1fr_auto] items-center gap-3 px-5 py-3 text-left transition-colors hover:bg-gray-50">
                      <span className={`h-2 w-2 rounded-full ${levelColour[level] ?? levelColour.important}`} aria-label={level} />
                      <span className="min-w-0">
                        <span className="flex items-center gap-2 text-[11px] text-gray-500">
                          <span className="truncate font-medium text-gray-600">{item.brand}</span>
                          {item.event_date && <><span>·</span><span className="shrink-0">{formatDate(item.event_date)}</span></>}
                          {item.status === 'new' && <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[9px] font-bold uppercase text-emerald-700">New</span>}
                        </span>
                        <span className="mt-0.5 block truncate text-sm font-medium text-gray-900 group-hover:text-blue-700">{item.headline}</span>
                      </span>
                      <ArrowRight className="h-4 w-4 text-gray-300 transition-transform group-hover:translate-x-0.5 group-hover:text-gray-500" />
                    </button>
                  );
                })}
              </div>
            )}
          </section>

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
            {isSettingsAdmin && <Button
              onClick={() => navigate('/admin')}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-8 py-3 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Get Started
            </Button>}
          </div>
        ) : (
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
              {topLevelItems.map((item) => (
                <WorkspaceCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>
      </main>

      <Dialog open={Boolean(selectedNews)} onOpenChange={(open) => !open && setSelectedNews(null)}>
        <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
          {selectedNews && <>
            <DialogHeader>
              <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                <span className={`h-2 w-2 rounded-full ${levelColour[selectedNews.importance?.level?.toLowerCase() ?? 'important'] ?? levelColour.important}`} />
                <span className="capitalize">{selectedNews.importance?.level ?? 'Important'}</span>
                {selectedNews.brand && <><span>·</span><span>{selectedNews.brand}</span></>}
                {selectedNews.event_date && <><span>·</span><span className="flex items-center gap-1"><CalendarDays className="h-3 w-3" />{formatDate(selectedNews.event_date)}</span></>}
              </div>
              <DialogTitle className="pr-6 text-left text-xl leading-snug">{selectedNews.headline}</DialogTitle>
            </DialogHeader>
            <div className="space-y-5 pt-2 text-sm leading-6 text-gray-600">
              {selectedNews.summary && <p className="font-medium text-gray-700">{selectedNews.summary}</p>}
              {selectedNews.what_happened && <div><h3 className="mb-1 font-semibold text-gray-900">What happened</h3><p>{selectedNews.what_happened}</p></div>}
              {selectedNews.why_it_matters && <div className="rounded-lg bg-gray-50 p-4"><h3 className="mb-1 font-semibold text-gray-900">Why it matters</h3><p>{selectedNews.why_it_matters}</p></div>}
              {!!selectedNews.sources?.length && <div><h3 className="mb-2 font-semibold text-gray-900">Sources</h3><div className="space-y-2">{selectedNews.sources.map((source, index) => { const url = typeof source === 'string' ? source : source.url; const title = typeof source === 'string' ? `Source ${index + 1}` : source.title ?? `Source ${index + 1}`; return url ? <a key={index} href={url} target="_blank" rel="noreferrer" className="block text-blue-600 hover:underline">{title}</a> : null; })}</div></div>}
            </div>
          </>}
        </DialogContent>
      </Dialog>
    </div>
  );
}
