const FREQUENCY_LABELS = {
	daily: "Diario",
	weekly: "Semanal",
	partOfWeek: "Dias especificos",
	monthly: "Mensual",
};

const DAY_LABELS = {
	MO: "Lunes",
	TU: "Martes",
	WE: "Miercoles",
	TH: "Jueves",
	FR: "Viernes",
	SA: "Sabado",
	SU: "Domingo",
};

/**
 * Formatea una fecha YYYY-MM-DD a DD/MM/YYYY
 * @param {string} dateStr - Fecha en formato YYYY-MM-DD
 * @returns {string}
 */
export const formatDate = (dateStr) => {
	if (!dateStr) return "";
	const [year, month, day] = dateStr.split("-");
	return `${day}/${month}/${year}`;
};

/**
 * Formatea la duracion en texto legible.
 * @param {number|string} hours
 * @param {number|string} minutes
 * @returns {string}
 */
export const formatDuration = (hours, minutes) => {
	const h = parseInt(hours) || 0;
	const m = parseInt(minutes) || 0;

	if (h === 0 && m === 0) return "0 minutos";

	const parts = [];
	if (h > 0) parts.push(`${h} ${h === 1 ? "hora" : "horas"}`);
	if (m > 0) parts.push(`${m} ${m === 1 ? "minuto" : "minutos"}`);

	return parts.join(" y ");
};

/**
 * Formatea la recurrencia en texto legible.
 * @param {object} formData
 * @returns {string}
 */
export const formatRecurrence = (formData) => {
	if (!formData.isRecurring) return "No";

	const freq = FREQUENCY_LABELS[formData.frequency] || formData.frequency;
	const interval = parseInt(formData.interval) || 1;

	let text = freq;

	if (formData.frequency === "partOfWeek" && formData.daysOfWeek.length > 0) {
		const dayNames = formData.daysOfWeek.map((d) => DAY_LABELS[d] || d);
		text += ` (${dayNames.join(", ")})`;
	}

	if (interval > 1) {
		text += `, cada ${interval} periodos`;
	}

	const endType = formData.endType || "count";
	if (endType === "until" && formData.untilDate) {
		text += ` — hasta ${formatDate(formData.untilDate)}`;
	} else {
		const count = parseInt(formData.count) || 0;
		text += ` — ${count} ${count === 1 ? "repeticion" : "repeticiones"}`;
	}

	return text;
};

/**
 * Formatea la alarma en texto legible.
 * @param {object} alarm - { enabled, preset, customHours, customMinutes }
 * @returns {string}
 */
export const formatAlarm = (alarm) => {
	if (!alarm?.enabled || alarm.preset === "none") return "Sin recordatorio";

	if (alarm.preset === "custom") {
		const h = parseInt(alarm.customHours) || 0;
		const m = parseInt(alarm.customMinutes) || 0;
		if (h === 0 && m === 0) return "Sin recordatorio";
		return `${formatDuration(h, m)} antes`;
	}

	const presetMinutes = parseInt(alarm.preset);
	if (!presetMinutes) return "Sin recordatorio";

	if (presetMinutes < 60) return `${presetMinutes} minutos antes`;
	if (presetMinutes === 60) return "1 hora antes";
	if (presetMinutes === 1440) return "1 dia antes";

	return `${formatDuration(Math.floor(presetMinutes / 60), presetMinutes % 60)} antes`;
};

/**
 * Formatea la lista de invitados para el preview.
 * @param {object[]} attendees - [{ name, email, rsvp }]
 * @param {object} organizer - { name, email }
 * @returns {string}
 */
export const formatAttendees = (attendees, organizer) => {
	const parts = [];

	if (organizer?.email?.trim()) {
		const orgName = organizer.name?.trim();
		parts.push(`Organizador: ${orgName ? `${orgName} (${organizer.email.trim()})` : organizer.email.trim()}`);
	}

	if (attendees?.length > 0) {
		const validAttendees = attendees.filter((a) => a.email?.trim());
		if (validAttendees.length > 0) {
			const names = validAttendees.map((a) => {
				const name = a.name?.trim();
				const email = a.email.trim();
				const rsvpTag = a.rsvp ? " (RSVP)" : "";
				return name ? `${name} <${email}>${rsvpTag}` : `${email}${rsvpTag}`;
			});
			parts.push(`${validAttendees.length} ${validAttendees.length === 1 ? "invitado" : "invitados"}: ${names.join(", ")}`);
		}
	}

	return parts.length > 0 ? parts.join("\n") : "Sin invitados";
};

/**
 * Genera un resumen completo del evento para el preview.
 * @param {object} formData
 * @returns {object} { title, description, location, date, time, duration, recurrence, alarm }
 */
export const formatEventSummary = (formData) => ({
	title: formData.title,
	description: formData.description || "—",
	location: formData.location || "—",
	date: formatDate(formData.startDate),
	time: formData.startTime,
	duration: formatDuration(formData.durationHours, formData.durationMinutes),
	recurrence: formatRecurrence(formData),
	alarm: formatAlarm(formData.alarm),
});
