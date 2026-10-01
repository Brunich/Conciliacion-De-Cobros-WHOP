# Conciliación de cobros WHOP

> **In English:** React dashboard that checks the Master Client List against WHOP payments and flags billing mismatches (missing id, missing payment, wrong amount, orphan payments). Mock data included.

Tablero en React que cruza la lista maestra de clientes (MCL) con los pagos de WHOP y marca lo que no cuadra antes de que el cliente se vaya.

Trae datos de prueba, así que puedes revisar los casos sin llaves de API.

## Cómo correrlo

```bash
npm install
npm run dev       # http://localhost:5173
npm run build
npm run preview
```

El idioma (ES / EN) se cambia en el pie de página y se guarda en `localStorage`.

## Estados

| Estado | Qué significa |
|-------|---------|
| `matched` | Cliente activo, con id de WHOP y el monto coincide con su plan |
| `missing_whop_id` | Fila activa de la MCL sin `whopMemberId` |
| `missing_payment` | Cliente activo sin cobro pagado en este ciclo |
| `amount_mismatch` | Lo pagado ≠ `monthlyUsd` de su fila en la MCL |
| `orphan_payment` | Pago de WHOP sin un `memberId` que coincida en la MCL |
| `inactive_but_paid` | Cliente en pausa o dado de baja con un cobro reciente |

Solo cuenta el último pago `paid` de cada `memberId`. Los `failed` y `refunded` se ignoran.

## La lógica, corta

```
por cada fila de la MCL:
  sin whopMemberId      → missing_whop_id
  activo, sin pago      → missing_payment
  inactivo + pago       → inactive_but_paid
  monto distinto        → amount_mismatch
  si no                 → matched

pagos de WHOP sin usar  → orphan_payment
```

Código: [`src/lib/reconcile.ts`](./src/lib/reconcile.ts)  
Datos de prueba: [`src/data/mock.ts`](./src/data/mock.ts), con 7 clientes, 8 cobros y algunos errores puestos a propósito.

## Interfaz

- Tarjetas de resumen: cuántos cuadran, cuántos tienen problema, tamaño de la MCL y MRR activo
- Filtro: todos / solo problemas / solo los que cuadran
- Tabla con lo esperado contra lo recibido y la diferencia
- Exportar a CSV

## Estructura

```
src/
  data/mock.ts
  lib/reconcile.ts
  i18n.ts
  App.tsx
```

## Falta

- Conectar la API de WHOP y leer la MCL desde Sheets o Airtable
- Correrlo solo cada cierto tiempo o con un webhook después de cada pago
- Avisar por Slack o correo cuando haya problemas

## Stack

React 19 · TypeScript · Vite

## Licencia

[MIT](LICENSE). Úsalo, cámbialo y compártelo; sólo conserva el aviso de copyright.
