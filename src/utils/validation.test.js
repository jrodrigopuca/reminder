import { validateEventForm, isFormValid } from "./validation";

const validFormData = {
	title: "Test Event",
	description: "",
	location: "",
	startDate: "2025-06-15",
	startTime: "09:00",
	durationHours: 1,
	durationMinutes: 0,
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
	batch: { enabled: false, intervalHours: 8, intervalMinutes: 0, totalDays: 1 },
};

describe("validateEventForm", () => {
	it("should return no errors for valid non-recurring event", () => {
		const errors = validateEventForm(validFormData);
		expect(errors).toStrictEqual({});
		expect(isFormValid(errors)).toBe(true);
	});

	it("should require title", () => {
		const errors = validateEventForm({ ...validFormData, title: "" });
		expect(errors.title).toBeDefined();
	});

	it("should require title to not be just whitespace", () => {
		const errors = validateEventForm({ ...validFormData, title: "   " });
		expect(errors.title).toBeDefined();
	});

	it("should require startDate", () => {
		const errors = validateEventForm({ ...validFormData, startDate: "" });
		expect(errors.startDate).toBeDefined();
	});

	it("should require startTime", () => {
		const errors = validateEventForm({ ...validFormData, startTime: "" });
		expect(errors.startTime).toBeDefined();
	});

	it("should not allow zero duration", () => {
		const errors = validateEventForm({
			...validFormData,
			durationHours: 0,
			durationMinutes: 0,
		});
		expect(errors.durationHours).toBeDefined();
	});

	it("should not allow negative hours", () => {
		const errors = validateEventForm({ ...validFormData, durationHours: -1 });
		expect(errors.durationHours).toBeDefined();
	});

	it("should not allow minutes greater than 59", () => {
		const errors = validateEventForm({ ...validFormData, durationMinutes: 60 });
		expect(errors.durationMinutes).toBeDefined();
	});

	describe("recurring events", () => {
		const recurringBase = {
			...validFormData,
			isRecurring: true,
			frequency: "weekly",
			count: 10,
			endType: "count",
			untilDate: "",
			interval: 1,
		};

		it("should return no errors for valid recurring event with count", () => {
			const errors = validateEventForm(recurringBase);
			expect(isFormValid(errors)).toBe(true);
		});

		it("should require frequency when recurring", () => {
			const errors = validateEventForm({ ...recurringBase, frequency: "" });
			expect(errors.frequency).toBeDefined();
		});

		it("should require at least one day for partOfWeek", () => {
			const errors = validateEventForm({
				...recurringBase,
				frequency: "partOfWeek",
				daysOfWeek: [],
			});
			expect(errors.daysOfWeek).toBeDefined();
		});

		it("should pass when partOfWeek has days selected", () => {
			const errors = validateEventForm({
				...recurringBase,
				frequency: "partOfWeek",
				daysOfWeek: ["MO", "WE"],
			});
			expect(errors.daysOfWeek).toBeUndefined();
		});

		it("should require count >= 1 when endType is count", () => {
			const errors = validateEventForm({ ...recurringBase, count: 0 });
			expect(errors.count).toBeDefined();
		});

		it("should not validate count when endType is until", () => {
			const errors = validateEventForm({
				...recurringBase,
				endType: "until",
				untilDate: "2025-12-31",
				count: 0,
			});
			expect(errors.count).toBeUndefined();
		});

		it("should not validate recurrence fields when not recurring", () => {
			const errors = validateEventForm({
				...validFormData,
				isRecurring: false,
				frequency: "",
				daysOfWeek: [],
				count: 0,
			});
			expect(errors.frequency).toBeUndefined();
			expect(errors.daysOfWeek).toBeUndefined();
			expect(errors.count).toBeUndefined();
		});

		describe("endType: until", () => {
			const untilBase = {
				...recurringBase,
				endType: "until",
				untilDate: "2025-12-31",
			};

			it("should return no errors for valid until event", () => {
				const errors = validateEventForm(untilBase);
				expect(isFormValid(errors)).toBe(true);
			});

			it("should require untilDate when endType is until", () => {
				const errors = validateEventForm({ ...untilBase, untilDate: "" });
				expect(errors.untilDate).toBeDefined();
			});

			it("should require untilDate to be after startDate", () => {
				const errors = validateEventForm({
					...untilBase,
					startDate: "2025-06-15",
					untilDate: "2025-06-15",
				});
				expect(errors.untilDate).toBeDefined();
			});

			it("should reject untilDate before startDate", () => {
				const errors = validateEventForm({
					...untilBase,
					startDate: "2025-06-15",
					untilDate: "2025-06-10",
				});
				expect(errors.untilDate).toBeDefined();
			});

			it("should accept untilDate after startDate", () => {
				const errors = validateEventForm({
					...untilBase,
					startDate: "2025-06-15",
					untilDate: "2025-06-16",
				});
				expect(errors.untilDate).toBeUndefined();
			});
		});

		describe("interval", () => {
			it("should accept interval of 1", () => {
				const errors = validateEventForm({ ...recurringBase, interval: 1 });
				expect(errors.interval).toBeUndefined();
			});

			it("should accept interval greater than 1", () => {
				const errors = validateEventForm({ ...recurringBase, interval: 3 });
				expect(errors.interval).toBeUndefined();
			});

			it("should reject interval less than 1", () => {
				const errors = validateEventForm({ ...recurringBase, interval: 0 });
				expect(errors.interval).toBeDefined();
			});
		});
	});

	describe("alarm", () => {
		it("should not validate alarm when disabled", () => {
			const errors = validateEventForm({
				...validFormData,
				alarm: { enabled: false, preset: "custom", customHours: 0, customMinutes: 0 },
			});
			expect(errors.alarmCustom).toBeUndefined();
		});

		it("should not validate alarm when preset is not custom", () => {
			const errors = validateEventForm({
				...validFormData,
				alarm: { enabled: true, preset: "15", customHours: 0, customMinutes: 0 },
			});
			expect(errors.alarmCustom).toBeUndefined();
		});

		it("should reject custom alarm with zero hours and minutes", () => {
			const errors = validateEventForm({
				...validFormData,
				alarm: { enabled: true, preset: "custom", customHours: 0, customMinutes: 0 },
			});
			expect(errors.alarmCustom).toBeDefined();
		});

		it("should accept custom alarm with valid hours", () => {
			const errors = validateEventForm({
				...validFormData,
				alarm: { enabled: true, preset: "custom", customHours: 1, customMinutes: 0 },
			});
			expect(errors.alarmCustom).toBeUndefined();
		});

		it("should accept custom alarm with valid minutes", () => {
			const errors = validateEventForm({
				...validFormData,
				alarm: { enabled: true, preset: "custom", customHours: 0, customMinutes: 30 },
			});
			expect(errors.alarmCustom).toBeUndefined();
		});
	});

	describe("attendees", () => {
		it("should not validate attendees when array is empty", () => {
			const errors = validateEventForm({ ...validFormData, attendees: [] });
			expect(errors.attendees).toBeUndefined();
		});

		it("should accept valid attendee emails", () => {
			const errors = validateEventForm({
				...validFormData,
				attendees: [
					{ name: "Ana", email: "ana@test.com", rsvp: false },
					{ name: "Bob", email: "bob@company.org", rsvp: true },
				],
			});
			expect(errors.attendees).toBeUndefined();
		});

		it("should reject invalid attendee emails", () => {
			const errors = validateEventForm({
				...validFormData,
				attendees: [{ name: "Ana", email: "not-an-email", rsvp: false }],
			});
			expect(errors.attendees).toBeDefined();
		});

		it("should reject attendee with empty email", () => {
			const errors = validateEventForm({
				...validFormData,
				attendees: [{ name: "Ana", email: "", rsvp: false }],
			});
			expect(errors.attendees).toBeDefined();
		});
	});

	describe("organizer", () => {
		it("should not validate organizer when email is empty", () => {
			const errors = validateEventForm({
				...validFormData,
				organizer: { name: "Boss", email: "" },
			});
			expect(errors.organizerEmail).toBeUndefined();
		});

		it("should accept valid organizer email", () => {
			const errors = validateEventForm({
				...validFormData,
				organizer: { name: "Boss", email: "boss@test.com" },
			});
			expect(errors.organizerEmail).toBeUndefined();
		});

		it("should reject invalid organizer email", () => {
			const errors = validateEventForm({
				...validFormData,
				organizer: { name: "Boss", email: "not-valid" },
			});
			expect(errors.organizerEmail).toBeDefined();
		});
	});

	describe("batch", () => {
		it("should not validate batch when disabled", () => {
			const errors = validateEventForm({
				...validFormData,
				batch: { enabled: false, intervalHours: 0, intervalMinutes: 0, totalDays: 0 },
			});
			expect(errors.batchInterval).toBeUndefined();
			expect(errors.batchTotalDays).toBeUndefined();
		});

		it("should accept valid batch config", () => {
			const errors = validateEventForm({
				...validFormData,
				batch: { enabled: true, intervalHours: 8, intervalMinutes: 0, totalDays: 3 },
			});
			expect(errors.batchInterval).toBeUndefined();
			expect(errors.batchTotalDays).toBeUndefined();
		});

		it("should reject zero batch interval", () => {
			const errors = validateEventForm({
				...validFormData,
				batch: { enabled: true, intervalHours: 0, intervalMinutes: 0, totalDays: 1 },
			});
			expect(errors.batchInterval).toBeDefined();
		});

		it("should accept batch interval with minutes only", () => {
			const errors = validateEventForm({
				...validFormData,
				batch: { enabled: true, intervalHours: 0, intervalMinutes: 30, totalDays: 1 },
			});
			expect(errors.batchInterval).toBeUndefined();
		});

		it("should reject totalDays less than 1", () => {
			const errors = validateEventForm({
				...validFormData,
				batch: { enabled: true, intervalHours: 8, intervalMinutes: 0, totalDays: 0 },
			});
			expect(errors.batchTotalDays).toBeDefined();
		});
	});

	describe("capabilities-aware validation", () => {
		const allCaps = { recurrence: true, alarms: true, attendees: true, organizer: true, batch: true };

		it("should skip recurrence validation when recurrence capability is false", () => {
			const caps = { ...allCaps, recurrence: false };
			const errors = validateEventForm(
				{
					...validFormData,
					isRecurring: true,
					frequency: "",
					daysOfWeek: [],
					count: 0,
				},
				caps,
			);
			expect(errors.frequency).toBeUndefined();
			expect(errors.daysOfWeek).toBeUndefined();
			expect(errors.count).toBeUndefined();
		});

		it("should skip alarm validation when alarms capability is false", () => {
			const caps = { ...allCaps, alarms: false };
			const errors = validateEventForm(
				{
					...validFormData,
					alarm: { enabled: true, preset: "custom", customHours: 0, customMinutes: 0 },
				},
				caps,
			);
			expect(errors.alarmCustom).toBeUndefined();
		});

		it("should skip attendees validation when attendees capability is false", () => {
			const caps = { ...allCaps, attendees: false };
			const errors = validateEventForm(
				{
					...validFormData,
					attendees: [{ name: "Ana", email: "not-valid", rsvp: false }],
				},
				caps,
			);
			expect(errors.attendees).toBeUndefined();
		});

		it("should skip organizer validation when organizer capability is false", () => {
			const caps = { ...allCaps, organizer: false };
			const errors = validateEventForm(
				{
					...validFormData,
					organizer: { name: "Boss", email: "not-valid" },
				},
				caps,
			);
			expect(errors.organizerEmail).toBeUndefined();
		});

		it("should skip batch validation when batch capability is false", () => {
			const caps = { ...allCaps, batch: false };
			const errors = validateEventForm(
				{
					...validFormData,
					batch: { enabled: true, intervalHours: 0, intervalMinutes: 0, totalDays: 0 },
				},
				caps,
			);
			expect(errors.batchInterval).toBeUndefined();
			expect(errors.batchTotalDays).toBeUndefined();
		});

		it("should validate everything when all capabilities are true", () => {
			const errors = validateEventForm(
				{
					...validFormData,
					isRecurring: true,
					frequency: "",
					alarm: { enabled: true, preset: "custom", customHours: 0, customMinutes: 0 },
					attendees: [{ name: "Ana", email: "bad", rsvp: false }],
					organizer: { name: "Boss", email: "bad" },
					batch: { enabled: true, intervalHours: 0, intervalMinutes: 0, totalDays: 0 },
				},
				allCaps,
			);
			expect(errors.frequency).toBeDefined();
			expect(errors.alarmCustom).toBeDefined();
			expect(errors.attendees).toBeDefined();
			expect(errors.organizerEmail).toBeDefined();
			expect(errors.batchInterval).toBeDefined();
			expect(errors.batchTotalDays).toBeDefined();
		});

		it("should always validate core fields regardless of capabilities", () => {
			const noCaps = { recurrence: false, alarms: false, attendees: false, organizer: false, batch: false };
			const errors = validateEventForm(
				{ ...validFormData, title: "" },
				noCaps,
			);
			expect(errors.title).toBeDefined();
		});
	});
});
