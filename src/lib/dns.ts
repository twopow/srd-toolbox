interface DohAnswer {
	name: string;
	type: number;
	TTL: number;
	data: string;
}

interface DohResponse {
	Status: number;
	Answer?: DohAnswer[];
}

export async function lookupSRDRecord(hostname: string): Promise<string> {
	const name = `_srd.${hostname}`;
	const url = `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(name)}&type=TXT`;

	const res = await fetch(url, {
		headers: { Accept: "application/dns-json" },
	});

	if (!res.ok) {
		throw new Error(`DNS lookup failed: HTTP ${res.status}`);
	}

	const data: DohResponse = await res.json();

	if (data.Status !== 0) {
		throw new Error(`DNS lookup failed: status ${data.Status}`);
	}

	const txtRecords = (data.Answer ?? []).filter((a) => a.type === 16);

	if (txtRecords.length === 0) {
		throw new Error(`No _srd TXT record found for ${hostname}`);
	}

	return txtRecords[0].data;
}
