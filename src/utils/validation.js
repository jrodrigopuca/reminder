/**
 * Valida los datos del formulario de evento.
 * Retorna un objeto con los errores encontrados (clave = campo, valor = mensaje).
 * Si el objeto esta vacio, no hay errores.
 *
 * @param {object} formData
 * @param {object} [capabilities] - Provider capabilities. When omitted, all validations run.
 * @returns {object} Mapa de errores { campo: mensaje }
 */
export const validateEventForm = (formData, capabilities) => {
	const caps = capabilities ?? {
		recurrence: true,
		alarms: true,
		attendees: true,
		organizer: true,
		batch: true,
	};

	const errors = {};

	if (!formData.title.trim()) {
		errors.title = "El titulo es obligatorio";
	}

	if (!formData.startDate) {
		errors.startDate = "La fecha de inicio es obligatoria";
	}

	if (!formData.startTime) {
		errors.startTime = "La hora de inicio es obligatoria";
	}

	const hours = parseInt(formData.durationHours);
	const minutes = parseInt(formData.durationMinutes);

	if (isNaN(hours) || hours < 0) {
		errors.durationHours = "Las horas deben ser 0 o mayor";
	}

	if (isNaN(minutes) || minutes < 0 || minutes > 59) {
		errors.durationMinutes = "Los minutos deben estar entre 0 y 59";
	}

	if (!isNaN(hours) && !isNaN(minutes) && hours === 0 && minutes === 0) {
		errors.durationHours = "La duracion debe ser mayor a 0";
	}

	if (caps.recurrence && formData.isRecurring) {
		if (!formData.frequency) {
			errors.frequency = "Selecciona una frecuencia";
		}

		if (formData.frequency === "partOfWeek" && formData.daysOfWeek.length === 0) {
			errors.daysOfWeek = "Selecciona al menos un dia";
		}

		const interval = parseInt(formData.interval);
		if (!isNaN(interval) && interval < 1) {
			errors.interval = "El intervalo debe ser al menos 1";
		}

		const endType = formData.endType || "count";

		if (endType === "until") {
			if (!formData.untilDate) {
				errors.untilDate = "La fecha limite es obligatoria";
			} else if (formData.startDate && formData.untilDate <= formData.startDate) {
				errors.untilDate = "La fecha limite debe ser posterior a la fecha de inicio";
			}
		} else {
			const count = parseInt(formData.count);
			if (isNaN(count) || count < 1) {
				errors.count = "Las repeticiones deben ser al menos 1";
			}
		}
	}

	if (caps.attendees && formData.attendees?.length > 0) {
		const invalidEmails = formData.attendees.some(
			(a) => !a.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(a.email)
		);
		if (invalidEmails) {
			errors.attendees = "Todos los invitados deben tener un email valido";
		}
	}

	if (caps.organizer && formData.organizer?.email) {
		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.organizer.email)) {
			errors.organizerEmail = "El email del organizador no es valido";
		}
	}

	if (caps.batch && formData.batch?.enabled) {
		const batchHours = parseInt(formData.batch.intervalHours) || 0;
		const batchMinutes = parseInt(formData.batch.intervalMinutes) || 0;
		if (batchHours === 0 && batchMinutes === 0) {
			errors.batchInterval = "El intervalo batch debe ser mayor a 0";
		}

		const totalDays = parseInt(formData.batch.totalDays);
		if (isNaN(totalDays) || totalDays < 1) {
			errors.batchTotalDays = "La duracion debe ser al menos 1 dia";
		}
	}

	if (caps.alarms && formData.alarm?.enabled && formData.alarm.preset === "custom") {
		const alarmHours = parseInt(formData.alarm.customHours);
		const alarmMinutes = parseInt(formData.alarm.customMinutes);
		const validHours = !isNaN(alarmHours) && alarmHours >= 0;
		const validMinutes = !isNaN(alarmMinutes) && alarmMinutes >= 0;

		if (!validHours || !validMinutes) {
			errors.alarmCustom = "Los valores de la alarma deben ser 0 o mayor";
		} else if (alarmHours === 0 && alarmMinutes === 0) {
			errors.alarmCustom = "La alarma personalizada debe ser mayor a 0";
		}
	}

	return errors;
};

/**
 * Retorna true si no hay errores de validacion.
 * @param {object} errors - Resultado de validateEventForm
 * @returns {boolean}
 */
export const isFormValid = (errors) => Object.keys(errors).length === 0;
