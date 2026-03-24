import { calculateOccurrences, formatOccurrenceDate } from "../../utils/occurrences";
import { formatDate, formatDuration, formatRecurrence, formatAlarm, formatAttendees } from "../../utils/format";
import { generateBatchDates, formatBatchDate } from "../../utils/batch";
import { PROVIDERS } from "../../services/providers";

const MAX_VISIBLE = 10;

function LivePreview({ formData, styles, capabilities, selectedProvider }) {
	const caps = capabilities ?? {
		recurrence: true,
		alarms: true,
		attendees: true,
		organizer: true,
		batch: true,
	};

	const providerLabel = PROVIDERS[selectedProvider]?.label ?? null;

	const hasTitle = formData.title?.trim().length > 0;
	const hasDate = formData.startDate?.length > 0;
	const hasTime = formData.startTime?.length > 0;
	const hasLocation = formData.location?.trim().length > 0;

	const isBatch = caps.batch !== false && formData.batch?.enabled;

	const recurrenceText = caps.recurrence !== false && !isBatch && formData.isRecurring
		? formatRecurrence(formData)
		: null;

	const alarmText = caps.alarms !== false ? formatAlarm(formData.alarm) : null;
	const hasAlarm = alarmText !== null && alarmText !== "Sin recordatorio";

	const attendeesText = caps.attendees !== false
		? formatAttendees(formData.attendees, caps.organizer !== false ? formData.organizer : null)
		: null;
	const hasAttendees = attendeesText !== null && attendeesText !== "Sin invitados";

	const occurrences = caps.recurrence !== false && !isBatch
		? calculateOccurrences(formData, MAX_VISIBLE)
		: [];

	const totalCount =
		!isBatch && formData.endType === "count" ? parseInt(formData.count) || 0 : null;
	const remaining =
		totalCount && totalCount > MAX_VISIBLE ? totalCount - MAX_VISIBLE : 0;

	const batchDates = isBatch
		? generateBatchDates({
				startDate: formData.startDate,
				startTime: formData.startTime,
				intervalHours: formData.batch.intervalHours,
				intervalMinutes: formData.batch.intervalMinutes,
				totalDays: formData.batch.totalDays,
			})
		: [];

	const batchVisible = batchDates.slice(0, MAX_VISIBLE);
	const batchRemaining = batchDates.length > MAX_VISIBLE ? batchDates.length - MAX_VISIBLE : 0;

	const hasBasicInfo = hasTitle || hasDate || hasTime;
	const hasAdvanced = recurrenceText || hasAlarm || hasAttendees || isBatch;

	const panelTitle = hasTitle ? formData.title.trim() : "Resumen del evento";

	if (!hasBasicInfo && !hasAdvanced) {
		return (
			<div className={styles.livePreview}>
				<h2 className={styles.previewTitle}>Resumen del evento</h2>
				<div className={styles.emptyState}>
					<p className={styles.emptyStateIcon}>📅</p>
					<p className={styles.emptyStateText}>
						Empezá completando el título y la fecha para ver el resumen de tu evento.
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className={styles.livePreview}>
			<h2 className={styles.previewTitle}>{panelTitle}</h2>

			{providerLabel && (
				<div className={styles.providerBadge}>
					{providerLabel}
				</div>
			)}

			<div className={styles.previewSection}>
				<div className={styles.eventDetails}>
					{hasDate && (
						<>
							<span className={styles.detailLabel}>Fecha</span>
							<span className={styles.detailValue}>{formatDate(formData.startDate)}</span>
						</>
					)}
					{hasTime && (
						<>
							<span className={styles.detailLabel}>Hora</span>
							<span className={styles.detailValue}>{formData.startTime} hs</span>
						</>
					)}
					<span className={styles.detailLabel}>Duración</span>
					<span className={styles.detailValue}>
						{formatDuration(formData.durationHours, formData.durationMinutes)}
					</span>
					{hasLocation && (
						<>
							<span className={styles.detailLabel}>Ubicación</span>
							<span className={styles.detailValue}>{formData.location.trim()}</span>
						</>
					)}
				</div>
			</div>

			{recurrenceText && (
				<div className={styles.previewSection}>
					<h3 className={styles.previewSectionTitle}>Recurrencia</h3>
					<p className={styles.previewText}>{recurrenceText}</p>
				</div>
			)}

			{hasAlarm && (
				<div className={styles.previewSection}>
					<h3 className={styles.previewSectionTitle}>Recordatorio</h3>
					<p className={styles.previewText}>{alarmText}</p>
				</div>
			)}

			{hasAttendees && (
				<div className={styles.previewSection}>
					<h3 className={styles.previewSectionTitle}>Invitados</h3>
					{attendeesText.split("\n").map((line, i) => (
						<p key={i} className={styles.previewText}>{line}</p>
					))}
				</div>
			)}

			{isBatch && batchDates.length > 0 && (
				<div className={styles.previewSection}>
					<h3 className={styles.previewSectionTitle}>
						Eventos batch ({batchDates.length} eventos)
					</h3>
					<ul className={styles.occurrenceList}>
						{batchVisible.map((date, index) => (
							<li key={index} className={styles.occurrenceItem}>
								{formatBatchDate(date)}
							</li>
						))}
					</ul>
					{batchRemaining > 0 && (
						<p className={styles.previewMore}>
							y {batchRemaining} {batchRemaining === 1 ? "evento" : "eventos"} mas...
						</p>
					)}
				</div>
			)}

			{isBatch && batchDates.length === 0 && formData.startDate && formData.startTime && (
				<div className={styles.previewSection}>
					<h3 className={styles.previewSectionTitle}>Eventos batch</h3>
					<p className={styles.previewEmpty}>
						Configura un intervalo mayor a 0 para generar eventos.
					</p>
				</div>
			)}

			{!isBatch && occurrences.length > 0 && (
				<div className={styles.previewSection}>
					<h3 className={styles.previewSectionTitle}>Próximas fechas</h3>
					<ul className={styles.occurrenceList}>
						{occurrences.map((date, index) => (
							<li key={index} className={styles.occurrenceItem}>
								{formatOccurrenceDate(date)}
							</li>
						))}
					</ul>
					{remaining > 0 && (
						<p className={styles.previewMore}>
							y {remaining} {remaining === 1 ? "fecha" : "fechas"} mas...
						</p>
					)}
				</div>
			)}
		</div>
	);
}

export default LivePreview;
