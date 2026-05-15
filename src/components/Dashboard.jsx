import { useState } from "react";

const CLIENT_ID = "31751";

function statusLabel(s) {
  if (s === "done") return "Concluído";
  if (s === "in_progress") return "Em andamento";
  return "Não iniciado";
}

export default function Dashboard({ storeId, token }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [gongNotes, setGongNotes] = useState("");
  const [manualNotes, setManualNotes] = useState("");
  const [report, setReport] = useState(null);

  async function runScan() {
    setLoading(true);
    setData(null);
    setReport(null);
    try {
      const res = await fetch(`/api/scan?store_id=${storeId}`);
      const json = await res.json();
      setData(json);
    } catch (e) {
      alert("Erro na varredura: " + e.message);
    }
    setLoading(false);
  }

  function generateReport() {
    if (!data) return;
    const { summary, categories, store, counts } = data;
    const today = new Date().toLocaleDateString("pt-BR");
    const doneCats = Object.values(categories).filter(c => c.status === "done").map(c => c.label);
    const inProg = Object.values(categories).filter(c => c.status === "in_progress").map(c => c.label);
    const pending = Object.values(categories).filter(c => c.status === "pending").map(c => c.label);

    const whats = `📊 *Status Report · ${store?.name}*\n${today}\n\n▸ Progresso: ${summary.pct}% (${summary.done}/${summary.total} áreas)\n▸ Produtos: ${counts?.productTotal} · Clientes: ${counts?.customerTotal}${doneCats.length ? "\n\n✅ Concluído: " + doneCats.join(", ") : ""}${inProg.length ? "\n🔄 Em andamento: " + inProg.join(", ") : ""}${pending.length ? "\n⏳ Pendente: " + pending.join(", ") : ""}${gongNotes ? "\n\n📋 Reunião: " + gongNotes : ""}${manualNotes ? "\n\n📝 Obs: " + manualNotes : ""}\n\n_Nuvem · Migration Team_`;

    const email = `Prezados, boa tarde!\n\nSegue o Status Report da loja ${store?.name} na Nuvemshop.\n\nProgresso: ${summary.pct}% — ${summary.done} de ${summary.total} áreas concluídas.\nProdutos: ${counts?.productTotal} | Clientes: ${counts?.customerTotal} | Frete: ${counts?.shippingTotal > 0 ? "Configurado" : "Pendente"} | Pagamentos: ${counts?.paymentCount > 0 ? "Configurado" : "Pendente"}${doneCats.length ? "\n\n✅ Concluído: " + doneCats.join(", ") : ""}${inProg.length ? "\n🔄 Em andamento: " + inProg.join(", ") : ""}${pending.length ? "\n⏳ Não iniciado: " + pending.join(", ") : ""}${gongNotes ? "\n\n📋 Reunião: " + gongNotes : ""}${manualNotes ? "\n\n📝 Obs: " + manualNotes : ""}\n\nAtenciosamente,\nNuvem · Migration Team`;

    setReport({ whats, email, today });
  }

  function copyText(text, btn) {
    navigator.clipboard.writeText(text).then(() => {
      const el = document.getElementById(btn);
      if (el) { el.textContent = "✅ Copiado!"; setTimeout(() => el.textContent = btn === "copyW" ? "📋 Copiar WhatsApp" : "✉️ Copiar e-mail", 2000); }
    });
  }

  const pct = data?.summary?.pct || 0;
  const pillCls = pct >= 60 ? "pill-ok" : pct >= 30 ? "pill-mid" : "pill-low";
  const pillLbl = pct >= 60 ? "No prazo" : pct >= 30 ? "Em andamento" : "Iniciando";

  return (
    <div className="app">
      <header className="header">
        <div className="header-left">
          <span className="logo-badge">Nuvem</span>
          <div>
            <div className="header-title">Migration Report</div>
            <div className="header-sub">varredura automática</div>
          </div>
        </div>
        <div className="header-right">
          {data && <span className="store-name">● {data.store?.name}</span>}
          <button className="btn-primary" onClick={runScan} disabled={loading}>
            {loading ? "Varrendo..." : "🔍 Varrer loja"}
          </button>
        </div>
      </header>

      <main className="main">
        {!data && !loading && (
          <div className="state-box">
            <h2>Pronto para varrer</h2>
            <p>Clique em <strong>"Varrer loja"</strong> para verificar o status atual da migração.</p>
          </div>
        )}

        {loading && (
          <div className="state-box">
            <div className="spinner" />
            <h2>Varrendo a loja...</h2>
            <p>Verificando produtos, categorias, clientes, frete e pagamentos.</p>
          </div>
        )}

        {data && (
          <>
            <div className="project-header">
              <div>
                <div className="project-name">Migração <span>{data.store?.name}</span></div>
                <div className="project-meta">
                  <span>{data.store?.country}</span>
                  <span>{data.store?.currency}</span>
                  <span>{data.store?.domain}</span>
                </div>
              </div>
              <span className={`pill ${pillCls}`}>{pillLbl}</span>
            </div>

            <div className="metrics-row">
              {[
                { label: "Categorias", value: data.summary.total, cls: "mv-total" },
                { label: "Concluídas", value: data.summary.done, cls: "mv-done" },
                { label: "Em andamento", value: data.summary.inProg, cls: "mv-mid" },
                { label: "Não iniciadas", value: data.summary.pending, cls: "mv-pending" },
                { label: "Progresso", value: data.summary.pct + "%", cls: "mv-pct" },
              ].map(m => (
                <div key={m.label} className="metric-cell">
                  <div className="metric-label">{m.label}</div>
                  <div className={`metric-value ${m.cls}`}>{m.value}</div>
                </div>
              ))}
            </div>

            <div className="progress-card">
              <div className="progress-header">
                <span>Progresso da migração</span>
                <span className="progress-pct">{data.summary.pct}%</span>
              </div>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: data.summary.pct + "%" }} />
              </div>
              <div className="scan-info">Varredura: {new Date(data.scannedAt).toLocaleString("pt-BR")}</div>
            </div>

            <div className="section-label">Status por área</div>
            <div className="cat-grid">
              {Object.values(data.categories).map(cat => (
                <div key={cat.label} className={`cat-card ${cat.status}`}>
                  <div className="cat-icon">{cat.icon}</div>
                  <div className="cat-info">
                    <div className="cat-name">{cat.label}</div>
                    <div className="cat-detail">{cat.detail}</div>
                  </div>
                  <span className={`cat-badge badge-${cat.status}`}>{statusLabel(cat.status)}</span>
                </div>
              ))}
            </div>

            <div className="notes-card">
              <div className="card-title">Pontos da reunião <span className="gong-tag">Gong</span></div>
              <textarea
                value={gongNotes}
                onChange={e => setGongNotes(e.target.value)}
                placeholder="Cole aqui os pontos da reunião do Gong..."
                rows={3}
              />
            </div>

            <div className="notes-card">
              <div className="card-title">Complemento manual</div>
              <textarea
                value={manualNotes}
                onChange={e => setManualNotes(e.target.value)}
                placeholder="Contexto extra: bloqueio do cliente, pendência externa..."
                rows={3}
              />
            </div>

            <div className="gen-row">
              <button className="btn-gen" onClick={generateReport}>⚡ Gerar report semanal</button>
            </div>

            {report && (
              <>
                <div className="section-label">Report gerado</div>
                <div className="output-card">
                  <div className="output-header">
                    <div>
                      <div className="output-title">Status Report · {data.store?.name}</div>
                      <div className="output-date">Gerado em {report.today}</div>
                    </div>
                    <span className={`pill ${pillCls}`}>{pillLbl}</span>
                  </div>
                  <div className="output-body">
                    {report.email.split("\n").map((line, i) => <p key={i}>{line}</p>)}
                  </div>
                </div>

                <div className="whats-card">
                  <div className="whats-hdr">
                    <div className="whats-icon">💬</div>
                    <div className="whats-title">Resumo WhatsApp</div>
                  </div>
                  <pre className="whats-body">{report.whats}</pre>
                </div>

                <div className="copy-row">
                  <button id="copyW" className="btn-outline" onClick={() => copyText(report.whats, "copyW")}>📋 Copiar WhatsApp</button>
                  <button id="copyE" className="btn-outline" onClick={() => copyText(report.email, "copyE")}>✉️ Copiar e-mail</button>
                </div>
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}