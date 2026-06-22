# WHOP · MCL Reconciliation Dashboard

Dashboard para operaciones de billing: compara la **Master Client List (MCL)** contra pagos de **WHOP** y señala discrepancias antes de que se conviertan en churn o revenue perdido.

**Autor:** Bruno Salas Rodriguez

---

## Qué resuelve

En una agencia con decenas de agentes, la MCL (Google Sheets / Airtable) y WHOP (membresías) se desincronizan fácilmente. Este dashboard responde:

- ¿Quién pagó pero no está en la MCL?
- ¿Quién está activo en MCL pero no pagó este ciclo?
- ¿El monto de WHOP coincide con el plan en MCL?
- ¿Hay clientes inactivos que siguen pagando?

---

## Inicio rápido

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # build de producción
npm run preview   # previsualizar build
```

UI bilingüe: botones **Español / English** en la barra inferior. La preferencia se guarda en `localStorage`.

---

## Estados de reconciliación

| Estado | Significado | Ejemplo en datos demo |
|--------|-------------|----------------------|
| **OK (matched)** | Cliente activo, WHOP ID presente, monto = plan MCL | Maria Torres ($1497 premium) |
| **Sin WHOP ID** | Fila MCL activa sin `whopMemberId` | Ana Lucía Rivas |
| **Sin pago** | Cliente activo en MCL, sin pago WHOP en el ciclo | *(ninguno en demo — Carlos sí pagó)* |
| **Monto** | Pago recibido ≠ `monthlyUsd` del plan | Sofia Herrera ($897 vs $997 esperado) |
| **Huérfano** | Pago WHOP sin fila MCL con ese `memberId` | unknown.agent@example.com |
| **Inactivo + pago** | Cliente pausado/churned pero con pago reciente | James Walker (paused) / Patricia Gómez (churned) |

Los pagos `failed` o `refunded` se ignoran; solo cuenta el último pago `paid` por `memberId`.

---

## Lógica (resumen)

```
Para cada fila MCL:
  ├─ Sin whopMemberId → missing_whop_id
  ├─ Activo sin pago WHOP → missing_payment
  ├─ Inactivo con pago → inactive_but_paid
  ├─ Monto distinto → amount_mismatch
  └─ Todo cuadra → matched

Para cada pago WHOP paid no usado:
  └─ Sin MCL con ese memberId → orphan_payment
```

Implementación en [`src/lib/reconcile.ts`](./src/lib/reconcile.ts). Datos de prueba en [`src/data/mock.ts`](./src/data/mock.ts) — 7 clientes MCL y 8 pagos WHOP con errores intencionales.

---

## Funciones del dashboard

- **Tarjetas resumen:** coincidencias, problemas, total MCL, MRR activo
- **Filtros:** todos / solo problemas / solo OK
- **Tabla:** agente, email, plan, esperado vs recibido, delta, mensaje
- **Export CSV:** reporte completo para compartir con ops o contabilidad

---

## Estructura

```
src/
  data/mock.ts       # MCL + WHOP de demo
  lib/reconcile.ts   # Motor de reconciliación + CSV
  i18n.ts            # Strings ES/EN
  App.tsx            # UI
  index.css          # Estilos dark dashboard
```

---

## Próximo paso (producción)

- Conectar API WHOP + export MCL (Sheets/Airtable)
- Cron diario o webhook post-pago
- Alertas Slack/email cuando `issues > 0`
- Deploy en Vercel (`npm run build` → static)

---

## Stack

React 19 · TypeScript · Vite

---

## Relacionado

Encaja con **[agency-onboarding-automation](../agency-onboarding-automation)**: al hacer onboarding se captura `whopMemberId` y se encola reconciliación. Maria Torres (`AGT-20481` / `whop_mem_8f3a21`) aparece en ambos proyectos como caso OK.
