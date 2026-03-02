import { useCallback, useEffect, useState } from "react";
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
import { inspect as inspectInput, type InspectResult } from "@/lib/dns";
import {
	statusCodeLabel,
	codeDescription,
	refererDescription,
	generateSRDRecord,
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

export default function InspectorSection() {
	const [input, setInput] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [result, setResult] = useState<InspectResult | null>(null);

	const reset = useCallback(() => {
		setError(null);
		setResult(null);
	}, []);

	const inspect = useCallback(
		async (value?: string) => {
			const v = (value ?? input).trim();
			if (!v) return;

			if (v !== input) setInput(v);

			reset();
			setLoading(true);

			try {
				const r = await inspectInput(v);
				console.log("inspect result", r);
				setResult(r);
				if (r.parseError) {
					setError(`Failed to parse record: ${r.parseError}`);
				}
			} catch (e) {
				setError(e instanceof Error ? e.message : "Unknown error");
			} finally {
				setLoading(false);
			}
		},
		[input],
	);

	useEffect(() => {
		const r = new URLSearchParams(window.location.search).get("r");
		if (r) inspect(r);
	}, []);

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
						onChange={(e) => {
							setInput(e.target.value);
							if (!e.target.value.trim()) reset();
						}}
						onKeyDown={handleKeyDown}
						flex="1"
					/>
					<Button onClick={() => inspect()} disabled={loading || !input.trim()}>
						{loading ? <Spinner size="sm" /> : "Inspect"}
					</Button>
				</HStack>
			</Field.Root>

			{loading && (
				<VStack width="100%" py="8">
					<Spinner size="lg" />
					<Text fontSize="sm" color="fg.muted">
						Inspecting record...
					</Text>
				</VStack>
			)}

			{error && (
				<Alert.Root status="error">
					<Alert.Indicator />
					<Alert.Content>
						<Alert.Description>{error}</Alert.Description>
					</Alert.Content>
				</Alert.Root>
			)}

			{result?.loopDetected && (
				<Alert.Root status="warning">
					<Alert.Indicator />
					<Alert.Content>
						<Alert.Title>Loop detected</Alert.Title>
						<Alert.Description>
							This record creates a redirect loop. The destination
							points back to a host that is also configured with
							SRD, causing an infinite redirect cycle.
						</Alert.Description>
					</Alert.Content>
				</Alert.Root>
			)}

			{result?.parsed && (
				<Card.Root width="100%">
					<Card.Body gap="4">
						<Box>
							<Text fontSize="sm" fontWeight="medium" mb="1">
								Record
							</Text>
							<Code display="block" p="2" width="100%">
								{generateSRDRecord(result.parsed)}
							</Code>
						</Box>

						<ParsedDisplay
							parsed={result.parsed}
							hostname={result.hostname ?? undefined}
						/>
					</Card.Body>
				</Card.Root>
			)}
		</VStack>
	);
}
