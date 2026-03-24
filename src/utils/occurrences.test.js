import { calculateOccurrences, formatOccurrenceDate } from "./occurrences";

const baseRecurring = {
	isRecurring: true,
	startDate: "2025-06-16", // Monday
	frequency: "weekly",
	daysOfWeek: [],
	endType: "count",
	count: 10,
	untilDate: "",
	interval: 1,
};

describe("occurrences utils", () => {
	describe("calculateOccurrences", () => {
		it("should return empty array when not recurring", () => {
			const result = calculateOccurrences({ ...baseRecurring, isRecurring: false });
			expect(result).toStrictEqual([]);
		});

		it("should return empty array when missing startDate", () => {
			const result = calculateOccurrences({ ...baseRecurring, startDate: "" });
			expect(result).toStrictEqual([]);
		});

		it("should return empty array when missing frequency", () => {
			const result = calculateOccurrences({ ...baseRecurring, frequency: "" });
			expect(result).toStrictEqual([]);
		});

		describe("daily", () => {
			it("should generate daily occurrences", () => {
				const result = calculateOccurrences({
					...baseRecurring,
					frequency: "daily",
					count: 3,
				});

				expect(result).toHaveLength(3);
				expect(result[0]).toStrictEqual(new Date(2025, 5, 16));
				expect(result[1]).toStrictEqual(new Date(2025, 5, 17));
				expect(result[2]).toStrictEqual(new Date(2025, 5, 18));
			});

			it("should respect interval for daily", () => {
				const result = calculateOccurrences({
					...baseRecurring,
					frequency: "daily",
					interval: 3,
					count: 3,
				});

				expect(result[0]).toStrictEqual(new Date(2025, 5, 16));
				expect(result[1]).toStrictEqual(new Date(2025, 5, 19));
				expect(result[2]).toStrictEqual(new Date(2025, 5, 22));
			});
		});

		describe("weekly", () => {
			it("should generate weekly occurrences", () => {
				const result = calculateOccurrences({
					...baseRecurring,
					frequency: "weekly",
					count: 3,
				});

				expect(result).toHaveLength(3);
				expect(result[0]).toStrictEqual(new Date(2025, 5, 16));
				expect(result[1]).toStrictEqual(new Date(2025, 5, 23));
				expect(result[2]).toStrictEqual(new Date(2025, 5, 30));
			});

			it("should respect interval for weekly (bi-weekly)", () => {
				const result = calculateOccurrences({
					...baseRecurring,
					frequency: "weekly",
					interval: 2,
					count: 3,
				});

				expect(result[0]).toStrictEqual(new Date(2025, 5, 16));
				expect(result[1]).toStrictEqual(new Date(2025, 5, 30));
				expect(result[2]).toStrictEqual(new Date(2025, 6, 14));
			});
		});

		describe("monthly", () => {
			it("should generate monthly occurrences", () => {
				const result = calculateOccurrences({
					...baseRecurring,
					frequency: "monthly",
					count: 3,
				});

				expect(result).toHaveLength(3);
				expect(result[0]).toStrictEqual(new Date(2025, 5, 16));
				expect(result[1]).toStrictEqual(new Date(2025, 6, 16));
				expect(result[2]).toStrictEqual(new Date(2025, 7, 16));
			});

			it("should respect interval for monthly (quarterly)", () => {
				const result = calculateOccurrences({
					...baseRecurring,
					frequency: "monthly",
					interval: 3,
					count: 3,
				});

				expect(result[0]).toStrictEqual(new Date(2025, 5, 16));
				expect(result[1]).toStrictEqual(new Date(2025, 8, 16));
				expect(result[2]).toStrictEqual(new Date(2025, 11, 16));
			});
		});

		describe("partOfWeek", () => {
			it("should generate occurrences for specific days", () => {
				const result = calculateOccurrences({
					...baseRecurring,
					frequency: "partOfWeek",
					daysOfWeek: ["MO", "WE", "FR"],
					count: 5,
				});

				expect(result).toHaveLength(5);
				// Mon 16/06
				expect(result[0]).toStrictEqual(new Date(2025, 5, 16));
				// Wed 18/06
				expect(result[1]).toStrictEqual(new Date(2025, 5, 18));
				// Fri 20/06
				expect(result[2]).toStrictEqual(new Date(2025, 5, 20));
				// Mon 23/06
				expect(result[3]).toStrictEqual(new Date(2025, 5, 23));
				// Wed 25/06
				expect(result[4]).toStrictEqual(new Date(2025, 5, 25));
			});

			it("should respect interval for partOfWeek (every 2 weeks)", () => {
				const result = calculateOccurrences({
					...baseRecurring,
					frequency: "partOfWeek",
					daysOfWeek: ["MO", "FR"],
					interval: 2,
					count: 4,
				});

				expect(result).toHaveLength(4);
				// Week 1: Mon 16/06, Fri 20/06
				expect(result[0]).toStrictEqual(new Date(2025, 5, 16));
				expect(result[1]).toStrictEqual(new Date(2025, 5, 20));
				// Skip week 2, Week 3: Mon 30/06, Fri 04/07
				expect(result[2]).toStrictEqual(new Date(2025, 5, 30));
				expect(result[3]).toStrictEqual(new Date(2025, 6, 4));
			});

			it("should return empty when no days selected", () => {
				const result = calculateOccurrences({
					...baseRecurring,
					frequency: "partOfWeek",
					daysOfWeek: [],
					count: 5,
				});
				expect(result).toStrictEqual([]);
			});
		});

		describe("until (end date)", () => {
			it("should stop at until date", () => {
				const result = calculateOccurrences({
					...baseRecurring,
					frequency: "daily",
					endType: "until",
					untilDate: "2025-06-18",
				});

				expect(result).toHaveLength(3);
				expect(result[0]).toStrictEqual(new Date(2025, 5, 16));
				expect(result[1]).toStrictEqual(new Date(2025, 5, 17));
				expect(result[2]).toStrictEqual(new Date(2025, 5, 18));
			});

			it("should stop partOfWeek at until date", () => {
				const result = calculateOccurrences({
					...baseRecurring,
					frequency: "partOfWeek",
					daysOfWeek: ["MO", "WE", "FR"],
					endType: "until",
					untilDate: "2025-06-19",
				});

				expect(result).toHaveLength(2);
				expect(result[0]).toStrictEqual(new Date(2025, 5, 16));
				expect(result[1]).toStrictEqual(new Date(2025, 5, 18));
			});
		});

		describe("maxResults", () => {
			it("should limit results to maxResults", () => {
				const result = calculateOccurrences(
					{ ...baseRecurring, frequency: "daily", count: 100 },
					5,
				);
				expect(result).toHaveLength(5);
			});
		});
	});

	describe("formatOccurrenceDate", () => {
		it("should format date as Day DD/MM/YYYY", () => {
			// Monday June 16, 2025
			const date = new Date(2025, 5, 16);
			expect(formatOccurrenceDate(date)).toBe("Lun 16/06/2025");
		});

		it("should handle Sunday", () => {
			// Sunday June 22, 2025
			const date = new Date(2025, 5, 22);
			expect(formatOccurrenceDate(date)).toBe("Dom 22/06/2025");
		});

		it("should pad single digit day and month", () => {
			// Wednesday January 1, 2025
			const date = new Date(2025, 0, 1);
			expect(formatOccurrenceDate(date)).toBe("Mie 01/01/2025");
		});
	});
});
