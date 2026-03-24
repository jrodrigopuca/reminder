import { createEvent, createEvents } from "ics";
import { saveAs } from "file-saver";
import { transformStartDate, transformRule } from "../utils/recurrence";
import { generateBatchDates, dateToIcsStart } from "../utils/batch";

/**
 * Construye el array de alarmas para la libreria ics.
 * @param {object} alarmData - { enabled, preset, customHours, customMinutes }
 * @returns {object[]|undefined} Array de alarmas o undefined si no hay
 */
export const buildAlarms = (alarmData) => {
	if (!alarmData?.enabled || alarmData.preset === "none") return undefined;

	let trigger;

	if (alarmData.preset === "custom") {
		const hours = parseInt(alarmData.customHours) || 0;
		const minutes = parseInt(alarmData.customMinutes) || 0;
		if (hours === 0 && minutes === 0) return undefined;
		trigger = { before: true, hours, minutes };
	} else {
		const presetMinutes = parseInt(alarmData.preset);
		if (!presetMinutes) return undefined;

		const hours = Math.floor(presetMinutes / 60);
		const minutes = presetMinutes % 60;
		trigger = { before: true, hours, minutes };
	}

	return [
		{
			action: "display",
			description: "Recordatorio",
			trigger,
		},
	];
};

/**
 * Construye el array de attendees para la libreria ics.
 * @param {object[]} attendees - [{ name, email, rsvp }]
 * @returns {object[]|undefined}
 */
export const buildAttendees = (attendees) => {
	if (!attendees?.length) return undefined;

	return attendees
		.filter((a) => a.email?.trim())
		.map((a) => ({
			name: a.name?.trim() || undefined,
			email: a.email.trim(),
			rsvp: a.rsvp ?? false,
			role: "REQ-PARTICIPANT",
			partstat: "NEEDS-ACTION",
		}));
};

/**
 * Construye el objeto de organizer para la libreria ics.
 * @param {object} organizer - { name, email }
 * @returns {object|undefined}
 */
export const buildOrganizer = (organizer) => {
	if (!organizer?.email?.trim()) return undefined;

	return {
		name: organizer.name?.trim() || undefined,
		email: organizer.email.trim(),
	};
};

/**
 * Construye el objeto de evento que espera la libreria ics.
 * @param {object} formData - Datos del formulario
 * @returns {object} EventAttributes para la libreria ics
 */
export const buildEventDetails = (formData) => {
	const event = {
		start: transformStartDate(formData.startDate, formData.startTime),
		duration: {
			hours: parseInt(formData.durationHours),
			minutes: parseInt(formData.durationMinutes),
		},
		title: formData.title,
		description: formData.description,
		location: formData.location,
		recurrenceRule: transformRule({
			isRecurring: formData.isRecurring,
			frequency: formData.frequency,
			daysOfWeek: formData.daysOfWeek,
			endType: formData.endType,
			count: formData.count,
			untilDate: formData.untilDate,
			interval: formData.interval,
		}),
	};

	const alarms = buildAlarms(formData.alarm);
	if (alarms) {
		event.alarms = alarms;
	}

	const attendees = buildAttendees(formData.attendees);
	if (attendees?.length) {
		event.attendees = attendees;
	}

	const organizer = buildOrganizer(formData.organizer);
	if (organizer) {
		event.organizer = organizer;
	}

	return event;
};

/**
 * Genera y descarga un archivo .ics a partir de los datos del formulario.
 * @param {object} formData - Datos del formulario
 */
export const downloadIcsFile = (formData) => {
	const eventDetails = buildEventDetails(formData);

	createEvent(eventDetails, (error, value) => {
		if (error) {
			console.error("Error generando evento ICS:", error);
			return;
		}

		const blob = new Blob([value], { type: "text/calendar" });
		const filename = formData.title
			? `${formData.title.replace(/\s+/g, "_")}.ics`
			: "event.ics";
		saveAs(blob, filename);
	});
};

/**
 * Construye un array de eventos individuales para batch generation.
 * Cada evento tiene su propia fecha de inicio pero comparte titulo, duracion, etc.
 *
 * @param {object} formData - Datos del formulario
 * @returns {object[]} Array de EventAttributes para createEvents
 */
export const buildBatchEvents = (formData) => {
	const dates = generateBatchDates({
		startDate: formData.startDate,
		startTime: formData.startTime,
		intervalHours: formData.batch?.intervalHours,
		intervalMinutes: formData.batch?.intervalMinutes,
		totalDays: formData.batch?.totalDays,
	});

	if (dates.length === 0) return [];

	const alarms = buildAlarms(formData.alarm);
	const attendees = buildAttendees(formData.attendees);
	const organizer = buildOrganizer(formData.organizer);

	return dates.map((date, index) => {
		const event = {
			start: dateToIcsStart(date),
			duration: {
				hours: parseInt(formData.durationHours),
				minutes: parseInt(formData.durationMinutes),
			},
			title: dates.length > 1
				? `${formData.title} (${index + 1}/${dates.length})`
				: formData.title,
			description: formData.description,
			location: formData.location,
		};

		if (alarms) event.alarms = alarms;
		if (attendees?.length) event.attendees = attendees;
		if (organizer) event.organizer = organizer;

		return event;
	});
};

/**
 * Genera y descarga un archivo .ics con multiples eventos (batch).
 * @param {object} formData - Datos del formulario con batch config
 */
export const downloadBatchIcsFile = (formData) => {
	const events = buildBatchEvents(formData);

	if (events.length === 0) {
		console.error("No se generaron eventos batch");
		return;
	}

	const { error, value } = createEvents(events);

	if (error) {
		console.error("Error generando eventos batch ICS:", error);
		return;
	}

	const blob = new Blob([value], { type: "text/calendar" });
	const filename = formData.title
		? `${formData.title.replace(/\s+/g, "_")}_batch.ics`
		: "events_batch.ics";
	saveAs(blob, filename);
};
