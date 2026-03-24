import { buildEventDetails, buildAlarms, buildAttendees, buildOrganizer, buildBatchEvents } from "./ics";

const baseFormData = {
	title: "Test Event",
	description: "A test",
	location: "Office",
	startDate: "2025-06-15",
	startTime: "09:30",
	durationHours: 2,
	durationMinutes: 30,
	isRecurring: false,
	frequency: "",
	daysOfWeek: [],
	count: 10,
	endType: "count",
	untilDate: "",
	interval: 1,
	alarm: { enabled: false, preset: "none", customHours: 0, customMinutes: 0 },
	attendees: [],
	organizer: { name: "", email: "" },
};

describe("ics service", () => {
	describe("buildAlarms", () => {
		it("should return undefined when alarm is not enabled", () => {
			const result = buildAlarms({ enabled: false, preset: "none" });
			expect(result).toBeUndefined();
		});

		it("should return undefined when preset is none", () => {
			const result = buildAlarms({ enabled: true, preset: "none" });
			expect(result).toBeUndefined();
		});

		it("should build alarm from preset minutes", () => {
			const result = buildAlarms({ enabled: true, preset: "15" });
			expect(result).toStrictEqual([
				{
					action: "display",
					description: "Recordatorio",
					trigger: { before: true, hours: 0, minutes: 15 },
				},
			]);
		});

		it("should convert preset of 60 minutes to 1 hour", () => {
			const result = buildAlarms({ enabled: true, preset: "60" });
			expect(result).toStrictEqual([
				{
					action: "display",
					description: "Recordatorio",
					trigger: { before: true, hours: 1, minutes: 0 },
				},
			]);
		});

		it("should convert preset of 1440 minutes to 24 hours (1 day)", () => {
			const result = buildAlarms({ enabled: true, preset: "1440" });
			expect(result).toStrictEqual([
				{
					action: "display",
					description: "Recordatorio",
					trigger: { before: true, hours: 24, minutes: 0 },
				},
			]);
		});

		it("should build alarm from custom hours and minutes", () => {
			const result = buildAlarms({
				enabled: true,
				preset: "custom",
				customHours: 2,
				customMinutes: 30,
			});
			expect(result).toStrictEqual([
				{
					action: "display",
					description: "Recordatorio",
					trigger: { before: true, hours: 2, minutes: 30 },
				},
			]);
		});

		it("should return undefined for custom with zero hours and minutes", () => {
			const result = buildAlarms({
				enabled: true,
				preset: "custom",
				customHours: 0,
				customMinutes: 0,
			});
			expect(result).toBeUndefined();
		});
	});

	describe("buildAttendees", () => {
		it("should return undefined when no attendees", () => {
			expect(buildAttendees([])).toBeUndefined();
			expect(buildAttendees(undefined)).toBeUndefined();
			expect(buildAttendees(null)).toBeUndefined();
		});

		it("should build attendee with name and email", () => {
			const result = buildAttendees([{ name: "Ana", email: "ana@test.com", rsvp: false }]);
			expect(result).toStrictEqual([
				{
					name: "Ana",
					email: "ana@test.com",
					rsvp: false,
					role: "REQ-PARTICIPANT",
					partstat: "NEEDS-ACTION",
				},
			]);
		});

		it("should build attendee without name", () => {
			const result = buildAttendees([{ name: "", email: "ana@test.com", rsvp: true }]);
			expect(result).toStrictEqual([
				{
					name: undefined,
					email: "ana@test.com",
					rsvp: true,
					role: "REQ-PARTICIPANT",
					partstat: "NEEDS-ACTION",
				},
			]);
		});

		it("should skip attendees with empty email", () => {
			const result = buildAttendees([
				{ name: "Ana", email: "ana@test.com", rsvp: false },
				{ name: "Ghost", email: "", rsvp: false },
			]);
			expect(result).toHaveLength(1);
			expect(result[0].email).toBe("ana@test.com");
		});

		it("should trim whitespace from name and email", () => {
			const result = buildAttendees([{ name: "  Ana  ", email: " ana@test.com ", rsvp: false }]);
			expect(result[0].name).toBe("Ana");
			expect(result[0].email).toBe("ana@test.com");
		});
	});

	describe("buildOrganizer", () => {
		it("should return undefined when no organizer email", () => {
			expect(buildOrganizer(null)).toBeUndefined();
			expect(buildOrganizer(undefined)).toBeUndefined();
			expect(buildOrganizer({ name: "Boss", email: "" })).toBeUndefined();
		});

		it("should build organizer with name and email", () => {
			const result = buildOrganizer({ name: "Boss", email: "boss@test.com" });
			expect(result).toStrictEqual({ name: "Boss", email: "boss@test.com" });
		});

		it("should build organizer without name", () => {
			const result = buildOrganizer({ name: "", email: "admin@test.com" });
			expect(result).toStrictEqual({ name: undefined, email: "admin@test.com" });
		});

		it("should trim whitespace", () => {
			const result = buildOrganizer({ name: "  Boss  ", email: " boss@test.com " });
			expect(result).toStrictEqual({ name: "Boss", email: "boss@test.com" });
		});
	});

	describe("buildEventDetails", () => {
		it("should build event details from non-recurring form data", () => {
			const result = buildEventDetails(baseFormData);

			expect(result).toStrictEqual({
				start: [2025, 6, 15, 9, 30],
				duration: { hours: 2, minutes: 30 },
				title: "Test Event",
				description: "A test",
				location: "Office",
				recurrenceRule: "",
			});
		});

		it("should include recurrence rule with COUNT when endType is count", () => {
			const formData = {
				...baseFormData,
				isRecurring: true,
				frequency: "weekly",
				count: 52,
			};

			const result = buildEventDetails(formData);
			expect(result.recurrenceRule).toBe("FREQ=WEEKLY;COUNT=52");
		});

		it("should include recurrence rule with UNTIL when endType is until", () => {
			const formData = {
				...baseFormData,
				isRecurring: true,
				frequency: "daily",
				endType: "until",
				untilDate: "2025-12-31",
			};

			const result = buildEventDetails(formData);
			expect(result.recurrenceRule).toBe("FREQ=DAILY;UNTIL=20251231T235959Z");
		});

		it("should include INTERVAL when greater than 1", () => {
			const formData = {
				...baseFormData,
				isRecurring: true,
				frequency: "weekly",
				count: 26,
				interval: 2,
			};

			const result = buildEventDetails(formData);
			expect(result.recurrenceRule).toBe("FREQ=WEEKLY;INTERVAL=2;COUNT=26");
		});

		it("should not include alarms when alarm is disabled", () => {
			const result = buildEventDetails(baseFormData);
			expect(result.alarms).toBeUndefined();
		});

		it("should include alarms when alarm is enabled with preset", () => {
			const formData = {
				...baseFormData,
				alarm: { enabled: true, preset: "15", customHours: 0, customMinutes: 0 },
			};

			const result = buildEventDetails(formData);
			expect(result.alarms).toStrictEqual([
				{
					action: "display",
					description: "Recordatorio",
					trigger: { before: true, hours: 0, minutes: 15 },
				},
			]);
		});

		it("should include alarms when alarm is enabled with custom time", () => {
			const formData = {
				...baseFormData,
				alarm: {
					enabled: true,
					preset: "custom",
					customHours: 1,
					customMinutes: 30,
				},
			};

			const result = buildEventDetails(formData);
			expect(result.alarms).toStrictEqual([
				{
					action: "display",
					description: "Recordatorio",
					trigger: { before: true, hours: 1, minutes: 30 },
				},
			]);
		});

		it("should not include attendees when array is empty", () => {
			const result = buildEventDetails(baseFormData);
			expect(result.attendees).toBeUndefined();
		});

		it("should include attendees when present", () => {
			const formData = {
				...baseFormData,
				attendees: [
					{ name: "Ana", email: "ana@test.com", rsvp: true },
				],
			};

			const result = buildEventDetails(formData);
			expect(result.attendees).toStrictEqual([
				{
					name: "Ana",
					email: "ana@test.com",
					rsvp: true,
					role: "REQ-PARTICIPANT",
					partstat: "NEEDS-ACTION",
				},
			]);
		});

		it("should not include organizer when email is empty", () => {
			const result = buildEventDetails(baseFormData);
			expect(result.organizer).toBeUndefined();
		});

		it("should include organizer when email is present", () => {
			const formData = {
				...baseFormData,
				organizer: { name: "Boss", email: "boss@test.com" },
			};

			const result = buildEventDetails(formData);
			expect(result.organizer).toStrictEqual({
				name: "Boss",
				email: "boss@test.com",
			});
		});
	});

	describe("buildBatchEvents", () => {
		it("should return empty array when batch config is missing", () => {
			const result = buildBatchEvents(baseFormData);
			expect(result).toStrictEqual([]);
		});

		it("should generate events with numbered titles", () => {
			const formData = {
				...baseFormData,
				batch: { intervalHours: 8, intervalMinutes: 0, totalDays: 1 },
			};

			const result = buildBatchEvents(formData);
			expect(result).toHaveLength(3);
			expect(result[0].title).toBe("Test Event (1/3)");
			expect(result[1].title).toBe("Test Event (2/3)");
			expect(result[2].title).toBe("Test Event (3/3)");
		});

		it("should set correct start times for each event", () => {
			const formData = {
				...baseFormData,
				startDate: "2025-06-15",
				startTime: "09:00",
				batch: { intervalHours: 8, intervalMinutes: 0, totalDays: 1 },
			};

			const result = buildBatchEvents(formData);
			expect(result[0].start).toStrictEqual([2025, 6, 15, 9, 0]);
			expect(result[1].start).toStrictEqual([2025, 6, 15, 17, 0]);
			expect(result[2].start).toStrictEqual([2025, 6, 16, 1, 0]);
		});

		it("should include duration on each event", () => {
			const formData = {
				...baseFormData,
				batch: { intervalHours: 12, intervalMinutes: 0, totalDays: 1 },
			};

			const result = buildBatchEvents(formData);
			result.forEach((event) => {
				expect(event.duration).toStrictEqual({ hours: 2, minutes: 30 });
			});
		});

		it("should include alarms when enabled", () => {
			const formData = {
				...baseFormData,
				alarm: { enabled: true, preset: "15", customHours: 0, customMinutes: 0 },
				batch: { intervalHours: 12, intervalMinutes: 0, totalDays: 1 },
			};

			const result = buildBatchEvents(formData);
			result.forEach((event) => {
				expect(event.alarms).toBeDefined();
				expect(event.alarms).toHaveLength(1);
			});
		});

		it("should include attendees when present", () => {
			const formData = {
				...baseFormData,
				attendees: [{ name: "Ana", email: "ana@test.com", rsvp: false }],
				batch: { intervalHours: 12, intervalMinutes: 0, totalDays: 1 },
			};

			const result = buildBatchEvents(formData);
			result.forEach((event) => {
				expect(event.attendees).toHaveLength(1);
			});
		});

		it("should not include recurrenceRule on batch events", () => {
			const formData = {
				...baseFormData,
				batch: { intervalHours: 12, intervalMinutes: 0, totalDays: 1 },
			};

			const result = buildBatchEvents(formData);
			result.forEach((event) => {
				expect(event.recurrenceRule).toBeUndefined();
			});
		});
	});
});
