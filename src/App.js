import React, { useState } from "react";
import { createEvent } from "ics";
import { saveAs } from "file-saver";
import "./App.css";

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
 * @function transformStartDate
 * @description transforma una fecha de inicio para que pueda ser interpretada por Calendar
 * @param {*} date fecha de inicio
 * @returns array de fecha
 */
export const transformStartDate = (date, time) => {
	const [year, month, day] = date.split("-").map(Number);
	const [hours, minutes] = time.split(":").map(Number);
	return [year, month, day, hours, minutes];
};

export const createMyEvent = (error, value) => {
	if (error) {
		console.error("error en lib ->", error);
		return;
	}
	console.table(value);
	const data = new Blob([value], { type: "text/calendar" });
	console.info("blob", data);
	saveAs(data, "event.ics");
};

function App() {
	//datos iniciales
	const [formData, setFormData] = useState({
		title: "",
		description: "",
		location: "",
		startDate: "",
		startTime: "",
		durationHours: 1,
		durationMinutes: 0,
		recurrence: "",
		count: 10,
		isRecurring: false,
		frequency: "",
		daysOfWeek: [],
	});

	//actualizar el state del form
	const handleChange = (event) => {
		const { name, value } = event.target;
		setFormData((prevData) => ({
			...prevData,
			[name]: value,
		}));
	};

	/**
	 * @function handleCheckboxChange
	 * @description maneja el cambio de estado de los checkbox
	 * @param {*} event
	 */
	const handleCheckboxChange = (event) => {
		const { name, checked } = event.target;
		setFormData((prevData) => {
			const newDaysOfWeek = checked
				? [...prevData.daysOfWeek, name]
				: prevData.daysOfWeek.filter((day) => day !== name);

			return {
				...prevData,
				daysOfWeek: newDaysOfWeek,
			};
		});
	};

	const handleRecurrenceToggle = () => {
		setFormData((prevData) => ({
			...prevData,
			isRecurring: !prevData.isRecurring,
			recurrence: "", // Reset recurrence when toggling
			frequency: "",
			daysOfWeek: [],
		}));
	};

	const handleSubmit = (event) => {
		event.preventDefault();

		const eventDetails = {
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
				formData.count
			),
		};

		console.log(eventDetails);

		createEvent(eventDetails, createMyEvent);
	};

	return (
		<div className="container">
			<h1 className="title">Crear un evento recurrente</h1>
			<form className="form" onSubmit={handleSubmit}>
				<div className="form-group">
					<label htmlFor="title">Título:</label>
					<input
						type="text"
						id="title"
						name="title"
						value={formData.title}
						onChange={handleChange}
						required
					/>
				</div>
				<div className="form-group">
					<label htmlFor="description">Descripción:</label>
					<input
						type="text"
						id="description"
						name="description"
						value={formData.description}
						onChange={handleChange}
					/>
				</div>
				<div className="form-group">
					<label htmlFor="location">Ubicación:</label>
					<input
						type="text"
						id="location"
						name="location"
						value={formData.location}
						onChange={handleChange}
					/>
				</div>
				<div className="form-group">
					<label htmlFor="startDate">Fecha de inicio (YYYY-MM-DD):</label>
					<input
						type="date"
						id="startDate"
						name="startDate"
						value={formData.startDate}
						onChange={handleChange}
						required
					/>
				</div>
				<div className="form-group">
					<label htmlFor="startTime">Hora de inicio (HH:MM):</label>
					<input
						type="time"
						id="startTime"
						name="startTime"
						value={formData.startTime}
						onChange={handleChange}
						required
					/>
				</div>
				<div className="form-group">
					<label htmlFor="durationHours">Duración (horas):</label>
					<input
						type="number"
						id="durationHours"
						name="durationHours"
						value={formData.durationHours}
						onChange={handleChange}
						required
					/>
				</div>
				<div className="form-group">
					<label htmlFor="durationMinutes">Duración (minutos):</label>
					<input
						type="number"
						id="durationMinutes"
						name="durationMinutes"
						value={formData.durationMinutes}
						onChange={handleChange}
						required
					/>
				</div>
				<div className="form-group">
					<label>
						<input
							type="checkbox"
							checked={formData.isRecurring}
							onChange={handleRecurrenceToggle}
						/>
						Evento recurrente
					</label>
				</div>
				{/*<-- Recurrencia --> */}
				{formData.isRecurring && (
					<>
						<div className="form-group">
							<label htmlFor="frequency">Frecuencia:</label>
							<select
								id="frequency"
								name="frequency"
								value={formData.frequency}
								onChange={handleChange}
							>
								<option value="">Seleccionar frecuencia</option>
								<option value="daily">Diario</option>
								<option value="weekly">Semanal</option>
								<option value="partOfWeek">Parte de la semana</option>
								<option value="monthly">Mensual</option>
							</select>
						</div>
						{formData.frequency === "partOfWeek" && (
							<div className="form-group">
								<label>Días de la semana:</label>
								<div className="checkbox-group">
									{[
										{ en: "MO", es: "L" },
										{ en: "TU", es: "M" },
										{ en: "WE", es: "X" },
										{ en: "TH", es: "J" },
										{ en: "FR", es: "V" },
										{ en: "SA", es: "S" },
										{ en: "SU", es: "D" },
									].map((day) => (
										<label key={day.en}>
											<input
												type="checkbox"
												name={day.en}
												checked={formData.daysOfWeek.includes(day.en)}
												onChange={handleCheckboxChange}
												value={day.en}
											/>
											{day.es}
										</label>
									))}
								</div>
							</div>
						)}
						<div className="form-group">
							<label htmlFor="count">Número de repeticiones:</label>
							<input
								type="number"
								id="count"
								name="count"
								value={formData.count}
								onChange={handleChange}
								required
							/>
						</div>
					</>
				)}

				<button className="submit-button" type="submit">
					Crear evento
				</button>
			</form>
		</div>
	);
}

export default App;
