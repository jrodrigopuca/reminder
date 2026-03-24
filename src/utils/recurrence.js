export const createWeeklyRecurrenceRule = (daysOfWeek) => {
	return `FREQ=WEEKLY;BYDAY=${daysOfWeek.join(",").toUpperCase()}`;
};

export const createFrequencyRecurrenceRule = (frequency) => {
	return `FREQ=${frequency.toUpperCase()}`;
};

export const transformRule = (isRecurring, frequency, daysOfWeek, count) => {
	let recurrenceRule = "";
	if (isRecurring) {
		recurrenceRule =
			frequency === "partOfWeek"
				? createWeeklyRecurrenceRule(daysOfWeek)
				: createFrequencyRecurrenceRule(frequency);
		recurrenceRule += `;COUNT=${count}`;
	}
	return recurrenceRule;
};

/**
 * Transforma una fecha y hora en el formato que espera la libreria ics.
 * @param {string} date - Fecha en formato YYYY-MM-DD
 * @param {string} time - Hora en formato HH:MM
 * @returns {number[]} Array [year, month, day, hours, minutes]
 */
export const transformStartDate = (date, time) => {
	const [year, month, day] = date.split("-").map(Number);
	const [hours, minutes] = time.split(":").map(Number);
	return [year, month, day, hours, minutes];
};
