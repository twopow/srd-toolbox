import { Box, Code, Heading, Table, Text, VStack } from "@chakra-ui/react";

export default function AboutSection() {
  return (
    <VStack align="stretch" gap="6">
      <Box>
        <Heading size="md" mb="2">
          What is SRD?
        </Heading>
        <Text>
          SRD (Simple Redirect Daemon) is a tiny HTTP service that turns DNS TXT
          records into URL redirects. Configure redirects where your DNS already
          lives — no accounts or control panel. DNS is the source of truth.
        </Text>
      </Box>

      <Box>
        <Heading size="md" mb="2">
          How it works
        </Heading>
        <VStack align="start" gap="2">
          <Text>
            <strong>1.</strong> Point your domain to the SRD service.
          </Text>
          <Code display="block" p="2" width="100%">
            blog.example.com. IN CNAME in.srd.sh
          </Code>
          <Text>
            <strong>2.</strong> Add a TXT record at{" "}
            <Code>_srd.&lt;host&gt;</Code> with the destination URL.
          </Text>
          <Code display="block" p="2" width="100%">
            _srd.blog.example.com. IN TXT "v=srd1;
            dest=https://newblog.example.net"
          </Code>
          <Text>
            <strong>3.</strong> Requests to your domain are redirected to the
            destination.
          </Text>
        </VStack>
      </Box>

      <Box>
        <Heading size="md" mb="2">
          Record format
        </Heading>
        <RecordTable />
      </Box>

      <Box>
        <Heading size="md" mb="2">
          Hosted service
        </Heading>
        <Text mb="2">
          A free hosted SRD service is available. Point your domain using either:
        </Text>
        <VStack align="start" gap="1">
          <Text>
            <strong>CNAME:</strong> <Code>in.srd.sh</Code> — for subdomains or
            root domains with CNAME flattening
          </Text>
          <Text>
            <strong>A record:</strong> <Code>34.56.76.181</Code> — for root
            domains
          </Text>
        </VStack>
      </Box>
    </VStack>
  );
}

function RecordTable() {
  return (
    <Table.Root size="sm">
      <Table.Header>
        <Table.Row>
          <Table.ColumnHeader>Field</Table.ColumnHeader>
          <Table.ColumnHeader>Description</Table.ColumnHeader>
          <Table.ColumnHeader>Required</Table.ColumnHeader>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        <Table.Row>
          <Table.Cell><Code>v=srd1</Code></Table.Cell>
          <Table.Cell>Version of the SRD record</Table.Cell>
          <Table.Cell>Yes</Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell><Code>dest</Code></Table.Cell>
          <Table.Cell>Destination URL for the redirect</Table.Cell>
          <Table.Cell>Yes</Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell><Code>code</Code></Table.Cell>
          <Table.Cell>HTTP status code (301, 302, 307, 308). Default: 302</Table.Cell>
          <Table.Cell>No</Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell><Code>route</Code></Table.Cell>
          <Table.Cell>Set to <Code>preserve</Code> to keep the original path and query string</Table.Cell>
          <Table.Cell>No</Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell><Code>referer</Code></Table.Cell>
          <Table.Cell>Referer header policy: <Code>none</Code>, <Code>host</Code> (default), or <Code>full</Code></Table.Cell>
          <Table.Cell>No</Table.Cell>
        </Table.Row>
      </Table.Body>
    </Table.Root>
  );
}
