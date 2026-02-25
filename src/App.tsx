import {
  Container,
  Heading,
  HStack,
  Icon,
  Link,
  Tabs,
  VStack,
} from "@chakra-ui/react";
import AboutSection from "@/components/AboutSection";
import GeneratorSection from "@/components/GeneratorSection";
import InspectorSection from "@/components/InspectorSection";
import { FaGithub } from "react-icons/fa6";


export default function App() {
  return (
    <Container maxW="3xl" py="8">
      <VStack align="start" gap="6" width="100%">
        <HStack justify="space-between" width="100%">
          <Heading size="xl">SRD Toolbox</Heading>
          <Link
            href="https://github.com/twopow/srd"
            target="_blank"
            fontSize="sm"
            color="fg.muted"
          >
            <Icon size="sm">
              <FaGithub />
            </Icon>
            twopow/srd
          </Link>
        </HStack>

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
