function AlarmOptions({ alarm, onAlarmChange, errors = {}, styles }) {
	const handleToggle = () => {
		onAlarmChange("enabled", !alarm.enabled);
		if (alarm.enabled) {
			onAlarmChange("preset", "none");
			onAlarmChange("customHours", 0);
			onAlarmChange("customMinutes", 0);
		}
	};

	const handlePresetChange = (event) => {
		onAlarmChange("preset", event.target.value);
	};

	const handleCustomChange = (event) => {
		onAlarmChange(event.target.name, parseInt(event.target.value) || 0);
	};

	return (
		<>
			<div className={styles.formGroup}>
				<label className={styles.checkboxLabel}>
					<input
						type="checkbox"
						checked={alarm.enabled}
						onChange={handleToggle}
					/>
					Agregar recordatorio
				</label>
			</div>

			{alarm.enabled && (
				<>
					<div className={styles.formGroup}>
						<label htmlFor="alarmPreset">Recordar antes:</label>
						<select
							id="alarmPreset"
							value={alarm.preset}
							onChange={handlePresetChange}
						>
							<option value="none">Sin recordatorio</option>
							<option value="5">5 minutos antes</option>
							<option value="15">15 minutos antes</option>
							<option value="30">30 minutos antes</option>
							<option value="60">1 hora antes</option>
							<option value="1440">1 dia antes</option>
							<option value="custom">Personalizado</option>
						</select>
					</div>

					{alarm.preset === "custom" && (
						<div className={styles.formGroup}>
							<label>Tiempo antes del evento:</label>
							<div className={styles.inlineFields}>
								<div className={styles.inlineField}>
									<input
										type="number"
										name="customHours"
										className={errors.alarmCustom ? styles.inputError : ""}
										value={alarm.customHours}
										onChange={handleCustomChange}
										min="0"
									/>
									<span>horas</span>
								</div>
								<div className={styles.inlineField}>
									<input
										type="number"
										name="customMinutes"
										className={errors.alarmCustom ? styles.inputError : ""}
										value={alarm.customMinutes}
										onChange={handleCustomChange}
										min="0"
										max="59"
									/>
									<span>minutos</span>
								</div>
							</div>
							{errors.alarmCustom && (
								<span className={styles.fieldError}>{errors.alarmCustom}</span>
							)}
						</div>
					)}
				</>
			)}
		</>
	);
}

export default AlarmOptions;
