"use client";

import { CalendarIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { parseIsoDate, toLocalIsoDate } from "@/lib/saison";

type DatePickerProps = {
	id: string;
	name: string;
	defaultValue?: string;
	invalid?: boolean;
	/** ISO-Datum (yyyy-mm-dd); Tage davor sind im Kalender gesperrt. */
	minDatum?: string;
	/** Wird nach jeder Auswahl mit dem gewählten ISO-Datum aufgerufen. */
	onChange?: (isoDatum: string) => void;
	/** Wird aufgerufen, wenn der Kalender geschlossen wird (für Live-Validierung). */
	onTouched?: () => void;
};

export function DatePicker({
	id,
	name,
	defaultValue,
	invalid,
	minDatum,
	onChange,
	onTouched,
}: DatePickerProps) {
	const [date, setDate] = useState(() =>
		defaultValue ? parseIsoDate(defaultValue) : undefined,
	);
	const [open, setOpen] = useState(false);
	const minDate = minDatum ? parseIsoDate(minDatum) : undefined;

	return (
		<>
			<input
				type="hidden"
				name={name}
				value={date ? toLocalIsoDate(date) : ""}
			/>
			<Popover
				open={open}
				onOpenChange={(next) => {
					setOpen(next);
					if (!next) onTouched?.();
				}}
			>
				<PopoverTrigger
					render={
						<Button
							id={id}
							type="button"
							variant="outline"
							aria-invalid={invalid}
							className="justify-start font-normal"
						/>
					}
				>
					<CalendarIcon />
					{date ? date.toLocaleDateString("de-DE") : "Datum wählen"}
				</PopoverTrigger>
				<PopoverContent className="w-auto p-0" align="start">
					<Calendar
						mode="single"
						required
						captionLayout="dropdown"
						selected={date}
						disabled={minDate ? { before: minDate } : undefined}
						onSelect={(selected) => {
							if (!selected) return;
							setDate(selected);
							setOpen(false);
							onChange?.(toLocalIsoDate(selected));
						}}
						autoFocus
					/>
				</PopoverContent>
			</Popover>
		</>
	);
}
