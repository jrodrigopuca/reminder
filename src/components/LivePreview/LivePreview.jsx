import { calculateOccurrences, formatOccurrenceDate } from "../../utils/occurrences";
import { formatRecurrence, formatAlarm, formatAttendees } from "../../utils/format";
import { generateBatchDates, formatBatchDate } from "../../utils/batch";

const MAX_VISIBLE = 10;

function LivePreview({ formData, styles, capabilities }) {
	const caps = capabilities ?? {
		recurrence: true,
		alarms: true,
		attendees: true,
		batch: true,
	};

	const isBatch = caps.batch !== false && formData.batch?.enabled;

	const recurrenceText = caps.recurrence !== false && !isBatch && formData.isRecurring
		? formatRecurrence(formData)
		: null;

	const alarmText = caps.alarms !== false ? formatAlarm(formData.alarm) : null;
	const hasAlarm = alarmText !== null && alarmText !== "Sin recordatorio";

	const attendeesText = caps.attendees !== false
		? formatAttendees(formData.attendees, formData.organizer)
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

	const hasContent = recurrenceText || hasAlarm || hasAttendees || isBatch;

	if (!hasContent) {
		return (
			<div className={styles.livePreview}>
				<h2 className={styles.previewTitle}>Vista previa</h2>
				<p className={styles.previewEmpty}>
					Configura recurrencia, recordatorio, invitados o batch para ver la vista previa.
				</p>
			</div>
		);
	}

	return (
		<div className={styles.livePreview}>
			<h2 className={styles.previewTitle}>Vista previa</h2>

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
					<h3 className={styles.previewSectionTitle}>Proximas fechas</h3>
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
