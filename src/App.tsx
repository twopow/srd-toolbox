import { Container, Heading, Tabs, VStack } from "@chakra-ui/react";
import AboutSection from "@/components/AboutSection";
import GeneratorSection from "@/components/GeneratorSection";
import InspectorSection from "@/components/InspectorSection";

export default function App() {
  return (
    <Container maxW="3xl" py="8">
      <VStack align="start" gap="6" width="100%">
        <Heading size="xl">SRD Toolbox</Heading>

        <Tabs.Root defaultValue="about" width="100%">
          <Tabs.List>
            <Tabs.Trigger value="about">About</Tabs.Trigger>
            <Tabs.Trigger value="generator">Generator</Tabs.Trigger>
            <Tabs.Trigger value="inspector">Inspector</Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="about">
            <AboutSection />
          </Tabs.Content>
          <Tabs.Content value="generator">
            <GeneratorSection />
          </Tabs.Content>
          <Tabs.Content value="inspector">
            <InspectorSection />
          </Tabs.Content>
        </Tabs.Root>
      </VStack>
    </Container>
  );
}
