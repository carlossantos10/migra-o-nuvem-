import { useState } from "react";
import {
  RefreshCw, Sparkles, Package, FolderTree,
  Users, ShoppingCart, CreditCard, Truck,
} from "lucide-react";
import { connect, iAmReady, getStoreInfo } from "@tiendanube/nexo";
import nexo from "./nexoClient";

const iconMap = {
  products: Package,
  categories: FolderTree,
  customers: Users,
  orders: ShoppingCart,
  payments: CreditCard,
  shipping: Truck,
};

const statusConfig = {
  done: {
    label: "Concluído",
    pill: "bg-emerald-50 text-emerald-600 ring-emerald-600/10",
    bar: "bg-green-500",
  },
  in_progress: {
    label: "Em andamento",
    pill: "bg-amber-50 text-amber-600 ring-amber-600/10",
    bar: "bg-amber-400",
  },
  pending: {
    label: "Não iniciado",
    pill: "bg-slate-100 text-slate-400 ring-slate-200",
    bar: "bg-slate-100",
  },
};

export default function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [storeId, setStoreId] = useState(null);
  const [storeInfo, setStoreInfo] = useState(null);
  const [scanData, setScanData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [gong, setGong] = useState("");
  const [manual, setManual] = useState("");
  const [report, setReport] = useState(null);

  useState(() => {
    connect(nexo).then(async () => {
      try {
        const info = await getStoreInfo(nexo);
        setStoreId(info.id);
        setStoreInfo(info);
      } catch (e) {
        console.error(e);
      }
      setIsConnected(true);
      iAmReady(nexo);
    });
  }, []);

  async function runScan() {
    if (!storeId) return;
    setLoading(true);
    setScanData(null);
    setReport(null);
    try {
      const res = await fetch(`/api/scan?store_id=${storeId}`);
      const json = await res.json();
      setScanData(json);
    } catch (e) {
      alert("Erro na varredura: " + e.message);
    }
    setLoading(false);
  }

  function generateReport() {
    if (!scanData) return;
    const { summary, categories, store } = scanData;
    const today = new Date().toLocaleDateString("pt-BR");
    const doneCats = Object.values(categories).filter(c => c.status === "done").map(c => c.label);
    const inProg = Object.values(categories).filter(c => c.status === "in_progress").map(c => c.label);
    const pending = Object.values(categories).filter(c => c.status === "pending").map(c => c.label);

    const whats = `📊 *Status Report · ${store?.name}*\n${today}\n\n▸ Progresso: ${summary.pct}% (${summary.done}/${summary.total} áreas)${doneCats.length ? "\n\n✅ Concluído: " + doneCats.join(", ") : ""}${inProg.length ? "\n🔄 Em andamento: " + inProg.join(", ") : ""}${pending.length ? "\n⏳ Pendente: " + pending.join(", ") : ""}${gong ? "\n\n📋 Reunião: " + gong : ""}${manual ? "\n\n📝 Obs: " + manual : ""}`;

    const email = `Olá,\n\nSegue o status de migração da loja ${store?.name} referente a ${today}.\n\nProgresso atual: ${summary.pct}%\n${doneCats.length ? "\nConcluído: " + doneCats.join(", ") : ""}${inProg.length ? "\nEm andamento: " + inProg.join(", ") : ""}${pending.length ? "\nPendente: " + pending.join(", ") : ""}${gong ? "\n\nPontos da reunião:\n" + gong : ""}${manual ? "\n\nObservações:\n" + manual : ""}\n\nAtenciosamente,\nTime de Onboarding Nuvemshop`;

    setReport({ whats, email, today });
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-400">
          <RefreshCw className="size-4 animate-spin" />
          <span className="text-sm">Conectando...</span>
        </div>
      </div>
    );
  }

  const areas = scanData
    ? Object.entries(scanData.categories).map(([key, cat], i) => ({
        key,
        name: cat.label,
        detail: cat.detail,
        icon: iconMap[key] || Package,
        status: cat.status,
        progress: cat.status === "done" ? 100 : cat.status === "in_progress" ? 50 : 0,
        index: i + 1,
      }))
    : [];

  const total = areas.length || 6;
  const done = areas.filter(a => a.status === "done").length;
  const inProgress = areas.filter(a => a.status === "in_progress").length;
  const notStarted = areas.filter(a => a.status === "pending").length;
  const overall = scanData?.summary?.pct || 0;
  const storeName = scanData?.store?.name || storeInfo?.name || "Loja";
  const storeCountry = scanData?.store?.country || storeInfo?.country || "";

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 pb-12">
      <header className="bg-[#0F172A] text-white pt-8 pb-20 px-6 lg:px-8">
        <div className="max-w-6xl mx-auto flex flex-wrap gap-6 justify-between items-start">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-white/10 rounded-lg">
                <div className="size-5 border-2 border-white/80 rounded-sm flex items-center justify-center font-bold text-[10px]">M</div>
              </div>
              <h1 className="text-xl font-semibold tracking-tight">Migration Hub</h1>
              <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-bold uppercase tracking-wider border border-blue-500/30">Onboarding</span>
            </div>
            <p className="text-slate-400 text-sm">Varredura automática em tempo real</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
              <span className="flex items-center gap-2 text-sm font-medium bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
                <span className="size-2 bg-green-400 rounded-full animate-pulse" />
                {storeName} · {storeCountry}
              </span>
              {scanData && (
                <span className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest">
                  Varredura: {new Date(scanData.scannedAt).toLocaleString("pt-BR")}
                </span>
              )}
            </div>
            <button onClick={runScan} disabled={loading}
              className="bg-white/10 hover:bg-white/20 transition-colors px-4 py-2 rounded-lg text-sm font-medium border border-white/10 flex items-center gap-2 disabled:opacity-50">
              <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
              {loading ? "Varrendo..." : "Varrer loja"}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 lg:px-8 -mt-12">
        <div className="grid grid-cols-12 gap-6 mb-6">
          <div className="col-span-12 md:col-span-4 bg-white rounded-2xl p-6 shadow-sm border border-slate-200/60">
            <div className="flex justify-between items-end mb-4">
              <div>
                <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Progresso geral</span>
                <div className="text-4xl font-bold text-[#0F172A] mt-1">{overall}%</div>
              </div>
              <span className="text-sm font-medium text-slate-400">{done} de {total} etapas</span>
            </div>
            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-[#0070F3] rounded-full transition-all duration-700" style={{ width: `${overall}%` }} />
            </div>
          </div>
          <div className="col-span-12 md:col-span-8 bg-white rounded-2xl p-6 shadow-sm border border-slate-200/60 flex items-center justify-between divide-x divide-slate-100">
            {[
              { value: total, label: "Áreas avaliadas", color: "text-[#0F172A]" },
              { value: done, label: "Concluídas", color: "text-green-500" },
              { value: inProgress, label: "Em andamento", color: "text-amber-400" },
              { value: notStarted, label: "Não iniciadas", color: "text-slate-300" },
            ].map(s => (
              <div key={s.label} className="flex-1 px-4 lg:px-6 first:pl-0 last:pr-0">
                <div className={`text-2xl font-bold tabular-nums ${s.color}`}>{s.value}</div>
                <div className="text-[11px] text-slate-400 font-medium uppercase tracking-wider mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden mb-6">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-semibold text-slate-800">Checklist de migração</h2>
            <span className="text-xs text-slate-400">{total} áreas · sincronizadas via API</span>
          </div>
          {!scanData && !loading && (
            <div className="p-12 text-center text-slate-400">
              <p className="text-sm">Clique em <strong className="text-slate-600">Varrer loja</strong> para carregar os dados</p>
            </div>
          )}
          {loading && (
            <div className="p-12 text-center text-slate-400 flex flex-col items-center gap-3">
              <RefreshCw className="size-5 animate-spin" />
              <p className="text-sm">Varrendo produtos, categorias, clientes, frete e pagamentos...</p>
            </div>
          )}
          {scanData && (
            <ul className="divide-y divide-slate-50">
              {areas.map((area, i) => {
                const cfg = statusConfig[area.status] || statusConfig.pending;
                const Icon = area.icon;
                return (
                  <li key={area.key} className="p-4 px-6 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="size-10 rounded-xl bg-slate-50 border border-slate-100 grid place-items-center shrink-0">
                        <span className="text-[11px] font-semibold tabular-nums text-slate-400">{String(i + 1).padStart(2, "0")}</span>
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <Icon className="size-4 text-slate-400" />
                          <h3 className="font-medium text-sm text-slate-700 truncate">{area.name}</h3>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">{area.detail}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-8">
                      <div className="hidden sm:block w-32 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${cfg.bar}`} style={{ width: `${area.progress}%` }} />
                      </div>
                      <span className={`w-28 text-center px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-tight ring-1 ring-inset ${cfg.pill}`}>
                        {cfg.label}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { label: "Resumo reunião Gong", placeholder: "Cole os insights e decisões da reunião...", value: gong, onChange: setGong },
            { label: "Bloqueios & pendências", placeholder: "Descreva impedimentos externos ou técnicos...", value: manual, onChange: setManual },
          ].map(f => (
            <div key={f.label} className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">{f.label}</label>
              <textarea value={f.value} onChange={e => f.onChange(e.target.value)} placeholder={f.placeholder}
                className="w-full h-32 p-4 bg-white rounded-xl border border-slate-200 focus:border-[#0070F3] focus:ring-2 focus:ring-blue-500/10 outline-none transition-all text-sm resize-none placeholder:text-slate-300" />
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap gap-4 items-center justify-between bg-slate-900/5 p-6 rounded-2xl border border-dashed border-slate-300">
          <p className="text-sm font-medium italic text-slate-500">Tudo pronto para consolidar os dados da semana.</p>
          <button onClick={generateReport} disabled={!scanData}
            className="flex items-center gap-2 bg-[#0070F3] hover:brightness-110 text-white px-8 py-3 rounded-xl font-semibold shadow-lg shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-40">
            <Sparkles className="size-4" />
            Gerar relatório semanal
          </button>
        </div>

        {report && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-800">Resumo WhatsApp</h3>
                <button onClick={() => navigator.clipboard.writeText(report.whats)}
                  className="text-xs text-[#0070F3] font-medium hover:underline">Copiar</button>
              </div>
              <pre className="text-xs text-slate-600 whitespace-pre-wrap font-sans leading-relaxed">{report.whats}</pre>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-800">E-mail</h3>
                <button onClick={() => navigator.clipboard.writeText(report.email)}
                  className="text-xs text-[#0070F3] font-medium hover:underline">Copiar</button>
              </div>
              <pre className="text-xs text-slate-600 whitespace-pre-wrap font-sans leading-relaxed">{report.email}</pre>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}