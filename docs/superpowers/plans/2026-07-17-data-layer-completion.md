# Data Layer Completion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete typed CRUD data-access modules and integration tests for all 17 tables.

**Architecture:** Each table gets a module in `lib/data/` using `createCrud()` factory from `lib/data/crud.ts`. Schema-fix pre-work unblocks the factory. Auth helper `session.ts` serves profil_id for auth-dependent tables. Atomic composite writes (verkauf+positionen, wareneingang+positionen) via Postgres RPC.

**Tech Stack:** Next.js 19, Supabase, Zod 4, Vitest, TypeScript

## Global Constraints

- Every module reuses `createCrud()` from `lib/data/crud.ts` unless explicitly noted (stand-saison, profil)
- Tables with `saison_id` column auto-inherit `getBySaisonId` from `createCrud()` via conditional type
- German error labels matching table domain
- Integration tests use `createTestClient()` from `lib/supabase/test.ts`, service-role client
- Run `bun run test:integration` (sequential, `--no-file-parallelism`)
- Run `npx tsc --noEmit` and `npx biome check --write` after each phase

---

### Task 1: Fix stand.ts schema (omit standort_id bug)

**Files:**
- Modify: `lib/schemas/stand.ts`

**Interfaces:**
- Consumes: none
- Produces: `standInsertSchema` now includes `standort_id` (NOT NULL column survives `.parse()`)

- [ ] **Read current file**

```bash
cat lib/schemas/stand.ts
```

- [ ] **Fix the omit call**

Change:
```ts
export const standInsertSchema = standSchema.omit({
	id: true,
	standort_id: true
});
```
To:
```ts
export const standInsertSchema = standSchema.omit({ id: true });
```

- [ ] **Verify no type errors**

Run: `npx tsc --noEmit`
Expected: 0 errors

- [ ] **Commit**

```bash
git add lib/schemas/stand.ts
git commit -m "fix: stand insertSchema must keep standort_id (NOT NULL)"
```

---

### Task 2: Fix einsatz.ts schema (split into three-tier pattern)

**Files:**
- Modify: `lib/schemas/einsatz.ts`

**Interfaces:**
- Consumes: none
- Produces: `einsatzInsertSchema` (no refine) + `einsatzCreateSchema` (with refine). `createCrud.update()` can now call `.partial()` safely.

- [ ] **Read current file**

```bash
cat lib/schemas/einsatz.ts
```

- [ ] **Rewrite with three-tier pattern**

Replace the entire file with:
```ts
import { z } from "zod";
import { dateSchema, uuidSchema } from "@/lib/schemas/common";

export const einsatzSchema = z.object({
	id: uuidSchema,
	saison_id: uuidSchema,
	stand_id: uuidSchema,
	profil_id: uuidSchema,
	von: dateSchema,
	bis: dateSchema.nullable(),
});

/** Basis ohne Refinements – sicher für .partial() in createCrud.update(). */
export const einsatzInsertSchema = einsatzSchema.omit({ id: true });

/** Anlegen mit zusätzlicher feldübergreifender Regel: bis >= von. */
export const einsatzCreateSchema = einsatzInsertSchema.refine(
	(e) => e.bis === null || e.bis >= e.von,
	{ message: "Enddatum darf nicht vor dem Startdatum liegen.", path: ["bis"] },
);

export type Einsatz = z.infer<typeof einsatzSchema>;
export type EinsatzInsert = z.infer<typeof einsatzInsertSchema>;
```

- [ ] **Verify**

Run: `npx tsc --noEmit`
Expected: 0 errors

- [ ] **Commit**

```bash
git add lib/schemas/einsatz.ts
git commit -m "fix: split einsatz schema into insert (plain) + create (with refine)"
```

---

### Task 3: Fix profil.ts schema (omit erstellt_am)

**Files:**
- Modify: `lib/schemas/profil.ts`

**Interfaces:**
- Consumes: none
- Produces: `profilInsertSchema` now omits `erstellt_am` (DB default)

- [ ] **Read current file and fix**

```bash
cat lib/schemas/profil.ts
```

Change the omit to include `erstellt_am`:
```ts
export const profilInsertSchema = profilSchema.omit({
	id: true,
	erstellt_am: true,
});
```

- [ ] **Verify**

Run: `npx tsc --noEmit`
Expected: 0 errors

- [ ] **Commit**

```bash
git add lib/schemas/profil.ts
git commit -m "fix: omit erstellt_am from profil insert (DB default)"
```

---

### Task 4: Create auth helper (session.ts)

**Files:**
- Create: `lib/data/session.ts`

**Interfaces:**
- Consumes: `createClient()` from `lib/supabase/server.ts`
- Produces: `getCurrentProfilId(): Promise<string>`, `getCurrentProfil(): Promise<Row<"tb_profil">>`

- [ ] **Create the file**

```ts
import "server-only";
import { createClient } from "@/lib/supabase/server";

/**
 * Liefert die aktuell angemeldete Benutzer-ID (auth.users.id = tb_profil.id).
 * Wirft, wenn kein Benutzer angemeldet ist.
 */
export async function getCurrentProfilId(): Promise<string> {
	const supabase = await createClient();
	const { data, error } = await supabase.auth.getUser();

	if (error || !data.user) {
		throw new Error("Nicht angemeldet.");
	}

	return data.user.id;
}

/**
 * Liefert das vollständige tb_profil des aktuellen Benutzers.
 */
export async function getCurrentProfil(): Promise<Record<string, unknown>> {
	const supabase = await createClient();
	const profileId = await getCurrentProfilId();

	const { data, error } = await supabase
		.from("tb_profil")
		.select("*")
		.eq("id", profileId)
		.single();

	if (error || !data) {
		throw new Error("Profil konnte nicht geladen werden.");
	}

	return data as Record<string, unknown>;
}
```

- [ ] **Verify**

Run: `npx tsc --noEmit`
Expected: 0 errors

- [ ] **Commit**

```bash
git add lib/data/session.ts
git commit -m "feat: add auth helper for server-side current user"
```

---

### Task 5: Create kunde.ts module + integration test

**Files:**
- Create: `lib/data/kunde.ts`
- Create: `lib/data/__tests__/kunde.integration.test.ts`

**Interfaces:**
- Consumes: `createCrud`, `kundeInsertSchema`
- Produces: `getKunden`, `getKunde`, `createKunde`, `updateKunde`, `deleteKunde`

- [ ] **Create the module**

```ts
import { createCrud } from "@/lib/data/crud";
import { kundeInsertSchema } from "@/lib/schemas/kunde";

const TABLE = "tb_kunde";

const crud = createCrud({
	table: TABLE,
	insertSchema: kundeInsertSchema,
	labels: { singular: "Kunde", plural: "Kunden" },
	orderBy: { column: "name" },
});

export const getKunden = crud.getAll;
export const getKunde = crud.getById;
export const createKunde = crud.create;
export const updateKunde = crud.update;
export const deleteKunde = crud.remove;
```

- [ ] **Create the integration test**

```ts
// @vitest-environment node
import { afterAll, describe, expect, it } from "vitest";
import { createTestClient } from "@/lib/supabase/test";

function uid() {
	return Math.random().toString(36).slice(2, 8);
}

const supabase = createTestClient();
const createdIds: string[] = [];

afterAll(async () => {
	if (createdIds.length > 0) {
		await supabase.from("tb_kunde").delete().in("id", createdIds);
	}
});

async function createKunde(overrides: Partial<Record<string, unknown>> = {}) {
	const { data, error } = await supabase
		.from("tb_kunde")
		.insert({
			name: `test-${uid()}`,
			telefon: "123456789",
			adresse: "Teststr. 1, 12345 Teststadt",
			ist_firma: false,
			...overrides,
		})
		.select()
		.single();

	if (error) throw error;
	createdIds.push(data.id);
	return data;
}

describe("tb_kunde CRUD", () => {
	it("creates kunde with defaults", async () => {
		const kunde = await createKunde();
		expect(kunde.ist_firma).toBe(false);
	});

	it("creates kunde as firm", async () => {
		const kunde = await createKunde({ ist_firma: true });
		expect(kunde.ist_firma).toBe(true);
	});

	it("reads all kunden", async () => {
		const created = await createKunde();
		const { data, error } = await supabase.from("tb_kunde").select("*");
		expect(error).toBeNull();
		expect(data?.some((k) => k.id === created.id)).toBe(true);
	});

	it("updates kunde name", async () => {
		const kunde = await createKunde();
		const { data, error } = await supabase
			.from("tb_kunde")
			.update({ name: `updated-${uid()}` })
			.eq("id", kunde.id)
			.select()
			.single();
		expect(error).toBeNull();
		expect(data?.name).not.toBe(kunde.name);
	});

	it("deletes kunde", async () => {
		const kunde = await createKunde();
		const { error } = await supabase
			.from("tb_kunde")
			.delete()
			.eq("id", kunde.id);
		expect(error).toBeNull();
	});
});
```

- [ ] **Verify**

Run: `npx tsc --noEmit`
Expected: 0 errors

Run: `npx biome check --write lib/data/kunde.ts lib/data/__tests__/kunde.integration.test.ts`
Expected: clean

- [ ] **Commit**

```bash
git add lib/data/kunde.ts lib/data/__tests__/kunde.integration.test.ts
git commit -m "feat: add kunde data module + integration test"
```

---

### Task 6: Create stand.ts module + integration test

**Files:**
- Create: `lib/data/stand.ts`
- Create: `lib/data/__tests__/stand.integration.test.ts`

**Depends on:** Task 1 (stand schema fix)

**Interfaces:**
- Consumes: `createCrud`, `standInsertSchema`
- Produces: `getStande`, `getStand`, `createStand`, `updateStand`, `deleteStand`
- Note: requires parent `tb_standort` in tests

- [ ] **Create the module**

```ts
import { createCrud } from "@/lib/data/crud";
import { standInsertSchema } from "@/lib/schemas/stand";

const TABLE = "tb_stand";

const crud = createCrud({
	table: TABLE,
	insertSchema: standInsertSchema,
	labels: { singular: "Stand", plural: "Stände" },
	orderBy: { column: "bezeichnung" },
});

export const getStande = crud.getAll;
export const getStand = crud.getById;
export const createStand = crud.create;
export const updateStand = crud.update;
export const deleteStand = crud.remove;
```

- [ ] **Create the integration test**

```ts
// @vitest-environment node
import { afterAll, describe, expect, it } from "vitest";
import { createTestClient } from "@/lib/supabase/test";

function uid() {
	return Math.random().toString(36).slice(2, 8);
}

const supabase = createTestClient();
const createdStandortIds: string[] = [];
const createdStandIds: string[] = [];

afterAll(async () => {
	if (createdStandIds.length > 0) {
		await supabase.from("tb_stand").delete().in("id", createdStandIds);
	}
	if (createdStandortIds.length > 0) {
		await supabase.from("tb_standort").delete().in("id", createdStandortIds);
	}
});

async function createStandort() {
	const { data, error } = await supabase
		.from("tb_standort")
		.insert({
			plz: 12345,
			ort: `Testort-${uid()}`,
			adresse: "Teststr. 1",
		})
		.select()
		.single();
	if (error) throw error;
	createdStandortIds.push(data.id);
	return data;
}

async function createStand(standortId: string, overrides: Partial<Record<string, unknown>> = {}) {
	const { data, error } = await supabase
		.from("tb_stand")
		.insert({
			standort_id: standortId,
			bezeichnung: `test-${uid()}`,
			...overrides,
		})
		.select()
		.single();
	if (error) throw error;
	createdStandIds.push(data.id);
	return data;
}

describe("tb_stand CRUD", () => {
	it("creates stand with standort", async () => {
		const standort = await createStandort();
		const stand = await createStand(standort.id);
		expect(stand.standort_id).toBe(standort.id);
	});

	it("reads all stande", async () => {
		const standort = await createStandort();
		const created = await createStand(standort.id);
		const { data, error } = await supabase.from("tb_stand").select("*");
		expect(error).toBeNull();
		expect(data?.some((s) => s.id === created.id)).toBe(true);
	});

	it("updates stand bezeichnung", async () => {
		const standort = await createStandort();
		const stand = await createStand(standort.id);
		const { data, error } = await supabase
			.from("tb_stand")
			.update({ bezeichnung: `updated-${uid()}` })
			.eq("id", stand.id)
			.select()
			.single();
		expect(error).toBeNull();
		expect(data?.bezeichnung).not.toBe(stand.bezeichnung);
	});

	it("deletes stand", async () => {
		const standort = await createStandort();
		const stand = await createStand(standort.id);
		const { error } = await supabase.from("tb_stand").delete().eq("id", stand.id);
		expect(error).toBeNull();
	});
});
```

- [ ] **Verify**

Run: `npx tsc --noEmit`
Expected: 0 errors

- [ ] **Commit**

```bash
git add lib/data/stand.ts lib/data/__tests__/stand.integration.test.ts
git commit -m "feat: add stand data module + integration test"
```

---

### Task 7: Create preisempfehlung.ts module + integration test

**Files:**
- Create: `lib/data/preisempfehlung.ts`
- Create: `lib/data/__tests__/preisempfehlung.integration.test.ts`

**Interfaces:**
- Consumes: `createCrud`, `preisempfehlungInsertSchema`
- Produces: `getPreisempfehlungen`, `getPreisempfehlung`, `createPreisempfehlung`, `updatePreisempfehlung`, `deletePreisempfehlung`, `getPreisempfehlungenBySaisonId` (auto)

- [ ] **Create the module**

```ts
import { createCrud } from "@/lib/data/crud";
import { preisempfehlungInsertSchema } from "@/lib/schemas/preisempfehlung";

const TABLE = "tb_preisempfehlung";

const crud = createCrud({
	table: TABLE,
	insertSchema: preisempfehlungInsertSchema,
	labels: { singular: "Preisempfehlung", plural: "Preisempfehlungen" },
});

export const getPreisempfehlungen = crud.getAll;
export const getPreisempfehlung = crud.getById;
export const getPreisempfehlungenBySaisonId = crud.getBySaisonId;
export const createPreisempfehlung = crud.create;
export const updatePreisempfehlung = crud.update;
export const deletePreisempfehlung = crud.remove;
```

- [ ] **Create the integration test**

```ts
// @vitest-environment node
import { afterAll, describe, expect, it } from "vitest";
import { createTestClient } from "@/lib/supabase/test";

function uid() {
	return Math.random().toString(36).slice(2, 8);
}

const supabase = createTestClient();
const createdSaisonIds: string[] = [];
const createdProduktIds: string[] = [];
const createdIds: string[] = [];

afterAll(async () => {
	if (createdIds.length > 0) {
		await supabase.from("tb_preisempfehlung").delete().in("id", createdIds);
	}
	if (createdProduktIds.length > 0) {
		await supabase.from("tb_produkt").delete().in("id", createdProduktIds);
	}
	if (createdSaisonIds.length > 0) {
		await supabase.from("tb_saison").delete().in("id", createdSaisonIds);
	}
});

async function createSaison() {
	const { data, error } = await supabase
		.from("tb_saison")
		.insert({ name: `test-${uid()}`, start_datum: "2026-01-01", end_datum: "2026-12-31" })
		.select()
		.single();
	if (error) throw error;
	createdSaisonIds.push(data.id);
	return data;
}

async function createProdukt() {
	const { data, error } = await supabase
		.from("tb_produkt")
		.insert({ art: "Baum", bezeichnung: `test-${uid()}`, von_cm: 100, bis_cm: 150 })
		.select()
		.single();
	if (error) throw error;
	createdProduktIds.push(data.id);
	return data;
}

async function createPreisempfehlung(saisonId: string, produktId: string, overrides: Partial<Record<string, unknown>> = {}) {
	const { data, error } = await supabase
		.from("tb_preisempfehlung")
		.insert({ saison_id: saisonId, produkt_id: produktId, preis: 10.0, ...overrides })
		.select()
		.single();
	if (error) throw error;
	createdIds.push(data.id);
	return data;
}

describe("tb_preisempfehlung CRUD", () => {
	it("creates preisempfehlung with preis", async () => {
		const saison = await createSaison();
		const produkt = await createProdukt();
		const pe = await createPreisempfehlung(saison.id, produkt.id);
		expect(pe.preis).toBe(10.0);
	});

	it("getBySaisonId returns only matching rows", async () => {
		const s1 = await createSaison();
		const s2 = await createSaison();
		const p = await createProdukt();
		await createPreisempfehlung(s1.id, p.id);
		await createPreisempfehlung(s2.id, p.id);

		const { data } = await supabase.from("tb_preisempfehlung").select("*").eq("saison_id", s1.id);
		expect(data?.length).toBe(1);
	});

	it("deletes preisempfehlung", async () => {
		const saison = await createSaison();
		const produkt = await createProdukt();
		const pe = await createPreisempfehlung(saison.id, produkt.id);
		const { error } = await supabase.from("tb_preisempfehlung").delete().eq("id", pe.id);
		expect(error).toBeNull();
	});
});
```

- [ ] **Verify**

Run: `npx tsc --noEmit`

- [ ] **Commit**

```bash
git add lib/data/preisempfehlung.ts lib/data/__tests__/preisempfehlung.integration.test.ts
git commit -m "feat: add preisempfehlung data module + integration test"
```

---

### Task 8: Create reservierung.ts module + integration test

**Files:**
- Create: `lib/data/reservierung.ts`
- Create: `lib/data/__tests__/reservierung.integration.test.ts`

**Interfaces:**
- Consumes: `createCrud`, `reservierungInsertSchema`
- Produces: CRUD + `getReservierungenBySaisonId` (auto). Profile ID passed explicitly (not via session in tests).

- [ ] **Create the module**

```ts
import { createCrud } from "@/lib/data/crud";
import { reservierungInsertSchema } from "@/lib/schemas/reservierung";

const TABLE = "tb_reservierung";

const crud = createCrud({
	table: TABLE,
	insertSchema: reservierungInsertSchema,
	labels: { singular: "Reservierung", plural: "Reservierungen" },
});

export const getReservierungen = crud.getAll;
export const getReservierung = crud.getById;
export const getReservierungenBySaisonId = crud.getBySaisonId;
export const createReservierung = crud.create;
export const updateReservierung = crud.update;
export const deleteReservierung = crud.remove;
```

- [ ] **Create the integration test**

```ts
// @vitest-environment node
import { afterAll, describe, expect, it } from "vitest";
import { createTestClient } from "@/lib/supabase/test";

function uid() {
	return Math.random().toString(36).slice(2, 8);
}

const supabase = createTestClient();
const createdIds: Record<string, string[]> = {
	tb_profil: [],
	tb_saison: [],
	tb_standort: [],
	tb_stand: [],
	tb_kunde: [],
	tb_reservierung: [],
};

afterAll(async () => {
	const order = ["tb_reservierung", "tb_kunde", "tb_stand", "tb_standort", "tb_saison", "tb_profil"];
	for (const table of order) {
		const ids = createdIds[table];
		if (ids.length > 0) {
			await supabase.from(table).delete().in("id", ids);
		}
	}
});

async function createParentSaison() {
	const { data, error } = await supabase
		.from("tb_saison")
		.insert({ name: `test-${uid()}`, start_datum: "2026-01-01", end_datum: "2026-12-31" })
		.select()
		.single();
	if (error) throw error;
	createdIds.tb_saison.push(data.id);
	return data;
}

async function createParentStandort() {
	const { data, error } = await supabase
		.from("tb_standort")
		.insert({ plz: 12345, ort: `Testort-${uid()}`, adresse: "Teststr. 1" })
		.select()
		.single();
	if (error) throw error;
	createdIds.tb_standort.push(data.id);
	return data;
}

async function createParentStand(standortId: string) {
	const { data, error } = await supabase
		.from("tb_stand")
		.insert({ standort_id: standortId, bezeichnung: `test-${uid()}` })
		.select()
		.single();
	if (error) throw error;
	createdIds.tb_stand.push(data.id);
	return data;
}

async function createParentKunde() {
	const { data, error } = await supabase
		.from("tb_kunde")
		.insert({ name: `test-${uid()}`, telefon: "123456789", adresse: "Teststr. 1", ist_firma: false })
		.select()
		.single();
	if (error) throw error;
	createdIds.tb_kunde.push(data.id);
	return data;
}

async function createParentProfil() {
	const { data, error } = await supabase
		.from("tb_profil")
		.insert({ id: crypto.randomUUID(), name: `test-${uid()}`, telefon: null, rolle: "mitarbeiter", aktiv: true })
		.select()
		.single();
	if (error) throw error;
	createdIds.tb_profil.push(data.id);
	return data;
}

describe("tb_reservierung CRUD", () => {
	it("creates reservierung with default status", async () => {
		const saison = await createParentSaison();
		const standort = await createParentStandort();
		const stand = await createParentStand(standort.id);
		const kunde = await createParentKunde();
		const profil = await createParentProfil();

		const { data, error } = await supabase
			.from("tb_reservierung")
			.insert({
				saison_id: saison.id,
				stand_id: stand.id,
				profil_id: profil.id,
				kunde_id: kunde.id,
				versandart: "abholung",
				geplantes_datum: "2026-12-01",
			})
			.select()
			.single();

		expect(error).toBeNull();
		expect(data?.status).toBe("offen");
		createdIds.tb_reservierung.push(data.id);
	});

	it("getBySaisonId returns only matching rows", async () => {
		const s1 = await createParentSaison();
		const s2 = await createParentSaison();
		const standort = await createParentStandort();
		const stand = await createParentStand(standort.id);
		const kunde = await createParentKunde();
		const profil = await createParentProfil();

		const { data: r1 } = await supabase.from("tb_reservierung").insert({
			saison_id: s1.id, stand_id: stand.id, profil_id: profil.id,
			kunde_id: kunde.id, versandart: "abholung", geplantes_datum: "2026-12-01",
		}).select().single();
		createdIds.tb_reservierung.push(r1.id);

		const { data: r2 } = await supabase.from("tb_reservierung").insert({
			saison_id: s2.id, stand_id: stand.id, profil_id: profil.id,
			kunde_id: kunde.id, versandart: "abholung", geplantes_datum: "2026-12-01",
		}).select().single();
		createdIds.tb_reservierung.push(r2.id);

		const { data } = await supabase.from("tb_reservierung").select("*").eq("saison_id", s1.id);
		expect(data?.length).toBe(1);
		expect(data?.[0].id).toBe(r1.id);
	});
});
```

- [ ] **Verify**

Run: `npx tsc --noEmit`

- [ ] **Commit**

```bash
git add lib/data/reservierung.ts lib/data/__tests__/reservierung.integration.test.ts
git commit -m "feat: add reservierung data module + integration test"
```

---

### Task 9: Create inventur.ts module + integration test

**Files:**
- Create: `lib/data/inventur.ts`
- Create: `lib/data/__tests__/inventur.integration.test.ts`

**Interfaces:**
- Consumes: `createCrud`, `inventurInsertSchema`
- Produces: CRUD + `getInventurenBySaisonId` (auto)

- [ ] **Create the module**

```ts
import { createCrud } from "@/lib/data/crud";
import { inventurInsertSchema } from "@/lib/schemas/inventur";

const TABLE = "tb_inventur";

const crud = createCrud({
	table: TABLE,
	insertSchema: inventurInsertSchema,
	labels: { singular: "Inventur", plural: "Inventuren" },
});

export const getInventuren = crud.getAll;
export const getInventur = crud.getById;
export const getInventurenBySaisonId = crud.getBySaisonId;
export const createInventur = crud.create;
export const updateInventur = crud.update;
export const deleteInventur = crud.remove;
```

- [ ] **Create the integration test**

```ts
// @vitest-environment node
import { afterAll, describe, expect, it } from "vitest";
import { createTestClient } from "@/lib/supabase/test";

function uid() {
	return Math.random().toString(36).slice(2, 8);
}

const supabase = createTestClient();
const createdIds: Record<string, string[]> = {
	tb_profil: [],
	tb_saison: [],
	tb_standort: [],
	tb_stand: [],
	tb_produkt: [],
	tb_inventur: [],
};

afterAll(async () => {
	const order = ["tb_inventur", "tb_produkt", "tb_stand", "tb_standort", "tb_saison", "tb_profil"];
	for (const table of order) {
		const ids = createdIds[table];
		if (ids.length > 0) {
			await supabase.from(table).delete().in("id", ids);
		}
	}
});

async function createSaison() {
	const { data, error } = await supabase.from("tb_saison")
		.insert({ name: `test-${uid()}`, start_datum: "2026-01-01", end_datum: "2026-12-31" })
		.select().single();
	if (error) throw error;
	createdIds.tb_saison.push(data.id);
	return data;
}

async function createStandort() {
	const { data, error } = await supabase.from("tb_standort")
		.insert({ plz: 12345, ort: `Testort-${uid()}`, adresse: "Teststr. 1" })
		.select().single();
	if (error) throw error;
	createdIds.tb_standort.push(data.id);
	return data;
}

async function createStand(standortId: string) {
	const { data, error } = await supabase.from("tb_stand")
		.insert({ standort_id: standortId, bezeichnung: `test-${uid()}` })
		.select().single();
	if (error) throw error;
	createdIds.tb_stand.push(data.id);
	return data;
}

async function createProdukt() {
	const { data, error } = await supabase.from("tb_produkt")
		.insert({ art: "Baum", bezeichnung: `test-${uid()}`, von_cm: 100, bis_cm: 150 })
		.select().single();
	if (error) throw error;
	createdIds.tb_produkt.push(data.id);
	return data;
}

async function createProfil() {
	const { data, error } = await supabase.from("tb_profil")
		.insert({ id: crypto.randomUUID(), name: `test-${uid()}`, telefon: null, rolle: "mitarbeiter", aktiv: true })
		.select().single();
	if (error) throw error;
	createdIds.tb_profil.push(data.id);
	return data;
}

describe("tb_inventur CRUD", () => {
	it("creates inventur with differenz", async () => {
		const saison = await createSaison();
		const standort = await createStandort();
		const stand = await createStand(standort.id);
		const produkt = await createProdukt();
		const profil = await createProfil();

		const { data, error } = await supabase.from("tb_inventur")
			.insert({
				saison_id: saison.id,
				stand_id: stand.id,
				produkt_id: produkt.id,
				profil_id: profil.id,
				datum: "2026-12-01",
				differenz: 5,
				grund: null,
			})
			.select().single();

		expect(error).toBeNull();
		expect(data.differenz).toBe(5);
		createdIds.tb_inventur.push(data.id);
	});

	it("getBySaisonId returns only matching rows", async () => {
		const s1 = await createSaison();
		const s2 = await createSaison();
		const standort = await createStandort();
		const stand = await createStand(standort.id);
		const produkt = await createProdukt();
		const profil = await createProfil();

		const { data: i1 } = await supabase.from("tb_inventur").insert({
			saison_id: s1.id, stand_id: stand.id, produkt_id: produkt.id,
			profil_id: profil.id, datum: "2026-12-01", differenz: 1,
		}).select().single();
		createdIds.tb_inventur.push(i1.id);

		const { data: i2 } = await supabase.from("tb_inventur").insert({
			saison_id: s2.id, stand_id: stand.id, produkt_id: produkt.id,
			profil_id: profil.id, datum: "2026-12-01", differenz: -2,
		}).select().single();
		createdIds.tb_inventur.push(i2.id);

		const { data } = await supabase.from("tb_inventur").select("*").eq("saison_id", s1.id);
		expect(data?.length).toBe(1);
	});
});
```

- [ ] **Verify**

Run: `npx tsc --noEmit`

- [ ] **Commit**

```bash
git add lib/data/inventur.ts lib/data/__tests__/inventur.integration.test.ts
git commit -m "feat: add inventur data module + integration test"
```

---

### Task 10: Create einsatz.ts module + integration test

**Files:**
- Create: `lib/data/einsatz.ts`
- Create: `lib/data/__tests__/einsatz.integration.test.ts`

**Depends on:** Task 2 (einsatz schema fix — three-tier pattern)

**Interfaces:**
- Consumes: `createCrud`, `einsatzInsertSchema`, `einsatzCreateSchema`
- Produces: CRUD + `getEinsaetzeBySaisonId` (auto)

- [ ] **Create the module**

```ts
import { createCrud } from "@/lib/data/crud";
import { einsatzCreateSchema, einsatzInsertSchema } from "@/lib/schemas/einsatz";

const TABLE = "tb_einsatz";

const crud = createCrud({
	table: TABLE,
	insertSchema: einsatzInsertSchema,
	createSchema: einsatzCreateSchema,
	labels: { singular: "Einsatz", plural: "Einsätze" },
});

export const getEinsaetze = crud.getAll;
export const getEinsatz = crud.getById;
export const getEinsaetzeBySaisonId = crud.getBySaisonId;
export const createEinsatz = crud.create;
export const updateEinsatz = crud.update;
export const deleteEinsatz = crud.remove;
```

- [ ] **Create the integration test**

```ts
// @vitest-environment node
import { afterAll, describe, expect, it } from "vitest";
import { createTestClient } from "@/lib/supabase/test";

function uid() {
	return Math.random().toString(36).slice(2, 8);
}

const supabase = createTestClient();
const createdIds: Record<string, string[]> = {
	tb_profil: [],
	tb_saison: [],
	tb_standort: [],
	tb_stand: [],
	tb_einsatz: [],
};

afterAll(async () => {
	const order = ["tb_einsatz", "tb_stand", "tb_standort", "tb_saison", "tb_profil"];
	for (const table of order) {
		const ids = createdIds[table];
		if (ids.length > 0) {
			await supabase.from(table).delete().in("id", ids);
		}
	}
});

async function createSaison() {
	const { data, error } = await supabase.from("tb_saison")
		.insert({ name: `test-${uid()}`, start_datum: "2026-01-01", end_datum: "2026-12-31" })
		.select().single();
	if (error) throw error;
	createdIds.tb_saison.push(data.id);
	return data;
}

async function createStandort() {
	const { data, error } = await supabase.from("tb_standort")
		.insert({ plz: 12345, ort: `Testort-${uid()}`, adresse: "Teststr. 1" })
		.select().single();
	if (error) throw error;
	createdIds.tb_standort.push(data.id);
	return data;
}

async function createStand(standortId: string) {
	const { data, error } = await supabase.from("tb_stand")
		.insert({ standort_id: standortId, bezeichnung: `test-${uid()}` })
		.select().single();
	if (error) throw error;
	createdIds.tb_stand.push(data.id);
	return data;
}

async function createProfil() {
	const { data, error } = await supabase.from("tb_profil")
		.insert({ id: crypto.randomUUID(), name: `test-${uid()}`, telefon: null, rolle: "mitarbeiter", aktiv: true })
		.select().single();
	if (error) throw error;
	createdIds.tb_profil.push(data.id);
	return data;
}

describe("tb_einsatz CRUD", () => {
	it("creates einsatz with von-datum", async () => {
		const saison = await createSaison();
		const standort = await createStandort();
		const stand = await createStand(standort.id);
		const profil = await createProfil();

		const { data, error } = await supabase.from("tb_einsatz")
			.insert({
				saison_id: saison.id,
				stand_id: stand.id,
				profil_id: profil.id,
				von: "2026-11-01",
			})
			.select().single();

		expect(error).toBeNull();
		expect(data.von).toBe("2026-11-01");
		createdIds.tb_einsatz.push(data.id);
	});

	it("getBySaisonId returns only matching rows", async () => {
		const s1 = await createSaison();
		const s2 = await createSaison();
		const standort = await createStandort();
		const stand = await createStand(standort.id);
		const profil = await createProfil();

		const { data: e1 } = await supabase.from("tb_einsatz").insert({
			saison_id: s1.id, stand_id: stand.id, profil_id: profil.id, von: "2026-11-01",
		}).select().single();
		createdIds.tb_einsatz.push(e1.id);

		const { data: e2 } = await supabase.from("tb_einsatz").insert({
			saison_id: s2.id, stand_id: stand.id, profil_id: profil.id, von: "2026-11-01",
		}).select().single();
		createdIds.tb_einsatz.push(e2.id);

		const { data } = await supabase.from("tb_einsatz").select("*").eq("saison_id", s1.id);
		expect(data?.length).toBe(1);
	});
});
```

- [ ] **Verify**

Run: `npx tsc --noEmit`

- [ ] **Commit**

```bash
git add lib/data/einsatz.ts lib/data/__tests__/einsatz.integration.test.ts
git commit -m "feat: add einsatz data module + integration test"
```

---

### Task 11: Create profil.ts module + integration test

**Files:**
- Create: `lib/data/profil.ts`
- Create: `lib/data/__tests__/profil.integration.test.ts`

**Interfaces:**
- Consumes: `createCrud`, `profilInsertSchema` (now omits `erstellt_am`)
- Produces: `getProfile`, `getProfil`, `createProfil(id, input)`, `updateProfil`, `deleteProfil`

Note: `tb_profil.id == auth.users.id` — no `gen_random_uuid()`. `createProfil` accepts explicit id.

- [ ] **Create the module**

```ts
import { createCrud } from "@/lib/data/crud";
import { profilInsertSchema } from "@/lib/schemas/profil";
import type { TablesInsert } from "@/lib/supabase/database.types";

const TABLE = "tb_profil";

const crud = createCrud({
	table: TABLE,
	insertSchema: profilInsertSchema,
	labels: { singular: "Profil", plural: "Profile" },
	orderBy: { column: "name" },
});

export const getProfile = crud.getAll;
export const getProfil = crud.getById;
export const updateProfil = crud.update;
export const deleteProfil = crud.remove;

/**
 * Erstellt ein Profil mit expliziter ID (auth.users.id).
 * @param id Die auth.users.id des neuen Benutzers.
 * @param input Die restlichen Profil-Felder (name, rolle, telefon, aktiv).
 */
export async function createProfil(
	id: string,
	input: Omit<TablesInsert<"tb_profil">, "id">,
): Promise<Record<string, unknown>> {
	const werte = profilInsertSchema.parse(input);
	const supabase = await (await import("@/lib/supabase/server")).createClient();
	const { data, error } = await supabase
		.from(TABLE)
		.insert({ ...werte, id })
		.select()
		.single();

	if (error) {
		throw new Error(`Profil konnte nicht angelegt werden: ${error.message}`);
	}

	return data as Record<string, unknown>;
}
```

- [ ] **Create the integration test**

```ts
// @vitest-environment node
import { afterAll, describe, expect, it } from "vitest";
import { createTestClient } from "@/lib/supabase/test";

function uid() {
	return Math.random().toString(36).slice(2, 8);
}

const supabase = createTestClient();
const createdIds: string[] = [];

afterAll(async () => {
	if (createdIds.length > 0) {
		await supabase.from("tb_profil").delete().in("id", createdIds);
	}
});

async function createProfil(overrides: Partial<Record<string, unknown>> = {}) {
	const { data, error } = await supabase
		.from("tb_profil")
		.insert({
			id: crypto.randomUUID(),
			name: `test-${uid()}`,
			rolle: "mitarbeiter",
			telefon: null,
			aktiv: true,
			...overrides,
		})
		.select()
		.single();

	if (error) throw error;
	createdIds.push(data.id);
	return data;
}

describe("tb_profil CRUD", () => {
	it("creates profil with explicit id", async () => {
		const profil = await createProfil();
		expect(profil.aktiv).toBe(true);
		expect(profil.rolle).toBe("mitarbeiter");
	});

	it("creates profil as admin", async () => {
		const profil = await createProfil({ rolle: "admin" });
		expect(profil.rolle).toBe("admin");
	});

	it("reads all profile", async () => {
		const created = await createProfil();
		const { data, error } = await supabase.from("tb_profil").select("*");
		expect(error).toBeNull();
		expect(data?.some((p) => p.id === created.id)).toBe(true);
	});

	it("updates profil name", async () => {
		const profil = await createProfil();
		const { data, error } = await supabase
			.from("tb_profil")
			.update({ name: `updated-${uid()}` })
			.eq("id", profil.id)
			.select()
			.single();
		expect(error).toBeNull();
		expect(data?.name).not.toBe(profil.name);
	});

	it("deletes profil", async () => {
		const profil = await createProfil();
		const { error } = await supabase.from("tb_profil").delete().eq("id", profil.id);
		expect(error).toBeNull();
	});
});
```

- [ ] **Verify**

Run: `npx tsc --noEmit`

- [ ] **Commit**

```bash
git add lib/data/profil.ts lib/data/__tests__/profil.integration.test.ts
git commit -m "feat: add profil data module (explicit id) + integration test"
```

---

### Task 12: Create stand-saison schema + module + integration test

**Files:**
- Create: `lib/schemas/stand-saison.ts`
- Create: `lib/data/stand-saison.ts`
- Create: `lib/data/__tests__/stand-saison.integration.test.ts`

**Interfaces:**
- Produces: schema `{ stand_id, saison_id }`, functions `getStaendeBySaison(saisonId)`, `assignStandToSaison(standId, saisonId)`, `removeStandFromSaison(standId, saisonId)`

- [ ] **Create the schema**

```ts
import { z } from "zod";
import { uuidSchema } from "@/lib/schemas/common";

export const standSaisonSchema = z.object({
	stand_id: uuidSchema,
	saison_id: uuidSchema,
});

export const standSaisonInsertSchema = standSaisonSchema;
export type StandSaison = z.infer<typeof standSaisonSchema>;
export type StandSaisonInsert = z.infer<typeof standSaisonInsertSchema>;
```

- [ ] **Create the module**

```ts
import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/supabase/database.types";

const TABLE = "tb_stand_saison";

/**
 * Alle Stände einer Saison.
 */
export async function getStaendeBySaison(
	saisonId: string,
): Promise<Tables<"tb_stand">[]> {
	const supabase = await createClient();
	const { data, error } = await supabase
		.from(TABLE)
		.select("tb_stand(*)")
		.eq("saison_id", saisonId);

	if (error) {
		throw new Error(
			`Stände konnten nicht geladen werden: ${error.message}`,
		);
	}

	return data.map((row: Record<string, unknown>) => row.tb_stand) as Tables<"tb_stand">[];
}

/**
 * Weist einen Stand einer Saison zu.
 */
export async function assignStandToSaison(
	standId: string,
	saisonId: string,
): Promise<void> {
	const supabase = await createClient();
	const { error } = await supabase
		.from(TABLE)
		.insert({ stand_id: standId, saison_id: saisonId });

	if (error) {
		throw new Error(
			`Stand konnte der Saison nicht zugewiesen werden: ${error.message}`,
		);
	}
}

/**
 * Entfernt einen Stand aus einer Saison.
 */
export async function removeStandFromSaison(
	standId: string,
	saisonId: string,
): Promise<void> {
	const supabase = await createClient();
	const { error } = await supabase
		.from(TABLE)
		.delete()
		.eq("stand_id", standId)
		.eq("saison_id", saisonId);

	if (error) {
		throw new Error(
			`Stand konnte aus der Saison nicht entfernt werden: ${error.message}`,
		);
	}
}
```

- [ ] **Create the integration test**

```ts
// @vitest-environment node
import { afterAll, describe, expect, it } from "vitest";
import { createTestClient } from "@/lib/supabase/test";

function uid() {
	return Math.random().toString(36).slice(2, 8);
}

const supabase = createTestClient();
const createdIds: Record<string, string[]> = {
	tb_saison: [],
	tb_standort: [],
	tb_stand: [],
	tb_stand_saison: [],
};

afterAll(async () => {
	await supabase.from("tb_stand_saison").delete().in("stand_id", createdIds.tb_stand);
	await supabase.from("tb_stand").delete().in("id", createdIds.tb_stand);
	await supabase.from("tb_standort").delete().in("id", createdIds.tb_standort);
	await supabase.from("tb_saison").delete().in("id", createdIds.tb_saison);
});

async function createSaison() {
	const { data, error } = await supabase.from("tb_saison")
		.insert({ name: `test-${uid()}`, start_datum: "2026-01-01", end_datum: "2026-12-31" })
		.select().single();
	if (error) throw error;
	createdIds.tb_saison.push(data.id);
	return data;
}

async function createStandort() {
	const { data, error } = await supabase.from("tb_standort")
		.insert({ plz: 12345, ort: `Testort-${uid()}`, adresse: "Teststr. 1" })
		.select().single();
	if (error) throw error;
	createdIds.tb_standort.push(data.id);
	return data;
}

async function createStand(standortId: string) {
	const { data, error } = await supabase.from("tb_stand")
		.insert({ standort_id: standortId, bezeichnung: `test-${uid()}` })
		.select().single();
	if (error) throw error;
	createdIds.tb_stand.push(data.id);
	return data;
}

describe("tb_stand_saison", () => {
	it("assigns stand to saison", async () => {
		const saison = await createSaison();
		const standort = await createStandort();
		const stand = await createStand(standort.id);

		const { error } = await supabase.from("tb_stand_saison").insert({
			stand_id: stand.id,
			saison_id: saison.id,
		});
		expect(error).toBeNull();
	});

	it("getStaendeBySaison returns assigned stands", async () => {
		const saison = await createSaison();
		const standort = await createStandort();
		const stand = await createStand(standort.id);

		await supabase.from("tb_stand_saison").insert({
			stand_id: stand.id,
			saison_id: saison.id,
		});

		const { data } = await supabase.from("tb_stand_saison")
			.select("tb_stand(*)")
			.eq("saison_id", saison.id);
		expect(data?.length).toBe(1);
	});

	it("removes stand from saison", async () => {
		const saison = await createSaison();
		const standort = await createStandort();
		const stand = await createStand(standort.id);

		await supabase.from("tb_stand_saison").insert({
			stand_id: stand.id,
			saison_id: saison.id,
		});

		const { error } = await supabase.from("tb_stand_saison")
			.delete()
			.eq("stand_id", stand.id)
			.eq("saison_id", saison.id);
		expect(error).toBeNull();

		const { data } = await supabase.from("tb_stand_saison")
			.select("*")
			.eq("stand_id", stand.id)
			.eq("saison_id", saison.id);
		expect(data?.length).toBe(0);
	});
});
```

- [ ] **Verify**

Run: `npx tsc --noEmit`

- [ ] **Commit**

```bash
git add lib/schemas/stand-saison.ts lib/data/stand-saison.ts lib/data/__tests__/stand-saison.integration.test.ts
git commit -m "feat: add stand-saison junction schema, module, integration test"
```

---

### Task 13: Create RPC migration — create_verkauf_mit_positionen

**Files:**
- Create: `supabase/migrations/00017_fn_create_verkauf_mit_positionen.sql`

**Interfaces:**
- Produces: Postgres function `create_verkauf_mit_positionen(p_verkauf jsonb, p_positionen jsonb) RETURNS tb_verkauf`

- [ ] **Create the migration**

```sql
-- Erzeugt einen Verkauf mit N Positionen in einer Transaktion.
-- Wirft bei Fehlern (z. B. menge <= 0) und rollt alles zurück.
CREATE OR REPLACE FUNCTION create_verkauf_mit_positionen(
	p_verkauf jsonb,
	p_positionen jsonb
)
RETURNS tb_verkauf
LANGUAGE plpgsql
AS $$
DECLARE
	v_verkauf tb_verkauf;
	v_pos jsonb;
BEGIN
	-- Verkauf-Kopf anlegen
	INSERT INTO tb_verkauf (
		saison_id,
		stand_id,
		profil_id,
		reservierung_id,
		aktion_bz,
		preis_gesamt,
		anmerkung
	)
	SELECT
		(p_verkauf->>'saison_id')::uuid,
		(p_verkauf->>'stand_id')::uuid,
		(p_verkauf->>'profil_id')::uuid,
		(p_verkauf->>'reservierung_id')::uuid,
		(p_verkauf->>'aktion_bz')::text,
		(p_verkauf->>'preis_gesamt')::numeric,
		(p_verkauf->>'anmerkung')::text
	RETURNING * INTO v_verkauf;

	-- Positionen anlegen
	FOR v_pos IN SELECT * FROM jsonb_array_elements(p_positionen)
	LOOP
		INSERT INTO tb_position (
			verkauf_id,
			produkt_id,
			menge,
			einzelpreis,
			kreuz_montiert,
			hoehe_cm
		)
		VALUES (
			v_verkauf.id,
			(v_pos->>'produkt_id')::uuid,
			(v_pos->>'menge')::int,
			(v_pos->>'einzelpreis')::numeric,
			COALESCE((v_pos->>'kreuz_montiert')::boolean, false),
			(v_pos->>'hoehe_cm')::int
		);
	END LOOP;

	RETURN v_verkauf;
END;
$$;
```

- [ ] **Verify SQL syntax**

Run: `supabase db reset` (or manual check if no local Supabase)

- [ ] **Commit**

```bash
git add supabase/migrations/00017_fn_create_verkauf_mit_positionen.sql
git commit -m "feat: add RPC for atomic verkauf+positionen creation"
```

---

### Task 14: Create RPC migration — create_wareneingang_mit_positionen

**Files:**
- Create: `supabase/migrations/00018_fn_create_wareneingang_mit_positionen.sql`

**Interfaces:**
- Produces: Postgres function `create_wareneingang_mit_positionen(p_kopf jsonb, p_positionen jsonb) RETURNS tb_wareneingang`

- [ ] **Create the migration**

```sql
-- Erzeugt einen Wareneingang mit N Positionen in einer Transaktion.
-- Wirft bei Fehlern (z. B. menge <= 0) und rollt alles zurück.
CREATE OR REPLACE FUNCTION create_wareneingang_mit_positionen(
	p_kopf jsonb,
	p_positionen jsonb
)
RETURNS tb_wareneingang
LANGUAGE plpgsql
AS $$
DECLARE
	v_we tb_wareneingang;
	v_pos jsonb;
BEGIN
	-- Wareneingang-Kopf anlegen
	INSERT INTO tb_wareneingang (
		saison_id,
		stand_id,
		datum,
		erfasst_von
	)
	SELECT
		(p_kopf->>'saison_id')::uuid,
		(p_kopf->>'stand_id')::uuid,
		COALESCE((p_kopf->>'datum')::date, CURRENT_DATE),
		(p_kopf->>'erfasst_von')::uuid
	RETURNING * INTO v_we;

	-- Positionen anlegen
	FOR v_pos IN SELECT * FROM jsonb_array_elements(p_positionen)
	LOOP
		INSERT INTO tb_wareneingangsposition (
			wareneingang_id,
			produkt_id,
			menge
		)
		VALUES (
			v_we.id,
			(v_pos->>'produkt_id')::uuid,
			(v_pos->>'menge')::int
		);
	END LOOP;

	RETURN v_we;
END;
$$;
```

- [ ] **Commit**

```bash
git add supabase/migrations/00018_fn_create_wareneingang_mit_positionen.sql
git commit -m "feat: add RPC for atomic wareneingang+positionen creation"
```

---

### Task 15: Add RPC types to database.types.ts

**Files:**
- Modify: `lib/supabase/database.types.ts`

**Interfaces:**
- Produces: Type-safe `supabase.rpc("create_verkauf_mit_positionen", ...)` and `supabase.rpc("create_wareneingang_mit_positionen", ...)` calls

- [ ] **Read current Functions section**

```bash
grep -n "Functions" lib/supabase/database.types.ts
```

- [ ] **Add RPC function definitions**

Find the `Functions: { [_ in never]: never }` block and replace with:
```ts
	Functions: {
		create_verkauf_mit_positionen: {
			Args: {
				p_verkauf: Json;
				p_positionen: Json;
			};
			Returns: Tables<"tb_verkauf">;
		};
		create_wareneingang_mit_positionen: {
			Args: {
				p_kopf: Json;
				p_positionen: Json;
			};
			Returns: Tables<"tb_wareneingang">;
		};
	};
```

- [ ] **Verify**

Run: `npx tsc --noEmit`
Expected: 0 errors

- [ ] **Commit**

```bash
git add lib/supabase/database.types.ts
git commit -m "feat: add RPC function types for atomic composite writes"
```

---

### Task 16: Create verkauf.ts module + integration test (including RPC)

**Files:**
- Create: `lib/data/verkauf.ts`
- Create: `lib/data/__tests__/verkauf.integration.test.ts`

**Interfaces:**
- Consumes: `createCrud`, `verkaufInsertSchema`, `getCurrentProfilId`
- Produces: CRUD + `createVerkaufMitPositionen(kopf, positionen)` via RPC

- [ ] **Create the module**

```ts
import { createCrud } from "@/lib/data/crud";
import { verkaufInsertSchema } from "@/lib/schemas/verkauf";
import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/supabase/database.types";

const TABLE = "tb_verkauf";

const crud = createCrud({
	table: TABLE,
	insertSchema: verkaufInsertSchema,
	labels: { singular: "Verkauf", plural: "Verkäufe" },
});

export const getVerkaeufe = crud.getAll;
export const getVerkauf = crud.getById;
export const getVerkaeufeBySaisonId = crud.getBySaisonId;
export const updateVerkauf = crud.update;
export const deleteVerkauf = crud.remove;

/**
 * Erstellt einen Verkauf mit N Positionen in einer atomaren DB-Transaktion
 * (via RPC). profil_id wird serverseitig aus der aktuellen Session injiziert.
 */
export async function createVerkaufMitPositionen(
	kopf: Omit<
		Parameters<typeof crud.create>[0],
		"profil_id" | "verkauft_am"
	>,
	positionen: Array<{
		produkt_id: string;
		menge: number;
		einzelpreis: number;
		kreuz_montiert?: boolean;
		hoehe_cm: number;
	}>,
): Promise<Tables<"tb_verkauf">> {
	const supabase = await createClient();

	const { data: user } = await supabase.auth.getUser();
	if (!user.user) throw new Error("Nicht angemeldet.");

	const kopfMitSession = {
		...kopf,
		profil_id: user.user.id,
	};

	const { data, error } = await supabase.rpc("create_verkauf_mit_positionen", {
		p_verkauf: kopfMitSession,
		p_positionen: positionen,
	});

	if (error) {
		throw new Error(
			`Verkauf konnte nicht angelegt werden: ${error.message}`,
		);
	}

	return data as unknown as Tables<"tb_verkauf">;
}
```

- [ ] **Create the integration test**

```ts
// @vitest-environment node
import { afterAll, describe, expect, it } from "vitest";
import { createTestClient } from "@/lib/supabase/test";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

function uid() {
	return Math.random().toString(36).slice(2, 8);
}

// Use service-role for test setup (bypasses auth)
const supabase = createClient<Database>(
	process.env.SUPABASE_TEST_URL!,
	process.env.SUPABASE_TEST_SERVICE_KEY!,
);

const createdIds: Record<string, string[]> = {
	tb_profil: [],
	tb_saison: [],
	tb_standort: [],
	tb_stand: [],
	tb_produkt: [],
	tb_verkauf: [],
	tb_position: [],
};

afterAll(async () => {
	const order = ["tb_position", "tb_verkauf", "tb_produkt", "tb_stand", "tb_standort", "tb_saison", "tb_profil"];
	for (const table of order) {
		const ids = createdIds[table];
		if (ids.length > 0) {
			await supabase.from(table).delete().in("id", ids);
		}
	}
});

async function createSaison() {
	const { data } = await supabase.from("tb_saison").insert({
		name: `test-${uid()}`, start_datum: "2026-01-01", end_datum: "2026-12-31",
	}).select().single().then(r => { createdIds.tb_saison.push(r.data!.id); return r; });
	return data!;
}

async function createStandort() {
	const { data } = await supabase.from("tb_standort").insert({
		plz: 12345, ort: `Testort-${uid()}`, adresse: "Teststr. 1",
	}).select().single().then(r => { createdIds.tb_standort.push(r.data!.id); return r; });
	return data!;
}

async function createStand(standortId: string) {
	const { data } = await supabase.from("tb_stand").insert({
		standort_id: standortId, bezeichnung: `test-${uid()}`,
	}).select().single().then(r => { createdIds.tb_stand.push(r.data!.id); return r; });
	return data!;
}

async function createProdukt() {
	const { data } = await supabase.from("tb_produkt").insert({
		art: "Baum", bezeichnung: `test-${uid()}`, von_cm: 100, bis_cm: 150,
	}).select().single().then(r => { createdIds.tb_produkt.push(r.data!.id); return r; });
	return data!;
}

async function createProfil() {
	const { data } = await supabase.from("tb_profil").insert({
		id: crypto.randomUUID(), name: `test-${uid()}`, telefon: null,
		rolle: "mitarbeiter", aktiv: true,
	}).select().single().then(r => { createdIds.tb_profil.push(r.data!.id); return r; });
	return data!;
}

describe("tb_verkauf RPC", () => {
	it("creates verkauf with 2 positions atomically", async () => {
		const saison = await createSaison();
		const standort = await createStandort();
		const stand = await createStand(standort.id);
		const produkt = await createProdukt();
		const profil = await createProfil();

		const { data, error } = await supabase.rpc("create_verkauf_mit_positionen", {
			p_verkauf: {
				saison_id: saison.id,
				stand_id: stand.id,
				profil_id: profil.id,
				aktion_bz: null,
				preis_gesamt: 45.0,
				anmerkung: null,
			},
			p_positionen: [
				{ produkt_id: produkt.id, menge: 1, einzelpreis: 25.0, kreuz_montiert: false, hoehe_cm: 120 },
				{ produkt_id: produkt.id, menge: 2, einzelpreis: 10.0, kreuz_montiert: true, hoehe_cm: 80 },
			],
		});

		expect(error).toBeNull();
		expect(data).not.toBeNull();

		// Verify header exists
		const { data: header } = await supabase.from("tb_verkauf").select("*").eq("id", data!.id).single();
		expect(header?.preis_gesamt).toBe(45.0);

		// Verify 2 positions created
		const { data: pos } = await supabase.from("tb_position").select("*").eq("verkauf_id", data!.id);
		expect(pos?.length).toBe(2);

		// Cleanup
		createdIds.tb_verkauf.push(data!.id);
		for (const p of pos || []) {
			createdIds.tb_position.push(p.id);
		}
	});

	it("rolls back on invalid position (menge <= 0)", async () => {
		const saison = await createSaison();
		const standort = await createStandort();
		const stand = await createStand(standort.id);
		const produkt = await createProdukt();
		const profil = await createProfil();

		const { data, error } = await supabase.rpc("create_verkauf_mit_positionen", {
			p_verkauf: {
				saison_id: saison.id,
				stand_id: stand.id,
				profil_id: profil.id,
				preis_gesamt: 10.0,
			},
			p_positionen: [
				{ produkt_id: produkt.id, menge: 0, einzelpreis: 10.0, kreuz_montiert: false, hoehe_cm: 100 },
			],
		});

		// Should fail - menge > 0 constraint in DB
		expect(error).not.toBeNull();
		expect(data).toBeNull();
	});
});
```

- [ ] **Verify**

Run: `npx tsc --noEmit`

- [ ] **Commit**

```bash
git add lib/data/verkauf.ts lib/data/__tests__/verkauf.integration.test.ts
git commit -m "feat: add verkauf data module (CRUD + RPC) + integration test"
```

---

### Task 17: Create wareneingang.ts module + integration test (including RPC)

**Files:**
- Create: `lib/data/wareneingang.ts`
- Create: `lib/data/__tests__/wareneingang.integration.test.ts`

**Interfaces:**
- Consumes: `createCrud`, `wareneingangInsertSchema`
- Produces: CRUD + `createWareneingangMitPositionen(kopf, positionen)` via RPC

- [ ] **Create the module**

```ts
import { createCrud } from "@/lib/data/crud";
import { wareneingangInsertSchema } from "@/lib/schemas/wareneingang";
import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/supabase/database.types";

const TABLE = "tb_wareneingang";

const crud = createCrud({
	table: TABLE,
	insertSchema: wareneingangInsertSchema,
	labels: { singular: "Wareneingang", plural: "Wareneingänge" },
});

export const getWareneingaenge = crud.getAll;
export const getWareneingang = crud.getById;
export const getWareneingaengeBySaisonId = crud.getBySaisonId;
export const updateWareneingang = crud.update;
export const deleteWareneingang = crud.remove;

/**
 * Erstellt einen Wareneingang mit N Positionen in einer atomaren DB-Transaktion
 * (via RPC). erfasst_von wird serverseitig aus der aktuellen Session injiziert.
 */
export async function createWareneingangMitPositionen(
	kopf: Omit<
		Parameters<typeof crud.create>[0],
		"erfasst_von"
	>,
	positionen: Array<{
		produkt_id: string;
		menge: number;
	}>,
): Promise<Tables<"tb_wareneingang">> {
	const supabase = await createClient();

	const { data: user } = await supabase.auth.getUser();
	if (!user.user) throw new Error("Nicht angemeldet.");

	const kopfMitSession = {
		...kopf,
		erfasst_von: user.user.id,
	};

	const { data, error } = await supabase.rpc("create_wareneingang_mit_positionen", {
		p_kopf: kopfMitSession,
		p_positionen: positionen,
	});

	if (error) {
		throw new Error(
			`Wareneingang konnte nicht angelegt werden: ${error.message}`,
		);
	}

	return data as unknown as Tables<"tb_wareneingang">;
}
```

- [ ] **Create the integration test**

```ts
// @vitest-environment node
import { afterAll, describe, expect, it } from "vitest";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

function uid() {
	return Math.random().toString(36).slice(2, 8);
}

const supabase = createClient<Database>(
	process.env.SUPABASE_TEST_URL!,
	process.env.SUPABASE_TEST_SERVICE_KEY!,
);

const createdIds: Record<string, string[]> = {
	tb_profil: [],
	tb_saison: [],
	tb_standort: [],
	tb_stand: [],
	tb_produkt: [],
	tb_wareneingang: [],
	tb_wareneingangsposition: [],
};

afterAll(async () => {
	const order = ["tb_wareneingangsposition", "tb_wareneingang", "tb_produkt", "tb_stand", "tb_standort", "tb_saison", "tb_profil"];
	for (const table of order) {
		const ids = createdIds[table];
		if (ids.length > 0) {
			await supabase.from(table).delete().in("id", ids);
		}
	}
});

async function createSaison() {
	const { data } = await supabase.from("tb_saison").insert({
		name: `test-${uid()}`, start_datum: "2026-01-01", end_datum: "2026-12-31",
	}).select().single().then(r => { createdIds.tb_saison.push(r.data!.id); return r; });
	return data!;
}

async function createStandort() {
	const { data } = await supabase.from("tb_standort").insert({
		plz: 12345, ort: `Testort-${uid()}`, adresse: "Teststr. 1",
	}).select().single().then(r => { createdIds.tb_standort.push(r.data!.id); return r; });
	return data!;
}

async function createStand(standortId: string) {
	const { data } = await supabase.from("tb_stand").insert({
		standort_id: standortId, bezeichnung: `test-${uid()}`,
	}).select().single().then(r => { createdIds.tb_stand.push(r.data!.id); return r; });
	return data!;
}

async function createProdukt() {
	const { data } = await supabase.from("tb_produkt").insert({
		art: "Baum", bezeichnung: `test-${uid()}`, von_cm: 100, bis_cm: 150,
	}).select().single().then(r => { createdIds.tb_produkt.push(r.data!.id); return r; });
	return data!;
}

async function createProfil() {
	const { data } = await supabase.from("tb_profil").insert({
		id: crypto.randomUUID(), name: `test-${uid()}`, telefon: null,
		rolle: "mitarbeiter", aktiv: true,
	}).select().single().then(r => { createdIds.tb_profil.push(r.data!.id); return r; });
	return data!;
}

describe("tb_wareneingang RPC", () => {
	it("creates wareneingang with 2 positions atomically", async () => {
		const saison = await createSaison();
		const standort = await createStandort();
		const stand = await createStand(standort.id);
		const produkt = await createProdukt();
		const profil = await createProfil();

		const { data, error } = await supabase.rpc("create_wareneingang_mit_positionen", {
			p_kopf: {
				saison_id: saison.id,
				stand_id: stand.id,
				erfasst_von: profil.id,
			},
			p_positionen: [
				{ produkt_id: produkt.id, menge: 10 },
				{ produkt_id: produkt.id, menge: 5 },
			],
		});

		expect(error).toBeNull();
		expect(data).not.toBeNull();

		const { data: pos } = await supabase.from("tb_wareneingangsposition")
			.select("*").eq("wareneingang_id", data!.id);
		expect(pos?.length).toBe(2);

		createdIds.tb_wareneingang.push(data!.id);
		for (const p of pos || []) {
			createdIds.tb_wareneingangsposition.push(p.id);
		}
	});

	it("rolls back on invalid position (menge <= 0)", async () => {
		const saison = await createSaison();
		const standort = await createStandort();
		const stand = await createStand(standort.id);
		const produkt = await createProdukt();
		const profil = await createProfil();

		const { error } = await supabase.rpc("create_wareneingang_mit_positionen", {
			p_kopf: { saison_id: saison.id, stand_id: stand.id, erfasst_von: profil.id },
			p_positionen: [{ produkt_id: produkt.id, menge: 0 }],
		});

		expect(error).not.toBeNull();
	});
});
```

- [ ] **Verify**

Run: `npx tsc --noEmit`

- [ ] **Commit**

```bash
git add lib/data/wareneingang.ts lib/data/__tests__/wareneingang.integration.test.ts
git commit -m "feat: add wareneingang data module (CRUD + RPC) + integration test"
```

---

### Task 18: Full verification

**Files:**
- Check: all new/modified files

- [ ] **Type check**

```bash
npx tsc --noEmit
```
Expected: 0 errors

- [ ] **Lint and format**

```bash
npx biome check --write lib/data/ lib/schemas/ lib/supabase/database.types.ts
```
Expected: clean output

- [ ] **Run integration tests**

```bash
bun run test:integration
```
Expected: all tests pass

- [ ] **Final commit**

```bash
git add -A
git commit -m "chore: full verification pass - tsc, biome, integration tests green"
```
