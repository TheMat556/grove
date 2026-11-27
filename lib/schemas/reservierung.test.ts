import { describe, expect, it } from "vitest";
import { toIsoDate } from "@/lib/saison";
import { reservierungCreateSchema } from "@/lib/schemas/reservierung";

function isoInTagen(tage: number) {
	const datum = new Date();
	datum.setUTCDate(datum.getUTCDate() + tage);
	return datum.toISOString().slice(0, 10);
}

const basis = {
	saison_id: "11111111-1111-4111-8111-111111111111",
	stand_id: "22222222-2222-4222-8222-222222222222",
	kunde_id: "33333333-3333-4333-8333-333333333333",
	versandart: "abholung",
	geplantes_datum: toIsoDate(new Date()),
};

describe("reservierungCreateSchema", () => {
	it("erlaubt heute und zukünftige Termine", () => {
		expect(reservierungCreateSchema.safeParse(basis).success).toBe(true);
		expect(
			reservierungCreateSchema.safeParse({
				...basis,
				geplantes_datum: isoInTagen(14),
			}).success,
		).toBe(true);
	});

	it("lehnt Termine in der Vergangenheit ab", () => {
		const geprueft = reservierungCreateSchema.safeParse({
			...basis,
			geplantes_datum: isoInTagen(-1),
		});

		expect(geprueft.success).toBe(false);
		expect(geprueft.error?.issues[0]?.message).toBe(
			"Geplantes Datum darf nicht in der Vergangenheit liegen.",
		);
		expect(geprueft.error?.issues[0]?.path).toEqual(["geplantes_datum"]);
	});
});
