import type { ReconcileRow, ReconcileStatus, WhopPayment } from "../data/mock";
import { MCL_CLIENTS, WHOP_PAYMENTS } from "../data/mock";

function latestPaidByMember(): Map<string, WhopPayment> {
  const map = new Map<string, WhopPayment>();
  for (const p of WHOP_PAYMENTS) {
    if (p.status !== "paid") continue;
    const prev = map.get(p.memberId);
    if (!prev || p.paidAt > prev.paidAt) map.set(p.memberId, p);
  }
  return map;
}

function statusMessage(status: ReconcileStatus, lang: "es" | "en"): string {
  const es: Record<ReconcileStatus, string> = {
    matched: "Pago coincide con MCL",
    missing_payment: "Cliente activo sin pago WHOP este ciclo",
    orphan_payment: "Pago WHOP sin fila en MCL",
    amount_mismatch: "Monto WHOP no coincide con plan MCL",
    missing_whop_id: "MCL sin WHOP member ID",
    inactive_but_paid: "Cliente inactivo/pausado pero con pago reciente",
  };
  const en: Record<ReconcileStatus, string> = {
    matched: "Payment matches MCL",
    missing_payment: "Active client with no WHOP payment this cycle",
    orphan_payment: "WHOP payment with no MCL row",
    amount_mismatch: "WHOP amount does not match MCL plan",
    missing_whop_id: "MCL row missing WHOP member ID",
    inactive_but_paid: "Inactive/paused client with recent payment",
  };
  return (lang === "es" ? es : en)[status];
}

export function reconcileAll(lang: "es" | "en" = "en"): ReconcileRow[] {
  const paidByMember = latestPaidByMember();
  const usedPayments = new Set<string>();
  const rows: ReconcileRow[] = [];

  for (const client of MCL_CLIENTS) {
    if (!client.whopMemberId) {
      rows.push({
        key: client.id,
        status: "missing_whop_id",
        client,
        payment: null,
        expectedUsd: client.monthlyUsd,
        receivedUsd: null,
        deltaUsd: null,
        message: statusMessage("missing_whop_id", lang),
      });
      continue;
    }

    const payment = paidByMember.get(client.whopMemberId) ?? null;
    if (payment) usedPayments.add(payment.id);

    if (!payment && client.status === "active") {
      rows.push({
        key: client.id,
        status: "missing_payment",
        client,
        payment: null,
        expectedUsd: client.monthlyUsd,
        receivedUsd: null,
        deltaUsd: null,
        message: statusMessage("missing_payment", lang),
      });
      continue;
    }

    if (payment && client.status !== "active") {
      rows.push({
        key: client.id,
        status: "inactive_but_paid",
        client,
        payment,
        expectedUsd: client.monthlyUsd,
        receivedUsd: payment.amountUsd,
        deltaUsd: payment.amountUsd - client.monthlyUsd,
        message: statusMessage("inactive_but_paid", lang),
      });
      continue;
    }

    if (payment && payment.amountUsd !== client.monthlyUsd) {
      rows.push({
        key: client.id,
        status: "amount_mismatch",
        client,
        payment,
        expectedUsd: client.monthlyUsd,
        receivedUsd: payment.amountUsd,
        deltaUsd: payment.amountUsd - client.monthlyUsd,
        message: statusMessage("amount_mismatch", lang),
      });
      continue;
    }

    if (payment) {
      rows.push({
        key: client.id,
        status: "matched",
        client,
        payment,
        expectedUsd: client.monthlyUsd,
        receivedUsd: payment.amountUsd,
        deltaUsd: 0,
        message: statusMessage("matched", lang),
      });
    }
  }

  for (const payment of WHOP_PAYMENTS) {
    if (payment.status !== "paid" || usedPayments.has(payment.id)) continue;
    const inMcl = MCL_CLIENTS.some(c => c.whopMemberId === payment.memberId);
    if (!inMcl) {
      rows.push({
        key: payment.id,
        status: "orphan_payment",
        client: null,
        payment,
        expectedUsd: null,
        receivedUsd: payment.amountUsd,
        deltaUsd: null,
        message: statusMessage("orphan_payment", lang),
      });
    }
  }

  const order: ReconcileStatus[] = [
    "missing_whop_id",
    "missing_payment",
    "amount_mismatch",
    "orphan_payment",
    "inactive_but_paid",
    "matched",
  ];
  return rows.sort((a, b) => order.indexOf(a.status) - order.indexOf(b.status));
}

export function exportCsv(rows: ReconcileRow[]): string {
  const header = "status,agent,email,mcl_id,whop_member,expected_usd,received_usd,delta_usd,message";
  const lines = rows.map(r =>
    [
      r.status,
      r.client?.agentName ?? "",
      r.client?.email ?? r.payment?.email ?? "",
      r.client?.id ?? "",
      r.client?.whopMemberId ?? r.payment?.memberId ?? "",
      r.expectedUsd ?? "",
      r.receivedUsd ?? "",
      r.deltaUsd ?? "",
      `"${r.message.replace(/"/g, '""')}"`,
    ].join(",")
  );
  return [header, ...lines].join("\n");
}

export function summary(rows: ReconcileRow[]) {
  const issues = rows.filter(r => r.status !== "matched").length;
  const matched = rows.filter(r => r.status === "matched").length;
  const mrr = MCL_CLIENTS.filter(c => c.status === "active").reduce((s, c) => s + c.monthlyUsd, 0);
  return { issues, matched, total: rows.length, mrr, clients: MCL_CLIENTS.length };
}
