import { useMemo } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ArrowLeft, CheckCircle2, Languages, Ship, Sparkles, Wrench } from 'lucide-react';

const monthlyLeadTime = [
  { month: 'Jul', value: 20.8 }, { month: 'Aug', value: 18.6 }, { month: 'Sep', value: 16.2 },
  { month: 'Oct', value: 14.8 }, { month: 'Nov', value: 13.1 }, { month: 'Dec', value: 11.9 },
];

const typeSummary = [
  { type: 'SRH', value: 31, color: '#64d7cb' },
  { type: 'SRT', value: 24, color: '#7988f2' },
  { type: 'SRM', value: 18, color: '#efad67' },
];

const contractTracking = [
  { month: 'Jul', srh: 8, srt: 5, srm: 3 }, { month: 'Aug', srh: 11, srt: 7, srm: 5 },
  { month: 'Sep', srh: 14, srt: 9, srm: 6 }, { month: 'Oct', srh: 18, srt: 12, srm: 8 },
  { month: 'Nov', srh: 22, srt: 15, srm: 11 }, { month: 'Dec', srh: 27, srt: 19, srm: 14 },
];

const copy = {
  en: {
    eyebrow: 'LONGTREE · PRODUCTION INTELLIGENCE', title: 'Production Dashboard', live: 'Live overview',
    average: 'Average completion days — Month', averageNote: 'Rolling monthly average', days: 'days',
    summary: 'Type summary · Selected month', summaryNote: 'December completions', units: 'units',
    contract: 'MY 2027 Contract Tracking', contractNote: 'Completed vehicles by model year · Jul—Dec',
    transport: 'In transit', weld: 'Welding → Complete', completed: 'Completed', back: 'All workspaces',
    embedded: 'Embedded view', standalone: 'Standalone view', months: ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  },
  zh: {
    eyebrow: 'LONGTREE · 生产智能看板', title: '生产仪表盘', live: '实时概览',
    average: '平均完成天数 — 月', averageNote: '月度滚动平均值', days: '天',
    summary: '类型汇总 · 所选月份', summaryNote: '十二月完成量', units: '辆',
    contract: 'MY 2027 合同追踪', contractNote: '2027 年款完成车辆 · 7—12 月',
    transport: '运输中', weld: '焊接 → 完成', completed: '已完成', back: '所有工作区',
    embedded: '非独立页面', standalone: '独立页面', months: ['7月', '8月', '9月', '10月', '11月', '12月'],
  },
};

export default function LongtreeProductionDashboard() {
  const { locale } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const language = locale === 'zh' || searchParams.get('lang') === 'zh' ? 'zh' : 'en';
  const standalone = searchParams.get('standalone') !== 'false';
  const t = copy[language];
  const chartData = useMemo(() => contractTracking.map((row, index) => ({ ...row, month: t.months[index] })), [t]);

  const updateView = (key: 'lang' | 'standalone', value: string) => {
    const next = new URLSearchParams(searchParams);
    next.set(key, value);
    setSearchParams(next);
  };

  return (
    <div className="min-h-screen bg-[#07111f] text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_18%_8%,#15385c_0,transparent_34%),radial-gradient(circle_at_88%_16%,#173d3b_0,transparent_30%)]" />
      <main className={`relative mx-auto ${standalone ? 'max-w-[1600px] px-5 py-7 lg:px-9' : 'max-w-full p-4'}`}>
        <header className="mb-7 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            {!standalone && <button onClick={() => navigate('/')} className="mb-4 flex items-center gap-2 text-xs text-slate-400 hover:text-white"><ArrowLeft size={14} />{t.back}</button>}
            <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold tracking-[0.2em] text-teal-300"><Sparkles size={13} />{t.eyebrow}</div>
            <h1 className="text-3xl font-semibold tracking-tight lg:text-4xl">{t.title}</h1>
            <div className="mt-3 flex items-center gap-2 text-sm text-slate-400"><span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_#34d399]" />{t.live} · 14 Aug 2026</div>
          </div>
          <div className="flex gap-2 rounded-2xl border border-white/10 bg-white/[0.04] p-1.5">
            <button onClick={() => updateView('lang', language === 'en' ? 'zh' : 'en')} className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs text-slate-200 hover:bg-white/10"><Languages size={15} />{language === 'en' ? '中文' : 'English'}</button>
            <button onClick={() => updateView('standalone', standalone ? 'false' : 'true')} className="rounded-xl bg-white/10 px-3 py-2 text-xs text-slate-200 hover:bg-white/15">{standalone ? t.standalone : t.embedded}</button>
          </div>
        </header>

        <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <article className="rounded-3xl border border-white/10 bg-white/[0.055] p-5 shadow-2xl shadow-black/20 backdrop-blur-xl">
            <p className="text-xs uppercase tracking-[0.14em] text-slate-400">{t.averageNote}</p>
            <h2 className="mt-2 text-base font-medium">{t.average}</h2>
            <div className="mt-2 flex items-end gap-2"><span className="text-4xl font-semibold">11.9</span><span className="mb-1 text-sm text-slate-400">{t.days}</span><span className="mb-1 ml-auto rounded-full bg-emerald-400/10 px-2 py-1 text-xs text-emerald-300">−9.2%</span></div>
            <div className="mt-5 h-48">
              <ResponsiveContainer width="100%" height="100%"><AreaChart data={monthlyLeadTime}><defs><linearGradient id="lead" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#62ded0" stopOpacity={.42}/><stop offset="1" stopColor="#62ded0" stopOpacity={0}/></linearGradient></defs><CartesianGrid vertical={false} stroke="#ffffff0d"/><XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill:'#7f91a7',fontSize:11}}/><YAxis hide domain={[0, 24]}/><Tooltip contentStyle={{background:'#101c2b',border:'1px solid #ffffff18',borderRadius:12}}/><Area type="monotone" dataKey="value" stroke="#62ded0" strokeWidth={2.5} fill="url(#lead)"/></AreaChart></ResponsiveContainer>
            </div>
          </article>

          <article className="rounded-3xl border border-white/10 bg-white/[0.055] p-5 shadow-2xl shadow-black/20 backdrop-blur-xl">
            <p className="text-xs uppercase tracking-[0.14em] text-slate-400">{t.summaryNote}</p>
            <h2 className="mt-2 text-base font-medium">{t.summary}</h2>
            <div className="mt-2 flex items-end gap-2"><span className="text-4xl font-semibold">73</span><span className="mb-1 text-sm text-slate-400">{t.units}</span></div>
            <div className="mt-5 h-48">
              <ResponsiveContainer width="100%" height="100%"><BarChart data={typeSummary} layout="vertical" margin={{left:0,right:12}}><CartesianGrid horizontal={false} stroke="#ffffff0d"/><XAxis type="number" hide/><YAxis dataKey="type" type="category" axisLine={false} tickLine={false} tick={{fill:'#c6d0dd',fontSize:12}} width={38}/><Tooltip cursor={{fill:'#ffffff08'}} contentStyle={{background:'#101c2b',border:'1px solid #ffffff18',borderRadius:12}}/><Bar dataKey="value" radius={[0,8,8,0]} barSize={22}>{typeSummary.map(row => <Cell key={row.type} fill={row.color}/>)}</Bar></BarChart></ResponsiveContainer>
            </div>
          </article>

          <article className="rounded-3xl border border-teal-300/20 bg-gradient-to-b from-teal-300/[0.09] to-white/[0.045] p-5 shadow-2xl shadow-black/20 backdrop-blur-xl">
            <p className="text-xs uppercase tracking-[0.14em] text-teal-300">MY 2027</p>
            <h2 className="mt-2 text-base font-medium">{t.contract}</h2>
            <p className="mt-1 text-xs text-slate-400">{t.contractNote}</p>
            <div className="mt-4 h-40">
              <ResponsiveContainer width="100%" height="100%"><BarChart data={chartData} margin={{left:-25,right:0}}><CartesianGrid vertical={false} stroke="#ffffff0d"/><XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill:'#7f91a7',fontSize:10}}/><YAxis axisLine={false} tickLine={false} tick={{fill:'#65778d',fontSize:9}}/><Tooltip cursor={{fill:'#ffffff08'}} contentStyle={{background:'#101c2b',border:'1px solid #ffffff18',borderRadius:12}}/><Bar name="SRH 2027" dataKey="srh" stackId="a" fill="#64d7cb"/><Bar name="SRT 2027" dataKey="srt" stackId="a" fill="#7988f2"/><Bar name="SRM 2027" dataKey="srm" stackId="a" fill="#efad67" radius={[4,4,0,0]}/></BarChart></ResponsiveContainer>
            </div>
            <div className="mt-3 flex justify-center gap-4 text-[10px] text-slate-400">{typeSummary.map(x => <span key={x.type} className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full" style={{background:x.color}}/>{x.type} 2027</span>)}</div>
            <div className="mt-5 grid grid-cols-3 gap-2 border-t border-white/10 pt-4">
              {[{icon:Ship,label:t.transport,value:21,color:'text-sky-300'},{icon:Wrench,label:t.weld,value:16,color:'text-amber-300'},{icon:CheckCircle2,label:t.completed,value:44,color:'text-emerald-300'}].map(item => <div key={item.label} className="rounded-2xl bg-black/15 p-3"><item.icon className={item.color} size={16}/><div className="mt-2 text-xl font-semibold">{item.value}</div><div className="mt-0.5 text-[10px] leading-tight text-slate-400">{item.label}</div></div>)}
            </div>
          </article>
        </section>
      </main>
    </div>
  );
}
