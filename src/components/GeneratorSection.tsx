import { useState } from "react";
import {
  Box,
  Button,
  Code,
  createListCollection,
  Field,
  Heading,
  HStack,
  Input,
  Select,
  Switch,
  Text,
  VStack,
} from "@chakra-ui/react";
import {
  generateSRDRecord,
  type GeneratorInput,
  type RefererPolicy,
  type StatusCode,
} from "@/lib/srd";

const statusCodes = createListCollection({
  items: [
    { value: "301", label: "301 — Moved Permanently" },
    { value: "302", label: "302 — Found (Temporary)" },
    { value: "307", label: "307 — Temporary Redirect" },
    { value: "308", label: "308 — Permanent Redirect" },
  ],
});

const refererPolicies = createListCollection({
  items: [
    { value: "none", label: "none — No Referer header" },
    { value: "host", label: "host — Hostname only (default)" },
    { value: "full", label: "full — Full referring URL" },
  ],
});

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <Button size="xs" variant="outline" onClick={handleCopy}>
      {copied ? "Copied" : "Copy"}
    </Button>
  );
}

export default function GeneratorSection() {
  const [hostname, setHostname] = useState("");
  const [dest, setDest] = useState("");
  const [code, setCode] = useState<StatusCode>(302);
  const [route, setRoute] = useState(false);
  const [referer, setReferer] = useState<RefererPolicy>("host");

  const input: GeneratorInput = { dest, code, route, referer };
  const record = dest ? generateSRDRecord(input) : "";
  const cnameRecord = hostname
    ? `${hostname}. IN CNAME in.srd.sh`
    : "<hostname>. IN CNAME in.srd.sh";
  const txtRecord = hostname
    ? `_srd.${hostname}. IN TXT "${record}"`
    : `_srd.<hostname>. IN TXT "${record}"`;

  return (
    <VStack align="start" gap="6">
      <VStack align="start" gap="4" width="100%">
        <Field.Root>
          <Field.Label>From (hostname)</Field.Label>
          <Input
            placeholder="blog.example.com"
            value={hostname}
            onChange={(e) => setHostname(e.target.value)}
          />
        </Field.Root>

        <Field.Root>
          <Field.Label>Destination</Field.Label>
          <Input
            placeholder="https://newblog.example.net"
            value={dest}
            onChange={(e) => setDest(e.target.value)}
          />
        </Field.Root>

        <Field.Root>
          <Field.Label>Status Code</Field.Label>
          <Select.Root
            collection={statusCodes}
            value={[String(code)]}
            onValueChange={(e) => setCode(Number(e.value[0]) as StatusCode)}
          >
            <Select.HiddenSelect />
            <Select.Control>
              <Select.Trigger>
                <Select.ValueText placeholder="Select status code" />
              </Select.Trigger>
              <Select.IndicatorGroup>
                <Select.Indicator />
              </Select.IndicatorGroup>
            </Select.Control>
            <Select.Positioner>
              <Select.Content>
                {statusCodes.items.map((item) => (
                  <Select.Item key={item.value} item={item}>
                    <Select.ItemText>{item.label}</Select.ItemText>
                    <Select.ItemIndicator />
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Positioner>
          </Select.Root>
        </Field.Root>

        <Field.Root>
          <Field.Label>Referer Policy</Field.Label>
          <Select.Root
            collection={refererPolicies}
            value={[referer]}
            onValueChange={(e) =>
              setReferer(e.value[0] as RefererPolicy)
            }
          >
            <Select.HiddenSelect />
            <Select.Control>
              <Select.Trigger>
                <Select.ValueText placeholder="Select referer policy" />
              </Select.Trigger>
              <Select.IndicatorGroup>
                <Select.Indicator />
              </Select.IndicatorGroup>
            </Select.Control>
            <Select.Positioner>
              <Select.Content>
                {refererPolicies.items.map((item) => (
                  <Select.Item key={item.value} item={item}>
                    <Select.ItemText>{item.label}</Select.ItemText>
                    <Select.ItemIndicator />
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Positioner>
          </Select.Root>
        </Field.Root>
      </VStack>

      <Field.Root>
        <HStack>
          <Switch.Root
            checked={route}
            onCheckedChange={(e) => setRoute(e.checked)}
          >
            <Switch.HiddenInput />
            <Switch.Control>
              <Switch.Thumb />
            </Switch.Control>
          </Switch.Root>
          <Field.Label mb="0">Preserve Route</Field.Label>
        </HStack>
      </Field.Root>

      {dest && (
        <VStack align="start" gap="4" width="100%">
          <Box width="100%">
            <Heading size="sm" mb="2">
              Generated Record
            </Heading>
            <HStack>
              <Code display="block" p="2" flex="1">
                {record}
              </Code>
              <CopyButton text={record} />
            </HStack>
          </Box>

          <Box width="100%">
            <Heading size="sm" mb="2">
              DNS Instructions
            </Heading>
            <VStack align="start" gap="2" width="100%">
              <Text fontSize="sm" fontWeight="medium">
                1. Point your domain to SRD:
              </Text>
              <HStack width="100%">
                <Code display="block" p="2" flex="1" fontSize="xs">
                  {cnameRecord}
                </Code>
                <CopyButton text={cnameRecord} />
              </HStack>

              <Text fontSize="sm" fontWeight="medium">
                2. Add the SRD TXT record:
              </Text>
              <HStack width="100%">
                <Code display="block" p="2" flex="1" fontSize="xs">
                  {txtRecord}
                </Code>
                <CopyButton text={txtRecord} />
              </HStack>
            </VStack>
          </Box>
        </VStack>
      )}
    </VStack>
  );
}
