import React, { useState, useEffect } from "react";
import {
  AlertCircle,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  Zap,
  Terminal,
  Activity,
  ArrowUpRight,
  RefreshCw,
  Cpu,
  Layers,
  Lock,
  ExternalLink,
  Filter
} from "lucide-react";

export default function App() {
  const [metrics, setMetrics] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [selectedTxn, setSelectedTxn] = useState(null);
  const [filterStatus, setFilterStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchDashboard = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/dashboard");
      const data = await res.json();
      setMetrics(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const url = filterStatus
        ? `http://localhost:8000/api/transactions?status=${filterStatus}`
        : "http://localhost:8000/api/transactions";
      const res = await fetch(url);
      const data = await res.json();
      setTransactions(data);
      if (selectedTxn) {
        const updated = data.find((t) => t.id === selectedTxn.id);
        if (updated) setSelectedTxn(updated);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
    fetchTransactions();
  }, [filterStatus]);

  const selectTransaction = async (id) => {
    try {
      const res = await fetch(`http://localhost:8000/api/transactions/${id}`);
      const data = await res.json();
      setSelectedTxn(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAnalyze = async (id) => {
    try {
      setActionLoading(true);
      await fetch(`http://localhost:8000/api/recovery/${id}/analyze`, { method: "POST" });
      await selectTransaction(id);
      await fetchDashboard();
      await fetchTransactions();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleExecute = async (id) => {
    try {
      setActionLoading(true);
      await fetch(`http://localhost:8000/api/recovery/${id}/execute`, { method: "POST" });
      await selectTransaction(id);
      await fetchDashboard();
      await fetchTransactions();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSimulateOutcome = async (id, outcome) => {
    try {
      setActionLoading(true);
      await fetch(`http://localhost:8000/api/recovery/${id}/result`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: outcome })
      });
      await selectTransaction(id);
      await fetchDashboard();
      await fetchTransactions();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSimulateBatch = async () => {
    try {
      setActionLoading(true);
      await fetch("http://localhost:8000/api/recovery/simulate-batch", { method: "POST" });
      await fetchDashboard();
      await fetchTransactions();
      if (selectedTxn) await selectTransaction(selectedTxn.id);
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "RECOVERED":
        return "bg-emerald-950/80 text-emerald-400 border-emerald-500/30";
      case "RECOVERING":
        return "bg-sky-950/80 text-sky-400 border-sky-500/30 animate-pulse";
      case "STOPPED":
        return "bg-rose-950/80 text-rose-400 border-rose-500/30";
      case "ESCALATED":
        return "bg-amber-950/80 text-amber-400 border-amber-500/30";
      default:
        return "bg-zinc-900 text-zinc-400 border-zinc-700";
    }
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-zinc-200 font-sans selection:bg-sky-500 selection:text-black">
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[150px] bg-sky-500/10 blur-[120px] pointer-events-none" />

      <header className="border-b border-zinc-800/80 bg-[#0a0d14]/90 backdrop-blur-md px-6 py-3.5 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center shadow-lg shadow-sky-500/20 ring-1 ring-sky-300/30">
            <Zap className="w-5 h-5 text-zinc-950 fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-base font-extrabold tracking-tight text-white uppercase">
                Razor<span className="text-sky-400">Recovery</span>.OS
              </span>
              <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                ACTIVE MONITOR
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 font-mono">AUTONOMOUS DISPATCH & GUARDRAILED RUNTIME</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchTransactions}
            className="p-2 rounded-lg border border-zinc-800 bg-zinc-900/80 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200 transition"
            title="Refresh Ledger"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={handleSimulateBatch}
            disabled={actionLoading}
            className="relative group overflow-hidden rounded-lg p-[1px] font-mono text-xs font-semibold uppercase disabled:opacity-50"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-sky-500 via-indigo-500 to-sky-500 rounded-lg group-hover:opacity-100 transition duration-300"></span>
            <span className="relative block px-4 py-2 bg-zinc-950 rounded-lg text-sky-400 group-hover:bg-opacity-80 transition">
              Run Batch Simulation (50 Txns)
            </span>
          </button>
        </div>
      </header>

      {metrics && (
        <section className="p-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative overflow-hidden rounded-xl border border-zinc-800/80 bg-gradient-to-b from-zinc-900/60 to-[#0c0f17] p-4">
            <div className="flex justify-between items-center text-xs font-mono text-zinc-500 uppercase tracking-wider">
              <span>Capital at Risk</span>
              <AlertCircle className="w-4 h-4 text-amber-500" />
            </div>
            <div className="mt-2 font-mono text-2xl font-bold text-white tracking-tight">
              INR {metrics.revenue_at_risk.toLocaleString()}
            </div>
            <div className="mt-2 text-[11px] text-zinc-400 flex items-center justify-between font-mono">
              <span>{metrics.total_failed} Dropped Checkouts</span>
              <span className="text-amber-400/80">Pending Action</span>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-xl border border-emerald-500/20 bg-gradient-to-b from-emerald-950/20 to-[#0c0f17] p-4">
            <div className="flex justify-between items-center text-xs font-mono text-emerald-400 uppercase tracking-wider">
              <span>Recovered Revenue</span>
              <ArrowUpRight className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="mt-2 font-mono text-2xl font-bold text-emerald-400 tracking-tight">
              INR {metrics.revenue_recovered.toLocaleString()}
            </div>
            <div className="mt-2 text-[11px] text-zinc-400 flex items-center justify-between font-mono">
              <span>{metrics.successful_recoveries} Salvaged</span>
              <span className="text-emerald-400">Captured</span>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-xl border border-zinc-800/80 bg-gradient-to-b from-zinc-900/60 to-[#0c0f17] p-4">
            <div className="flex justify-between items-center text-xs font-mono text-zinc-500 uppercase tracking-wider">
              <span>Salvage Efficiency</span>
              <Activity className="w-4 h-4 text-sky-400" />
            </div>
            <div className="mt-2 font-mono text-2xl font-bold text-white tracking-tight">
              {metrics.recovery_rate}%
            </div>
            <div className="mt-2 text-[11px] text-zinc-400 flex items-center justify-between font-mono">
              <span>{metrics.recovery_attempts} Automated Retries</span>
              <span className="text-sky-400">Conversion Rate</span>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-xl border border-rose-500/20 bg-gradient-to-b from-rose-950/20 to-[#0c0f17] p-4">
            <div className="flex justify-between items-center text-xs font-mono text-rose-400 uppercase tracking-wider">
              <span>Guardrail Invocations</span>
              <ShieldAlert className="w-4 h-4 text-rose-400" />
            </div>
            <div className="mt-2 font-mono text-2xl font-bold text-rose-400 tracking-tight">
              {metrics.stopped}
            </div>
            <div className="mt-2 text-[11px] text-zinc-400 flex items-center justify-between font-mono">
              <span>Max Limits & Ceilings</span>
              <span className="text-rose-400">Safety Tripped</span>
            </div>
          </div>
        </section>
      )}

      <main className="flex-1 px-6 pb-6 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-hidden">
        <section className="lg:col-span-5 border border-zinc-800/80 bg-[#0a0d14] rounded-xl flex flex-col h-[calc(100vh-270px)] overflow-hidden shadow-2xl">
          <div className="px-4 py-3 border-b border-zinc-800/80 bg-zinc-900/40 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-sky-400" />
              <span className="font-mono text-xs font-semibold uppercase tracking-wider text-zinc-300">
                Transaction Stream
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-zinc-500" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-zinc-950 border border-zinc-800 text-[11px] font-mono rounded px-2 py-1 text-zinc-300 focus:outline-none focus:border-sky-500"
              >
                <option value="">ALL STATUSES</option>
                <option value="FAILED">FAILED (AWAITING ACTION)</option>
                <option value="RECOVERING">RECOVERING</option>
                <option value="RECOVERED">RECOVERED</option>
                <option value="STOPPED">STOPPED</option>
                <option value="ESCALATED">ESCALATED</option>
              </select>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-zinc-900/90 font-mono">
            {loading ? (
              <div className="p-8 text-center text-zinc-600 text-xs font-mono">Reading event stream...</div>
            ) : transactions.length === 0 ? (
              <div className="p-8 text-center text-zinc-600 text-xs font-mono">Zero events under selected filter.</div>
            ) : (
              transactions.map((t) => {
                const isSelected = selectedTxn?.id === t.id;
                return (
                  <div
                    key={t.id}
                    onClick={() => selectTransaction(t.id)}
                    className={`px-4 py-3 cursor-pointer transition-colors duration-150 flex items-center justify-between border-l-2 ${
                      isSelected
                        ? "bg-sky-500/10 border-sky-400"
                        : "border-transparent hover:bg-zinc-900/50"
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{t.id}</span>
                        <span
                          className={`text-[9px] px-1.5 py-0.2 rounded font-bold border uppercase tracking-wider ${getStatusBadge(
                            t.status
                          )}`}
                        >
                          {t.status}
                        </span>
                      </div>
                      <div className="text-[11px] text-zinc-400 mt-1 flex items-center gap-2">
                        <span className="text-zinc-500">{t.customer_id}</span>
                        <span>-</span>
                        <span className="uppercase text-[10px] text-zinc-300">{t.payment_method}</span>
                        <span>-</span>
                        <span className="text-rose-400/90 text-[10px]">{t.failure_reason}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-bold text-zinc-100">INR {t.amount.toLocaleString()}</div>
                      <div className="text-[10px] text-zinc-500 mt-0.5">Attempt {t.attempt_count}/2</div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        <section className="lg:col-span-7 border border-zinc-800/80 bg-[#0a0d14] rounded-xl p-5 flex flex-col h-[calc(100vh-270px)] overflow-y-auto shadow-2xl">
          {selectedTxn ? (
            <div className="space-y-6">
              <div className="flex items-start justify-between border-b border-zinc-800/80 pb-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-mono font-bold text-white">{selectedTxn.id}</h2>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold border uppercase ${getStatusBadge(
                        selectedTxn.status
                      )}`}
                    >
                      {selectedTxn.status}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 font-mono mt-1">Customer Identifier: {selectedTxn.customer_id}</p>
                </div>
                <div className="text-right">
                  <div className="text-xs font-mono text-zinc-500 uppercase">Gross Transaction Value</div>
                  <div className="text-2xl font-mono font-extrabold text-sky-400">
                    INR {selectedTxn.amount.toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950/70">
                <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider mb-3">
                  Autonomous Execution Stepper
                </div>
                <div className="grid grid-cols-4 gap-2">
                  <div className="border-t-2 border-emerald-500 pt-2">
                    <span className="text-[10px] font-mono text-emerald-400 font-bold block">01. CAPTURE</span>
                    <span className="text-[11px] text-zinc-300 font-mono">Failure Detected</span>
                  </div>
                  <div
                    className={`border-t-2 pt-2 ${
                      selectedTxn.decisions?.length > 0 ? "border-emerald-500" : "border-zinc-700"
                    }`}
                  >
                    <span
                      className={`text-[10px] font-mono font-bold block ${
                        selectedTxn.decisions?.length > 0 ? "text-emerald-400" : "text-zinc-600"
                      }`}
                    >
                      02. AI DIAGNOSTIC
                    </span>
                    <span className="text-[11px] text-zinc-400 font-mono">
                      {selectedTxn.decisions?.length > 0 ? "Inferred Action" : "Pending"}
                    </span>
                  </div>
                  <div
                    className={`border-t-2 pt-2 ${
                      selectedTxn.recovery_attempts?.length > 0 ? "border-emerald-500" : "border-zinc-700"
                    }`}
                  >
                    <span
                      className={`text-[10px] font-mono font-bold block ${
                        selectedTxn.recovery_attempts?.length > 0 ? "text-emerald-400" : "text-zinc-600"
                      }`}
                    >
                      03. POLICY VERIFY
                    </span>
                    <span className="text-[11px] text-zinc-400 font-mono">
                      {selectedTxn.recovery_attempts?.length > 0 ? "Boundaries Evaluated" : "Waiting"}
                    </span>
                  </div>
                  <div
                    className={`border-t-2 pt-2 ${
                      selectedTxn.status === "RECOVERED"
                        ? "border-emerald-500"
                        : selectedTxn.status === "STOPPED" || selectedTxn.status === "ESCALATED"
                        ? "border-rose-500"
                        : "border-zinc-700"
                    }`}
                  >
                    <span
                      className={`text-[10px] font-mono font-bold block ${
                        selectedTxn.status === "RECOVERED"
                          ? "text-emerald-400"
                          : selectedTxn.status === "STOPPED" || selectedTxn.status === "ESCALATED"
                          ? "text-rose-400"
                          : "text-zinc-600"
                      }`}
                    >
                      04. SETTLEMENT
                    </span>
                    <span className="text-[11px] text-zinc-400 font-mono">{selectedTxn.status}</span>
                  </div>
                </div>
              </div>

              <div className="border border-zinc-800 rounded-xl p-4 bg-zinc-950/60 relative">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-sky-400" />
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-200">
                      AI Diagnostic Engine
                    </span>
                  </div>
                  {selectedTxn.decisions?.length > 0 && (
                    <span className="text-[11px] font-mono bg-sky-950/80 border border-sky-500/30 text-sky-300 px-2 py-0.5 rounded">
                      Confidence: {(selectedTxn.decisions[0].confidence * 100).toFixed(0)}%
                    </span>
                  )}
                </div>

                {selectedTxn.decisions?.length > 0 ? (
                  <div className="space-y-3 text-xs font-mono">
                    <div className="grid grid-cols-2 gap-4 bg-zinc-900/60 p-3 rounded-lg border border-zinc-800/80">
                      <div>
                        <span className="text-zinc-500 block text-[10px] uppercase">Root Cause</span>
                        <span className="text-zinc-200 font-semibold">{selectedTxn.decisions[0].diagnosis}</span>
                      </div>
                      <div>
                        <span className="text-zinc-500 block text-[10px] uppercase">Recommended Tactic</span>
                        <span className="text-sky-400 font-bold">{selectedTxn.decisions[0].recommended_action}</span>
                      </div>
                      <div>
                        <span className="text-zinc-500 block text-[10px] uppercase">Estimated Salvage Prob</span>
                        <span className="text-emerald-400 font-bold">
                          {(selectedTxn.decisions[0].recovery_probability * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div>
                        <span className="text-zinc-500 block text-[10px] uppercase">Classification Tier</span>
                        <span className="text-zinc-300 font-semibold">{selectedTxn.decisions[0].recoverability}</span>
                      </div>
                    </div>
                    <p className="text-[11px] text-zinc-400 italic bg-zinc-900/30 p-2.5 rounded border-l-2 border-sky-400">
                      {selectedTxn.decisions[0].reason}
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center justify-between py-2">
                    <span className="text-xs font-mono text-zinc-500">Autonomous diagnostic pending execution.</span>
                    <button
                      onClick={() => handleAnalyze(selectedTxn.id)}
                      disabled={actionLoading}
                      className="px-3 py-1.5 rounded-lg border border-sky-500/30 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 text-xs font-mono font-semibold transition disabled:opacity-50"
                    >
                      Invoke Diagnostic
                    </button>
                  </div>
                )}
              </div>

              <div className="border border-zinc-800 rounded-xl p-4 bg-zinc-950/60">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-200">
                      Deterministic Guardrails & Dispatch
                    </span>
                  </div>
                </div>

                {selectedTxn.recovery_attempts?.length > 0 ? (
                  <div className="space-y-3 font-mono">
                    {selectedTxn.recovery_attempts.map((att, i) => (
                      <div key={i} className="border border-zinc-800/80 bg-zinc-900/50 p-3 rounded-lg text-xs">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-zinc-300 font-semibold">Attempt #{att.attempt_number}</span>
                          <span
                            className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase ${
                              att.policy_result === "APPROVED"
                                ? "bg-emerald-950 text-emerald-400 border-emerald-500/40"
                                : "bg-rose-950 text-rose-400 border-rose-500/40"
                            }`}
                          >
                            Policy: {att.policy_result}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-400 mb-3">{att.policy_reason}</p>

                        {att.payment_link_url && (
                          <div className="pt-3 border-t border-zinc-800 flex items-center justify-between">
                            <a
                              href={att.payment_link_url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-sky-400 hover:text-sky-300 flex items-center gap-1.5 text-xs font-semibold underline underline-offset-4"
                            >
                              Open Razorpay Payment Link <ExternalLink className="w-3 h-3" />
                            </a>
                            {att.status === "PENDING" && (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleSimulateOutcome(selectedTxn.id, "SUCCESS")}
                                  className="bg-emerald-600 hover:bg-emerald-500 text-zinc-950 px-2.5 py-1 rounded text-[11px] font-bold uppercase transition"
                                >
                                  Mark Paid
                                </button>
                                <button
                                  onClick={() => handleSimulateOutcome(selectedTxn.id, "FAILED")}
                                  className="bg-rose-600 hover:bg-rose-500 text-white px-2.5 py-1 rounded text-[11px] font-bold uppercase transition"
                                >
                                  Mark Expired
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-between py-2">
                    <span className="text-xs font-mono text-zinc-500">
                      Deterministic safety bounds not yet evaluated.
                    </span>
                    <button
                      onClick={() => handleExecute(selectedTxn.id)}
                      disabled={actionLoading}
                      className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-mono font-bold transition disabled:opacity-50"
                    >
                      Evaluate & Dispatch
                    </button>
                  </div>
                )}
              </div>

              <div className="border border-zinc-800 rounded-xl p-4 bg-zinc-950/80">
                <div className="flex items-center gap-2 mb-3">
                  <Terminal className="w-4 h-4 text-zinc-400" />
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400">
                    Immutable Audit Log
                  </span>
                </div>
                <div className="space-y-2 max-h-36 overflow-y-auto pr-2 font-mono text-[11px]">
                  {selectedTxn.audit_events?.map((ev, i) => (
                    <div key={i} className="border-l border-zinc-700 pl-3 py-0.5 text-zinc-400">
                      <div className="flex items-center gap-2">
                        <span className="text-sky-400 font-bold">{ev.actor}</span>
                        <span className="text-zinc-600">-</span>
                        <span className="text-zinc-300">{ev.event_type}</span>
                      </div>
                      <p className="text-zinc-500 mt-0.5">{ev.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-zinc-600 font-mono text-xs">
              <Layers className="w-8 h-8 mb-2 text-zinc-700 animate-pulse" />
              Select an event from the transaction stream to inspect execution states.
            </div>
          )}
        </section>
      </main>
    </div>
  );
}