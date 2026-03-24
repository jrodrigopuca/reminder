function AttendeeList({ attendees, organizer, onAttendeeAdd, onAttendeeRemove, onAttendeeChange, onOrganizerChange, errors, styles }) {
	return (
		<div className={styles.formGroup}>
			<label>Organizador:</label>
			<div className={styles.inlineFields}>
				<div className={styles.inlineField}>
					<input
						type="text"
						placeholder="Nombre"
						value={organizer.name}
						onChange={(e) => onOrganizerChange("name", e.target.value)}
					/>
				</div>
				<div className={styles.inlineField}>
					<input
						type="email"
						placeholder="email@ejemplo.com"
						className={errors.organizerEmail ? styles.inputError : ""}
						value={organizer.email}
						onChange={(e) => onOrganizerChange("email", e.target.value)}
					/>
				</div>
			</div>
			{errors.organizerEmail && (
				<span className={styles.fieldError}>{errors.organizerEmail}</span>
			)}

			<label style={{ marginTop: "12px", display: "block" }}>Invitados:</label>
			{attendees.map((attendee, index) => (
				<div key={index} className={styles.attendeeRow}>
					<input
						type="text"
						placeholder="Nombre"
						value={attendee.name}
						onChange={(e) => onAttendeeChange(index, "name", e.target.value)}
						className={styles.attendeeInput}
					/>
					<input
						type="email"
						placeholder="email@ejemplo.com"
						value={attendee.email}
						onChange={(e) => onAttendeeChange(index, "email", e.target.value)}
						className={`${styles.attendeeInput} ${errors.attendees ? styles.inputError : ""}`}
					/>
					<label className={styles.attendeeRsvp}>
						<input
							type="checkbox"
							checked={attendee.rsvp}
							onChange={(e) => onAttendeeChange(index, "rsvp", e.target.checked)}
						/>
						RSVP
					</label>
					<button
						type="button"
						className={styles.attendeeRemove}
						onClick={() => onAttendeeRemove(index)}
						title="Quitar invitado"
					>
						&times;
					</button>
				</div>
			))}
			{errors.attendees && (
				<span className={styles.fieldError}>{errors.attendees}</span>
			)}
			<button
				type="button"
				className={styles.attendeeAdd}
				onClick={onAttendeeAdd}
			>
				+ Agregar invitado
			</button>
		</div>
	);
}

export default AttendeeList;
