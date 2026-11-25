"use client";

import { NumberField as NumberFieldPrimitive } from "@base-ui/react/number-field";
import { MinusIcon, PlusIcon } from "lucide-react";
import type * as React from "react";
import { cn } from "@/lib/utils";

type NumberFieldProps = React.ComponentProps<
	typeof NumberFieldPrimitive.Root
> & {
	invalid?: boolean;
	id?: string;
	placeholder?: string;
};

const stepperClasses =
	"flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center text-muted-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-50";

/**
 * Zahleneingabe im shadcn-Stil (Base UI Number Field): Eingabe mit
 * Minus/Plus-Steppern. Der `name` erzeugt ein Hidden-Feld mit dem rohen
 * Zahlenwert, damit FormData unabhängig von der Anzeige-Formatierung bleibt.
 */
export function NumberField({
	invalid,
	id,
	placeholder,
	className,
	defaultValue,
	...props
}: NumberFieldProps) {
	return (
		<NumberFieldPrimitive.Root
			{...props}
			// Base UI hält den `defaultValue` des unkontrollierten Felds fest und
			// warnt, wenn er sich nach dem ersten Render ändert. Das passiert real,
			// wenn revalidatePath das offene Formular mit frischen Daten neu
			// rendert. Ein Key auf dem Default initialisiert das Feld in dem Fall
			// neu – ohne unkontrollierte Werte stillschweigend zu ignorieren.
			key={defaultValue ?? "leer"}
			defaultValue={defaultValue}
			locale="de-DE"
			className={cn(
				"flex w-full items-center overflow-hidden rounded-lg border border-input bg-transparent",
				invalid && "border-destructive",
				className,
			)}
		>
			{/* Explizite Keys: Base UI reicht die Root-Kinder per
			    React.createElement (Legacy-Pfad) als Liste weiter; Turbopack-Dev
			    markiert statische Kinder nicht als validiert, React warnt sonst. */}
			<NumberFieldPrimitive.Decrement
				key="decrement"
				aria-label="Verringern"
				className={cn(stepperClasses, "border-r border-input")}
			>
				<MinusIcon className="size-3.5" />
			</NumberFieldPrimitive.Decrement>
			<NumberFieldPrimitive.Input
				key="input"
				id={id}
				aria-invalid={invalid}
				placeholder={placeholder}
				className="h-8 w-full min-w-0 bg-transparent px-1 text-center text-sm outline-none placeholder:text-muted-foreground"
			/>
			<NumberFieldPrimitive.Increment
				key="increment"
				aria-label="Erhöhen"
				className={cn(stepperClasses, "border-l border-input")}
			>
				<PlusIcon className="size-3.5" />
			</NumberFieldPrimitive.Increment>
		</NumberFieldPrimitive.Root>
	);
}
