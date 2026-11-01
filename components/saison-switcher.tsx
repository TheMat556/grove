import { SaisonSelect } from "@/components/saison-select";
import { getSaisonSelection } from "@/lib/saison-context";

export async function SaisonSwitcher() {
	let selection: Awaited<ReturnType<typeof getSaisonSelection>>;
	try {
		selection = await getSaisonSelection();
	} catch {
		// Der Header darf die Seite nicht mitreißen, wenn die Saisons nicht laden.
		return null;
	}

	const { saisons, selectedId } = selection;
	if (saisons.length === 0) {
		return null;
	}

	const options = [...saisons]
		.sort((a, b) => b.start_datum.localeCompare(a.start_datum))
		.map(({ id, name }) => ({ id, name }));

	return <SaisonSelect saisons={options} selectedId={selectedId} />;
}
