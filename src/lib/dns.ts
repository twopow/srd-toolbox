import { parseSRDRecord, type SRDRecord } from "@/lib/srd";

const INSPECT_URL = "https://in.srd.sh/inspect";

interface APIInspectResponse {
	host: string;
	destination?: string;
	code?: number;
	preserve_route?: boolean;
	referer_policy?: string;
	not_found?: boolean;
	loop?: boolean;
	error?: string;
}

export interface InspectResult {
	hostname: string | null;
	parsed: SRDRecord | null;
	parseError: string | null;
	loopDetected: boolean;
}

function looksLikeRecord(input: string): boolean {
	return input.includes("=");
}

function parseRecord(raw: string): {
	parsed: SRDRecord | null;
	parseError: string | null;
} {
	try {
		return { parsed: parseSRDRecord(raw), parseError: null };
	} catch (e) {
		return {
			parsed: null,
			parseError: e instanceof Error ? e.message : "Unknown error",
		};
	}
}

function toSRDRecord(data: APIInspectResponse): SRDRecord {
	return {
		version: "srd1",
		dest: data.destination ?? "",
		code: (data.code ?? 302) as SRDRecord["code"],
		route: data.preserve_route ?? false,
		referer: (data.referer_policy ?? "host") as SRDRecord["referer"],
	};
}

async function inspectHostname(hostname: string): Promise<InspectResult> {
	const res = await fetch(
		`${INSPECT_URL}?host=${encodeURIComponent(hostname)}`,
	);

	if (!res.ok) {
		throw new Error(`Inspect request failed: HTTP ${res.status}`);
	}

	const data: APIInspectResponse = await res.json();

	if (data.error) {
		throw new Error(data.error);
	}

	if (data.not_found) {
		throw new Error(`No SRD record found for ${hostname}`);
	}

	return {
		hostname,
		parsed: toSRDRecord(data),
		parseError: null,
		loopDetected: data.loop ?? false,
	};
}

export async function inspect(input: string): Promise<InspectResult> {
	if (looksLikeRecord(input)) {
		const { parsed, parseError } = parseRecord(input);
		return { hostname: null, parsed, parseError, loopDetected: false };
	}

	return inspectHostname(input);
}
