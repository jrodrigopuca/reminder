import { useState } from "react";
import { downloadIcsFile, downloadBatchIcsFile } from "./services/ics";
import { PROVIDERS, DEFAULT_PROVIDER, getCapabilities } from "./services/providers";
import { buildGoogleCalendarUrl, buildOutlookCalendarUrl } from "./services/calendarLinks";
import { validateEventForm, isFormValid } from "./utils/validation";
import RecurrenceOptions from "./components/RecurrenceOptions";
import AlarmOptions from "./components/AlarmOptions";
import AttendeeList from "./components/AttendeeList";
import BatchOptions from "./components/BatchOptions";
import LivePreview from "./components/LivePreview";
import styles from "./App.module.css";

const INITIAL_FORM_DATA = {
	title: "",
	description: "",
	location: "",
	startDate: "",
	startTime: "",
	durationHours: 1,
	durationMinutes: 0,
	isRecurring: false,
	frequency: "",
	daysOfWeek: [],
	endType: "count",
	count: 10,
	untilDate: "",
	interval: 1,
	alarm: {
		enabled: false,
		preset: "none",
		customHours: 0,
		customMinutes: 0,
	},
	attendees: [],
	organizer: { name: "", email: "" },
	batch: {
		enabled: false,
		intervalHours: 8,
		intervalMinutes: 0,
		totalDays: 1,
	},
};

function App() {
	const [formData, setFormData] = useState(INITIAL_FORM_DATA);
	const [errors, setErrors] = useState({});
	const [submitted, setSubmitted] = useState(false);
	const [selectedProvider, setSelectedProvider] = useState(DEFAULT_PROVIDER);

	const capabilities = getCapabilities(selectedProvider);
	const providerConfig = PROVIDERS[selectedProvider];

	const currentErrors = submitted ? validateEventForm(formData, capabilities) : errors;
	const canSubmit = isFormValid(validateEventForm(formData, capabilities));

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
			frequency: "",
			daysOfWeek: [],
			endType: "count",
			count: 10,
			untilDate: "",
			interval: 1,
		}));
	};

	const handleAlarmChange = (field, value) => {
		setFormData((prevData) => ({
			...prevData,
			alarm: {
				...prevData.alarm,
				[field]: value,
			},
		}));
	};

	const handleAttendeeAdd = () => {
		setFormData((prevData) => ({
			...prevData,
			attendees: [...prevData.attendees, { name: "", email: "", rsvp: false }],
		}));
	};

	const handleAttendeeRemove = (index) => {
		setFormData((prevData) => ({
			...prevData,
			attendees: prevData.attendees.filter((_, i) => i !== index),
		}));
	};

	const handleAttendeeChange = (index, field, value) => {
		setFormData((prevData) => ({
			...prevData,
			attendees: prevData.attendees.map((a, i) =>
				i === index ? { ...a, [field]: value } : a
			),
		}));
	};

	const handleOrganizerChange = (field, value) => {
		setFormData((prevData) => ({
			...prevData,
			organizer: {
				...prevData.organizer,
				[field]: value,
			},
		}));
	};

	const handleBatchChange = (field, value) => {
		setFormData((prevData) => ({
			...prevData,
			batch: {
				...prevData.batch,
				[field]: value,
			},
		}));
	};

	const handleSubmit = (event) => {
		event.preventDefault();
		setSubmitted(true);

		const validationErrors = validateEventForm(formData, capabilities);
		setErrors(validationErrors);

		if (!isFormValid(validationErrors)) {
			return;
		}

		if (providerConfig.action === "download") {
			if (formData.batch?.enabled) {
				downloadBatchIcsFile(formData);
			} else {
				downloadIcsFile(formData);
			}
		} else {
			let url;
			if (selectedProvider === "google") {
				url = buildGoogleCalendarUrl(formData);
			} else if (selectedProvider === "outlook-personal") {
				url = buildOutlookCalendarUrl(formData, "outlook.live.com");
			} else if (selectedProvider === "outlook-work") {
				url = buildOutlookCalendarUrl(formData, "outlook.office.com");
			}
			if (url) {
				window.open(url, "_blank", "noopener,noreferrer");
			}
		}
	};

	const fieldClassName = (fieldName) =>
		currentErrors[fieldName] ? `${styles.inputError}` : "";

	return (
		<div className={styles.layout}>
			<div className={styles.container}>
				<h1 className={styles.title}>Crear un evento recurrente</h1>
				<form className={styles.form} onSubmit={handleSubmit} noValidate>
					<div className={`${styles.formGroup} ${styles.providerGroup}`}>
						<label htmlFor="provider">Calendario destino:</label>
						<select
							id="provider"
							name="provider"
							value={selectedProvider}
							onChange={(e) => setSelectedProvider(e.target.value)}
						>
							{Object.entries(PROVIDERS).map(([id, { label }]) => (
								<option key={id} value={id}>{label}</option>
							))}
						</select>
					</div>
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
							<span className={styles.fieldError}>
								{currentErrors.startDate}
							</span>
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
							<span className={styles.fieldError}>
								{currentErrors.startTime}
							</span>
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
					{capabilities.recurrence && (
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
					)}

					{capabilities.recurrence && formData.isRecurring && (
						<RecurrenceOptions
							frequency={formData.frequency}
							daysOfWeek={formData.daysOfWeek}
							endType={formData.endType}
							count={formData.count}
							untilDate={formData.untilDate}
							interval={formData.interval}
							onChange={handleChange}
							onDayChange={handleCheckboxChange}
							errors={currentErrors}
							styles={styles}
						/>
					)}

					{capabilities.alarms && (
						<AlarmOptions
							alarm={formData.alarm}
							onAlarmChange={handleAlarmChange}
							errors={currentErrors}
							styles={styles}
						/>
					)}

					<AttendeeList
						attendees={formData.attendees}
						organizer={formData.organizer}
						onAttendeeAdd={handleAttendeeAdd}
						onAttendeeRemove={handleAttendeeRemove}
						onAttendeeChange={handleAttendeeChange}
						onOrganizerChange={handleOrganizerChange}
						showOrganizer={capabilities.organizer}
						errors={currentErrors}
						styles={styles}
					/>

					{capabilities.batch && (
						<BatchOptions
							batch={formData.batch}
							onBatchChange={handleBatchChange}
							errors={currentErrors}
							styles={styles}
						/>
					)}

					<button
						className={styles.submitButton}
						type="submit"
						disabled={submitted && !canSubmit}
					>
						{providerConfig.action === "download"
							? formData.batch?.enabled
								? "Descargar .ics (batch)"
								: "Descargar .ics"
							: `Abrir en ${providerConfig.label}`}
					</button>
				</form>
			</div>

			<LivePreview formData={formData} capabilities={capabilities} styles={styles} />
		</div>
	);
}

export default App;
