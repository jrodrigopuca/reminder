function BatchOptions({ batch, onBatchChange, errors, styles }) {
	return (
		<div className={styles.formGroup}>
			<label className={styles.checkboxLabel}>
				<input
					type="checkbox"
					checked={batch.enabled}
					onChange={(e) => onBatchChange("enabled", e.target.checked)}
				/>
				Generar eventos en batch (frecuencias sub-diarias)
			</label>

			{batch.enabled && (
				<>
					<label style={{ marginTop: "12px", display: "block" }}>
						Repetir cada:
					</label>
					<div className={styles.inlineFields}>
						<div className={styles.inlineField}>
							<input
								type="number"
								min="0"
								value={batch.intervalHours}
								onChange={(e) => onBatchChange("intervalHours", e.target.value)}
							/>
							<span>horas</span>
						</div>
						<div className={styles.inlineField}>
							<input
								type="number"
								min="0"
								max="59"
								value={batch.intervalMinutes}
								onChange={(e) => onBatchChange("intervalMinutes", e.target.value)}
							/>
							<span>minutos</span>
						</div>
					</div>
					{errors.batchInterval && (
						<span className={styles.fieldError}>{errors.batchInterval}</span>
					)}

					<label style={{ marginTop: "12px", display: "block" }}>
						Durante:
					</label>
					<div className={styles.inlineFields}>
						<div className={styles.inlineField}>
							<input
								type="number"
								min="1"
								value={batch.totalDays}
								onChange={(e) => onBatchChange("totalDays", e.target.value)}
							/>
							<span>dias</span>
						</div>
					</div>
					{errors.batchTotalDays && (
						<span className={styles.fieldError}>{errors.batchTotalDays}</span>
					)}
				</>
			)}
		</div>
	);
}

export default BatchOptions;
