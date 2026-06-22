import { useMemo, useState } from "react";
import { STRINGS, type Lang } from "./i18n";
import { exportCsv, reconcileAll, summary } from "./lib/reconcile";
import type { ReconcileStatus } from "./data/mock";
import "./index.css";

type Filter = "all" | "issues" | "matched";

const STATUS_CLASS: Record<ReconcileStatus, string> = {
  matched: "badge ok",
  missing_payment: "badge err",
  orphan_payment: "badge warn",
  amount_mismatch: "badge warn",
  missing_whop_id: "badge err",
  inactive_but_paid: "badge warn",
};

function App() {
  const [lang, setLang] = useState<Lang>(() =>
    (localStorage.getItem("wmr_lang") as Lang) || "en"
  );
  const [filter, setFilter] = useState<Filter>("all");

  const t = STRINGS[lang];
  const rows = useMemo(() => reconcileAll(lang), [lang]);
  const stats = useMemo(() => summary(rows), [rows]);

  const visible = rows.filter(r => {
    if (filter === "issues") return r.status !== "matched";
    if (filter === "matched") return r.status === "matched";
    return true;
  });

  const setLanguage = (next: Lang) => {
    setLang(next);
    localStorage.setItem("wmr_lang", next);
    document.documentElement.lang = next;
  };

  const downloadCsv = () => {
    const blob = new Blob([exportCsv(rows)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `whop-mcl-reconcile-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="app">
      <header className="header">
        <div>
          <h1>{t.title}</h1>
          <p>{t.subtitle}</p>
        </div>
        <button type="button" className="btn primary" onClick={downloadCsv}>{t.export}</button>
      </header>

      <section className="cards">
        <div className="card"><span className="label">{t.matched}</span><strong className="ok">{stats.matched}</strong></div>
        <div className="card"><span className="label">{t.issues}</span><strong className="err">{stats.issues}</strong></div>
        <div className="card"><span className="label">{t.mclClients}</span><strong>{stats.clients}</strong></div>
        <div className="card"><span className="label">{t.activeMrr}</span><strong>${stats.mrr.toLocaleString()}</strong></div>
      </section>

      <section className="filters">
        {(["all", "issues", "matched"] as Filter[]).map(f => (
          <button key={f} type="button" className={`chip ${filter === f ? "active" : ""}`} onClick={() => setFilter(f)}>
            {f === "all" ? t.filterAll : f === "issues" ? t.filterIssues : t.filterMatched}
          </button>
        ))}
      </section>

      <section className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>{t.colStatus}</th>
              <th>{t.colAgent}</th>
              <th>{t.colEmail}</th>
              <th>{t.colPlan}</th>
              <th>{t.colExpected}</th>
              <th>{t.colReceived}</th>
              <th>{t.colDelta}</th>
              <th>{t.colMessage}</th>
            </tr>
          </thead>
          <tbody>
            {visible.map(row => (
              <tr key={row.key}>
                <td><span className={STATUS_CLASS[row.status]}>{t.statuses[row.status]}</span></td>
                <td>{row.client?.agentName ?? "—"}</td>
                <td>{row.client?.email ?? row.payment?.email ?? "—"}</td>
                <td>{row.client?.plan ?? "—"}</td>
                <td>{row.expectedUsd != null ? `$${row.expectedUsd}` : "—"}</td>
                <td>{row.receivedUsd != null ? `$${row.receivedUsd}` : "—"}</td>
                <td className={row.deltaUsd && row.deltaUsd !== 0 ? "warn-text" : ""}>
                  {row.deltaUsd != null ? (row.deltaUsd === 0 ? "$0" : `$${row.deltaUsd}`) : "—"}
                </td>
                <td className="msg">{row.message}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <footer className="lang-bar">
        <button type="button" className={lang === "es" ? "lang active" : "lang"} onClick={() => setLanguage("es")}>Español</button>
        <button type="button" className={lang === "en" ? "lang active" : "lang"} onClick={() => setLanguage("en")}>English</button>
      </footer>
    </div>
  );
}

export default App;
