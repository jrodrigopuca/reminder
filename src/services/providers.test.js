import { PROVIDERS, DEFAULT_PROVIDER, getCapabilities } from "./providers";

const EXPECTED_CAPABILITY_KEYS = ["recurrence", "alarms", "attendees", "organizer", "batch"];

describe("providers", () => {
	describe("PROVIDERS structure", () => {
		it.each(Object.entries(PROVIDERS))(
			"%s should have a non-empty label string",
			(_id, provider) => {
				expect(typeof provider.label).toBe("string");
				expect(provider.label.length).toBeGreaterThan(0);
			},
		);

		it.each(Object.entries(PROVIDERS))(
			'%s should have action "download" or "open-url"',
			(_id, provider) => {
				expect(["download", "open-url"]).toContain(provider.action);
			},
		);

		it.each(Object.entries(PROVIDERS))(
			"%s should have exactly 5 boolean capability keys",
			(_id, provider) => {
				const keys = Object.keys(provider.capabilities);
				expect(keys).toHaveLength(5);
				expect(keys.sort()).toStrictEqual([...EXPECTED_CAPABILITY_KEYS].sort());
				keys.forEach((key) => {
					expect(typeof provider.capabilities[key]).toBe("boolean");
				});
			},
		);
	});

	describe("DEFAULT_PROVIDER", () => {
		it('should be "ics"', () => {
			expect(DEFAULT_PROVIDER).toBe("ics");
		});
	});

	describe("ICS capabilities", () => {
		it("should have all capabilities as true", () => {
			const caps = PROVIDERS.ics.capabilities;
			expect(caps).toStrictEqual({
				recurrence: true,
				alarms: true,
				attendees: true,
				organizer: true,
				batch: true,
			});
		});
	});

	describe("Google capabilities", () => {
		it("should have recurrence and attendees true, rest false", () => {
			const caps = PROVIDERS.google.capabilities;
			expect(caps.recurrence).toBe(true);
			expect(caps.attendees).toBe(true);
			expect(caps.alarms).toBe(false);
			expect(caps.organizer).toBe(false);
			expect(caps.batch).toBe(false);
		});
	});

	describe("Outlook personal capabilities", () => {
		it("should have only attendees true", () => {
			const caps = PROVIDERS["outlook-personal"].capabilities;
			expect(caps.attendees).toBe(true);
			expect(caps.recurrence).toBe(false);
			expect(caps.alarms).toBe(false);
			expect(caps.organizer).toBe(false);
			expect(caps.batch).toBe(false);
		});
	});

	describe("Outlook work capabilities", () => {
		it("should have only attendees true", () => {
			const caps = PROVIDERS["outlook-work"].capabilities;
			expect(caps.attendees).toBe(true);
			expect(caps.recurrence).toBe(false);
			expect(caps.alarms).toBe(false);
			expect(caps.organizer).toBe(false);
			expect(caps.batch).toBe(false);
		});
	});

	describe("getCapabilities", () => {
		it("should return correct capabilities for each known provider", () => {
			Object.entries(PROVIDERS).forEach(([id, provider]) => {
				expect(getCapabilities(id)).toStrictEqual(provider.capabilities);
			});
		});

		it("should fall back to ICS capabilities for unknown provider id", () => {
			expect(getCapabilities("unknown")).toStrictEqual(PROVIDERS.ics.capabilities);
			expect(getCapabilities("")).toStrictEqual(PROVIDERS.ics.capabilities);
			expect(getCapabilities(undefined)).toStrictEqual(PROVIDERS.ics.capabilities);
		});
	});
});
