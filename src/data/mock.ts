export type MclClient = {
  id: string;
  agentName: string;
  email: string;
  plan: "growth" | "premium";
  monthlyUsd: number;
  whopMemberId: string | null;
  status: "active" | "paused" | "churned";
  onboardedAt: string;
};

export type WhopPayment = {
  id: string;
  memberId: string;
  email: string;
  amountUsd: number;
  status: "paid" | "failed" | "refunded";
  paidAt: string;
  product: string;
};

export type ReconcileStatus =
  | "matched"
  | "missing_payment"
  | "orphan_payment"
  | "amount_mismatch"
  | "missing_whop_id"
  | "inactive_but_paid";

export type ReconcileRow = {
  key: string;
  status: ReconcileStatus;
  client: MclClient | null;
  payment: WhopPayment | null;
  expectedUsd: number | null;
  receivedUsd: number | null;
  deltaUsd: number | null;
  message: string;
};

export const MCL_CLIENTS: MclClient[] = [
  { id: "MCL-001", agentName: "Maria Elena Torres", email: "maria.torres@example.com", plan: "premium", monthlyUsd: 1497, whopMemberId: "whop_mem_8f3a21", status: "active", onboardedAt: "2026-05-02" },
  { id: "MCL-002", agentName: "Carlos Mendoza", email: "carlos.m@example.com", plan: "growth", monthlyUsd: 997, whopMemberId: "whop_mem_91bc44", status: "active", onboardedAt: "2026-04-18" },
  { id: "MCL-003", agentName: "Ana Lucía Rivas", email: "ana.rivas@example.com", plan: "premium", monthlyUsd: 1497, whopMemberId: null, status: "active", onboardedAt: "2026-06-01" },
  { id: "MCL-004", agentName: "James Walker", email: "j.walker@example.com", plan: "growth", monthlyUsd: 997, whopMemberId: "whop_mem_aa1100", status: "paused", onboardedAt: "2026-03-10" },
  { id: "MCL-005", agentName: "Sofia Herrera", email: "sofia.h@example.com", plan: "growth", monthlyUsd: 997, whopMemberId: "whop_mem_cc8822", status: "active", onboardedAt: "2026-05-28" },
  { id: "MCL-006", agentName: "Diego Alvarez", email: "diego.a@example.com", plan: "premium", monthlyUsd: 1497, whopMemberId: "whop_mem_dd0033", status: "active", onboardedAt: "2026-06-12" },
  { id: "MCL-007", agentName: "Patricia Gómez", email: "patricia.g@example.com", plan: "growth", monthlyUsd: 997, whopMemberId: "whop_mem_ee7744", status: "churned", onboardedAt: "2026-01-20" },
];

export const WHOP_PAYMENTS: WhopPayment[] = [
  { id: "WP-1001", memberId: "whop_mem_8f3a21", email: "maria.torres@example.com", amountUsd: 1497, status: "paid", paidAt: "2026-06-01", product: "Premium Plan" },
  { id: "WP-1002", memberId: "whop_mem_91bc44", email: "carlos.m@example.com", amountUsd: 997, status: "paid", paidAt: "2026-06-01", product: "Growth Plan" },
  { id: "WP-1003", memberId: "whop_mem_aa1100", email: "j.walker@example.com", amountUsd: 997, status: "paid", paidAt: "2026-06-01", product: "Growth Plan" },
  { id: "WP-1004", memberId: "whop_mem_cc8822", email: "sofia.h@example.com", amountUsd: 897, status: "paid", paidAt: "2026-06-01", product: "Growth Plan" },
  { id: "WP-1005", memberId: "whop_mem_dd0033", email: "diego.a@example.com", amountUsd: 1497, status: "paid", paidAt: "2026-06-01", product: "Premium Plan" },
  { id: "WP-1006", memberId: "whop_mem_orphan01", email: "unknown.agent@example.com", amountUsd: 997, status: "paid", paidAt: "2026-06-03", product: "Growth Plan" },
  { id: "WP-1007", memberId: "whop_mem_ee7744", email: "patricia.g@example.com", amountUsd: 997, status: "paid", paidAt: "2026-06-01", product: "Growth Plan" },
  { id: "WP-1008", memberId: "whop_mem_91bc44", email: "carlos.m@example.com", amountUsd: 997, status: "failed", paidAt: "2026-06-15", product: "Growth Plan" },
];
