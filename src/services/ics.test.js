import { buildEventDetails } from "./ics";

describe("ics service", () => {
	describe("buildEventDetails", () => {
		it("should build event details from form data", () => {
			const formData = {
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
			};

			const result = buildEventDetails(formData);

			expect(result).toStrictEqual({
				start: [2025, 6, 15, 9, 30],
				duration: { hours: 2, minutes: 30 },
				title: "Test Event",
				description: "A test",
				location: "Office",
				recurrenceRule: "",
			});
		});

		it("should include recurrence rule when recurring", () => {
			const formData = {
				title: "Weekly Standup",
				description: "",
				location: "",
				startDate: "2025-03-24",
				startTime: "10:00",
				durationHours: 0,
				durationMinutes: 15,
				isRecurring: true,
				frequency: "weekly",
				daysOfWeek: [],
				count: 52,
			};

			const result = buildEventDetails(formData);

			expect(result.recurrenceRule).toBe("FREQ=WEEKLY;COUNT=52");
		});
	});
});
