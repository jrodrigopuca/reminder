import React, { useState } from "react";
import { createEvent } from "ics";
import { saveAs } from "file-saver";
import "./App.css";

function App() {
	//datos iniciales
	const [formData, setFormData] = useState({
		title: "",
		description: "",
		location: "",
		start: "",
		durationHours: 1,
		durationMinutes: 0,
		recurrence: "FREQ=WEEKLY;BYDAY=MO",
		count: 10,
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
	 * @function transformStartDate
	 * @description transforma una fecha de inicio para que pueda ser interpretada por Calendar
	 * @param {*} date fecha de inicio
	 * @returns array de fecha
	 */
	const transformStartDate = (date) => {
		const startArray = date
			.split("-")
			.map((item, index) =>
				index === 1 ? parseInt(item, 10) - 1 : parseInt(item, 10)
			);
		startArray.push(12, 0); // Añadir hora y minutos
		return startArray;
	};

	const handleSubmit = (event) => {
		event.preventDefault();

		const eventDetails = {
			start: transformStartDate(formData.start),
			duration: {
				hours: parseInt(formData.durationHours),
				minutes: parseInt(formData.durationMinutes),
			},
			title: formData.title,
			description: formData.description,
			location: formData.location,
			recurrenceRule: `${formData.recurrence};COUNT=${formData.count}`,
		};
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
					<label htmlFor="start">Fecha de inicio (YYYY-MM-DD):</label>
					<input
						type="date"
						id="start"
						name="start"
						value={formData.start}
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
					<label htmlFor="recurrence">
						Recurrencia (e.g., FREQ=WEEKLY;BYDAY=MO):
					</label>
					<input
						type="text"
						id="recurrence"
						name="recurrence"
						value={formData.recurrence}
						onChange={handleChange}
						required
					/>
				</div>
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
				<button className="submit-button" type="submit">
					Crear evento
				</button>
			</form>
		</div>
	);
}

export default App;
