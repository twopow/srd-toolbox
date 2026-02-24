import { useState } from "react";
import {
	Alert,
	Box,
	Button,
	Card,
	Code,
	Field,
	HStack,
	Input,
	Spinner,
	Text,
	VStack,
} from "@chakra-ui/react";
import { lookupSRDRecord } from "@/lib/dns";
import {
	parseSRDRecord,
	statusCodeLabel,
	codeDescription,
	refererDescription,
	type SRDRecord,
} from "@/lib/srd";

function ParsedDisplay({
	parsed,
	hostname,
}: {
	parsed: SRDRecord;
	hostname?: string;
}) {
	return (
		<>
			<Box>
				<Text fontSize="sm" fontWeight="medium" mb="2">
					Parsed Fields
				</Text>
				<VStack align="start" gap="3">
					<Box>
						<Text fontSize="sm">
							<strong>Destination</strong> <Code fontSize="xs">dest</Code>
						</Text>
						<Text fontSize="sm" color="fg.muted">
							{parsed.dest}
						</Text>
					</Box>
					<Box>
						<Text fontSize="sm">
							<strong>Status Code</strong> <Code fontSize="xs">code</Code>
						</Text>
						<Text fontSize="sm" color="fg.muted">
							{statusCodeLabel(parsed.code)} — {codeDescription(parsed.code)}
						</Text>
					</Box>
					<Box>
						<Text fontSize="sm">
							<strong>Route Preservation</strong>{" "}
							<Code fontSize="xs">route</Code>
						</Text>
						<Text fontSize="sm" color="fg.muted">
							{parsed.route
								? "Enabled — the original URL path and query string are appended to the destination."
								: "Disabled — requests redirect to the exact destination URL."}
						</Text>
					</Box>
					<Box>
						<Text fontSize="sm">
							<strong>Referer Policy</strong> <Code fontSize="xs">referer</Code>
						</Text>
						<Text fontSize="sm" color="fg.muted">
							{parsed.referer} — {refererDescription(parsed.referer)}
						</Text>
					</Box>
				</VStack>
			</Box>

			{hostname && (
				<Box
					p="3"
					borderWidth="1px"
					borderRadius="md"
					bg={{ base: "gray.50", _dark: "gray.800" }}
				>
					<Text fontSize="sm">
						Requests to <strong>{hostname}</strong> will be redirected to{" "}
						<strong>{parsed.dest}</strong> with a{" "}
						<strong>{statusCodeLabel(parsed.code)}</strong> response.
					</Text>
				</Box>
			)}
		</>
	);
}

function looksLikeRecord(input: string): boolean {
	return input.includes("=");
}

export default function InspectorSection() {
	const [input, setInput] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [rawRecord, setRawRecord] = useState<string | null>(null);
	const [parsed, setParsed] = useState<SRDRecord | null>(null);
	const [inspectedHost, setInspectedHost] = useState<string | null>(null);

	const inspectRecord = (raw: string) => {
		setRawRecord(raw);
		try {
			setParsed(parseSRDRecord(raw));
		} catch (e) {
			setError(
				`Failed to parse record: ${e instanceof Error ? e.message : "Unknown error"}`,
			);
		}
	};

	const inspect = async () => {
		const value = input.trim();
		if (!value) return;

		setError(null);
		setRawRecord(null);
		setParsed(null);
		setInspectedHost(null);

		if (looksLikeRecord(value)) {
			inspectRecord(value);
			return;
		}

		setLoading(true);
		setInspectedHost(value);

		try {
			const raw = await lookupSRDRecord(value);
			inspectRecord(raw);
		} catch (e) {
			setError(e instanceof Error ? e.message : "Unknown error");
		} finally {
			setLoading(false);
		}
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter") inspect();
	};

	return (
		<VStack align="start" gap="6" width="100%">
			<Field.Root>
				<Field.Label>Hostname or SRD record</Field.Label>
				<HStack width="100%">
					<Input
						placeholder="Enter a host (a.test.srd.sh) or SRD record (v=srd1; dest=https://example.com)"
						value={input}
						onChange={(e) => setInput(e.target.value)}
						onKeyDown={handleKeyDown}
						flex="1"
					/>
					<Button onClick={inspect} disabled={loading || !input.trim()}>
						{loading ? <Spinner size="sm" /> : "Inspect"}
					</Button>
				</HStack>
			</Field.Root>

			{error && (
				<Alert.Root status="error">
					<Alert.Indicator />
					<Alert.Content>
						<Alert.Description>{error}</Alert.Description>
					</Alert.Content>
				</Alert.Root>
			)}

			{rawRecord && (
				<Card.Root width="100%">
					<Card.Body gap="4">
						<Box>
							<Text fontSize="sm" fontWeight="medium" mb="1">
								{inspectedHost ? "Raw DNS Record" : "Record"}
							</Text>
							<Code display="block" p="2" width="100%">
								{rawRecord}
							</Code>
						</Box>

						{parsed && (
							<ParsedDisplay
								parsed={parsed}
								hostname={inspectedHost ?? undefined}
							/>
						)}
					</Card.Body>
				</Card.Root>
			)}
		</VStack>
	);
}
