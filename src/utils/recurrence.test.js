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
			const result = transformRule(false, "weekly", ["mo"], 10);
			expect(result).toBe("");
		});

		it("should create frequency rule with count for standard frequencies", () => {
			const result = transformRule(true, "weekly", ["mon", "wed", "fri"], 10);
			expect(result).toBe("FREQ=WEEKLY;COUNT=10");
		});

		it("should create weekly BYDAY rule for partOfWeek frequency", () => {
			const result = transformRule(true, "partOfWeek", ["mon", "wed", "fri"], 10);
			expect(result).toBe("FREQ=WEEKLY;BYDAY=MON,WED,FRI;COUNT=10");
		});

		it("should handle daily frequency", () => {
			const result = transformRule(true, "daily", [], 5);
			expect(result).toBe("FREQ=DAILY;COUNT=5");
		});
	});
});
