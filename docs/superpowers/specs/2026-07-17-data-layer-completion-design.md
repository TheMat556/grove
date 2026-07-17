# Complete Data Layer for All Tables

**Date:** 2026-07-17
**Branch:** feat/schema-zod-data-layer
**Status:** Design approved, not yet implemented

## 1. Scope

- Typed CRUD data-access modules for every remaining table (17 total, 3 exist).
- Integration tests per module (pattern: `saison.integration.test.ts`).
- Postgres RPCs for composite writes (verkauf+positionen, wareneingang+positionen).
- Auth helper for server-side current-user injection.
- No UI, no forms, no RLS in this pass.

## 2. Architecture

### 2.1 Module Classification

**A — Standard createCrud modules (6):**
`kunde`, `stand`, `preisempfehlung`, `reservierung`, `inventur`, `einsatz`

All use existing `createCrud()` factory from `lib/data/crud.ts`. Auto-inherit `getBySaisonId()` when Row has `saison_id`. Follow `standort.ts`/`saison.ts` patterns exactly.

**B — Special modules (4):**
- `profil` — `id` == `auth.users.id`, explicit id on insert, omit `erstellt_am`
- `stand-saison` — composite PK (`stand_id`, `saison_id`), no `id` column → hand-written CRUD
- `verkauf` — header via createCrud + RPC `create_verkauf_mit_positionen`
- `wareneingang` — header via createCrud + RPC `create_wareneingang_mit_positionen`

**C — Line-item tables (2):**
`tb_position`, `tb_wareneingangsposition` — no standalone module. Written only through RPCs. Optional read helper in parent module.

### 2.2 Auth Helper

New file: `lib/data/session.ts` (imports `server-only`)

```typescript
export async function getCurrentProfilId(): Promise<string>
export async function getCurrentProfil(): Promise<Row<"tb_profil">>
```

Uses `createClient()` from `lib/supabase/server.ts`. Profil-dependent creates call this internally — `profil_id`/`erfasst_von` never client-supplied.

## 3. Schema Fixes (pre-implementation)

1. **`lib/schemas/stand.ts`** — change `.omit({ id, standort_id })` → `.omit({ id })`. `standort_id` is NOT NULL, must survive `.parse()`.
2. **`lib/schemas/einsatz.ts`** — split into plain `einsatzInsertSchema` (no refine) + `einsatzCreateSchema` (with `zeitraumGueltig` refine). `createCrud.update()` calls `insertSchema.partial()` which fails on refined schemas.
3. **`lib/schemas/profil.ts`** — omit `erstellt_am` from insert schema (DB default).

## 4. RPC Migrations

Two new SQL migrations:

- `supabase/migrations/00017_fn_create_verkauf_mit_positionen.sql`
  - `create_verkauf_mit_positionen(p_verkauf jsonb, p_positionen jsonb) RETURNS tb_verkauf`
  - Inserts header row, then each position with the new `verkauf_id`. Single implicit tx.
  - Returns the inserted header row.

- `supabase/migrations/00018_fn_create_wareneingang_mit_positionen.sql`
  - `create_wareneingang_mit_positionen(p_kopf jsonb, p_positionen jsonb) RETURNS tb_wareneingang`
  - Analogous structure.

Hand-edit `lib/supabase/database.types.ts` Functions section for typed `supabase.rpc()` calls.

## 5. Integration Tests

One `*.integration.test.ts` per module in `lib/data/__tests__/`. Pattern:

- `createTestClient()` from `lib/supabase/test.ts`
- `afterAll` cleanup via `createdIds` tracking
- Service-role client for setup/teardown

**Saison-dependent tests:** create parent `tb_saison` (and `tb_standort`/`tb_stand`, `tb_produkt`, `tb_kunde` as needed). Clean up in reverse FK order.

**Assertions:** create returns row with defaults; `getBySaisonId` filters correctly; RPCs create header + N positions atomically and roll back on bad input (e.g. `menge <= 0`).

**Auth-dependent modules:** tests insert `tb_profil` row directly (service role), pass its id explicitly. `getCurrentProfilId()` unit test deferred.

## 6. Execution Order

| Phase | Work | Verification |
|-------|------|-------------|
| 1 | Schema fixes (stand, einsatz, profil) | `tsc --noEmit` |
| 2 | Auth helper `session.ts` | `tsc --noEmit` |
| 3 | 7 standard modules + tests | `tsc --noEmit`, tests green |
| 4 | profil, stand-saison + tests | `tsc --noEmit`, tests green |
| 5 | RPCs + verkauf/wareneingang + tests | `tsc --noEmit`, tests green |
| 6 | Full verification | `biome check --write`, `bun run test:integration` |

## 7. Open Follow-ups (out of scope)

- No DB trigger creates `tb_profil` on signup; app code must call `createProfil` after `auth.signUp()`.
- UI/forms for these tables is a separate pass.
- RLS is disabled (seed.sql grants full access). Revisit when policies land.
