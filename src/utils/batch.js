/**
 * Genera un array de fechas de inicio para eventos batch.
 * Esto resuelve frecuencias sub-diarias (ej: cada 8 horas)
 * que Google Calendar ignora con FREQ=HOURLY en RRULE.
 *
 * @param {object} options
 * @param {string} options.startDate - YYYY-MM-DD
 * @param {string} options.startTime - HH:MM
 * @param {number} options.intervalHours - Horas entre eventos
 * @param {number} options.intervalMinutes - Minutos entre eventos
 * @param {number} options.totalDays - Dias durante los cuales generar eventos
 * @returns {Date[]} Array de fechas de inicio
 */
export const generateBatchDates = ({
	startDate,
	startTime,
	intervalHours = 0,
	intervalMinutes = 0,
	totalDays = 1,
}) => {
	if (!startDate || !startTime) return [];

	const hours = parseInt(intervalHours) || 0;
	const minutes = parseInt(intervalMinutes) || 0;
	const intervalMs = (hours * 60 + minutes) * 60 * 1000;

	if (intervalMs <= 0) return [];

	const [year, month, day] = startDate.split("-").map(Number);
	const [hour, minute] = startTime.split(":").map(Number);

	const start = new Date(year, month - 1, day, hour, minute, 0, 0);
	const days = parseInt(totalDays) || 1;
	const endMs = start.getTime() + days * 24 * 60 * 60 * 1000;

	const dates = [];
	let current = start.getTime();

	while (current < endMs) {
		dates.push(new Date(current));
		current += intervalMs;
	}

	return dates;
};

/**
 * Convierte un Date a array [year, month, day, hour, minute] para la libreria ics.
 * @param {Date} date
 * @returns {number[]}
 */
export const dateToIcsStart = (date) => [
	date.getFullYear(),
	date.getMonth() + 1,
	date.getDate(),
	date.getHours(),
	date.getMinutes(),
];

/**
 * Formatea una fecha batch para el preview.
 * @param {Date} date
 * @returns {string} Ej: "Lun 16/06/2025 09:00"
 */
export const formatBatchDate = (date) => {
	const dayNames = ["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"];
	const dayName = dayNames[date.getDay()];
	const dd = String(date.getDate()).padStart(2, "0");
	const mm = String(date.getMonth() + 1).padStart(2, "0");
	const yyyy = date.getFullYear();
	const hh = String(date.getHours()).padStart(2, "0");
	const min = String(date.getMinutes()).padStart(2, "0");
	return `${dayName} ${dd}/${mm}/${yyyy} ${hh}:${min}`;
};
