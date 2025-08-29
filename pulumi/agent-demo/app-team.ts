import * as teleport from "@pulumi/teleport";
import { teleportProvider } from "../providers";

export const agentBotRole = new teleport.Role("agent-demo-bot", {
  version: "v7",
  metadata: {
    name: "agent-demo-bot",
  },
  spec: {
    allow: {
      appLabels: {
        "env": ["agent-demo"],
        "app": ["quotes"],
      },
      logins: ["ubuntu"],
      nodeLabels: {
        "env": ["agent-demo"],
      },
    }
  }
}, { provider: teleportProvider })

export const agentBot = new teleport.Bot("agent-demo", {
  name: "agent-demo-bot",
  roles: ["agent-demo-bot"],
}, { provider: teleportProvider })
