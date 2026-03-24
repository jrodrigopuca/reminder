import { useState } from "react";
import { downloadIcsFile } from "./services/ics";
import { validateEventForm, isFormValid } from "./utils/validation";
import RecurrenceOptions from "./components/RecurrenceOptions";
import styles from "./App.module.css";

const INITIAL_FORM_DATA = {
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
};

function App() {
	const [formData, setFormData] = useState(INITIAL_FORM_DATA);
	const [errors, setErrors] = useState({});
	const [submitted, setSubmitted] = useState(false);

	const currentErrors = submitted ? validateEventForm(formData) : errors;
	const canSubmit = isFormValid(validateEventForm(formData));

	const handleChange = (event) => {
		const { name, value } = event.target;
		setFormData((prevData) => ({
			...prevData,
			[name]: value,
		}));
	};

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
			recurrence: "",
			frequency: "",
			daysOfWeek: [],
		}));
	};

	const handleSubmit = (event) => {
		event.preventDefault();
		setSubmitted(true);

		const validationErrors = validateEventForm(formData);
		setErrors(validationErrors);

		if (!isFormValid(validationErrors)) {
			return;
		}

		downloadIcsFile(formData);
	};

	const fieldClassName = (fieldName) =>
		currentErrors[fieldName] ? `${styles.inputError}` : "";

	return (
		<div className={styles.container}>
			<h1 className={styles.title}>Crear un evento recurrente</h1>
			<form className={styles.form} onSubmit={handleSubmit} noValidate>
				<div className={styles.formGroup}>
					<label htmlFor="title">Título:</label>
					<input
						type="text"
						id="title"
						name="title"
						className={fieldClassName("title")}
						value={formData.title}
						onChange={handleChange}
					/>
					{currentErrors.title && (
						<span className={styles.fieldError}>{currentErrors.title}</span>
					)}
				</div>
				<div className={styles.formGroup}>
					<label htmlFor="description">Descripción:</label>
					<input
						type="text"
						id="description"
						name="description"
						value={formData.description}
						onChange={handleChange}
					/>
				</div>
				<div className={styles.formGroup}>
					<label htmlFor="location">Ubicación:</label>
					<input
						type="text"
						id="location"
						name="location"
						value={formData.location}
						onChange={handleChange}
					/>
				</div>
				<div className={styles.formGroup}>
					<label htmlFor="startDate">Fecha de inicio:</label>
					<input
						type="date"
						id="startDate"
						name="startDate"
						className={fieldClassName("startDate")}
						value={formData.startDate}
						onChange={handleChange}
					/>
					{currentErrors.startDate && (
						<span className={styles.fieldError}>{currentErrors.startDate}</span>
					)}
				</div>
				<div className={styles.formGroup}>
					<label htmlFor="startTime">Hora de inicio:</label>
					<input
						type="time"
						id="startTime"
						name="startTime"
						className={fieldClassName("startTime")}
						value={formData.startTime}
						onChange={handleChange}
					/>
					{currentErrors.startTime && (
						<span className={styles.fieldError}>{currentErrors.startTime}</span>
					)}
				</div>
				<div className={styles.formGroup}>
					<label htmlFor="durationHours">Duración (horas):</label>
					<input
						type="number"
						id="durationHours"
						name="durationHours"
						className={fieldClassName("durationHours")}
						value={formData.durationHours}
						onChange={handleChange}
						min="0"
					/>
					{currentErrors.durationHours && (
						<span className={styles.fieldError}>
							{currentErrors.durationHours}
						</span>
					)}
				</div>
				<div className={styles.formGroup}>
					<label htmlFor="durationMinutes">Duración (minutos):</label>
					<input
						type="number"
						id="durationMinutes"
						name="durationMinutes"
						className={fieldClassName("durationMinutes")}
						value={formData.durationMinutes}
						onChange={handleChange}
						min="0"
						max="59"
					/>
					{currentErrors.durationMinutes && (
						<span className={styles.fieldError}>
							{currentErrors.durationMinutes}
						</span>
					)}
				</div>
				<div className={styles.formGroup}>
					<label className={styles.checkboxLabel}>
						<input
							type="checkbox"
							checked={formData.isRecurring}
							onChange={handleRecurrenceToggle}
						/>
						Evento recurrente
					</label>
				</div>

				{formData.isRecurring && (
					<RecurrenceOptions
						frequency={formData.frequency}
						daysOfWeek={formData.daysOfWeek}
						count={formData.count}
						onChange={handleChange}
						onDayChange={handleCheckboxChange}
						errors={currentErrors}
						styles={styles}
					/>
				)}

				<button
					className={styles.submitButton}
					type="submit"
					disabled={submitted && !canSubmit}
				>
					Crear evento
				</button>
			</form>
		</div>
	);
}

export default App;
