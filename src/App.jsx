import { useState, useMemo, useEffect } from "react";
import {
  LayoutDashboard, TrendingUp, FileText, Search,
  Settings, Plus, Sparkles, ChevronDown, ChevronRight,
  Check, Zap, Clock, AlertTriangle, CircleDot, Copy,
} from "lucide-react";
import { connect, iAmReady, getStoreInfo } from "@tiendanube/nexo";
import nexo from "./nexoClient";

const PHASES_META = [
  { id: 1, name: "Kick Off", short: "Kick Off", color: "bg-emerald-500", hex: "#10b981" },
  { id: 2, name: "Catálogo & Layout", short: "Catálogo", color: "bg-blue-500", hex: "#3b82f6" },
  { id: 3, name: "Pagamento, Envio & Apps", short: "Pagamento", color: "bg-amber-500", hex: "#f59e0b" },
  { id: 4, name: "Pré Go Live", short: "Pré Go Live", color: "bg-violet-500", hex: "#8b5cf6" },
  { id: 5, name: "Go Live", short: "Go Live", color: "bg-red-500", hex: "#ef4444" },
  { id: 6, name: "Pós Go Live", short: "Pós Go Live", color: "bg-slate-400", hex: "#94a3b8" },
  { id: 7, name: "Passagem de Bastão", short: "Passagem", color: "bg-slate-400", hex: "#94a3b8" },
];

const t = (name, owner, opts = {}) => ({
  name, owner,
  optional: !!opts.optional,
  auto: !!opts.auto,
  done: !!opts.done,
  late: !!opts.late,
  due: opts.due || "—",
  obs: "",
  realDate: "",
  forced: false,
});

const DEFAULT_PHASES = [
  { id: 1, tasks: [
    t("Realizar reunião de Kick Off", "AP", { due: "a definir" }),
    t("Verificar servidor de domínio no Whois", "AP", { due: "a definir" }),
    t("Verificar plano e status da loja", "AP", { due: "a definir" }),
    t("Incluir tags de liberação e migração", "AP", { due: "a definir" }),
    t("Validar e-mail principal da loja", "AP", { due: "a definir" }),
    t("Criar plano de ação no Admin", "AP", { due: "a definir" }),
    t("Enviar e-mail pós Kick Off", "AP", { due: "a definir" }),
    t("Criar grupo de WhatsApp", "AP", { due: "a definir" }),
    t("Preencher dados do negócio", "Lojista", { due: "a definir" }),
    t("Enviar convite Google Analytics/GTM", "Lojista", { due: "a definir" }),
    t("Enviar convite Meta", "Lojista", { due: "a definir" }),
    t("Contatar Intelipost", "AP", { optional: true, due: "a definir" }),
    t("Solicitar liberação B2B", "AP", { optional: true, due: "a definir" }),
  ]},
  { id: 2, tasks: [
    t("Briefing com agência", "Lojista + Agência", { due: "a definir" }),
    t("Desenvolvimento de protótipo de layout", "Agência", { due: "a definir" }),
    t("Configurar integração ERP / importar produtos", "Lojista", { auto: true, due: "a definir" }),
    t("Testar integração ERP", "Lojista", { due: "a definir" }),
    t("Validar produtos (descrição, fotos, dimensões)", "Lojista", { auto: true, due: "a definir" }),
    t("Cadastrar categorias", "Lojista", { auto: true, due: "a definir" }),
    t("Orientar campos extras dos produtos (SEO)", "AP", { due: "a definir" }),
    t("Cadastrar campos extras nos produtos", "Lojista", { optional: true, due: "a definir" }),
    t("Aprovação do protótipo de layout", "Lojista", { due: "a definir" }),
    t("Configuração do layout na Nuvemshop", "Agência", { due: "a definir" }),
    t("Criar páginas institucionais", "Lojista", { due: "a definir" }),
  ]},
  { id: 3, tasks: [
    t("Configurar meios de pagamento", "Lojista", { auto: true, due: "a definir" }),
    t("Configurar regras de pagamento (PIX, parcelamento)", "Lojista", { due: "a definir" }),
    t("Cadastrar pagamentos personalizados", "Lojista", { optional: true, due: "a definir" }),
    t("Realizar pedido-teste de pagamento", "Lojista", { auto: true, due: "a definir" }),
    t("Configurar meios de envio", "Lojista", { auto: true, due: "a definir" }),
    t("Configurar frete grátis", "Lojista", { optional: true, due: "a definir" }),
    t("Configurar retirada em loja física", "Lojista", { optional: true, due: "a definir" }),
    t("Cadastrar Centro de Distribuição", "Lojista", { due: "a definir" }),
    t("Testar cotação de frete", "Lojista", { due: "a definir" }),
    t("Instalar aplicativos desejados", "Lojista", { auto: true, due: "a definir" }),
    t("Configurar promoções e cupons", "Lojista", { optional: true, auto: true, due: "a definir" }),
    t("Editar e-mails transacionais", "Lojista", { due: "a definir" }),
    t("Configurar permissões por usuário", "Lojista", { due: "a definir" }),
    t("Orientar verificação em duas etapas", "AP", { due: "a definir" }),
  ]},
  { id: 4, tasks: [
    t("Realizar treinamento da plataforma", "AP", { due: "a definir" }),
    t("Enviar e-mail resumo pós treinamento", "AP", { due: "a definir" }),
    t("Solicitar dados de faturamento da loja atual", "AP", { due: "a definir" }),
    t("Enviar orientações de Redirect 301", "AP", { due: "a definir" }),
    t("Preenchimento planilha Redirect 301", "Lojista", { due: "a definir" }),
    t("Receber e validar planilha Redirect 301", "AP", { due: "a definir" }),
    t("Subir planilha Redirect 301 na plataforma", "AP", { due: "a definir" }),
    t("Realizar mapeamento de IDs Meta e Google", "AP", { due: "a definir" }),
    t("Verificação de performance via NubeInsights", "AP", { due: "a definir" }),
    t("Análise NubeInsights < 50", "AP", { optional: true, due: "a definir" }),
    t("Orientar importação da base de clientes", "AP", { due: "a definir" }),
    t("Agendar reunião de Pré Go Live", "AP", { due: "a definir" }),
    t("Validar estrutura do layout", "AP", { due: "a definir" }),
    t("Realizar compra-teste completa", "AP + Lojista", { due: "a definir" }),
    t("Enviar orientações de apontamento de domínio", "AP", { due: "a definir" }),
    t("Agendar data para virada do DNS", "AP + Lojista", { due: "a definir" }),
  ]},
  { id: 5, tasks: [
    t("Confirmar apontamento de domínio", "AP", { auto: true, due: "a definir" }),
    t("Verificar SSL ativo", "AP", { auto: true, due: "a definir" }),
    t("Confirmar domínio principal no painel", "AP", { due: "a definir" }),
    t("Verificar apontamentos no Whois", "AP", { due: "a definir" }),
    t("Enviar e-mail orientações Google e Meta", "AP", { due: "a definir" }),
    t("Configurar GA4", "Lojista", { due: "a definir" }),
    t("Configurar GTM", "Lojista", { due: "a definir" }),
    t("Configurar Google Shopping e Ads", "Lojista", { due: "a definir" }),
  ]},
  { id: 6, tasks: [
    t("Verificar auto-tagging Google Ads", "AP + Lojista", { due: "a definir" }),
    t("Verificar campanhas Performance Max", "AP", { optional: true, due: "a definir" }),
    t("Configurar catálogo no Merchant Center", "Lojista", { due: "a definir" }),
    t("Verificar campos Google Shopping", "AP", { due: "a definir" }),
    t("Configurar integração Meta Shopping", "Lojista", { due: "a definir" }),
    t("Testar links quebrados", "AP", { due: "a definir" }),
    t("Verificar performance pós-apontamento", "AP", { due: "a definir" }),
    t("Finalizar migração de IDs Meta e Google", "AP", { due: "a definir" }),
    t("Desativar feed XML da plataforma anterior (Meta)", "AP + Lojista", { optional: true, due: "a definir" }),
    t("Verificar permissões Meta", "AP", { optional: true, due: "a definir" }),
    t("Registrar observações no HubSpot", "AP", { due: "a definir" }),
    t("Preencher manual de passagem de bastão", "AP", { due: "a definir" }),
    t("Orientar upload de sitemap Google Search Console", "Lojista", { due: "a definir" }),
    t("Acompanhamento do projeto pós migração", "AP", { due: "a definir" }),
  ]},
  { id: 7, tasks: [
    t("Agendar reunião de passagem de bastão", "AP", { due: "a definir" }),
    t("Apresentar AM ao merchant", "AP", { due: "a definir" }),
    t("Incluir AM no grupo WhatsApp e sair", "AP", { due: "a definir" }),
    t("Verificar pesquisa de satisfação (CSAT)", "AP", { due: "a definir" }),
  ]},
];

const ownerStyle = (o) => {
  if (o === "AP") return "bg-slate-100 text-slate-700";
  if (o === "Lojista") return "bg-blue-50 text-blue-700";
  if (o === "Agência") return "bg-violet-50 text-violet-700";
  return "bg-indigo-50 text-indigo-700";
};

export default function App() {
  const [phasesState, setPhasesState] = useState(DEFAULT_PHASES);
  const [expandedPhase, setExpandedPhase] = useState(null);
  const [expandedTask, setExpandedTask] = useState(null);
  const [activeNav, setActiveNav] = useState("dashboard");
  const [storeName, setStoreName] = useState("Carregando...");
  const [storeId, setStoreId] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [lastScan, setLastScan] = useState(null);
  const [reportText, setReportText] = useState(null);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [copied, setCopied] = useState(null);
  const [week, setWeek] = useState(1);

  useEffect(() => {
    connect(nexo).then(async () => {
      try {
        const info = await getStoreInfo(nexo);
        setStoreId(info.id);
        setStoreName(info.name || "Loja");
        await loadState(info.id);
      } catch (e) {
        console.error(e);
        setStoreName("Loja");
      }
      iAmReady(nexo);
    });
  }, []);

  async function loadState(id) {
    try {
      const res = await fetch(`/api/state?store_id=${id}`);
      const data = await res.json();
      if (data && data.phases) {
        setPhasesState(data.phases);
        setLastScan(data.lastScan || null);
        setWeek(data.week || 1);
      }
    } catch (e) {
      console.error("Erro ao carregar estado:", e);
    }
  }

  async function saveState(phases, scan) {
    if (!storeId) return;
    try {
      await fetch(`/api/state?store_id=${storeId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phases, lastScan: scan, week }),
      });
    } catch (e) {
      console.error("Erro ao salvar estado:", e);
    }
  }

  const phaseStats = useMemo(() =>
    phasesState.map((p) => {
      const total = p.tasks.length;
      const done = p.tasks.filter((x) => x.done).length;
      const late = p.tasks.filter((x) => x.late && !x.done).length;
      const pct = total ? Math.round((done / total) * 100) : 0;
      let status = "Não iniciada";
      if (pct === 100) status = "Concluída";
      else if (late > 0) status = "Em risco";
      else if (done > 0) status = "Em andamento";
      return { id: p.id, total, done, late, pct, status };
    }), [phasesState]);

  const totals = useMemo(() => {
    const all = phasesState.flatMap((p) => p.tasks);
    return {
      done: all.filter((x) => x.done).length,
      risk: all.filter((x) => x.late && !x.done).length,
      total: all.length,
    };
  }, [phasesState]);

  const inProgressCount = useMemo(() => {
    let c = 0;
    phasesState.forEach((p, i) => {
      const st = phaseStats[i];
      if (st.pct > 0 && st.pct < 100)
        c += p.tasks.filter((x) => !x.done && !x.late).length;
    });
    return c;
  }, [phasesState, phaseStats]);

  const overallPct = Math.round(
    phaseStats.reduce((a, b) => a + b.pct, 0) / phaseStats.length
  );

  const toggleTaskDone = (phaseId, taskIdx) => {
    setPhasesState((prev) => {
      const next = prev.map((p) =>
        p.id !== phaseId ? p : {
          ...p,
          tasks: p.tasks.map((t, i) =>
            i !== taskIdx ? t : { ...t, done: !t.done, late: t.done ? t.late : false }
          ),
        }
      );
      saveState(next, lastScan);
      return next;
    });
  };

  const updateTaskField = (phaseId, taskIdx, field, value) => {
    setPhasesState((prev) => {
      const next = prev.map((p) =>
        p.id !== phaseId ? p : {
          ...p,
          tasks: p.tasks.map((t, i) => i !== taskIdx ? t : { ...t, [field]: value }),
        }
      );
      saveState(next, lastScan);
      return next;
    });
  };

  async function runScan() {
    if (!storeId) return;
    setScanning(true);
    try {
      const res = await fetch(`/api/scan?store_id=${storeId}`);
      const data = await res.json();
      const now = new Date().toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
      setLastScan(now);

      if (data.categories) {
        setPhasesState((prev) => {
          const next = prev.map((p) => {
            if (p.id !== 3) return p;
            return {
              ...p,
              tasks: p.tasks.map((t) => {
                if (t.name.includes("pagamento") && data.categories.payments?.status === "done")
                  return { ...t, done: true };
                if (t.name.includes("envio") && data.categories.shipping?.status === "done")
                  return { ...t, done: true };
                if (t.name.includes("aplicativos") && data.categories.products?.status !== "pending")
                  return { ...t, done: true };
                return t;
              }),
            };
          });
          saveState(next, now);
          return next;
        });
      }
    } catch (e) { console.error(e); }
    setScanning(false);
  }

  async function generateReport() {
    setGeneratingReport(true);
    setReportText(null);
    try {
      const phaseStatsText = phaseStats.map((s, i) =>
        `Fase ${s.id} (${PHASES_META[i].name}): ${s.pct}% — ${s.status}`
      ).join("\n");
      const riskyTasks = phasesState.flatMap((p) =>
        p.tasks.filter((t) => t.late && !t.done).map((t) => `- ${t.name} (${t.owner})`)
      ).join("\n");
      const observations = phasesState.flatMap((p) =>
        p.tasks.filter((t) => t.obs).map((t) => `- ${t.name}: ${t.obs}`)
      ).join("\n");

      const res = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeName,
          week,
          overallPct,
          phaseStats: phaseStatsText,
          riskyTasks,
          observations,
        }),
      });
      const data = await res.json();
      setReportText(data);
    } catch (e) { console.error(e); }
    setGeneratingReport(false);
  }

  function copyText(text, key) {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900" style={{ fontFamily: "Inter, ui-sans-serif, system-ui" }}>
      <div className="flex">
        <aside className="w-[220px] shrink-0 h-screen sticky top-0 border-r border-slate-200 bg-white flex flex-col">
          <div className="p-4 flex items-center gap-2.5 border-b border-slate-100">
            <div className="w-9 h-9 rounded-lg bg-[#0F172A] text-white grid place-items-center font-semibold">M</div>
            <div className="leading-tight">
              <div className="text-[13px] font-semibold">Migration Hub</div>
              <div className="text-[11px] text-slate-500">Gestão de projeto</div>
            </div>
          </div>
          <div className="px-3 py-4 overflow-y-auto flex-1">
            <div className="px-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-2">Visão geral</div>
            {[
              { id: "dashboard", label: "Dashboard", Icon: LayoutDashboard },
              { id: "progresso", label: "Progresso", Icon: TrendingUp },
              { id: "report", label: "Report semanal", Icon: FileText },
            ].map((n) => (
              <button key={n.id} onClick={() => setActiveNav(n.id)}
                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-[13px] mb-0.5 transition ${
                  activeNav === n.id ? "bg-slate-100 text-slate-900 font-medium" : "text-slate-600 hover:bg-slate-50"
                }`}>
                <n.Icon size={15} />{n.label}
              </button>
            ))}
            <div className="px-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400 mt-6 mb-2">Fases do projeto</div>
            {PHASES_META.map((ph, i) => {
              const st = phaseStats[i];
              return (
                <button key={ph.id}
                  onClick={() => {
                    setActiveNav("dashboard");
                    setExpandedPhase(ph.id);
                    setTimeout(() => {
                      document.getElementById(`phase-${ph.id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
                    }, 50);
                  }}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-[12.5px] text-slate-600 hover:bg-slate-50 mb-0.5">
                  <span className={`w-2 h-2 rounded-full ${ph.color}`} />
                  <span className="flex-1 text-left truncate">
                    <span className="text-slate-400 mr-1">{ph.id}</span>{ph.short}
                  </span>
                  <span className="text-[11px] text-slate-400 tabular-nums">{st.pct}%</span>
                </button>
              );
            })}
          </div>
          <div className="border-t border-slate-100 p-3 space-y-0.5">
            <button onClick={runScan} className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-[13px] text-slate-600 hover:bg-slate-50">
              <Search size={15} />{scanning ? "Varrendo..." : "Varrer loja"}
            </button>
            <button className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-[13px] text-slate-600 hover:bg-slate-50">
              <Settings size={15} />Configurações
            </button>
          </div>
        </aside>

        <main className="flex-1 min-w-0">
          <div className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-[17px] font-semibold">{storeName}</h1>
                  <span className="text-xs text-slate-400">· BR</span>
                </div>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-[12px] text-slate-500">Semana {week} de 8</span>
                  {lastScan && (
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Clock size={10} />última varredura: {lastScan}
                    </span>
                  )}
                </div>
              </div>
              <span className="ml-2 inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                <CircleDot size={11} />Em andamento
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={runScan} className="text-[13px] px-3 py-1.5 rounded-md border border-slate-200 hover:bg-slate-50 inline-flex items-center gap-1.5">
                <Search size={14} />{scanning ? "Varrendo..." : "Varrer"}
              </button>
              <button onClick={generateReport} disabled={generatingReport}
                className="text-[13px] px-3 py-1.5 rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 inline-flex items-center gap-1.5 font-medium disabled:opacity-50">
                <Sparkles size={14} />{generatingReport ? "Gerando..." : "Gerar report"}
              </button>
              <button className="text-[13px] px-3 py-1.5 rounded-md bg-[#0F172A] text-white hover:bg-slate-800 inline-flex items-center gap-1.5 font-medium">
                <Plus size={14} />Nova tarefa
              </button>
            </div>
          </div>

          <div className="p-8 max-w-[1100px] mx-auto space-y-8">
            <section>
              <div className="flex items-baseline justify-between mb-3">
                <h2 className="text-[15px] font-semibold">Progresso geral</h2>
                <span className="text-[12px] text-slate-500"><span className="text-slate-900 font-semibold">{overallPct}%</span> completo</span>
              </div>
              <div className="flex gap-1 h-2.5 rounded-full overflow-hidden bg-slate-200/70">
                {PHASES_META.map((ph, i) => {
                  const st = phaseStats[i];
                  return (
                    <div key={ph.id} className="flex-1 bg-slate-200/60 relative overflow-hidden rounded-sm">
                      <div className={`h-full ${ph.color} transition-all`} style={{ width: `${st.pct}%` }} />
                    </div>
                  );
                })}
              </div>
              <div className="grid grid-cols-7 gap-1 mt-2">
                {PHASES_META.map((ph) => (
                  <div key={ph.id} className="text-[10.5px] text-slate-500 truncate text-center">{ph.short}</div>
                ))}
              </div>
            </section>

            <section className="grid grid-cols-4 gap-4">
              {[
                { label: "Concluídas", value: totals.done, tone: "emerald" },
                { label: "Em andamento", value: inProgressCount, tone: "amber" },
                { label: "Em risco", value: totals.risk, tone: "red" },
                { label: "Total de tarefas", value: totals.total, tone: "slate" },
              ].map((m) => <MetricCard key={m.label} {...m} />)}
            </section>

            <section className="space-y-3">
              <h2 className="text-[15px] font-semibold">Fases do projeto</h2>
              {PHASES_META.map((ph, i) => {
                const st = phaseStats[i];
                const isOpen = expandedPhase === ph.id;
                const phaseData = phasesState[i];
                return (
                  <div id={`phase-${ph.id}`} key={ph.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                    <button onClick={() => setExpandedPhase(isOpen ? null : ph.id)}
                      className="w-full flex items-center gap-4 px-5 py-4 hover:bg-slate-50/50 transition">
                      <div className={`w-8 h-8 rounded-lg ${ph.color} text-white grid place-items-center text-[13px] font-semibold shrink-0`}>
                        {ph.id}
                      </div>
                      <div className="flex-1 text-left min-w-0">
                        <div className="text-[14px] font-medium text-slate-900">{ph.name}</div>
                        <div className="text-[12px] text-slate-500 mt-0.5">{st.done} de {st.total} tarefas</div>
                      </div>
                      <StatusBadge status={st.status} />
                      <div className="w-24 hidden sm:flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-full ${ph.color}`} style={{ width: `${st.pct}%` }} />
                        </div>
                        <span className="text-[11px] text-slate-500 tabular-nums w-8 text-right">{st.pct}%</span>
                      </div>
                      {isOpen ? <ChevronDown size={16} className="text-slate-400" /> : <ChevronRight size={16} className="text-slate-400" />}
                    </button>

                    {isOpen && (
                      <div className="border-t border-slate-100">
                        {phaseData.tasks.map((task, idx) => {
                          const tKey = `${ph.id}-${idx}`;
                          const taskOpen = expandedTask === tKey;
                          return (
                            <div key={idx} className="border-b border-slate-100 last:border-b-0">
                              <div className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50/60">
                                <button onClick={(e) => { e.stopPropagation(); toggleTaskDone(ph.id, idx); }}
                                  className={`w-5 h-5 rounded-md border shrink-0 grid place-items-center transition ${
                                    task.done
                                      ? task.auto ? "bg-blue-500 border-blue-500 text-white" : "bg-emerald-500 border-emerald-500 text-white"
                                      : task.auto ? "bg-blue-50 border-blue-200 text-blue-500" : "bg-white border-slate-300 hover:border-slate-400"
                                  }`}>
                                  {task.done ? <Check size={12} strokeWidth={3} /> : task.auto ? <Zap size={11} strokeWidth={2.5} /> : null}
                                </button>
                                <button onClick={() => setExpandedTask(taskOpen ? null : tKey)}
                                  className="flex-1 flex items-center gap-2 min-w-0 text-left">
                                  <span className={`text-[13px] truncate ${task.done ? "line-through text-slate-400" : "text-slate-800"}`}>
                                    {task.name}
                                  </span>
                                </button>
                                <span className={`text-[10.5px] font-medium px-2 py-0.5 rounded-md ${ownerStyle(task.owner)}`}>
                                  {task.owner}
                                </span>
                                {task.optional && (
                                  <span className="text-[10.5px] px-2 py-0.5 rounded-md bg-slate-50 text-slate-500 border border-slate-200">opcional</span>
                                )}
                                <div className={`flex items-center gap-1 text-[11.5px] tabular-nums shrink-0 ${task.late && !task.done ? "text-red-600 font-medium" : "text-slate-500"}`}>
                                  {task.late && !task.done ? <AlertTriangle size={12} /> : <Clock size={12} />}
                                  {task.due}
                                </div>
                              </div>

                              {taskOpen && (
                                <div className="px-5 pb-4 pt-2 bg-slate-50/60 border-t border-slate-100">
                                  <div className="grid grid-cols-2 gap-4 max-w-2xl ml-8">
                                    <div>
                                      <label className="text-[11px] font-medium text-slate-600 block mb-1">Data real de conclusão</label>
                                      <input type="date" value={task.realDate}
                                        onChange={(e) => updateTaskField(ph.id, idx, "realDate", e.target.value)}
                                        className="w-full text-[12.5px] px-2.5 py-1.5 border border-slate-200 rounded-md bg-white" />
                                    </div>
                                    <div className="flex items-end">
                                      <label className="inline-flex items-center gap-2 text-[12px] text-slate-700 cursor-pointer">
                                        <input type="checkbox" checked={task.forced}
                                          onChange={(e) => {
                                            updateTaskField(ph.id, idx, "forced", e.target.checked);
                                            if (e.target.checked) updateTaskField(ph.id, idx, "done", true);
                                          }}
                                          className="rounded border-slate-300" />
                                        Forçar como concluído
                                      </label>
                                    </div>
                                    <div className="col-span-2">
                                      <label className="text-[11px] font-medium text-slate-600 block mb-1">Observação</label>
                                      <textarea rows={2} value={task.obs}
                                        onChange={(e) => updateTaskField(ph.id, idx, "obs", e.target.value)}
                                        placeholder="Adicionar observação…"
                                        className="w-full text-[12.5px] px-2.5 py-1.5 border border-slate-200 rounded-md bg-white resize-none" />
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </section>

            <section className="rounded-xl bg-blue-50 border border-blue-100 px-6 py-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-white grid place-items-center text-blue-600">
                <Sparkles size={18} />
              </div>
              <div className="flex-1">
                <div className="text-[14px] font-semibold text-slate-900">Report semanal pronto para gerar</div>
                <div className="text-[12.5px] text-slate-600 mt-0.5">
                  Semana {week} · {totals.risk} {totals.risk === 1 ? "item" : "itens"} em risco · progresso {overallPct}%
                </div>
              </div>
              <button onClick={generateReport} disabled={generatingReport}
                className="text-[13px] px-3.5 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 font-medium inline-flex items-center gap-1.5 disabled:opacity-50">
                <Sparkles size={14} />{generatingReport ? "Gerando..." : "Gerar com IA"}
              </button>
            </section>

            {reportText && (
              <section className="grid grid-cols-2 gap-6">
                {[
                  { key: "whatsapp", label: "WhatsApp", text: reportText.whatsapp },
                  { key: "email", label: "E-mail", text: reportText.email },
                ].map((r) => (
                  <div key={r.key} className="bg-white border border-slate-200 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-[14px] font-semibold">{r.label}</h3>
                      <button onClick={() => copyText(r.text, r.key)}
                        className="text-[12px] text-blue-600 hover:underline flex items-center gap-1">
                        <Copy size={12} />{copied === r.key ? "Copiado!" : "Copiar"}
                      </button>
                    </div>
                    <pre className="text-[12px] text-slate-700 whitespace-pre-wrap font-sans leading-relaxed">{r.text}</pre>
                  </div>
                ))}
              </section>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

function MetricCard({ label, value, tone }) {
  const tones = { emerald: "text-emerald-600", amber: "text-amber-600", red: "text-red-600", slate: "text-slate-700" };
  const dots = { emerald: "bg-emerald-500", amber: "bg-amber-500", red: "bg-red-500", slate: "bg-slate-400" };
  return (
    <div className="bg-white border border-slate-200 rounded-xl px-5 py-4">
      <div className="flex items-center gap-1.5 text-[11.5px] text-slate-500 font-medium">
        <span className={`w-1.5 h-1.5 rounded-full ${dots[tone]}`} />{label}
      </div>
      <div className={`text-[26px] font-semibold mt-1 tabular-nums ${tones[tone]}`}>{value}</div>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    "Concluída": "bg-emerald-50 text-emerald-700 border-emerald-200",
    "Em andamento": "bg-amber-50 text-amber-700 border-amber-200",
    "Em risco": "bg-red-50 text-red-700 border-red-200",
    "Não iniciada": "bg-slate-50 text-slate-500 border-slate-200",
  };
  return (
    <span className={`text-[10.5px] font-medium px-2 py-0.5 rounded-full border ${map[status]} hidden md:inline-block`}>
      {status}
    </span>
  );
}