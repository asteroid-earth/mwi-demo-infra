import * as teleport from "@pulumi/teleport";
import { teleportProvider } from "../providers";

export const instanceJoinToken = new teleport.ProvisionToken("agent-demo-instance", {
  version: "v2",
  metadata: {
    name: "agent-demo-instance",
  },
  spec: {
    joinMethod: "iam",
    roles: ["Node", "Bot", "App"],
    botName: "agent-demo-bot",
    allows: [
      {
        awsAccount: "668558765449",
        awsArn: `arn:aws:sts::668558765449:assumed-role/AgentDemoInstance/i-*`
      }
    ]
  },
}, { provider: teleportProvider })

export const deploymentBotRole = new teleport.Role("agent-demo-deployment-bot", {
  version: "v7",
  metadata: {
    name: "agent-demo-deployment-bot",
  },
  spec: {
    allow: {
      nodeLabels: {
        "env": ["agent-demo"]
      },
      logins: ["ubuntu", "root"],
      kubernetesLabels: {
        "*": ["*"]
      },
      kubernetesGroups: ["system:masters"],
      kubernetesResources: [
        {
          kind: "*",
          verbs: ["*"],
          namespace: "agent-demo",
          name: "*",
        },
      ],
      rules: [
        {
          resources: ["workload_identity"],
          verbs: ["list", "read"],
        }
      ],
    }
  }
}, { provider: teleportProvider })

export const deploymentBot = new teleport.Bot("agent-demo-deployment", {
  name: "agent-demo-deployment",
  roles: ["agent-demo-deployment-bot"]
}, { provider: teleportProvider })

export const deploymentJoinToken = new teleport.ProvisionToken("agent-demo-deployment", {
  version: "v2",
  metadata: {
    name: "agent-demo-deployment",
  },
  spec: {
    joinMethod: "github",
    roles: ["Bot"],
    botName: "agent-demo-deployment",
    github: {
      allows: [{
        repository: "asteroid-earth/agentic-identity-demo",
      }],
      enterpriseSlug: "teleport",
    }
  },
}, { provider: teleportProvider })
