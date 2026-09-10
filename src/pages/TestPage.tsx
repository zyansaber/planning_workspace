import { useMemo, useState } from 'react';
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  BarChart3,
  Bell,
  CircleDollarSign,
  Factory,
  FileBarChart,
  Gauge,
  Handshake,
  LayoutDashboard,
  Menu,
  PackageCheck,
  Plus,
  Search,
  Settings2,
  ShieldCheck,
  TrendingUp,
  UserRound,
  UsersRound,
  Warehouse,
  Wrench,
  X,
  type LucideIcon,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Imagery — swap these for Regent's own photography when available.  */
/* ------------------------------------------------------------------ */
const HERO_IMAGE =
  'https://images.unsplash.com/photo-1596470689657-bcfc0e24f4e0?fm=jpg&q=75&w=2400&auto=format&fit=crop';
const FEATURE_IMAGE =
  'https://images.unsplash.com/photo-1571528122012-eff3e9a3f49b?fm=jpg&q=75&w=1200&auto=format&fit=crop';

type SectionId = 'production' | 'sales' | 'warranty' | 'finance';

type Tone = {
  rail: string;
  chip: string;
  dot: string;
  link: string;
};

/* Colour semantics kept consistent with the rest of the suite:
   indigo = build / brand, violet = commercial, amber = after-sales, emerald = money. */
const tones: Record<SectionId, Tone> = {
  production: {
    rail: 'bg-indigo-500',
    chip: 'bg-indigo-50 text-indigo-700 ring-indigo-100',
    dot: 'bg-indigo-500',
    link: 'hover:bg-indigo-50 hover:text-indigo-600',
  },
  sales: {
    rail: 'bg-violet-500',
    chip: 'bg-violet-50 text-violet-700 ring-violet-100',
    dot: 'bg-violet-500',
    link: 'hover:bg-violet-50 hover:text-violet-600',
  },
  warranty: {
    rail: 'bg-amber-500',
    chip: 'bg-amber-50 text-amber-700 ring-amber-100',
    dot: 'bg-amber-500',
    link: 'hover:bg-amber-50 hover:text-amber-600',
  },
  finance: {
    rail: 'bg-emerald-500',
    chip: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
    dot: 'bg-emerald-500',
    link: 'hover:bg-emerald-50 hover:text-emerald-600',
  },
};

const sections: Array<{ id: SectionId; title: string; caption: string; icon: LucideIcon }> = [
  { id: 'production', title: 'Production & operation', caption: 'Build line, materials and quality', icon: Factory },
  { id: 'sales', title: 'Sales & dealership', caption: 'Orders, dealers and the forward pipeline', icon: Handshake },
  { id: 'warranty', title: 'Warranty & spare parts', caption: 'Claims, repairs and parts fulfilment', icon: Wrench },
  { id: 'finance', title: 'Finance', caption: 'Result, margin and cash position', icon: CircleDollarSign },
];

type Report = {
  id: string;
  title: string;
  description: string;
  section: SectionId;
  icon: LucideIcon;
  updated: string;
  metric: string;
  metricLabel: string;
  delta: number | null;
  /** true when a rising number is good news */
  upIsGood: boolean;
};

const initialReports: Report[] = [
  { id: 'production-overview', title: 'Production overview', description: 'Output against plan, by line', section: 'production', icon: Gauge, updated: '5 min ago', metric: '84', metricLabel: 'vans this month', delta: 6.2, upIsGood: true },
  { id: 'inventory', title: 'Inventory status', description: 'Material cover and shortages', section: 'production', icon: Warehouse, updated: '12 min ago', metric: '11', metricLabel: 'lines short', delta: -18.0, upIsGood: false },
  { id: 'quality', title: 'Quality performance', description: 'Pre-delivery defects per van', section: 'production', icon: ShieldCheck, updated: 'Today', metric: '2.4', metricLabel: 'defects per van', delta: -9.1, upIsGood: false },
  { id: 'sales-performance', title: 'Sales performance', description: 'Retail against target', section: 'sales', icon: TrendingUp, updated: '8 min ago', metric: '$14.2M', metricLabel: 'month to date', delta: 4.8, upIsGood: true },
  { id: 'dealer-network', title: 'Dealer network', description: 'Activity by dealer and state', section: 'sales', icon: UsersRound, updated: 'Today', metric: '38', metricLabel: 'active dealers', delta: 0, upIsGood: true },
  { id: 'pipeline', title: 'Order pipeline', description: 'Committed builds and delivery dates', section: 'sales', icon: BarChart3, updated: '20 min ago', metric: '312', metricLabel: 'open orders', delta: 2.1, upIsGood: true },
  { id: 'warranty-claims', title: 'Warranty claims', description: 'Open claims and ageing', section: 'warranty', icon: FileBarChart, updated: '10 min ago', metric: '196', metricLabel: 'claims open', delta: -5.4, upIsGood: false },
  { id: 'parts', title: 'Spare parts', description: 'Fulfilment and critical stock', section: 'warranty', icon: PackageCheck, updated: 'Today', metric: '92%', metricLabel: 'shipped on time', delta: 1.7, upIsGood: true },
  { id: 'financial-summary', title: 'Financial summary', description: 'Revenue, margin and operating result', section: 'finance', icon: CircleDollarSign, updated: 'Today', metric: '18.6%', metricLabel: 'gross margin', delta: 0.9, upIsGood: true },
  { id: 'cashflow', title: 'Cash flow forecast', description: 'Actuals, commitments and outlook', section: 'finance', icon: BarChart3, updated: 'Yesterday', metric: '$6.9M', metricLabel: 'closing cash', delta: -3.2, upIsGood: true },
];

const headline = [
  { label: 'Vans delivered', value: '84', sub: 'against a plan of 79' },
  { label: 'Retail revenue', value: '$14.2M', sub: 'month to date' },
  { label: 'Warranty cost per van', value: '$1,180', sub: 'rolling 90 days' },
  { label: 'Orders in build', value: '312', sub: 'across 4 lines' },
];

function Delta({ value, upIsGood }: { value: number | null; upIsGood: boolean }) {
  if (value === null || value === 0) {
    return <span className="text-[11px] font-medium text-slate-400">flat</span>;
  }
  const good = value > 0 === upIsGood;
  const Icon = value > 0 ? ArrowUp : ArrowDown;
  return (
    <span className={`inline-flex items-center gap-0.5 text-[11px] font-semibold tabular-nums ${good ? 'text-emerald-600' : 'text-rose-600'}`}>
      <Icon className="h-3 w-3" />
      {Math.abs(value).toFixed(1)}%
    </span>
  );
}

export default function TestPage() {
  const [reports, setReports] = useState(initialReports);
  const [editMode, setEditMode] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [query, setQuery] = useState('');

  const visibleReports = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return reports;
    return reports.filter((report) => `${report.title} ${report.description}`.toLowerCase().includes(needle));
  }, [query, reports]);

  const moveReport = (id: string, direction: -1 | 1) => {
    setReports((current) => {
      const report = current.find((item) => item.id === id);
      if (!report) return current;
      const siblings = current.filter((item) => item.section === report.section);
      const siblingIndex = siblings.findIndex((item) => item.id === id);
      const neighbour = siblings[siblingIndex + direction];
      if (!neighbour) return current;
      const from = current.findIndex((item) => item.id === id);
      const to = current.findIndex((item) => item.id === neighbour.id);
      const next = [...current];
      [next[from], next[to]] = [next[to], next[from]];
      return next;
    });
  };

  const changeSection = (id: string, section: SectionId) => {
    setReports((current) => current.map((report) => (report.id === id ? { ...report, section } : report)));
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-indigo-100">
      {/* ----------------------------- sidebar ----------------------------- */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[244px] flex-col border-r border-slate-200 bg-white px-4 py-6 transition-transform duration-200 lg:translate-x-0 ${
          mobileNavOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="mb-9 flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-slate-900 text-sm font-black text-white">R</div>
            <div>
              <p className="text-[15px] font-semibold leading-tight tracking-tight">Regent Workspace</p>
              <p className="text-xs leading-tight text-slate-400">Business reporting</p>
            </div>
          </div>
          <button
            className="rounded-md p-1 text-slate-400 hover:bg-slate-100 lg:hidden"
            onClick={() => setMobileNavOpen(false)}
            aria-label="Close navigation"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="space-y-1" aria-label="Workspace navigation">
          <a
            href="#overview"
            className="flex items-center gap-3 rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white"
          >
            <LayoutDashboard className="h-[18px] w-[18px]" />
            Overview
          </a>
          {sections.map((section) => {
            const Icon = section.icon;
            const count = reports.filter((report) => report.section === section.id).length;
            return (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
              >
                <Icon className="h-[18px] w-[18px] text-slate-400" />
                <span className="flex-1 truncate">{section.title.split(' ')[0]}</span>
                <span className="text-xs tabular-nums text-slate-400">{count}</span>
              </a>
            );
          })}
        </nav>

        <div className="mt-auto rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-semibold">Not where you want it?</p>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            Turn on arrange mode to reorder reports or move one to another area.
          </p>
          <button
            onClick={() => setEditMode(true)}
            className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
          >
            <Settings2 className="h-3.5 w-3.5" />
            Arrange reports
          </button>
        </div>
      </aside>

      <div className="lg:pl-[244px]">
        {/* ----------------------------- header ---------------------------- */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/85 px-5 backdrop-blur-md md:px-8 2xl:px-12">
          <div className="flex items-center gap-3">
            <button
              className="rounded-md p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
              onClick={() => setMobileNavOpen(true)}
              aria-label="Open navigation"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-base font-semibold tracking-tight">Good morning, Alex</h1>
              <p className="hidden text-xs text-slate-400 sm:block">Thursday, 10 September · figures refresh every 5 minutes</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <label className="hidden h-9 w-64 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 focus-within:border-indigo-400 md:flex">
              <Search className="h-4 w-4 shrink-0 text-slate-400" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
                placeholder="Search reports"
                aria-label="Search reports"
              />
            </label>
            <button
              className="relative grid h-9 w-9 place-items-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-indigo-500 ring-2 ring-white" />
            </button>
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-slate-900 text-white">
              <UserRound className="h-4 w-4" />
            </div>
          </div>
        </header>

        <main id="overview" className="w-full px-5 py-6 md:px-8 2xl:px-12">
          {/* ------------------------------ hero ---------------------------- */}
          <section className="relative overflow-hidden rounded-2xl bg-slate-900">
            <img
              src={HERO_IMAGE}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 h-full w-full object-cover object-center opacity-55"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-slate-950/25" />
            <div className="relative px-6 pb-6 pt-9 md:px-10 md:pb-8 md:pt-12">
              <div className="flex flex-wrap items-end justify-between gap-5">
                <div className="max-w-xl">
                  <h2 className="text-2xl font-semibold tracking-tight text-white md:text-[32px] md:leading-[1.15]">
                    Every number in the business, on one screen.
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-slate-300">
                    Reports are grouped by the team that owns them. Open one to drill in, or rearrange the board so your
                    daily few sit at the top.
                  </p>
                </div>
                <button
                  onClick={() => setEditMode((value) => !value)}
                  className={`inline-flex h-10 shrink-0 items-center gap-2 rounded-lg px-4 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
                    editMode ? 'bg-indigo-500 text-white hover:bg-indigo-400' : 'bg-white text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Settings2 className="h-4 w-4" />
                  {editMode ? 'Done arranging' : 'Arrange reports'}
                </button>
              </div>

              <dl className="mt-9 grid grid-cols-2 gap-px overflow-hidden rounded-xl bg-white/10 lg:grid-cols-4">
                {headline.map((item) => (
                  <div key={item.label} className="bg-slate-950/70 px-5 py-4 backdrop-blur-sm">
                    <dt className="text-xs font-medium text-slate-400">{item.label}</dt>
                    <dd className="mt-1.5 text-2xl font-semibold tabular-nums tracking-tight text-white md:text-3xl">
                      {item.value}
                    </dd>
                    <p className="mt-1 text-xs text-slate-400">{item.sub}</p>
                  </div>
                ))}
              </dl>
            </div>
          </section>

          {/* --------------------------- report board ------------------------ */}
          <div className="mt-6 grid gap-5 lg:grid-cols-2 2xl:grid-cols-4">
            {sections.map((section) => {
              const Icon = section.icon;
              const tone = tones[section.id];
              const sectionReports = visibleReports.filter((report) => report.section === section.id);

              return (
                <section
                  key={section.id}
                  id={section.id}
                  className="flex scroll-mt-20 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white"
                >
                  <div className={`h-[3px] ${tone.rail}`} />
                  <div className="flex items-start justify-between gap-3 px-5 py-4">
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg ring-1 ${tone.chip}`}>
                        <Icon className="h-[18px] w-[18px]" />
                      </div>
                      <div>
                        <h3 className="text-[15px] font-semibold leading-tight tracking-tight">{section.title}</h3>
                        <p className="mt-0.5 text-xs leading-5 text-slate-400">{section.caption}</p>
                      </div>
                    </div>
                    <span className="shrink-0 rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium tabular-nums text-slate-500">
                      {sectionReports.length}
                    </span>
                  </div>

                  <div className="flex-1 divide-y divide-slate-100 border-t border-slate-100">
                    {sectionReports.map((report, index) => {
                      const ReportIcon = report.icon;
                      return (
                        <article key={report.id} className="group flex items-center gap-3 px-5 py-3.5">
                          <ReportIcon className="h-4 w-4 shrink-0 text-slate-400" />
                          <div className="min-w-0 flex-1">
                            <h4 className="truncate text-sm font-medium leading-tight">{report.title}</h4>
                            {editMode ? (
                              <p className="mt-0.5 truncate text-xs text-slate-400">{report.description}</p>
                            ) : (
                              <p className="mt-1 flex items-baseline gap-1.5">
                                <span className="text-lg font-semibold tabular-nums leading-none tracking-tight">
                                  {report.metric}
                                </span>
                                <span className="truncate text-xs text-slate-400">{report.metricLabel}</span>
                              </p>
                            )}
                          </div>

                          {editMode ? (
                            <div className="flex shrink-0 items-center gap-1">
                              <button
                                disabled={index === 0}
                                onClick={() => moveReport(report.id, -1)}
                                className="rounded-md border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-50 disabled:opacity-30"
                                aria-label={`Move ${report.title} up`}
                              >
                                <ArrowUp className="h-3.5 w-3.5" />
                              </button>
                              <button
                                disabled={index === sectionReports.length - 1}
                                onClick={() => moveReport(report.id, 1)}
                                className="rounded-md border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-50 disabled:opacity-30"
                                aria-label={`Move ${report.title} down`}
                              >
                                <ArrowDown className="h-3.5 w-3.5" />
                              </button>
                              <label className="relative">
                                <span className="sr-only">Move {report.title} to another area</span>
                                <select
                                  value={report.section}
                                  onChange={(event) => changeSection(report.id, event.target.value as SectionId)}
                                  className="h-[30px] rounded-md border border-slate-200 bg-white pl-2 pr-6 text-xs text-slate-600 outline-none focus:border-indigo-400"
                                >
                                  {sections.map((option) => (
                                    <option key={option.id} value={option.id}>
                                      {option.title.split(' ')[0]}
                                    </option>
                                  ))}
                                </select>
                              </label>
                            </div>
                          ) : (
                            <div className="flex shrink-0 items-center gap-3">
                              <div className="text-right">
                                <Delta value={report.delta} upIsGood={report.upIsGood} />
                                <p className="text-[11px] text-slate-400">{report.updated}</p>
                              </div>
                              <button
                                className={`grid h-8 w-8 place-items-center rounded-md text-slate-400 transition-colors ${tone.link}`}
                                aria-label={`Open ${report.title}`}
                              >
                                <ArrowRight className="h-4 w-4" />
                              </button>
                            </div>
                          )}
                        </article>
                      );
                    })}

                    {sectionReports.length === 0 && (
                      <div className="px-5 py-8 text-center">
                        <p className="text-sm text-slate-500">Nothing here matches “{query}”.</p>
                        <button
                          onClick={() => setQuery('')}
                          className="mt-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                        >
                          Clear the search
                        </button>
                      </div>
                    )}
                  </div>

                  <button className="flex w-full items-center justify-center gap-1.5 border-t border-slate-100 py-2.5 text-xs font-medium text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-900">
                    <Plus className="h-3.5 w-3.5" />
                    Add a report
                  </button>
                </section>
              );
            })}
          </div>

          {/* --------------------------- feature strip ----------------------- */}
          <section className="mt-6 grid overflow-hidden rounded-xl border border-slate-200 bg-white lg:grid-cols-[minmax(0,1fr)_420px]">
            <div className="flex flex-col justify-center gap-3 px-6 py-7 md:px-9">
              <span className={`inline-flex w-fit items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium ring-1 ${tones.warranty.chip}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${tones.warranty.dot}`} />
                Needs a look today
              </span>
              <h3 className="text-xl font-semibold tracking-tight">Nine claims have been open longer than 30 days</h3>
              <p className="max-w-2xl text-sm leading-6 text-slate-500">
                All nine sit with dealers awaiting a parts dispatch. Clearing them would pull the warranty ageing average
                back under the 21-day target for the first time this quarter.
              </p>
              <button className="mt-1 inline-flex w-fit items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">
                Open warranty claims
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
            <div className="relative min-h-[190px] order-first lg:order-last">
              <img src={FEATURE_IMAGE} alt="A Regent caravan parked on site" className="h-full w-full object-cover" loading="lazy" />
            </div>
          </section>

          <footer className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 py-5 text-xs text-slate-400">
            <span>Regent Workspace · test environment</span>
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              All systems operational
            </span>
          </footer>
        </main>
      </div>

      {mobileNavOpen && (
        <button
          className="fixed inset-0 z-30 bg-slate-950/40 lg:hidden"
          onClick={() => setMobileNavOpen(false)}
          aria-label="Close navigation overlay"
        />
      )}
    </div>
  );
}
