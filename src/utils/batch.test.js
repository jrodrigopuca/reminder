import { generateBatchDates, dateToIcsStart, formatBatchDate } from "./batch";

describe("batch utils", () => {
	describe("generateBatchDates", () => {
		it("should return empty array when no start date or time", () => {
			expect(generateBatchDates({ startDate: "", startTime: "09:00", intervalHours: 8, totalDays: 1 })).toStrictEqual([]);
			expect(generateBatchDates({ startDate: "2025-06-15", startTime: "", intervalHours: 8, totalDays: 1 })).toStrictEqual([]);
		});

		it("should return empty array when interval is zero", () => {
			expect(generateBatchDates({
				startDate: "2025-06-15",
				startTime: "09:00",
				intervalHours: 0,
				intervalMinutes: 0,
				totalDays: 1,
			})).toStrictEqual([]);
		});

		it("should generate events every 8 hours for 1 day", () => {
			const dates = generateBatchDates({
				startDate: "2025-06-15",
				startTime: "09:00",
				intervalHours: 8,
				intervalMinutes: 0,
				totalDays: 1,
			});

			expect(dates).toHaveLength(3);
			expect(dates[0].getHours()).toBe(9);
			expect(dates[1].getHours()).toBe(17);
			expect(dates[2].getDate()).toBe(16);
			expect(dates[2].getHours()).toBe(1);
		});

		it("should generate events every 30 minutes for 1 day", () => {
			const dates = generateBatchDates({
				startDate: "2025-06-15",
				startTime: "10:00",
				intervalHours: 0,
				intervalMinutes: 30,
				totalDays: 1,
			});

			// 24 hours = 1440 minutes / 30 min interval = 48 events
			expect(dates).toHaveLength(48);
			expect(dates[0].getHours()).toBe(10);
			expect(dates[0].getMinutes()).toBe(0);
			expect(dates[1].getHours()).toBe(10);
			expect(dates[1].getMinutes()).toBe(30);
			expect(dates[2].getHours()).toBe(11);
			expect(dates[2].getMinutes()).toBe(0);
		});

		it("should generate events every 4 hours for 2 days", () => {
			const dates = generateBatchDates({
				startDate: "2025-06-15",
				startTime: "08:00",
				intervalHours: 4,
				intervalMinutes: 0,
				totalDays: 2,
			});

			// 48 hours / 4 hours = 12 events
			expect(dates).toHaveLength(12);
			expect(dates[0].getHours()).toBe(8);
			expect(dates[0].getDate()).toBe(15);
			// Last event: 8 + (11 * 4) = 52 hours from midnight on 15th
			// That's day 17 at 4:00 AM
			expect(dates[dates.length - 1].getDate()).toBe(17);
			expect(dates[dates.length - 1].getHours()).toBe(4);
		});

		it("should handle combined hours and minutes interval", () => {
			const dates = generateBatchDates({
				startDate: "2025-06-15",
				startTime: "00:00",
				intervalHours: 1,
				intervalMinutes: 30,
				totalDays: 1,
			});

			// 24 hours / 1.5 hours = 16 events
			expect(dates).toHaveLength(16);
			expect(dates[0].getHours()).toBe(0);
			expect(dates[0].getMinutes()).toBe(0);
			expect(dates[1].getHours()).toBe(1);
			expect(dates[1].getMinutes()).toBe(30);
			expect(dates[2].getHours()).toBe(3);
			expect(dates[2].getMinutes()).toBe(0);
			expect(dates[3].getHours()).toBe(4);
			expect(dates[3].getMinutes()).toBe(30);
		});

		it("should default totalDays to 1", () => {
			const dates = generateBatchDates({
				startDate: "2025-06-15",
				startTime: "00:00",
				intervalHours: 12,
				intervalMinutes: 0,
			});

			expect(dates).toHaveLength(2);
		});
	});

	describe("dateToIcsStart", () => {
		it("should convert Date to ics start array", () => {
			const date = new Date(2025, 5, 15, 9, 30); // June 15, 2025 09:30
			expect(dateToIcsStart(date)).toStrictEqual([2025, 6, 15, 9, 30]);
		});

		it("should handle midnight", () => {
			const date = new Date(2025, 0, 1, 0, 0); // Jan 1, 2025 00:00
			expect(dateToIcsStart(date)).toStrictEqual([2025, 1, 1, 0, 0]);
		});
	});

	describe("formatBatchDate", () => {
		it("should format date with day name and time", () => {
			const date = new Date(2025, 5, 15, 9, 0); // Sunday June 15, 2025
			expect(formatBatchDate(date)).toBe("Dom 15/06/2025 09:00");
		});

		it("should pad single digit values", () => {
			const date = new Date(2025, 0, 5, 8, 5); // Sunday Jan 5, 2025
			expect(formatBatchDate(date)).toBe("Dom 05/01/2025 08:05");
		});

		it("should handle midnight", () => {
			const date = new Date(2025, 5, 16, 0, 0); // Monday June 16
			expect(formatBatchDate(date)).toBe("Lun 16/06/2025 00:00");
		});
	});
});
