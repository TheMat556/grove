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

type DatePickerProps = {
	id: string;
	name: string;
	defaultValue?: string;
	invalid?: boolean;
};

function parseDate(value?: string) {
	if (!value) return undefined;
	const date = new Date(`${value}T00:00:00`);
	return Number.isNaN(date.getTime()) ? undefined : date;
}

function toIsoDate(date: Date) {
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	return `${date.getFullYear()}-${month}-${day}`;
}

export function DatePicker({
	id,
	name,
	defaultValue,
	invalid,
}: DatePickerProps) {
	const [date, setDate] = useState(() => parseDate(defaultValue));
	const [open, setOpen] = useState(false);

	return (
		<>
			<input type="hidden" name={name} value={date ? toIsoDate(date) : ""} />
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
