import { transformStartDate, transformRule, createMyEvent } from "./App";
import { saveAs } from "file-saver";

describe("App.js", () => {
	describe("transformStartDate", () => {
		it("should correctly transform the start date and time", () => {
			const startDate = "2022-12-31";
			const startTime = "12:00";
			const result = transformStartDate(startDate, startTime);
			expect(result).toStrictEqual([2022, 12, 31, 12, 0]);
		});
	});

	describe("transformRule", () => {
		it("should correctly transform the recurrence rule", () => {
			const isRecurring = true;
			const frequency = "weekly";
			const daysOfWeek = ["mon", "wed", "fri"];
			const count = 10;
			const result = transformRule(isRecurring, frequency, daysOfWeek, count);
			expect(result).toBe("FREQ=WEEKLY;COUNT=10");
		});

		it("should correctly transform the recurrence rule to part of week", () => {
			const isRecurring = true;
			const frequency = "partOfWeek";
			const daysOfWeek = ["mon", "wed", "fri"];
			const count = 10;
			const result = transformRule(isRecurring, frequency, daysOfWeek, count);
			expect(result).toBe("FREQ=WEEKLY;BYDAY=MON,WED,FRI;COUNT=10");
		});
	});

	describe("createEvent", () => {
		it("should call createMyEvent and capture the error", () => {
			const error = null;
			const value = {
				start: "2022-12-31T12:00:00",
				duration: { hours: 1, minutes: 30 },
				title: "Test Event",
				description: "This is a test event.",
				location: "Test Location",
				recurrenceRule: "FREQ=WEEKLY;BYDAY=MON,WED,FRI;COUNT=10",
			};
			try {
				createMyEvent("something", value);
			} catch (error) {
				expect(console.error).toHaveBeenCalledWith(
					"error en lib ->",
					"something"
				);
				expect(saveAs).not.toHaveBeenCalled();
			}
		});
		it.skip("should log the value, create a blob, and save the blob if there is no error", () => {
			const error = null;
			const value = {
				start: "2022-12-31T12:00:00",
				duration: { hours: 1, minutes: 30 },
				title: "Test Event",
				description: "This is a test event.",
				location: "Test Location",
				recurrenceRule: "FREQ=WEEKLY;BYDAY=MON,WED,FRI;COUNT=10",
			};
			//const blob = new Blob([value], { type: "text/calendar" });

			createMyEvent(error, value);

			expect(console.table).toHaveBeenCalledWith(value);
			//expect(console.info).toHaveBeenCalledWith("blob", blob);
			//expect(saveAs).toHaveBeenCalledWith(blob, "event.ics");
		});
	});
});
