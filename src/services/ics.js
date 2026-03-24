import { createEvent } from "ics";
import { saveAs } from "file-saver";
import { transformStartDate, transformRule } from "../utils/recurrence";

/**
 * Construye el objeto de evento que espera la libreria ics.
 * @param {object} formData - Datos del formulario
 * @returns {object} EventAttributes para la libreria ics
 */
export const buildEventDetails = (formData) => ({
	start: transformStartDate(formData.startDate, formData.startTime),
	duration: {
		hours: parseInt(formData.durationHours),
		minutes: parseInt(formData.durationMinutes),
	},
	title: formData.title,
	description: formData.description,
	location: formData.location,
	recurrenceRule: transformRule(
		formData.isRecurring,
		formData.frequency,
		formData.daysOfWeek,
		formData.count,
	),
});

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
