export const PROVIDERS = {
	ics: {
		label: "Archivo .ics",
		action: "download",
		capabilities: { recurrence: true, alarms: true, attendees: true, organizer: true, batch: true },
	},
	google: {
		label: "Google Calendar",
		action: "open-url",
		capabilities: { recurrence: true, alarms: false, attendees: true, organizer: false, batch: false },
	},
	"outlook-personal": {
		label: "Outlook (personal)",
		action: "open-url",
		capabilities: { recurrence: false, alarms: false, attendees: true, organizer: false, batch: false },
	},
	"outlook-work": {
		label: "Outlook (trabajo)",
		action: "open-url",
		capabilities: { recurrence: false, alarms: false, attendees: true, organizer: false, batch: false },
	},
};

export const DEFAULT_PROVIDER = "ics";

export const getCapabilities = (providerId) =>
	PROVIDERS[providerId]?.capabilities ?? PROVIDERS.ics.capabilities;
