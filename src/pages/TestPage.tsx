import { useMemo, useState } from 'react';
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  BarChart3,
  Bell,
  ChevronDown,
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
  Sparkles,
  TrendingUp,
  UserRound,
  UsersRound,
  Warehouse,
  Wrench,
  X,
  type LucideIcon,
} from 'lucide-react';

type SectionId = 'production' | 'sales' | 'warranty' | 'finance';

type Report = {
  id: string;
  title: string;
  description: string;
  section: SectionId;
  icon: LucideIcon;
  updated: string;
};

const sections: Array<{
  id: SectionId;
  title: string;
  shortTitle: string;
  eyebrow: string;
  icon: LucideIcon;
  accent: string;
  iconStyle: string;
}> = [
  {
    id: 'production',
    title: 'Production & Operation',
    shortTitle: 'Production',
    eyebrow: 'OPERATIONS',
    icon: Factory,
    accent: 'from-blue-500 to-cyan-400',
    iconStyle: 'bg-blue-50 text-blue-600 ring-blue-100',
  },
  {
    id: 'sales',
    title: 'Sales & Dealership',
    shortTitle: 'Sales',
    eyebrow: 'COMMERCIAL',
    icon: Handshake,
    accent: 'from-violet-500 to-fuchsia-400',
    iconStyle: 'bg-violet-50 text-violet-600 ring-violet-100',
  },
  {
    id: 'warranty',
    title: 'Warranty & Spare Parts',
    shortTitle: 'Warranty',
    eyebrow: 'AFTER SALES',
    icon: Wrench,
    accent: 'from-amber-500 to-orange-400',
    iconStyle: 'bg-amber-50 text-amber-600 ring-amber-100',
  },
  {
    id: 'finance',
    title: 'Finance',
    shortTitle: 'Finance',
    eyebrow: 'FINANCIAL',
    icon: CircleDollarSign,
    accent: 'from-emerald-500 to-teal-400',
    iconStyle: 'bg-emerald-50 text-emerald-600 ring-emerald-100',
  },
];

const initialReports: Report[] = [
  { id: 'production-overview', title: 'Production Overview', description: 'Live output, targets and line efficiency', section: 'production', icon: Gauge, updated: '5 min ago' },
  { id: 'inventory', title: 'Inventory Status', description: 'Materials, stock levels and availability', section: 'production', icon: Warehouse, updated: '12 min ago' },
  { id: 'quality', title: 'Quality Performance', description: 'Inspections, defects and compliance', section: 'production', icon: ShieldCheck, updated: 'Today' },
  { id: 'sales-performance', title: 'Sales Performance', description: 'Revenue, conversion and target tracking', section: 'sales', icon: TrendingUp, updated: '8 min ago' },
  { id: 'dealer-network', title: 'Dealer Network', description: 'Dealer activity and regional performance', section: 'sales', icon: UsersRound, updated: 'Today' },
  { id: 'pipeline', title: 'Deal Pipeline', description: 'Opportunities and upcoming deliveries', section: 'sales', icon: BarChart3, updated: '20 min ago' },
  { id: 'warranty-claims', title: 'Warranty Claims', description: 'Open claims, ageing and resolution status', section: 'warranty', icon: FileBarChart, updated: '10 min ago' },
  { id: 'parts', title: 'Spare Parts', description: 'Orders, fulfilment and critical stock', section: 'warranty', icon: PackageCheck, updated: 'Today' },
  { id: 'financial-summary', title: 'Financial Summary', description: 'Revenue, margin and operating result', section: 'finance', icon: CircleDollarSign, updated: 'Today' },
  { id: 'cashflow', title: 'Cash Flow Forecast', description: 'Actuals, commitments and forward outlook', section: 'finance', icon: BarChart3, updated: 'Yesterday' },
];

export default function TestPage() {
  const [reports, setReports] = useState(initialReports);
  const [editMode, setEditMode] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [query, setQuery] = useState('');

  const visibleReports = useMemo(
    () => reports.filter((report) => `${report.title} ${report.description}`.toLowerCase().includes(query.toLowerCase())),
    [query, reports],
  );

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
    <div className="min-h-screen bg-[#f6f8fb] text-slate-900">
      <aside className={`fixed inset-y-0 left-0 z-40 w-[238px] border-r border-slate-200/80 bg-white px-4 py-6 transition-transform lg:translate-x-0 ${mobileNavOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="mb-10 flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-[#1867e8] text-white shadow-lg shadow-blue-200"><Sparkles className="h-4 w-4" /></div>
            <div><p className="text-[15px] font-bold tracking-tight">Regent Workspace</p><p className="text-[10px] font-semibold tracking-[.18em] text-slate-400">BUSINESS HUB</p></div>
          </div>
          <button className="lg:hidden" onClick={() => setMobileNavOpen(false)} aria-label="Close navigation"><X className="h-5 w-5" /></button>
        </div>
        <nav className="space-y-1.5" aria-label="Workspace navigation">
          <a href="#overview" className="flex items-center gap-3 rounded-xl bg-blue-50 px-3 py-2.5 text-sm font-semibold text-blue-700"><LayoutDashboard className="h-[18px] w-[18px]" />Overview</a>
          {sections.map((section) => {
            const Icon = section.icon;
            return <a key={section.id} href={`#${section.id}`} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"><Icon className="h-[18px] w-[18px]" />{section.shortTitle}</a>;
          })}
        </nav>
        <div className="absolute inset-x-4 bottom-5 rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
          <div className="mb-3 grid h-8 w-8 place-items-center rounded-lg bg-white text-blue-600 shadow-sm"><Settings2 className="h-4 w-4" /></div>
          <p className="text-xs font-bold">Customise workspace</p>
          <p className="mt-1 text-[11px] leading-4 text-slate-500">Turn on edit mode to arrange your reports.</p>
        </div>
      </aside>

      <div className="lg:pl-[238px]">
        <header className="sticky top-0 z-30 flex h-[72px] items-center justify-between border-b border-slate-200/80 bg-white/90 px-5 backdrop-blur-xl md:px-9">
          <div className="flex items-center gap-3">
            <button className="rounded-lg p-2 hover:bg-slate-100 lg:hidden" onClick={() => setMobileNavOpen(true)} aria-label="Open navigation"><Menu className="h-5 w-5" /></button>
            <div><h1 className="text-lg font-bold tracking-tight md:text-xl">Good morning, Alex</h1><p className="hidden text-xs text-slate-400 sm:block">Here’s what’s happening across your business today.</p></div>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            <label className="hidden h-9 w-52 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 md:flex">
              <Search className="h-4 w-4 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} className="min-w-0 flex-1 bg-transparent text-xs outline-none" placeholder="Search reports..." aria-label="Search reports" />
            </label>
            <button className="relative grid h-9 w-9 place-items-center rounded-xl border border-slate-200 bg-white text-slate-500"><Bell className="h-4 w-4" /><span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-blue-500 ring-2 ring-white" /></button>
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 text-white"><UserRound className="h-4 w-4" /></div>
          </div>
        </header>

        <main id="overview" className="mx-auto max-w-[1460px] px-5 py-7 md:px-9 md:py-9">
          <section className="mb-8 overflow-hidden rounded-[24px] bg-[#101b35] px-6 py-7 text-white shadow-xl shadow-slate-200 md:flex md:items-center md:justify-between md:px-9">
            <div><span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10px] font-bold tracking-[.16em] text-blue-100">BUSINESS OVERVIEW</span><h2 className="mt-4 text-2xl font-bold tracking-tight md:text-3xl">Everything you need, in one place.</h2><p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">Access your reports by business area, keep priorities visible and move work where it belongs.</p></div>
            <button onClick={() => setEditMode((value) => !value)} className={`mt-5 inline-flex h-10 items-center gap-2 rounded-xl px-4 text-xs font-bold transition md:mt-0 ${editMode ? 'bg-blue-500 text-white' : 'bg-white text-slate-900 hover:bg-blue-50'}`}><Settings2 className="h-4 w-4" />{editMode ? 'Finish arranging' : 'Arrange reports'}</button>
          </section>

          <div className="grid gap-6 xl:grid-cols-2">
            {sections.map((section) => {
              const Icon = section.icon;
              const sectionReports = visibleReports.filter((report) => report.section === section.id);
              return (
                <section id={section.id} key={section.id} className="scroll-mt-24 overflow-hidden rounded-[22px] border border-slate-200/80 bg-white shadow-sm shadow-slate-200/60">
                  <div className={`h-1 bg-gradient-to-r ${section.accent}`} />
                  <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 md:px-6">
                    <div className="flex items-center gap-3"><div className={`grid h-11 w-11 place-items-center rounded-2xl ring-1 ${section.iconStyle}`}><Icon className="h-5 w-5" /></div><div><p className="text-[9px] font-bold tracking-[.18em] text-slate-400">{section.eyebrow}</p><h3 className="text-base font-bold tracking-tight">{section.title}</h3></div></div>
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-500">{sectionReports.length} REPORTS</span>
                  </div>
                  <div className="divide-y divide-slate-100 px-5 md:px-6">
                    {sectionReports.map((report, index) => {
                      const ReportIcon = report.icon;
                      return (
                        <article key={report.id} className="group flex items-center gap-3 py-4">
                          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-50 text-slate-500 ring-1 ring-slate-100 transition group-hover:bg-slate-900 group-hover:text-white"><ReportIcon className="h-[18px] w-[18px]" /></div>
                          <div className="min-w-0 flex-1"><h4 className="truncate text-sm font-bold">{report.title}</h4><p className="mt-0.5 truncate text-[11px] text-slate-400">{report.description}</p></div>
                          {editMode ? (
                            <div className="flex items-center gap-1">
                              <button disabled={index === 0} onClick={() => moveReport(report.id, -1)} className="rounded-lg border border-slate-200 p-1.5 text-slate-500 disabled:opacity-25" title="Move forward" aria-label={`Move ${report.title} forward`}><ArrowUp className="h-3.5 w-3.5" /></button>
                              <button disabled={index === sectionReports.length - 1} onClick={() => moveReport(report.id, 1)} className="rounded-lg border border-slate-200 p-1.5 text-slate-500 disabled:opacity-25" title="Move backward" aria-label={`Move ${report.title} backward`}><ArrowDown className="h-3.5 w-3.5" /></button>
                              <label className="relative ml-1 hidden sm:block"><span className="sr-only">Move {report.title} to section</span><select value={report.section} onChange={(event) => changeSection(report.id, event.target.value as SectionId)} className="h-8 appearance-none rounded-lg border border-slate-200 bg-white pl-2.5 pr-7 text-[10px] font-semibold text-slate-600 outline-none focus:border-blue-400">{sections.map((option) => <option key={option.id} value={option.id}>{option.shortTitle}</option>)}</select><ChevronDown className="pointer-events-none absolute right-2 top-2.5 h-3 w-3 text-slate-400" /></label>
                            </div>
                          ) : (
                            <div className="flex items-center gap-3"><span className="hidden text-[10px] text-slate-400 sm:block">Updated {report.updated}</span><button className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition hover:bg-blue-50 hover:text-blue-600" aria-label={`Open ${report.title}`}><ArrowRight className="h-4 w-4" /></button></div>
                          )}
                        </article>
                      );
                    })}
                    {sectionReports.length === 0 && <div className="py-9 text-center text-xs text-slate-400">No matching reports in this section.</div>}
                  </div>
                  <button className="flex w-full items-center justify-center gap-2 border-t border-slate-100 bg-slate-50/50 py-3 text-[11px] font-bold text-slate-500 transition hover:bg-slate-50 hover:text-blue-600"><Plus className="h-3.5 w-3.5" />Add report</button>
                </section>
              );
            })}
          </div>
          <footer className="mt-8 flex items-center justify-between border-t border-slate-200 py-5 text-[10px] text-slate-400"><span>Regent Workspace · Test environment</span><span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />All systems operational</span></footer>
        </main>
      </div>
      {mobileNavOpen && <button className="fixed inset-0 z-30 bg-slate-950/30 backdrop-blur-sm lg:hidden" onClick={() => setMobileNavOpen(false)} aria-label="Close navigation overlay" />}
    </div>
  );
}
