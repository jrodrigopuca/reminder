/**
 * Valida los datos del formulario de evento.
 * Retorna un objeto con los errores encontrados (clave = campo, valor = mensaje).
 * Si el objeto esta vacio, no hay errores.
 *
 * @param {object} formData
 * @returns {object} Mapa de errores { campo: mensaje }
 */
export const validateEventForm = (formData) => {
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

	if (formData.isRecurring) {
		if (!formData.frequency) {
			errors.frequency = "Selecciona una frecuencia";
		}

		if (formData.frequency === "partOfWeek" && formData.daysOfWeek.length === 0) {
			errors.daysOfWeek = "Selecciona al menos un dia";
		}

		const count = parseInt(formData.count);
		if (isNaN(count) || count < 1) {
			errors.count = "Las repeticiones deben ser al menos 1";
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
