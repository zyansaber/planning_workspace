import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowDown,
  ArrowRight,
  ArrowUp,
  BarChart3,
  Bell,
  Boxes,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  Download,
  Factory,
  FileBarChart,
  Gauge,
  Handshake,
  LayoutDashboard,
  Menu,
  PackageCheck,
  Search,
  Settings2,
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  UserRound,
  UsersRound,
  Warehouse,
  Wrench,
  X,
  type LucideIcon,
} from 'lucide-react';

import HERO_IMAGE from './regent-executive-hero.png';
import WEEKLY_REPORT_IMAGE from './regent-weekly-report.png';

type SectionId = 'production' | 'sales' | 'warranty' | 'finance';
type Status = 'on-track' | 'watch' | 'action';

type Tone = {
  rail: string;
  chip: string;
  dot: string;
  link: string;
  soft: string;
};

const tones: Record<SectionId, Tone> = {
  production: {
    rail: 'bg-indigo-500',
    chip: 'bg-indigo-50 text-indigo-700 ring-indigo-100',
    dot: 'bg-indigo-500',
    link: 'hover:bg-indigo-50 hover:text-indigo-700',
    soft: 'bg-indigo-50/70',
  },
  sales: {
    rail: 'bg-violet-500',
    chip: 'bg-violet-50 text-violet-700 ring-violet-100',
    dot: 'bg-violet-500',
    link: 'hover:bg-violet-50 hover:text-violet-700',
    soft: 'bg-violet-50/70',
  },
  warranty: {
    rail: 'bg-amber-500',
    chip: 'bg-amber-50 text-amber-700 ring-amber-100',
    dot: 'bg-amber-500',
    link: 'hover:bg-amber-50 hover:text-amber-700',
    soft: 'bg-amber-50/70',
  },
  finance: {
    rail: 'bg-emerald-500',
    chip: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
    dot: 'bg-emerald-500',
    link: 'hover:bg-emerald-50 hover:text-emerald-700',
    soft: 'bg-emerald-50/70',
  },
};

const statusStyles: Record<Status, { label: string; dot: string; text: string; bg: string }> = {
  'on-track': {
    label: 'On track',
    dot: 'bg-emerald-500',
    text: 'text-emerald-700',
    bg: 'bg-emerald-50 ring-emerald-100',
  },
  watch: {
    label: 'Watch',
    dot: 'bg-amber-500',
    text: 'text-amber-700',
    bg: 'bg-amber-50 ring-amber-100',
  },
  action: {
    label: 'Action required',
    dot: 'bg-rose-500',
    text: 'text-rose-700',
    bg: 'bg-rose-50 ring-rose-100',
  },
};

const sections: Array<{ id: SectionId; title: string; shortTitle: string; caption: string; icon: LucideIcon }> = [
  {
    id: 'production',
    title: 'Production & Operations',
    shortTitle: 'Production',
    caption: 'Build performance, WIP, materials and quality',
    icon: Factory,
  },
  {
    id: 'sales',
    title: 'Sales & Order Pipeline',
    shortTitle: 'Sales',
    caption: 'Orders, dealers, shows and forward delivery',
    icon: Handshake,
  },
  {
    id: 'warranty',
    title: 'Aftersales & Warranty',
    shortTitle: 'Aftersales',
    caption: 'Claims, repairs, service and parts fulfilment',
    icon: Wrench,
  },
  {
    id: 'finance',
    title: 'Finance & Commercial',
    shortTitle: 'Finance',
    caption: 'Revenue, margin, invoicing and cash position',
    icon: CircleDollarSign,
  },
];

type Report = {
  id: string;
  title: string;
  description: string;
  section: SectionId;
  icon: LucideIcon;
  href: string;
  updated: string;
  metric?: string;
  metricLabel?: string;
  delta?: number | null;
  upIsGood?: boolean;
  executive?: boolean;
};

const initialReports: Report[] = [
  {
    id: 'production-overview',
    title: 'Production Overview',
    description: 'MTD / YTD output against target, by product category',
    section: 'production',
    icon: Gauge,
    href: '/reports/production-overview',
    updated: '5 min ago',
    metric: '203',
    metricLabel: 'MTD production',
    delta: null,
    upIsGood: true,
    executive: true,
  },
  {
    id: 'production-schedule',
    title: 'Production Schedule',
    description: 'Forward build plan, customer units and stock allocation',
    section: 'production',
    icon: BarChart3,
    href: '/reports/production-schedule',
    updated: '12 min ago',
  },
  {
    id: 'inventory',
    title: 'Inventory & Material',
    description: 'Factory stock, line-side stock and material shortages',
    section: 'production',
    icon: Warehouse,
    href: '/reports/inventory',
    updated: '12 min ago',
    metric: '140',
    metricLabel: 'stock before line',
    delta: null,
    upIsGood: false,
    executive: true,
  },
  {
    id: 'quality',
    title: 'Production Risk & Quality',
    description: 'Red vans, quarantine, shortages and quality exceptions',
    section: 'production',
    icon: ShieldCheck,
    href: '/reports/production-risk',
    updated: 'Today',
    metric: '52',
    metricLabel: 'red vans',
    delta: null,
    upIsGood: false,
    executive: true,
  },
  {
    id: 'sales-performance',
    title: 'Executive Sales Overview',
    description: 'Retail performance against target and prior period',
    section: 'sales',
    icon: TrendingUp,
    href: '/reports/sales-performance',
    updated: '8 min ago',
    metric: '$14.2M',
    metricLabel: 'month to date',
    delta: 4.8,
    upIsGood: true,
    executive: true,
  },
  {
    id: 'orders-received',
    title: 'Orders Received',
    description: 'Monthly intake, stock / customer mix and year-on-year trend',
    section: 'sales',
    icon: BarChart3,
    href: '/reports/orders-received',
    updated: '15 min ago',
  },
  {
    id: 'pipeline',
    title: 'Outstanding Orders',
    description: 'Committed builds, backlog and forecast delivery coverage',
    section: 'sales',
    icon: Boxes,
    href: '/reports/order-pipeline',
    updated: '20 min ago',
    metric: '312',
    metricLabel: 'open orders',
    delta: 2.1,
    upIsGood: true,
    executive: true,
  },
  {
    id: 'dealer-network',
    title: 'Dealer Performance',
    description: 'Dealer activity, stock, invoice and sales performance',
    section: 'sales',
    icon: UsersRound,
    href: '/reports/dealer-performance',
    updated: 'Today',
  },
  {
    id: 'show-performance',
    title: 'Show Performance',
    description: 'Show targets, confirmed orders and event completion',
    section: 'sales',
    icon: Handshake,
    href: '/reports/show-performance',
    updated: 'Today',
  },
  {
    id: 'warranty-claims',
    title: 'Warranty Claims',
    description: 'Open claims, approval, parts and repair ageing',
    section: 'warranty',
    icon: FileBarChart,
    href: '/reports/warranty-claims',
    updated: '10 min ago',
    metric: '196',
    metricLabel: 'claims open',
    delta: -5.4,
    upIsGood: false,
    executive: true,
  },
  {
    id: 'service-centre',
    title: 'Service Centre',
    description: 'Repair throughput, technician workload and cycle time',
    section: 'warranty',
    icon: Wrench,
    href: '/reports/service-centre',
    updated: 'Today',
  },
  {
    id: 'parts',
    title: 'Spare Parts',
    description: 'Parts order volume, fulfilment and critical stock',
    section: 'warranty',
    icon: PackageCheck,
    href: '/reports/spare-parts',
    updated: 'Today',
    metric: '92%',
    metricLabel: 'shipped on time',
    delta: 1.7,
    upIsGood: true,
    executive: true,
  },
  {
    id: 'financial-summary',
    title: 'Financial Summary',
    description: 'Revenue, gross margin and operating result',
    section: 'finance',
    icon: CircleDollarSign,
    href: '/reports/financial-summary',
    updated: 'Today',
    metric: '18.6%',
    metricLabel: 'gross margin',
    delta: 0.9,
    upIsGood: true,
    executive: true,
  },
  {
    id: 'invoice-performance',
    title: 'Invoice Performance',
    description: 'Monthly and YTD invoice volume against target',
    section: 'finance',
    icon: FileBarChart,
    href: '/reports/invoice-performance',
    updated: 'Today',
  },
  {
    id: 'cashflow',
    title: 'Cash Flow Forecast',
    description: 'Actuals, commitments and forward cash outlook',
    section: 'finance',
    icon: BarChart3,
    href: '/reports/cash-flow',
    updated: 'Yesterday',
    metric: '$6.9M',
    metricLabel: 'closing cash',
    delta: -3.2,
    upIsGood: true,
    executive: true,
  },
];

const heroKpis = [
  { label: 'MTD Production', value: '203', sub: '79.3% of 256 target' },
  { label: 'YTD Production', value: '2,440', sub: '91.9% of 2,656 target' },
  { label: 'Orders in Build', value: '312', sub: 'committed production pipeline' },
  { label: 'Red Vans', value: '52', sub: '20 Production · 32 QC' },
];

const executivePulse: Array<{
  label: string;
  value: string;
  sub: string;
  status: Status;
  icon: LucideIcon;
  href: string;
}> = [
  {
    label: 'Production',
    value: '203',
    sub: '79.3% of MTD target',
    status: 'watch',
    icon: Factory,
    href: '/reports/production-overview',
  },
  {
    label: 'Sales',
    value: '$14.2M',
    sub: 'month to date',
    status: 'on-track',
    icon: TrendingUp,
    href: '/reports/sales-performance',
  },
  {
    label: 'Orders',
    value: '312',
    sub: 'open production orders',
    status: 'on-track',
    icon: BarChart3,
    href: '/reports/order-pipeline',
  },
  {
    label: 'Finance',
    value: '18.6%',
    sub: 'gross margin',
    status: 'on-track',
    icon: CircleDollarSign,
    href: '/reports/financial-summary',
  },
  {
    label: 'Aftersales',
    value: '196',
    sub: 'open warranty claims',
    status: 'watch',
    icon: Wrench,
    href: '/reports/warranty-claims',
  },
  {
    label: 'Factory Stock',
    value: '384',
    sub: '140 stock before line',
    status: 'watch',
    icon: Warehouse,
    href: '/reports/inventory',
  },
];

const attentionItems: Array<{
  title: string;
  detail: string;
  value: string;
  level: Status;
  href: string;
}> = [
  {
    title: 'Red vans require review',
    detail: '20 are in Production and 32 are in QC.',
    value: '52',
    level: 'action',
    href: '/reports/production-risk',
  },
  {
    title: 'Semi vans in quarantine',
    detail: 'Shortage / damage units waiting for release.',
    value: '122',
    level: 'watch',
    href: '/reports/inventory',
  },
  {
    title: 'Warranty ageing',
    detail: 'Nine claims have been open longer than 30 days.',
    value: '9',
    level: 'watch',
    href: '/reports/warranty-claims',
  },
];

function Delta({ value, upIsGood = true }: { value?: number | null; upIsGood?: boolean }) {
  if (value === undefined || value === null || value === 0) {
    return <span className="text-[11px] font-medium text-slate-400">stable</span>;
  }

  const good = (value > 0) === upIsGood;
  const Icon = value > 0 ? ArrowUp : ArrowDown;

  return (
    <span
      className={`inline-flex items-center gap-0.5 text-[11px] font-semibold tabular-nums ${
        good ? 'text-emerald-600' : 'text-rose-600'
      }`}
    >
      <Icon className="h-3 w-3" />
      {Math.abs(value).toFixed(1)}%
    </span>
  );
}

function StatusPill({ status }: { status: Status }) {
  const style = statusStyles[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[11px] font-semibold ring-1 ${style.bg} ${style.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
      {style.label}
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
    return reports.filter((report) =>
      `${report.title} ${report.description} ${report.section}`.toLowerCase().includes(needle),
    );
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
    <div className="min-h-screen bg-[#f6f8fb] text-slate-900 selection:bg-indigo-100">
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[256px] flex-col border-r border-slate-200 bg-white px-4 py-6 transition-transform duration-200 lg:translate-x-0 ${
          mobileNavOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="mb-8 flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-slate-950 text-sm font-black tracking-[0.18em] text-white shadow-sm">
              RV
            </div>
            <div>
              <p className="text-[15px] font-semibold leading-tight tracking-tight">Regent Executive</p>
              <p className="mt-0.5 text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400">Performance & reporting</p>
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

        <nav className="space-y-1" aria-label="Executive navigation">
          <a href="#overview" className="flex items-center gap-3 rounded-lg bg-slate-950 px-3 py-2.5 text-sm font-medium text-white shadow-sm">
            <LayoutDashboard className="h-[18px] w-[18px]" />
            Executive Overview
          </a>

          <p className="px-3 pb-1 pt-5 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Business areas</p>
          {sections.map((section) => {
            const Icon = section.icon;
            const count = reports.filter((report) => report.section === section.id).length;
            return (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-950"
              >
                <Icon className="h-[18px] w-[18px] text-slate-400" />
                <span className="flex-1 truncate">{section.shortTitle}</span>
                <span className="text-xs tabular-nums text-slate-400">{count}</span>
              </a>
            );
          })}

          <p className="px-3 pb-1 pt-5 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Management</p>
          <a href="#attention" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-950">
            <ShieldAlert className="h-[18px] w-[18px] text-slate-400" />
            Management Attention
          </a>
          <a href="#weekly-report" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-950">
            <FileBarChart className="h-[18px] w-[18px] text-slate-400" />
            Weekly Executive Report
          </a>
        </nav>

        <div className="mt-auto rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            Secure executive access
          </div>
          <p className="mt-2 text-xs leading-5 text-slate-500">
            Publish this portal behind company sign-in so managers can use the same URL from desktop, tablet or mobile.
          </p>
        </div>
      </aside>

      <div className="lg:pl-[256px]">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/90 px-5 backdrop-blur-md md:px-8 2xl:px-12">
          <div className="flex items-center gap-3">
            <button
              className="rounded-md p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
              onClick={() => setMobileNavOpen(true)}
              aria-label="Open navigation"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-sm font-semibold tracking-tight text-slate-900 sm:text-base">Executive Performance Portal</h1>
              <p className="hidden text-xs text-slate-400 sm:flex sm:items-center sm:gap-1.5">
                <Clock3 className="h-3 w-3" />
                Figures refresh automatically · report period September 2026
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <label className="hidden h-9 w-72 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 shadow-sm focus-within:border-indigo-400 md:flex">
              <Search className="h-4 w-4 shrink-0 text-slate-400" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
                placeholder="Search reports"
                aria-label="Search reports"
              />
            </label>
            <button className="relative grid h-9 w-9 place-items-center rounded-lg border border-slate-200 bg-white text-slate-500 shadow-sm hover:bg-slate-50" aria-label="Notifications">
              <Bell className="h-4 w-4" />
              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-rose-500 ring-2 ring-white" />
            </button>
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-slate-950 text-white shadow-sm">
              <UserRound className="h-4 w-4" />
            </div>
          </div>
        </header>

        <main id="overview" className="w-full px-5 py-6 md:px-8 2xl:px-12">
          <section className="relative overflow-hidden rounded-[22px] bg-slate-950 shadow-[0_18px_50px_rgba(15,23,42,0.16)]">
            <img src={HERO_IMAGE} alt="Regent caravans" className="absolute inset-0 h-full w-full object-cover object-center" />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-slate-950/25" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent" />

            <div className="relative px-6 pb-6 pt-9 md:px-10 md:pb-8 md:pt-12 xl:px-12">
              <div className="flex flex-wrap items-end justify-between gap-6">
                <div className="max-w-2xl">
                  <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.22em] text-cyan-300">Regent RV · Executive Intelligence</p>
                  <h2 className="max-w-xl text-3xl font-semibold tracking-[-0.03em] text-white md:text-[42px] md:leading-[1.08]">
                    One view of performance. One click to the detail.
                  </h2>
                  <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300 md:text-[15px]">
                    Start with the business pulse, focus on exceptions, then open the underlying operational report without leaving the portal.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <a href="#reports" className="inline-flex h-10 items-center gap-2 rounded-lg bg-white px-4 text-sm font-semibold text-slate-950 shadow-sm hover:bg-slate-100">
                    Browse reports
                    <ArrowRight className="h-4 w-4" />
                  </a>
                  <button
                    onClick={() => setEditMode((value) => !value)}
                    className={`inline-flex h-10 items-center gap-2 rounded-lg px-4 text-sm font-semibold ring-1 ring-white/20 transition-colors ${
                      editMode ? 'bg-indigo-500 text-white' : 'bg-white/10 text-white backdrop-blur hover:bg-white/15'
                    }`}
                  >
                    <Settings2 className="h-4 w-4" />
                    {editMode ? 'Done arranging' : 'Arrange reports'}
                  </button>
                </div>
              </div>

              <dl className="mt-10 grid grid-cols-2 overflow-hidden rounded-xl border border-white/10 bg-slate-950/55 backdrop-blur-md lg:grid-cols-4">
                {heroKpis.map((item, index) => (
                  <div key={item.label} className={`px-5 py-[18px] ${index > 0 ? 'border-l border-white/10' : ''}`}>
                    <dt className="text-[11px] font-medium uppercase tracking-[0.12em] text-slate-400">{item.label}</dt>
                    <dd className="mt-1.5 text-2xl font-semibold tabular-nums tracking-tight text-white md:text-3xl">{item.value}</dd>
                    <p className="mt-1 text-xs text-slate-400">{item.sub}</p>
                  </div>
                ))}
              </dl>
            </div>
          </section>

          <section className="mt-7">
            <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Executive pulse</p>
                <h3 className="mt-1 text-xl font-semibold tracking-tight">Business performance at a glance</h3>
              </div>
              <p className="text-xs text-slate-400">Green = on track · Amber = watch · Red = action required</p>
            </div>

            <div className="grid overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
              {executivePulse.map((item, index) => {
                const Icon = item.icon;
                return (
                  <a
                    href={item.href}
                    key={item.label}
                    className={`group min-w-0 p-4 transition-colors hover:bg-slate-50 ${index > 0 ? 'border-t border-slate-100 sm:border-t-0 sm:border-l' : ''}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="grid h-8 w-8 place-items-center rounded-lg bg-slate-100 text-slate-500 group-hover:bg-white">
                        <Icon className="h-4 w-4" />
                      </div>
                      <StatusPill status={item.status} />
                    </div>
                    <p className="mt-5 text-xs font-semibold text-slate-500">{item.label}</p>
                    <p className="mt-1 text-2xl font-semibold tabular-nums tracking-tight text-slate-950">{item.value}</p>
                    <p className="mt-1 truncate text-xs text-slate-400">{item.sub}</p>
                  </a>
                );
              })}
            </div>
          </section>

          <section id="attention" className="mt-7 scroll-mt-24 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 md:px-6">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-rose-500">Management attention</p>
                <h3 className="mt-1 text-lg font-semibold tracking-tight">Exceptions worth opening today</h3>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 ring-1 ring-rose-100">
                <AlertTriangle className="h-3.5 w-3.5" />
                3 active items
              </span>
            </div>

            <div className="grid md:grid-cols-3">
              {attentionItems.map((item, index) => {
                const style = statusStyles[item.level];
                return (
                  <a
                    key={item.title}
                    href={item.href}
                    className={`group flex min-h-[142px] items-start gap-4 p-5 transition-colors hover:bg-slate-50 md:p-6 ${
                      index > 0 ? 'border-t border-slate-100 md:border-l md:border-t-0' : ''
                    }`}
                  >
                    <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${style.bg} ${style.text} ring-1`}>
                      <AlertTriangle className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <h4 className="text-sm font-semibold leading-5 text-slate-900">{item.title}</h4>
                        <span className="text-2xl font-semibold tabular-nums tracking-tight text-slate-950">{item.value}</span>
                      </div>
                      <p className="mt-1.5 text-xs leading-5 text-slate-500">{item.detail}</p>
                      <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-slate-700 group-hover:text-indigo-600">
                        Open detail <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </a>
                );
              })}
            </div>
          </section>

          <section id="reports" className="mt-8 scroll-mt-24">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Report centre</p>
                <h3 className="mt-1 text-xl font-semibold tracking-tight">Open the detailed business view</h3>
              </div>
              {query && (
                <button onClick={() => setQuery('')} className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">
                  Clear search
                </button>
              )}
            </div>

            <div className="grid gap-5 lg:grid-cols-2 2xl:grid-cols-4">
              {sections.map((section) => {
                const Icon = section.icon;
                const tone = tones[section.id];
                const sectionReports = visibleReports.filter((report) => report.section === section.id);

                return (
                  <section
                    key={section.id}
                    id={section.id}
                    className="flex scroll-mt-24 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
                  >
                    <div className={`h-[3px] ${tone.rail}`} />
                    <div className="flex items-start justify-between gap-3 px-5 py-[18px]">
                      <div className="flex items-start gap-3">
                        <div className={`mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg ring-1 ${tone.chip}`}>
                          <Icon className="h-[18px] w-[18px]" />
                        </div>
                        <div>
                          <h4 className="text-[15px] font-semibold leading-tight tracking-tight">{section.title}</h4>
                          <p className="mt-1 text-xs leading-5 text-slate-400">{section.caption}</p>
                        </div>
                      </div>
                      <span className="shrink-0 rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium tabular-nums text-slate-500">
                        {sectionReports.length}
                      </span>
                    </div>

                    <div className="flex-1 divide-y divide-slate-100 border-t border-slate-100">
                      {sectionReports.map((report, index) => {
                        const ReportIcon = report.icon;

                        if (editMode) {
                          return (
                            <article key={report.id} className="flex items-center gap-3 px-5 py-3.5">
                              <ReportIcon className="h-4 w-4 shrink-0 text-slate-400" />
                              <div className="min-w-0 flex-1">
                                <h5 className="truncate text-sm font-medium leading-tight">{report.title}</h5>
                                <p className="mt-0.5 truncate text-xs text-slate-400">{report.description}</p>
                              </div>
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
                                <select
                                  value={report.section}
                                  onChange={(event) => changeSection(report.id, event.target.value as SectionId)}
                                  className="h-[30px] rounded-md border border-slate-200 bg-white pl-2 pr-6 text-xs text-slate-600 outline-none focus:border-indigo-400"
                                  aria-label={`Move ${report.title} to another area`}
                                >
                                  {sections.map((option) => (
                                    <option key={option.id} value={option.id}>
                                      {option.shortTitle}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </article>
                          );
                        }

                        return (
                          <a key={report.id} href={report.href} className={`group flex items-center gap-3 px-5 py-3.5 transition-colors ${tone.link}`}>
                            <div className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${tone.soft}`}>
                              <ReportIcon className="h-4 w-4 text-slate-500" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <h5 className="truncate text-sm font-medium leading-tight text-slate-900">{report.title}</h5>
                                {report.executive && (
                                  <span className="hidden rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-500 sm:inline">
                                    KPI
                                  </span>
                                )}
                              </div>
                              {report.executive && report.metric ? (
                                <p className="mt-1 flex items-baseline gap-1.5">
                                  <span className="text-lg font-semibold tabular-nums leading-none tracking-tight text-slate-950">{report.metric}</span>
                                  <span className="truncate text-xs text-slate-400">{report.metricLabel}</span>
                                </p>
                              ) : (
                                <p className="mt-1 truncate text-xs text-slate-400">{report.description}</p>
                              )}
                            </div>
                            <div className="flex shrink-0 items-center gap-3">
                              <div className="hidden text-right sm:block">
                                {report.executive && <Delta value={report.delta} upIsGood={report.upIsGood} />}
                                <p className="mt-0.5 text-[10px] text-slate-400">{report.updated}</p>
                              </div>
                              <span className="grid h-8 w-8 place-items-center rounded-md text-slate-400 group-hover:bg-white group-hover:text-slate-700">
                                <ArrowRight className="h-4 w-4" />
                              </span>
                            </div>
                          </a>
                        );
                      })}

                      {sectionReports.length === 0 && (
                        <div className="px-5 py-8 text-center">
                          <p className="text-sm text-slate-500">Nothing in {section.shortTitle} matches “{query}”.</p>
                        </div>
                      )}
                    </div>
                  </section>
                );
              })}
            </div>
          </section>

          <section
            id="weekly-report"
            className="mt-7 grid scroll-mt-24 overflow-hidden rounded-2xl border border-slate-200 bg-slate-950 shadow-[0_14px_40px_rgba(15,23,42,0.14)] lg:grid-cols-[minmax(0,1fr)_44%]"
          >
            <div className="flex flex-col justify-center px-6 py-8 text-white md:px-9 lg:px-10 lg:py-10">
              <div className="inline-flex w-fit items-center gap-2 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-slate-200 ring-1 ring-white/10">
                <FileBarChart className="h-3.5 w-3.5" />
                Weekly Executive Report
              </div>
              <h3 className="mt-4 text-2xl font-semibold tracking-tight md:text-3xl">The board view, packaged for the weekly management meeting.</h3>
              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300">
                Finance, production, sales, orders received and aftersales are brought into one management report. Open the live view for drill-down or download the fixed PDF for distribution.
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                <a href="/reports/weekly-executive" className="inline-flex h-10 items-center gap-2 rounded-lg bg-white px-4 text-sm font-semibold text-slate-950 hover:bg-slate-100">
                  Open live report
                  <ArrowRight className="h-4 w-4" />
                </a>
                <a href="/reports/weekly-executive.pdf" className="inline-flex h-10 items-center gap-2 rounded-lg bg-white/10 px-4 text-sm font-semibold text-white ring-1 ring-white/15 hover:bg-white/15">
                  <Download className="h-4 w-4" />
                  Download PDF
                </a>
              </div>
            </div>

            <div className="relative min-h-[240px] lg:min-h-[320px]">
              <img src={WEEKLY_REPORT_IMAGE} alt="Regent vehicle travelling through forest" className="absolute inset-0 h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950/75 via-slate-950/10 to-transparent lg:from-slate-950/35" />
            </div>
          </section>

          <footer className="mt-7 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 py-5 text-xs text-slate-400">
            <span>Regent Executive · Performance & Reporting</span>
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Data services operational
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
