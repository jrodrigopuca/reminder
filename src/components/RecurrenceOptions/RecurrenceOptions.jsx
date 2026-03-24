import DayPicker from "../DayPicker";

function RecurrenceOptions({
	frequency,
	daysOfWeek,
	endType,
	count,
	untilDate,
	interval,
	onChange,
	onDayChange,
	errors = {},
	styles,
}) {
	return (
		<>
			<div className={styles.formGroup}>
				<label htmlFor="frequency">Frecuencia:</label>
				<select
					id="frequency"
					name="frequency"
					className={errors.frequency ? styles.inputError : ""}
					value={frequency}
					onChange={onChange}
				>
					<option value="">Seleccionar frecuencia</option>
					<option value="daily">Diario</option>
					<option value="weekly">Semanal</option>
					<option value="partOfWeek">Parte de la semana</option>
					<option value="monthly">Mensual</option>
				</select>
				{errors.frequency && (
					<span className={styles.fieldError}>{errors.frequency}</span>
				)}
			</div>

			{frequency === "partOfWeek" && (
				<div className={styles.formGroup}>
					<label>Dias de la semana:</label>
					<div className={styles.checkboxGroup}>
						<DayPicker selectedDays={daysOfWeek} onChange={onDayChange} />
					</div>
					{errors.daysOfWeek && (
						<span className={styles.fieldError}>{errors.daysOfWeek}</span>
					)}
				</div>
			)}

			<div className={styles.formGroup}>
				<label htmlFor="interval">Cada cuantos periodos:</label>
				<input
					type="number"
					id="interval"
					name="interval"
					className={errors.interval ? styles.inputError : ""}
					value={interval}
					onChange={onChange}
					min="1"
				/>
				{errors.interval && (
					<span className={styles.fieldError}>{errors.interval}</span>
				)}
			</div>

			<div className={styles.formGroup}>
				<label htmlFor="endType">Terminacion:</label>
				<select
					id="endType"
					name="endType"
					value={endType}
					onChange={onChange}
				>
					<option value="count">Despues de N repeticiones</option>
					<option value="until">Hasta una fecha</option>
				</select>
			</div>

			{endType === "count" && (
				<div className={styles.formGroup}>
					<label htmlFor="count">Numero de repeticiones:</label>
					<input
						type="number"
						id="count"
						name="count"
						className={errors.count ? styles.inputError : ""}
						value={count}
						onChange={onChange}
						min="1"
					/>
					{errors.count && (
						<span className={styles.fieldError}>{errors.count}</span>
					)}
				</div>
			)}

			{endType === "until" && (
				<div className={styles.formGroup}>
					<label htmlFor="untilDate">Repetir hasta:</label>
					<input
						type="date"
						id="untilDate"
						name="untilDate"
						className={errors.untilDate ? styles.inputError : ""}
						value={untilDate}
						onChange={onChange}
					/>
					{errors.untilDate && (
						<span className={styles.fieldError}>{errors.untilDate}</span>
					)}
				</div>
			)}
		</>
	);
}

export default RecurrenceOptions;
