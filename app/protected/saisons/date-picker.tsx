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
};

export function DatePicker({
	id,
	name,
	defaultValue,
	invalid,
}: DatePickerProps) {
	const [date, setDate] = useState(() =>
		defaultValue ? parseIsoDate(defaultValue) : undefined,
	);
	const [open, setOpen] = useState(false);

	return (
		<>
			<input
				type="hidden"
				name={name}
				value={date ? toLocalIsoDate(date) : ""}
			/>
			<Popover open={open} onOpenChange={setOpen}>
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
						captionLayout="dropdown"
						selected={date}
						onSelect={(selected) => {
							setDate(selected);
							setOpen(false);
						}}
						autoFocus
					/>
				</PopoverContent>
			</Popover>
		</>
	);
}
