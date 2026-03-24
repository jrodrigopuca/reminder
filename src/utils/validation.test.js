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
		};

		it("should return no errors for valid recurring event", () => {
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

		it("should require count >= 1", () => {
			const errors = validateEventForm({ ...recurringBase, count: 0 });
			expect(errors.count).toBeDefined();
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
	});
});
