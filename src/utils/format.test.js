import {
	formatDate,
	formatDuration,
	formatRecurrence,
	formatAlarm,
	formatAttendees,
	formatEventSummary,
} from "./format";

describe("format utils", () => {
	describe("formatDate", () => {
		it("should format YYYY-MM-DD to DD/MM/YYYY", () => {
			expect(formatDate("2025-06-15")).toBe("15/06/2025");
		});

		it("should return empty string for empty input", () => {
			expect(formatDate("")).toBe("");
		});
	});

	describe("formatDuration", () => {
		it("should format hours only", () => {
			expect(formatDuration(2, 0)).toBe("2 horas");
		});

		it("should format minutes only", () => {
			expect(formatDuration(0, 30)).toBe("30 minutos");
		});

		it("should format hours and minutes", () => {
			expect(formatDuration(1, 30)).toBe("1 hora y 30 minutos");
		});

		it("should format singular hour", () => {
			expect(formatDuration(1, 0)).toBe("1 hora");
		});

		it("should format singular minute", () => {
			expect(formatDuration(0, 1)).toBe("1 minuto");
		});

		it("should handle zero duration", () => {
			expect(formatDuration(0, 0)).toBe("0 minutos");
		});
	});

	describe("formatRecurrence", () => {
		it("should return No when not recurring", () => {
			expect(formatRecurrence({ isRecurring: false })).toBe("No");
		});

		it("should format weekly with count", () => {
			const result = formatRecurrence({
				isRecurring: true,
				frequency: "weekly",
				daysOfWeek: [],
				interval: 1,
				endType: "count",
				count: 10,
			});
			expect(result).toBe("Semanal — 10 repeticiones");
		});

		it("should format daily with until", () => {
			const result = formatRecurrence({
				isRecurring: true,
				frequency: "daily",
				daysOfWeek: [],
				interval: 1,
				endType: "until",
				untilDate: "2025-12-31",
			});
			expect(result).toBe("Diario — hasta 31/12/2025");
		});

		it("should format partOfWeek with days", () => {
			const result = formatRecurrence({
				isRecurring: true,
				frequency: "partOfWeek",
				daysOfWeek: ["MO", "WE", "FR"],
				interval: 1,
				endType: "count",
				count: 5,
			});
			expect(result).toBe(
				"Dias especificos (Lunes, Miercoles, Viernes) — 5 repeticiones",
			);
		});

		it("should include interval when greater than 1", () => {
			const result = formatRecurrence({
				isRecurring: true,
				frequency: "weekly",
				daysOfWeek: [],
				interval: 2,
				endType: "count",
				count: 10,
			});
			expect(result).toBe("Semanal, cada 2 periodos — 10 repeticiones");
		});

		it("should format singular repetition", () => {
			const result = formatRecurrence({
				isRecurring: true,
				frequency: "monthly",
				daysOfWeek: [],
				interval: 1,
				endType: "count",
				count: 1,
			});
			expect(result).toBe("Mensual — 1 repeticion");
		});
	});

	describe("formatAlarm", () => {
		it("should return Sin recordatorio when disabled", () => {
			expect(
				formatAlarm({ enabled: false, preset: "none" }),
			).toBe("Sin recordatorio");
		});

		it("should return Sin recordatorio when preset is none", () => {
			expect(
				formatAlarm({ enabled: true, preset: "none" }),
			).toBe("Sin recordatorio");
		});

		it("should format preset minutes", () => {
			expect(formatAlarm({ enabled: true, preset: "15" })).toBe(
				"15 minutos antes",
			);
		});

		it("should format 1 hour preset", () => {
			expect(formatAlarm({ enabled: true, preset: "60" })).toBe(
				"1 hora antes",
			);
		});

		it("should format 1 day preset", () => {
			expect(formatAlarm({ enabled: true, preset: "1440" })).toBe(
				"1 dia antes",
			);
		});

		it("should format custom alarm", () => {
			expect(
				formatAlarm({
					enabled: true,
					preset: "custom",
					customHours: 2,
					customMinutes: 30,
				}),
			).toBe("2 horas y 30 minutos antes");
		});

		it("should return Sin recordatorio for custom with zero values", () => {
			expect(
				formatAlarm({
					enabled: true,
					preset: "custom",
					customHours: 0,
					customMinutes: 0,
				}),
			).toBe("Sin recordatorio");
		});
	});

	describe("formatAttendees", () => {
		it("should return Sin invitados when no attendees or organizer", () => {
			expect(formatAttendees([], null)).toBe("Sin invitados");
			expect(formatAttendees([], {})).toBe("Sin invitados");
			expect(formatAttendees(undefined, undefined)).toBe("Sin invitados");
		});

		it("should format organizer with name and email", () => {
			const result = formatAttendees([], { name: "Juan", email: "juan@test.com" });
			expect(result).toBe("Organizador: Juan (juan@test.com)");
		});

		it("should format organizer with email only", () => {
			const result = formatAttendees([], { name: "", email: "admin@test.com" });
			expect(result).toBe("Organizador: admin@test.com");
		});

		it("should format single attendee with name and email", () => {
			const attendees = [{ name: "Ana", email: "ana@test.com", rsvp: false }];
			const result = formatAttendees(attendees, null);
			expect(result).toBe("1 invitado: Ana <ana@test.com>");
		});

		it("should format attendee with RSVP", () => {
			const attendees = [{ name: "Ana", email: "ana@test.com", rsvp: true }];
			const result = formatAttendees(attendees, null);
			expect(result).toBe("1 invitado: Ana <ana@test.com> (RSVP)");
		});

		it("should format multiple attendees", () => {
			const attendees = [
				{ name: "Ana", email: "ana@test.com", rsvp: false },
				{ name: "", email: "bob@test.com", rsvp: true },
			];
			const result = formatAttendees(attendees, null);
			expect(result).toBe("2 invitados: Ana <ana@test.com>, bob@test.com (RSVP)");
		});

		it("should format organizer and attendees together", () => {
			const attendees = [{ name: "Ana", email: "ana@test.com", rsvp: false }];
			const organizer = { name: "Boss", email: "boss@test.com" };
			const result = formatAttendees(attendees, organizer);
			expect(result).toContain("Organizador: Boss (boss@test.com)");
			expect(result).toContain("1 invitado: Ana <ana@test.com>");
		});

		it("should skip attendees with empty emails", () => {
			const attendees = [
				{ name: "Ana", email: "ana@test.com", rsvp: false },
				{ name: "Ghost", email: "", rsvp: false },
			];
			const result = formatAttendees(attendees, null);
			expect(result).toBe("1 invitado: Ana <ana@test.com>");
		});
	});

	describe("formatEventSummary", () => {
		it("should build complete summary object", () => {
			const formData = {
				title: "Standup",
				description: "Daily sync",
				location: "Zoom",
				startDate: "2025-06-15",
				startTime: "09:00",
				durationHours: 0,
				durationMinutes: 15,
				isRecurring: true,
				frequency: "daily",
				daysOfWeek: [],
				interval: 1,
				endType: "count",
				count: 30,
				alarm: { enabled: true, preset: "5" },
			};

			const summary = formatEventSummary(formData);

			expect(summary).toStrictEqual({
				title: "Standup",
				description: "Daily sync",
				location: "Zoom",
				date: "15/06/2025",
				time: "09:00",
				duration: "15 minutos",
				recurrence: "Diario — 30 repeticiones",
				alarm: "5 minutos antes",
			});
		});

		it("should use dash for empty description and location", () => {
			const formData = {
				title: "Test",
				description: "",
				location: "",
				startDate: "2025-01-01",
				startTime: "10:00",
				durationHours: 1,
				durationMinutes: 0,
				isRecurring: false,
				alarm: { enabled: false, preset: "none" },
			};

			const summary = formatEventSummary(formData);

			expect(summary.description).toBe("—");
			expect(summary.location).toBe("—");
		});
	});
});
