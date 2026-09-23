import { useEffect, useMemo, useState } from 'react';
import { onValue, ref } from 'firebase/database';
import { database } from '@/lib/firebase';
import { useAuth } from '@/auth/AuthProvider';
import { Button } from '@/components/ui/button';
import {
  ArrowDown, ArrowLeft, ArrowRight, Building2, CalendarDays, ChevronRight,
  Clock3, LogOut, Menu, Newspaper, Radio, Settings, ShieldAlert, Sparkles, X,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type Level = 'critical' | 'high' | 'important' | string;

type IntelligenceItem = {
  event_id: string;
  status?: string;
  importance: { score: number; level: Level };
  event_date: string;
  category: string;
  headline: string;
  brand: string;
  summary: string;
  what_happened?: string;
  why_it_matters?: string;
  sources?: Array<{ title?: string; url?: string } | string>;
};

type Feed = {
  feed_metadata?: {
    report_date?: string;
    generated_at?: string;
    market?: string;
    item_count?: number;
  };
  items?: IntelligenceItem[];
};

const sampleItems: IntelligenceItem[] = [
  { event_id: 'aor-administration', status: 'new', importance: { score: 95, level: 'critical' }, event_date: '2026-09-15', category: 'insolvency', brand: 'Australian Off Road', headline: 'Australian Off Road enters administration, citing import price pressure and product copying', summary: 'Australian Off Road, a Queensland off-road RV manufacturer operating for more than 25 years, entered administration.', what_happened: 'The long-standing Queensland manufacturer entered voluntary administration after sustained pressure from rising input costs, lower-priced imports and product copying.', why_it_matters: 'This is a significant change in the premium off-road segment and may affect customers, suppliers, dealers and competitor positioning.' },
  { event_id: 'regent-recall', importance: { score: 96, level: 'critical' }, event_date: '2026-09-10', category: 'recall', brand: 'Regent RV / Snowy River', headline: 'Regent RV recalls 511 Snowy River SRH hybrid caravans over possible suspension-arm weld cracking', summary: 'A safety recall affecting Snowy River SRH hybrid caravans due to a potential suspension-arm weld issue.', what_happened: 'A recall was issued for 511 Snowy River SRH hybrid caravans because weld cracking may develop around the suspension-arm assembly.', why_it_matters: 'Recall activity can affect customer confidence, service capacity and future engineering controls across the hybrid segment.' },
  { event_id: 'snowy-48v', status: 'new', importance: { score: 82, level: 'high' }, event_date: '2026-09-22', category: 'technology', brand: 'Snowy River', headline: 'Snowy River launches Australian-engineered 48V power platform across MY27 SRH, SRM and SRT ranges', summary: 'A 48V power platform is being introduced across key MY27 Snowy River ranges.', what_happened: 'Snowy River announced an Australian-engineered 48V power system for three of its core model ranges.', why_it_matters: 'Higher-voltage platforms are becoming a key product differentiator for buyers seeking longer off-grid capability.' },
  { event_id: 'austrack-acquisition', importance: { score: 91, level: 'critical' }, event_date: '2026-08-21', category: 'acquisition', brand: 'Austrack / X Series RV / Phoenix RV', headline: 'Austrack acquires X Series RV, Phoenix RV and Sunland assets after liquidation', summary: 'Austrack has acquired selected caravan and RV brand assets following liquidation.', what_happened: 'Austrack acquired selected intellectual property and brand assets associated with X Series RV, Phoenix RV and Sunland.', why_it_matters: 'The transaction consolidates brand ownership and may reshape product, dealer and customer-support strategies.' },
  { event_id: 'jb-network', importance: { score: 88, level: 'high' }, event_date: '2026-07-10', category: 'acquisition', brand: 'JB Group / Network RV', headline: 'JB Group acquires Network RV intellectual property following administration', summary: 'JB Group acquired Network RV intellectual property after the business entered administration.', what_happened: 'JB Group acquired Network RV intellectual property and related brand assets from the administration process.', why_it_matters: 'The deal gives an established manufacturer additional products and brand reach in a consolidating market.' },
  { event_id: 'market-update', importance: { score: 76, level: 'important' }, event_date: '2026-09-08', category: 'market trend', brand: 'Australian RV industry', headline: 'Caravan Industry Association publishes 2026 market update: local output softens while imports rise', summary: 'Industry data signals softer local output alongside continued import growth.', what_happened: 'The latest market update points to easing domestic production while imported caravan volumes continue to rise.', why_it_matters: 'The shift increases price competition and gives manufacturers a clearer signal to review sourcing, positioning and production plans.' },
];

const levelStyles: Record<string, { bar: string; pill: string; dot: string }> = {
  critical: { bar: 'bg-[#e04938]', pill: 'bg-[#fff0ed] text-[#b42b20]', dot: 'bg-[#e04938]' },
  high: { bar: 'bg-[#eb9d2f]', pill: 'bg-[#fff4df] text-[#9a5b00]', dot: 'bg-[#e9a23b]' },
  important: { bar: 'bg-[#367cc7]', pill: 'bg-[#eaf3ff] text-[#28639f]', dot: 'bg-[#367cc7]' },
};

const prettyCategory = (category: string) => category.replace(/\b\w/g, (letter) => letter.toUpperCase());
const formatDate = (value?: string, long = false) => {
  if (!value) return '';
  const date = new Date(`${value.slice(0, 10)}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('en-AU', long
    ? { day: 'numeric', month: 'long', year: 'numeric' }
    : { day: '2-digit', month: 'short', year: 'numeric' }).format(date);
};

export default function Index() {
  const navigate = useNavigate();
  const { user, logOut, isSettingsAdmin } = useAuth();
  const [feed, setFeed] = useState<Feed>({ feed_metadata: { report_date: '2026-09-23' }, items: sampleItems });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState<IntelligenceItem | null>(null);
  const [mobileMenu, setMobileMenu] = useState(false);

  useEffect(() => onValue(ref(database, 'rv_intelligence/latest/payload'), (snapshot) => {
    const value = snapshot.val() as Feed | null;
    if (value?.items?.length) setFeed(value);
    setLoading(false);
  }, () => setLoading(false)), []);

  const items = useMemo(() => [...(feed.items ?? sampleItems)]
    .sort((a, b) => b.importance.score - a.importance.score)
    .filter((item) => filter === 'all' || item.importance.level === filter || item.category === filter), [feed.items, filter]);

  const reportDate = feed.feed_metadata?.report_date ?? '2026-09-23';
  const newCount = (feed.items ?? sampleItems).filter((item) => item.status === 'new').length;
  const filters = [
    ['all', 'All updates'], ['critical', 'Critical'], ['acquisition', 'Acquisitions'],
    ['technology', 'Technology'], ['market trend', 'Market trends'],
  ];

  return (
    <div className="min-h-screen bg-[#f6f7f8] text-[#172024]">
      <header className="border-b border-[#dde2e5] bg-white/95">
        <div className="mx-auto flex h-[72px] max-w-[1180px] items-center justify-between px-5 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#113c34] text-white"><Radio className="h-[18px] w-[18px]" /></div>
            <div><div className="text-[15px] font-bold leading-tight tracking-[-.01em]">RV Industry Intelligence</div><div className="mt-0.5 text-[11px] font-medium uppercase tracking-[.12em] text-[#83908d]">Australian market</div></div>
          </div>
          <div className="hidden items-center gap-6 md:flex">
            <div className="flex items-center gap-2 text-xs text-[#64706d]"><span className="h-2 w-2 animate-pulse rounded-full bg-[#36a46f]" />Live daily feed</div>
            {isSettingsAdmin && <Button variant="ghost" size="sm" onClick={() => navigate('/admin')}><Settings className="mr-2 h-4 w-4" />Settings</Button>}
            <button onClick={() => void logOut()} className="flex items-center gap-2 text-xs font-medium text-[#64706d] hover:text-[#183d35]"><LogOut className="h-4 w-4" />Sign out</button>
          </div>
          <button className="md:hidden" aria-label="Open menu" onClick={() => setMobileMenu(!mobileMenu)}><Menu /></button>
        </div>
        {mobileMenu && <div className="flex items-center justify-end gap-4 border-t px-5 py-3 md:hidden"><span className="text-xs text-slate-500">{user?.email}</span>{isSettingsAdmin && <button onClick={() => navigate('/admin')}><Settings className="h-4 w-4" /></button>}<button onClick={() => void logOut()}><LogOut className="h-4 w-4" /></button></div>}
      </header>

      <main>
        <section className="relative overflow-hidden bg-[#123d35] text-white">
          <div className="pointer-events-none absolute inset-0 opacity-[.09] [background-image:radial-gradient(#fff_1px,transparent_1px)] [background-size:22px_22px]" />
          <div className="relative mx-auto max-w-[1180px] px-5 py-14 lg:px-8 lg:py-[72px]">
            <div className="mb-6 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[.16em] text-[#b8d1c9]"><span>Intelligence briefing</span><span className="h-px w-8 bg-[#6d9188]" /><span>{formatDate(reportDate, true)}</span></div>
            <div className="grid gap-8 lg:grid-cols-[1fr_270px] lg:items-end">
              <div><h1 className="max-w-3xl text-[40px] font-semibold leading-[1.05] tracking-[-.04em] sm:text-[55px]">What changed in the<br /><span className="text-[#bbd8ce]">Australian RV market.</span></h1><p className="mt-6 max-w-[650px] text-[15px] leading-7 text-[#c9d9d4]">A practical view of events that affect manufacturing, pricing, compliance, dealerships and competitors.</p></div>
              <div className="rounded-xl border border-white/15 bg-white/[.06] p-5 backdrop-blur"><div className="flex items-end justify-between"><strong className="text-4xl font-medium">{feed.items?.length ?? sampleItems.length}</strong>{newCount > 0 && <span className="rounded-full bg-[#d6f45b] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#244218]">{newCount} new</span>}</div><div className="mt-1 text-xs uppercase tracking-[.13em] text-[#a8c0ba]">Material updates</div><div className="mt-5 h-1 overflow-hidden rounded bg-white/10"><div className="h-full w-4/5 bg-[#d6f45b]" /></div><div className="mt-3 flex items-center justify-between text-[10px] text-[#93ada6]"><span>Daily signal strength</span><span>High</span></div></div>
            </div>
          </div>
        </section>

        <section className="border-b border-[#e1e5e6] bg-[#eff2ee]">
          <div className="mx-auto flex max-w-[1180px] items-center gap-4 overflow-hidden px-5 py-3 lg:px-8"><span className="flex shrink-0 items-center gap-2 text-[10px] font-bold uppercase tracking-[.15em] text-[#21463d]"><Sparkles className="h-3.5 w-3.5" />Market watch</span><span className="h-4 w-px shrink-0 bg-[#c9d0cb]" /><div className="truncate whitespace-nowrap text-xs text-[#62706c]">Australian Off Road administration&nbsp;&nbsp; • &nbsp;&nbsp;Snowy River 48V launch&nbsp;&nbsp; • &nbsp;&nbsp;Regent SRH recall&nbsp;&nbsp; • &nbsp;&nbsp;Imports rising&nbsp;&nbsp; • &nbsp;&nbsp;New ownership changes</div></div>
        </section>

        <section className="mx-auto max-w-[1180px] px-5 py-10 lg:px-8 lg:py-14">
          <div className="mb-8 flex flex-col justify-between gap-5 border-b border-[#dfe3e4] pb-5 lg:flex-row lg:items-end">
            <div><div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.15em] text-[#74817e]"><Newspaper className="h-3.5 w-3.5" />Latest intelligence</div><h2 className="text-2xl font-semibold tracking-[-.025em]">All market updates</h2></div>
            <div className="flex gap-2 overflow-x-auto pb-1">{filters.map(([value, label]) => <button key={value} onClick={() => setFilter(value)} className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition ${filter === value ? 'bg-[#173f37] text-white shadow-sm' : 'border border-[#d9dede] bg-white text-[#65716f] hover:border-[#9dafaa]'}`}>{label}</button>)}</div>
          </div>

          <div className="mb-5 flex items-center justify-between text-xs text-[#7a8683]"><span>{items.length} updates · ranked by importance</span><span className="flex items-center gap-1.5"><ArrowDown className="h-3.5 w-3.5" />Highest impact first</span></div>
          <div className="grid gap-4">
            {loading && <div className="rounded-xl border bg-white p-8 text-center text-sm text-slate-500">Checking today’s intelligence feed…</div>}
            {!loading && items.length === 0 && <div className="rounded-xl border bg-white p-12 text-center text-sm text-slate-500">No updates match this filter.</div>}
            {!loading && items.map((item) => {
              const style = levelStyles[item.importance.level] ?? levelStyles.important;
              return <article key={item.event_id} onClick={() => setSelected(item)} className="group relative cursor-pointer overflow-hidden rounded-xl border border-[#e0e4e5] bg-white shadow-[0_2px_10px_rgba(20,40,35,.025)] transition duration-200 hover:-translate-y-0.5 hover:border-[#bdcbc7] hover:shadow-[0_12px_32px_rgba(20,45,38,.09)]">
                <div className={`absolute inset-y-0 left-0 w-1 ${style.bar}`} />
                <div className="grid gap-5 px-6 py-6 sm:px-7 lg:grid-cols-[104px_1fr_38px] lg:items-center">
                  <div className="flex items-center gap-4 lg:block"><div className="text-[11px] font-semibold uppercase tracking-[.13em] text-[#9aa4a2]">Impact</div><div className="mt-1 flex items-baseline"><span className="text-[31px] font-semibold leading-none tracking-[-.04em] text-[#263a35]">{item.importance.score}</span><span className="text-xs text-[#9ba5a2]">/100</span></div><div className={`ml-auto mt-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[.08em] lg:ml-0 ${style.pill}`}><span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />{item.importance.level}</div></div>
                  <div className="border-t border-[#edf0f0] pt-4 lg:border-l lg:border-t-0 lg:pl-7 lg:pt-0"><div className="mb-2 flex flex-wrap items-center gap-2 text-[11px] font-semibold text-[#77827f]"><span className="text-[#345f55]">{item.brand}</span><span className="text-[#c6ccca]">/</span><span>{prettyCategory(item.category)}</span><span className="text-[#c6ccca]">/</span><span className="flex items-center gap-1"><CalendarDays className="h-3 w-3" />{formatDate(item.event_date)}</span>{item.status === 'new' && <span className="rounded bg-[#dff36d] px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-[#395018]">New</span>}</div><h3 className="max-w-[800px] text-[18px] font-semibold leading-[1.4] tracking-[-.015em] text-[#1b2925] transition group-hover:text-[#145b4b]">{item.headline}</h3><p className="mt-2 max-w-[820px] text-[13px] leading-6 text-[#717d7a]">{item.summary}</p></div>
                  <div className="hidden h-9 w-9 items-center justify-center rounded-full border border-[#dfe5e3] text-[#547069] transition group-hover:border-[#1e5a4b] group-hover:bg-[#1e5a4b] group-hover:text-white lg:flex"><ChevronRight className="h-4 w-4" /></div>
                </div>
              </article>;
            })}
          </div>
        </section>
      </main>

      <footer className="border-t border-[#dde2e2] bg-white"><div className="mx-auto flex max-w-[1180px] flex-col justify-between gap-3 px-5 py-6 text-[11px] text-[#7d8885] sm:flex-row lg:px-8"><span>RV Intelligence · Internal market briefing</span><span>Updated daily from verified industry sources</span></div></footer>

      {selected && <div className="fixed inset-0 z-50 flex justify-end bg-[#071a16]/60 backdrop-blur-[2px]" onMouseDown={(e) => { if (e.currentTarget === e.target) setSelected(null); }}>
        <aside className="h-full w-full max-w-[680px] overflow-y-auto bg-[#fbfcfb] shadow-2xl animate-in slide-in-from-right duration-300">
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#e1e5e4] bg-white/95 px-6 py-4 backdrop-blur sm:px-10"><button onClick={() => setSelected(null)} className="flex items-center gap-2 text-xs font-semibold text-[#58706a]"><ArrowLeft className="h-4 w-4" />Back to updates</button><button aria-label="Close brief" onClick={() => setSelected(null)} className="rounded-full p-2 hover:bg-slate-100"><X className="h-4 w-4" /></button></div>
          <div className="px-6 py-9 sm:px-10 sm:py-12">
            <div className="mb-6 flex flex-wrap items-center gap-2"><span className={`rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.1em] ${(levelStyles[selected.importance.level] ?? levelStyles.important).pill}`}>{selected.importance.level} · {selected.importance.score}/100</span>{selected.status === 'new' && <span className="rounded-full bg-[#dff36d] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.1em] text-[#405318]">New update</span>}</div>
            <h2 className="text-[31px] font-semibold leading-[1.18] tracking-[-.035em] text-[#172722] sm:text-[38px]">{selected.headline}</h2>
            <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 border-y border-[#dfe5e3] py-4 text-xs font-medium text-[#697672]"><span className="flex items-center gap-1.5"><Building2 className="h-3.5 w-3.5" />{selected.brand}</span><span className="flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5" />{formatDate(selected.event_date, true)}</span><span>{prettyCategory(selected.category)}</span></div>
            <p className="mt-8 text-lg font-medium leading-8 text-[#3f514c]">{selected.summary}</p>
            {selected.what_happened && <section className="mt-10"><div className="mb-3 flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[.13em] text-[#7a8783]"><Clock3 className="h-4 w-4 text-[#2b7563]" />What happened</div><p className="text-[15px] leading-7 text-[#52615d]">{selected.what_happened}</p></section>}
            {selected.why_it_matters && <section className="mt-8 rounded-xl border border-[#d8e3df] bg-[#eef5f2] p-6"><div className="mb-3 flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[.13em] text-[#276454]"><ShieldAlert className="h-4 w-4" />Why it matters</div><p className="text-[15px] leading-7 text-[#41544e]">{selected.why_it_matters}</p></section>}
            {!!selected.sources?.length && <section className="mt-9 border-t pt-7"><div className="mb-3 text-[11px] font-bold uppercase tracking-[.13em] text-[#7a8783]">Sources</div>{selected.sources.map((source, index) => { const url = typeof source === 'string' ? source : source.url; const title = typeof source === 'string' ? `Source ${index + 1}` : source.title ?? `Source ${index + 1}`; return url ? <a key={index} href={url} target="_blank" rel="noreferrer" className="mt-2 flex items-center justify-between rounded-lg border bg-white px-4 py-3 text-sm font-medium text-[#286656] hover:border-[#8eaaa2]">{title}<ArrowRight className="h-4 w-4" /></a> : null; })}</section>}
          </div>
        </aside>
      </div>}
    </div>
  );
}
