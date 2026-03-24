const DAY_INDEX = { SU: 0, MO: 1, TU: 2, WE: 3, TH: 4, FR: 5, SA: 6 };

/**
 * Agrega N periodos a una fecha segun la frecuencia.
 * Retorna una NUEVA Date (no muta la original).
 */
const addPeriod = (date, frequency, n) => {
	const next = new Date(date);
	if (frequency === "daily") {
		next.setDate(next.getDate() + n);
	} else if (frequency === "weekly" || frequency === "partOfWeek") {
		next.setDate(next.getDate() + 7 * n);
	} else if (frequency === "monthly") {
		next.setMonth(next.getMonth() + n);
	}
	return next;
};

/**
 * Genera las proximas ocurrencias para frecuencias simples (daily, weekly, monthly).
 */
const generateSimpleOccurrences = (start, frequency, interval, limit, untilDate) => {
	const dates = [];
	let current = new Date(start);

	for (let i = 0; i < limit; i++) {
		if (untilDate && current > untilDate) break;
		dates.push(new Date(current));
		current = addPeriod(current, frequency, interval);
	}

	return dates;
};

/**
 * Genera las proximas ocurrencias para partOfWeek.
 * Itera dia a dia desde el start, y solo incluye los dias seleccionados.
 * El interval aplica como "cada N semanas".
 */
const generatePartOfWeekOccurrences = (start, daysOfWeek, interval, limit, untilDate) => {
	const targetDays = new Set(daysOfWeek.map((d) => DAY_INDEX[d]));
	const dates = [];
	let current = new Date(start);

	// Encontrar el lunes de la semana del start
	const startDay = current.getDay();
	const mondayOffset = startDay === 0 ? -6 : 1 - startDay;
	let weekStart = new Date(current);
	weekStart.setDate(weekStart.getDate() + mondayOffset);

	const MAX_ITERATIONS = 1000;
	let iterations = 0;

	while (dates.length < limit && iterations < MAX_ITERATIONS) {
		// Recorrer los 7 dias de esta semana
		for (let dayOffset = 0; dayOffset < 7 && dates.length < limit; dayOffset++) {
			const candidate = new Date(weekStart);
			candidate.setDate(candidate.getDate() + dayOffset);

			if (candidate < start) continue;
			if (untilDate && candidate > untilDate) return dates;

			if (targetDays.has(candidate.getDay())) {
				dates.push(new Date(candidate));
			}
		}

		// Saltar al inicio de la siguiente semana valida (interval semanas)
		weekStart.setDate(weekStart.getDate() + 7 * interval);
		iterations++;
	}

	return dates;
};

/**
 * Calcula las proximas ocurrencias de un evento recurrente.
 *
 * @param {object} formData - Datos del formulario
 * @param {number} maxResults - Maximo de fechas a generar (default 10)
 * @returns {Date[]} Array de fechas de ocurrencia
 */
export const calculateOccurrences = (formData, maxResults = 10) => {
	if (!formData.isRecurring || !formData.startDate || !formData.frequency) {
		return [];
	}

	if (formData.frequency === "partOfWeek" && (!formData.daysOfWeek || formData.daysOfWeek.length === 0)) {
		return [];
	}

	const [year, month, day] = formData.startDate.split("-").map(Number);
	const start = new Date(year, month - 1, day);

	const interval = Math.max(1, parseInt(formData.interval) || 1);
	const endType = formData.endType || "count";

	let limit;
	let untilDate = null;

	if (endType === "until" && formData.untilDate) {
		const [uy, um, ud] = formData.untilDate.split("-").map(Number);
		untilDate = new Date(uy, um - 1, ud);
		limit = maxResults;
	} else {
		const count = parseInt(formData.count) || 10;
		limit = Math.min(count, maxResults);
	}

	if (formData.frequency === "partOfWeek" && formData.daysOfWeek.length > 0) {
		return generatePartOfWeekOccurrences(start, formData.daysOfWeek, interval, limit, untilDate);
	}

	return generateSimpleOccurrences(start, formData.frequency, interval, limit, untilDate);
};

/**
 * Formatea una Date a string legible "Lun 16/06/2025".
 * @param {Date} date
 * @returns {string}
 */
export const formatOccurrenceDate = (date) => {
	const days = ["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"];
	const dayName = days[date.getDay()];
	const dd = String(date.getDate()).padStart(2, "0");
	const mm = String(date.getMonth() + 1).padStart(2, "0");
	const yyyy = date.getFullYear();
	return `${dayName} ${dd}/${mm}/${yyyy}`;
};
