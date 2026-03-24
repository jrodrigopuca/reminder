import { transformRule } from "../utils/recurrence";

/**
 * Computa las fechas de inicio y fin a partir de fecha, hora y duracion.
 * @param {string} date - Fecha en formato "YYYY-MM-DD"
 * @param {string} time - Hora en formato "HH:mm"
 * @param {number} durationHours - Horas de duracion
 * @param {number} durationMinutes - Minutos de duracion
 * @returns {{ start: Date, end: Date }}
 */
export const computeStartEnd = (date, time, durationHours, durationMinutes) => {
	const [year, month, day] = date.split("-").map(Number);
	const [hours, minutes] = time.split(":").map(Number);

	const start = new Date(year, month - 1, day, hours, minutes, 0);
	const end = new Date(start.getTime() + ((durationHours || 0) * 60 + (durationMinutes || 0)) * 60 * 1000);

	return { start, end };
};

/**
 * Formatea un Date al formato Google Calendar: "YYYYMMDDTHHmmss"
 * @param {Date} date
 * @returns {string}
 */
export const formatGoogleDate = (date) => {
	const y = date.getFullYear();
	const mo = String(date.getMonth() + 1).padStart(2, "0");
	const d = String(date.getDate()).padStart(2, "0");
	const h = String(date.getHours()).padStart(2, "0");
	const mi = String(date.getMinutes()).padStart(2, "0");
	const s = String(date.getSeconds()).padStart(2, "0");
	return `${y}${mo}${d}T${h}${mi}${s}`;
};

/**
 * Formatea un Date al formato Outlook: "YYYY-MM-DDTHH:mm:ss"
 * @param {Date} date
 * @returns {string}
 */
export const formatOutlookDate = (date) => {
	const y = date.getFullYear();
	const mo = String(date.getMonth() + 1).padStart(2, "0");
	const d = String(date.getDate()).padStart(2, "0");
	const h = String(date.getHours()).padStart(2, "0");
	const mi = String(date.getMinutes()).padStart(2, "0");
	const s = String(date.getSeconds()).padStart(2, "0");
	return `${y}-${mo}-${d}T${h}:${mi}:${s}`;
};

/**
 * Construye la URL para agregar un evento a Google Calendar.
 * @param {object} formData - Datos del formulario
 * @returns {string} URL completa
 */
export const buildGoogleCalendarUrl = (formData) => {
	const { start, end } = computeStartEnd(
		formData.startDate,
		formData.startTime,
		parseInt(formData.durationHours),
		parseInt(formData.durationMinutes),
	);

	const params = new URLSearchParams();
	params.set("action", "TEMPLATE");
	params.set("text", formData.title);
	params.set("dates", `${formatGoogleDate(start)}/${formatGoogleDate(end)}`);

	if (formData.description?.trim()) {
		params.set("details", formData.description.trim());
	}

	if (formData.location?.trim()) {
		params.set("location", formData.location.trim());
	}

	if (formData.isRecurring) {
		const rule = transformRule({
			isRecurring: formData.isRecurring,
			frequency: formData.frequency,
			daysOfWeek: formData.daysOfWeek,
			endType: formData.endType,
			count: formData.count,
			untilDate: formData.untilDate,
			interval: formData.interval,
		});
		if (rule) {
			params.set("recur", `RRULE:${rule}`);
		}
	}

	if (formData.attendees?.length) {
		const emails = formData.attendees
			.filter((a) => a.email?.trim())
			.map((a) => a.email.trim());
		if (emails.length) {
			params.set("add", emails.join(","));
		}
	}

	return `https://calendar.google.com/calendar/render?${params.toString()}`;
};

/**
 * Construye la URL para agregar un evento a Outlook Calendar.
 * @param {object} formData - Datos del formulario
 * @param {string} domain - "outlook.live.com" o "outlook.office.com"
 * @returns {string} URL completa
 */
export const buildOutlookCalendarUrl = (formData, domain) => {
	const { start, end } = computeStartEnd(
		formData.startDate,
		formData.startTime,
		parseInt(formData.durationHours),
		parseInt(formData.durationMinutes),
	);

	const params = new URLSearchParams();
	params.set("path", "/calendar/action/compose");
	params.set("rru", "addevent");
	params.set("subject", formData.title);
	params.set("startdt", formatOutlookDate(start));
	params.set("enddt", formatOutlookDate(end));

	if (formData.description?.trim()) {
		params.set("body", formData.description.trim());
	}

	if (formData.location?.trim()) {
		params.set("location", formData.location.trim());
	}

	if (formData.attendees?.length) {
		const emails = formData.attendees
			.filter((a) => a.email?.trim())
			.map((a) => a.email.trim());
		if (emails.length) {
			params.set("to", emails.join(";"));
		}
	}

	return `https://${domain}/calendar/deeplink/compose?${params.toString()}`;
};
