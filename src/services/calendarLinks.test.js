import {
	computeStartEnd,
	formatGoogleDate,
	formatOutlookDate,
	buildGoogleCalendarUrl,
	buildOutlookCalendarUrl,
} from "./calendarLinks";

const baseFormData = {
	title: "Standup",
	description: "",
	location: "",
	startDate: "2026-04-01",
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
	attendees: [],
};

describe("calendarLinks", () => {
	describe("computeStartEnd", () => {
		it("should compute start and end for a basic case", () => {
			const { start, end } = computeStartEnd("2026-04-01", "09:00", 1, 30);
			expect(start).toStrictEqual(new Date(2026, 3, 1, 9, 0, 0));
			expect(end).toStrictEqual(new Date(2026, 3, 1, 10, 30, 0));
		});

		it("should handle midnight crossing", () => {
			const { start, end } = computeStartEnd("2026-03-31", "23:00", 2, 0);
			expect(start).toStrictEqual(new Date(2026, 2, 31, 23, 0, 0));
			expect(end).toStrictEqual(new Date(2026, 3, 1, 1, 0, 0));
		});

		it("should handle zero duration", () => {
			const { start, end } = computeStartEnd("2026-04-01", "09:00", 0, 0);
			expect(start).toStrictEqual(new Date(2026, 3, 1, 9, 0, 0));
			expect(end).toStrictEqual(new Date(2026, 3, 1, 9, 0, 0));
		});
	});

	describe("formatGoogleDate", () => {
		it('should format as "YYYYMMDDTHHmmss"', () => {
			const date = new Date(2026, 3, 1, 9, 0, 0);
			expect(formatGoogleDate(date)).toBe("20260401T090000");
		});
	});

	describe("formatOutlookDate", () => {
		it('should format as "YYYY-MM-DDTHH:mm:ss"', () => {
			const date = new Date(2026, 3, 1, 9, 0, 0);
			expect(formatOutlookDate(date)).toBe("2026-04-01T09:00:00");
		});
	});

	describe("buildGoogleCalendarUrl", () => {
		it("should build minimal URL with action, text, and dates", () => {
			const url = buildGoogleCalendarUrl(baseFormData);

			expect(url).toContain("https://calendar.google.com/calendar/render?");

			const params = new URL(url).searchParams;
			expect(params.get("action")).toBe("TEMPLATE");
			expect(params.get("text")).toBe("Standup");
			expect(params.get("dates")).toBe("20260401T090000/20260401T100000");

			expect(params.has("details")).toBe(false);
			expect(params.has("location")).toBe(false);
			expect(params.has("recur")).toBe(false);
			expect(params.has("add")).toBe(false);
		});

		it("should include details and location when present", () => {
			const formData = {
				...baseFormData,
				description: "Daily sync",
				location: "Sala A",
			};
			const url = buildGoogleCalendarUrl(formData);
			const params = new URL(url).searchParams;

			expect(params.get("details")).toBe("Daily sync");
			expect(params.get("location")).toBe("Sala A");
		});

		it("should include recur param with RRULE prefix when recurring", () => {
			const formData = {
				...baseFormData,
				isRecurring: true,
				frequency: "partOfWeek",
				daysOfWeek: ["MO", "WE"],
				endType: "count",
				count: 10,
			};
			const url = buildGoogleCalendarUrl(formData);
			const params = new URL(url).searchParams;

			expect(params.get("recur")).toMatch(/^RRULE:/);
			expect(params.get("recur")).toContain("FREQ=WEEKLY");
			expect(params.get("recur")).toContain("BYDAY=MO,WE");
		});

		it("should include add param with comma-separated emails", () => {
			const formData = {
				...baseFormData,
				attendees: [
					{ name: "Ana", email: "ana@test.com", rsvp: false },
					{ name: "Luis", email: "luis@test.com", rsvp: false },
				],
			};
			const url = buildGoogleCalendarUrl(formData);
			const params = new URL(url).searchParams;

			expect(params.get("add")).toBe("ana@test.com,luis@test.com");
		});

		it("should omit details and location when empty", () => {
			const formData = { ...baseFormData, description: "  ", location: "  " };
			const url = buildGoogleCalendarUrl(formData);
			const params = new URL(url).searchParams;

			expect(params.has("details")).toBe(false);
			expect(params.has("location")).toBe(false);
		});
	});

	describe("buildOutlookCalendarUrl", () => {
		it("should build minimal URL on outlook.live.com", () => {
			const url = buildOutlookCalendarUrl(baseFormData, "outlook.live.com");

			expect(url).toContain("https://outlook.live.com/calendar/deeplink/compose?");

			const params = new URL(url).searchParams;
			expect(params.get("path")).toBe("/calendar/action/compose");
			expect(params.get("rru")).toBe("addevent");
			expect(params.get("subject")).toBe("Standup");
			expect(params.get("startdt")).toBe("2026-04-01T09:00:00");
			expect(params.get("enddt")).toBe("2026-04-01T10:00:00");
		});

		it("should build URL on outlook.office.com", () => {
			const url = buildOutlookCalendarUrl(baseFormData, "outlook.office.com");
			expect(url).toContain("https://outlook.office.com/calendar/deeplink/compose?");
		});

		it("should include body and location when present", () => {
			const formData = {
				...baseFormData,
				description: "Sync call",
				location: "Room B",
			};
			const url = buildOutlookCalendarUrl(formData, "outlook.live.com");
			const params = new URL(url).searchParams;

			expect(params.get("body")).toBe("Sync call");
			expect(params.get("location")).toBe("Room B");
		});

		it("should include to param with semicolon-separated emails", () => {
			const formData = {
				...baseFormData,
				attendees: [
					{ name: "Ana", email: "ana@test.com", rsvp: false },
					{ name: "Luis", email: "luis@test.com", rsvp: false },
				],
			};
			const url = buildOutlookCalendarUrl(formData, "outlook.live.com");
			const params = new URL(url).searchParams;

			expect(params.get("to")).toBe("ana@test.com;luis@test.com");
		});

		it("should omit body and location when empty", () => {
			const formData = { ...baseFormData, description: "", location: "" };
			const url = buildOutlookCalendarUrl(formData, "outlook.live.com");
			const params = new URL(url).searchParams;

			expect(params.has("body")).toBe(false);
			expect(params.has("location")).toBe(false);
		});
	});
});
