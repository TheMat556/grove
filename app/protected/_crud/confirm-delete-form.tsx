"use client";

import { Button } from "@/components/ui/button";

type ConfirmDeleteFormProps = {
	action: (formData: FormData) => Promise<void>;
	id: string;
	entity: string;
};

export function ConfirmDeleteForm({
	action,
	id,
	entity,
}: ConfirmDeleteFormProps) {
	return (
		<form
			action={action}
			onSubmit={(e) => {
				if (!confirm(`${entity} wirklich löschen?`)) {
					e.preventDefault();
				}
			}}
		>
			<input type="hidden" name="id" value={id} />
			<Button variant="outline" size="sm" type="submit">
				Löschen
			</Button>
		</form>
	);
}
