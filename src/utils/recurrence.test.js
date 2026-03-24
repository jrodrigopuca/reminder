import {
	transformStartDate,
	transformRule,
	createWeeklyRecurrenceRule,
	createFrequencyRecurrenceRule,
} from "./recurrence";

describe("recurrence utils", () => {
	describe("transformStartDate", () => {
		it("should correctly transform date and time to array", () => {
			const result = transformStartDate("2022-12-31", "12:00");
			expect(result).toStrictEqual([2022, 12, 31, 12, 0]);
		});

		it("should handle midnight correctly", () => {
			const result = transformStartDate("2025-01-01", "00:00");
			expect(result).toStrictEqual([2025, 1, 1, 0, 0]);
		});
	});

	describe("createWeeklyRecurrenceRule", () => {
		it("should create weekly rule with given days", () => {
			const result = createWeeklyRecurrenceRule(["mo", "we", "fr"]);
			expect(result).toBe("FREQ=WEEKLY;BYDAY=MO,WE,FR");
		});

		it("should handle a single day", () => {
			const result = createWeeklyRecurrenceRule(["tu"]);
			expect(result).toBe("FREQ=WEEKLY;BYDAY=TU");
		});
	});

	describe("createFrequencyRecurrenceRule", () => {
		it("should create rule with uppercased frequency", () => {
			expect(createFrequencyRecurrenceRule("daily")).toBe("FREQ=DAILY");
			expect(createFrequencyRecurrenceRule("weekly")).toBe("FREQ=WEEKLY");
			expect(createFrequencyRecurrenceRule("monthly")).toBe("FREQ=MONTHLY");
		});
	});

	describe("transformRule", () => {
		it("should return empty string when not recurring", () => {
			const result = transformRule({
				isRecurring: false,
				frequency: "weekly",
				daysOfWeek: ["MO"],
				count: 10,
			});
			expect(result).toBe("");
		});

		it("should create frequency rule with COUNT by default", () => {
			const result = transformRule({
				isRecurring: true,
				frequency: "weekly",
				count: 10,
			});
			expect(result).toBe("FREQ=WEEKLY;COUNT=10");
		});

		it("should create weekly BYDAY rule for partOfWeek", () => {
			const result = transformRule({
				isRecurring: true,
				frequency: "partOfWeek",
				daysOfWeek: ["MO", "WE", "FR"],
				count: 10,
			});
			expect(result).toBe("FREQ=WEEKLY;BYDAY=MO,WE,FR;COUNT=10");
		});

		it("should handle daily frequency", () => {
			const result = transformRule({
				isRecurring: true,
				frequency: "daily",
				count: 5,
			});
			expect(result).toBe("FREQ=DAILY;COUNT=5");
		});

		describe("INTERVAL", () => {
			it("should add INTERVAL when greater than 1", () => {
				const result = transformRule({
					isRecurring: true,
					frequency: "weekly",
					interval: 2,
					count: 10,
				});
				expect(result).toBe("FREQ=WEEKLY;INTERVAL=2;COUNT=10");
			});

			it("should not add INTERVAL when 1 (default)", () => {
				const result = transformRule({
					isRecurring: true,
					frequency: "daily",
					interval: 1,
					count: 5,
				});
				expect(result).toBe("FREQ=DAILY;COUNT=5");
			});

			it("should combine INTERVAL with partOfWeek", () => {
				const result = transformRule({
					isRecurring: true,
					frequency: "partOfWeek",
					daysOfWeek: ["MO", "FR"],
					interval: 3,
					count: 8,
				});
				expect(result).toBe("FREQ=WEEKLY;BYDAY=MO,FR;INTERVAL=3;COUNT=8");
			});
		});

		describe("UNTIL", () => {
			it("should use UNTIL instead of COUNT when endType is until", () => {
				const result = transformRule({
					isRecurring: true,
					frequency: "daily",
					endType: "until",
					untilDate: "2025-12-31",
				});
				expect(result).toBe("FREQ=DAILY;UNTIL=20251231T235959Z");
			});

			it("should fall back to COUNT when endType is until but no date", () => {
				const result = transformRule({
					isRecurring: true,
					frequency: "weekly",
					endType: "until",
					untilDate: "",
					count: 5,
				});
				expect(result).toBe("FREQ=WEEKLY;COUNT=5");
			});

			it("should combine INTERVAL with UNTIL", () => {
				const result = transformRule({
					isRecurring: true,
					frequency: "monthly",
					interval: 3,
					endType: "until",
					untilDate: "2026-06-30",
				});
				expect(result).toBe("FREQ=MONTHLY;INTERVAL=3;UNTIL=20260630T235959Z");
			});
		});
	});
});
