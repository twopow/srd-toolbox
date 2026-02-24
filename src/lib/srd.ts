export type StatusCode = 301 | 302 | 307 | 308;
export type RefererPolicy = "none" | "host" | "full";

export interface SRDRecord {
	version: string;
	dest: string;
	code: StatusCode;
	route: boolean;
	referer: RefererPolicy;
}

const VERSION = "srd1";
const DEFAULT_CODE: StatusCode = 302;
const DEFAULT_REFERER: RefererPolicy = "host";

export function parseSRDRecord(raw: string): SRDRecord {
	const record = raw.replace(/^"|"$/g, "");

	const rr: SRDRecord = {
		version: "",
		dest: "",
		code: DEFAULT_CODE,
		route: false,
		referer: DEFAULT_REFERER,
	};

	const parts = record.split(";");

	for (const part of parts) {
		const trimmed = part.trim();
		if (trimmed === "") continue;

		const eqIndex = trimmed.indexOf("=");
		let key: string;
		let value: string;

		if (eqIndex === -1) {
			key = trimmed;
			value = "";
		} else {
			key = trimmed.substring(0, eqIndex).trim();
			value = trimmed.substring(eqIndex + 1).trim();
		}

		switch (key) {
			case "v":
				rr.version = value;
				break;
			case "dest":
				rr.dest = value;
				break;
			case "code":
				rr.code = parseCode(value);
				break;
			case "route":
				if (value === "preserve") {
					rr.route = true;
				}
				break;
			case "referer":
			case "referrer":
				rr.referer = parseRefererPolicy(value);
				break;
		}
	}

	if (rr.version !== VERSION) {
		throw new Error("invalid version");
	}

	if (rr.dest === "") {
		throw new Error("no destination found");
	}

	rr.dest = rr.dest.toLowerCase().trim();

	// Match Go behavior: prepend http:// if no scheme present
	if (!rr.dest.includes("://")) {
		rr.dest = "http://" + rr.dest;
	}

	try {
		new URL(rr.dest);
	} catch {
		throw new Error("invalid destination");
	}

	return rr;
}

function parseCode(value: string): StatusCode {
	switch (value) {
		case "301":
			return 301;
		case "302":
			return 302;
		case "307":
			return 307;
		case "308":
			return 308;
		default:
			return DEFAULT_CODE;
	}
}

function parseRefererPolicy(value: string): RefererPolicy {
	switch (value) {
		case "none":
			return "none";
		case "host":
			return "host";
		case "full":
			return "full";
		default:
			return DEFAULT_REFERER;
	}
}

export interface GeneratorInput {
	dest: string;
	code: StatusCode;
	route: boolean;
	referer: RefererPolicy;
}

export function generateSRDRecord(input: GeneratorInput): string {
	const parts: string[] = [`v=${VERSION}`, `dest=${input.dest}`];

	if (input.code !== DEFAULT_CODE) {
		parts.push(`code=${input.code}`);
	}

	if (input.route) {
		parts.push("route=preserve");
	}

	if (input.referer !== DEFAULT_REFERER) {
		parts.push(`referer=${input.referer}`);
	}

	return parts.join("; ");
}

export function statusCodeLabel(code: StatusCode): string {
	switch (code) {
		case 301:
			return "301 Moved Permanently";
		case 302:
			return "302 Found (Temporary)";
		case 307:
			return "307 Temporary Redirect";
		case 308:
			return "308 Permanent Redirect";
	}
}

export function codeDescription(code: StatusCode): string {
	switch (code) {
		case 301:
			return "Browsers and search engines treat this as a permanent move. Caches may store the redirect indefinitely.";
		case 302:
			return "A temporary redirect. Browsers will check the original URL again on future requests.";
		case 307:
			return "Like 302, but guarantees the request method (POST, PUT, etc.) is preserved on redirect.";
		case 308:
			return "Like 301, but guarantees the request method is preserved. Permanent and cacheable.";
	}
}

export function refererDescription(policy: RefererPolicy): string {
	switch (policy) {
		case "none":
			return "No Referer header is sent with the redirect.";
		case "host":
			return "The Referer header contains only the hostname of the original request.";
		case "full":
			return "The Referer header contains the full URL of the original request.";
	}
}
