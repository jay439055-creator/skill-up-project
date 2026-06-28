export type LabsPrototype = {
  readonly id: string;
  readonly title: string;
  readonly status: string;
  readonly version: string;
  readonly image: string;
  readonly href: string;
  readonly description: string;
};

export type LabsQuestion = {
  readonly title: string;
  readonly body: string;
};

export const prototypes: readonly LabsPrototype[] = [
  {
    id: "section-1",
    title: "Customer Knowledge Base",
    status: "Prototype",
    version: "v0.01",
    image: "/sequence-labs/customer-knowledge-base.png",
    href: "https://www.sequencehq.com/labs/customer-knowledge-base",
    description:
      "Most of what you know about a customer lives across shared docs and Slack channels. To make that knowledge more accessible to agents, this tool ingests those sources into a vector index and exposes the index via an MCP server, so any agent can search and cite the source material.",
  },
  {
    id: "section-2",
    title: "Contract intake agent",
    status: "Live",
    version: "v0.37",
    image: "/sequence-labs/contract-intake-agent.png",
    href: "https://www.sequencehq.com/labs/contract-intake-agent",
    description:
      "Customer contracts contain a variety of data, including customer details, billing contacts, pricing details, and billing terms. Instead of manually transcribing a contract into Sequence for every new customer, contract intake agent automatically extracts the key information and sets up the customer and billing schedule for review.",
  },
];

export const buildLevels: readonly string[] = [
  "Slotted into specific product flows (a contract becomes structured data).",
  "Running guided automations with human oversight (multi-step workflows with tools, review, and audit).",
  "Operating autonomously, where guardrails are strong enough.",
];

export const principles: readonly LabsQuestion[] = [
  {
    title: "The quality of your tools matters.",
    body: "Tools, context, and feedback loops are the biggest differentiators.",
  },
  {
    title: "Keep humans in the loop.",
    body: "Someone has to see what the agent did, why, and have a path to override it.",
  },
  {
    title: "Smallest useful scope first.",
    body: "Every agent should do one specific job before we widen its remit.",
  },
  {
    title: "Measure everything.",
    body: "‘Vibes are good’ isn’t enough. Track quality, latency, and cost at every layer.",
  },
];

export const hackQuestions: readonly LabsQuestion[] = [
  {
    title: "How do we want to build our MCP server?",
    body: "This includes thinking through API key security and exploring whether we can implement an OAuth IDP layer based on Stytch so the MCP server can be scoped to RBAC rules per user. There are already a few approaches and frameworks for building MCP servers, so having multiple people try different ones is a feature, not a bug.",
  },
  {
    title: "What AI Agent Framework do we want to adopt?",
    body: "Pick a TypeScript or Python agent framework and build something with it. We want to see how these frameworks handle multi-turn orchestration, tool integration, and observability. A good target to aim at: get an agent to interact with our API via tool calls. This is a good way to get a feel for the developer experience of building agents on top of these frameworks, and to see how well they integrate with our existing infrastructure.",
  },
];
