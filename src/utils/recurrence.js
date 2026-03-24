export const createWeeklyRecurrenceRule = (daysOfWeek) => {
	return `FREQ=WEEKLY;BYDAY=${daysOfWeek.join(",").toUpperCase()}`;
};

export const createFrequencyRecurrenceRule = (frequency) => {
	return `FREQ=${frequency.toUpperCase()}`;
};

/**
 * Construye la RRULE completa a partir de las opciones de recurrencia.
 *
 * @param {object} options
 * @param {boolean} options.isRecurring
 * @param {string} options.frequency - "daily" | "weekly" | "partOfWeek" | "monthly"
 * @param {string[]} options.daysOfWeek - Dias para partOfWeek (ej: ["MO", "WE"])
 * @param {string} options.endType - "count" | "until"
 * @param {number} options.count - Numero de repeticiones (si endType === "count")
 * @param {string} options.untilDate - Fecha limite YYYY-MM-DD (si endType === "until")
 * @param {number} options.interval - Cada N periodos (1 = cada periodo, 2 = cada 2, etc.)
 * @returns {string} RRULE string o vacio
 */
export const transformRule = ({
	isRecurring,
	frequency,
	daysOfWeek = [],
	endType = "count",
	count = 10,
	untilDate = "",
	interval = 1,
}) => {
	if (!isRecurring) return "";

	let rule =
		frequency === "partOfWeek"
			? createWeeklyRecurrenceRule(daysOfWeek)
			: createFrequencyRecurrenceRule(frequency);

	if (interval > 1) {
		rule += `;INTERVAL=${interval}`;
	}

	if (endType === "until" && untilDate) {
		const formatted = untilDate.replace(/-/g, "");
		rule += `;UNTIL=${formatted}T235959Z`;
	} else {
		rule += `;COUNT=${count}`;
	}

	return rule;
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
