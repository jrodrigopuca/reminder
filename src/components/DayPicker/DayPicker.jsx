const DAYS = [
	{ en: "MO", es: "L" },
	{ en: "TU", es: "M" },
	{ en: "WE", es: "X" },
	{ en: "TH", es: "J" },
	{ en: "FR", es: "V" },
	{ en: "SA", es: "S" },
	{ en: "SU", es: "D" },
];

function DayPicker({ selectedDays, onChange }) {
	return (
		<>
			{DAYS.map((day) => (
				<label key={day.en}>
					<input
						type="checkbox"
						name={day.en}
						checked={selectedDays.includes(day.en)}
						onChange={onChange}
						value={day.en}
					/>
					{day.es}
				</label>
			))}
		</>
	);
}

export default DayPicker;
