"use client";

import {
	type FormEvent,
	startTransition,
	useActionState,
	useEffect,
	useRef,
} from "react";
import type { EntityFormState } from "./entity-actions";

/**
 * Formular-State einer Server-Action. Bewusst ohne `action`-Prop: React 19
 * resettet unkontrollierte Felder nach jedem Action-Lauf – auch wenn die
 * Action nur Validierungsfehler meldet – und würde so getippte Werte löschen.
 * Der manuelle Dispatch umgeht den Auto-Reset (s. kunde-form.test).
 *
 * `onSuccess` wird über eine Ref gehalten: Aufrufer übergeben oft Inline-
 * Funktionen, die bei jedem Render neu entstehen – ohne Ref würde der Effekt
 * dann mehrfach feuern.
 */
export function useServerForm<S extends EntityFormState>(
	// Rückgabe bewusst breit: create- und update-Action eines Entity haben
	// unterschiedlich schmale Zustände (z. B. KundeFormState vs. EntityFormState).
	action: (prevState: S, formData: FormData) => Promise<EntityFormState>,
	initialState: S,
	onSuccess?: (state: S) => void,
) {
	// Casts nur, weil create- und update-Action eines Entity unterschiedlich
	// schmale Zustandstypen liefern; zur Laufzeit ist es dieselbe Funktion.
	const [rohState, formAction, isPending] = useActionState(
		action as unknown as (
			state: EntityFormState,
			payload: FormData,
		) => EntityFormState,
		initialState as EntityFormState,
	);
	const state = rohState as S;
	const onSuccessRef = useRef(onSuccess);
	useEffect(() => {
		onSuccessRef.current = onSuccess;
	});
	useEffect(() => {
		if (state.success) onSuccessRef.current?.(state);
	}, [state]);

	const submit = (formData: FormData) =>
		startTransition(() => formAction(formData));

	return {
		state,
		isPending,
		/** Für Formulare, die ihr FormData selbst bauen (kein <form> möglich). */
		submit,
		formProps: {
			onSubmit: (event: FormEvent<HTMLFormElement>) => {
				event.preventDefault();
				submit(new FormData(event.currentTarget));
			},
		},
	};
}
