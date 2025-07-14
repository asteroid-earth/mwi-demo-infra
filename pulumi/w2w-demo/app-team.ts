import * as teleport from "@pulumi/teleport";
import { teleportProvider } from "../providers";
import * as fetch from "sync-fetch";

export const webWorkloadID = new teleport.WorkloadIdentity("w2w-demo-web", {
  version: "v1",
  metadata: {
    name: "w2w-demo-web",
    description: "Workload ID for w2w-demo web component",
    labels: {
      "env": "w2w-demo",
      "component": "web",
    }
  },
  spec: {
    spiffe: {
      id: "/apps/w2w-demo/web",
    },
    rules: {
      allows: [
        {
          conditions: [
            {
              attribute: "workload.unix.uid",
              eq: {
                value: "3001"
              }
            },
            {
              attribute: "workload.unix.gid",
              eq: {
                value: "3001"
              }
            }
          ]
        }
      ]
    }
  },
}, { provider: teleportProvider })

export const backend1WorkloadID = new teleport.WorkloadIdentity("w2w-demo-backend-1", {
  version: "v1",
  metadata: {
    name: "w2w-demo-backend-1",
    description: "Workload ID for w2w-demo backend 1",
    labels: {
      "env": "w2w-demo",
      "component": "backend-1",
    }
  },
  spec: {
    spiffe: {
      // In this Workload Identity configuration, we leverage the templating
      // functionality to dynamically derive the SPIFFE ID based on attributes
      // from the attestation process. Implicitly, the workload must have
      // passed Kubernetes workload attestation to be issued a SVID because
      // the rules refer to attributes derived from Kubernetes workload
      // attestation.
      id: "/apps/{{ workload.kubernetes.namespace }}/{{ workload.kubernetes.service_account }}",
    },
  },
}, { provider: teleportProvider })

export const backend2WorkloadID = new teleport.WorkloadIdentity("w2w-demo-backend-2", {
  version: "v1",
  metadata: {
    name: "w2w-demo-backend-2",
    description: "Workload ID for w2w-demo backend 2",
    labels: {
      "env": "w2w-demo",
      "component": "backend-2",
    }
  },
  spec: {
    spiffe: {
      id: "/apps/w2w-demo/backend-2",
    },
    // In this Workload Identity configuration, we specify rules to dynamically
    // control which workloads can be issued a SPIFFE SVID using this
    // Workload Identity. These rules are based on attributes determined by the
    // attestation process.
    rules: {
      allows: [
        {
          conditions: [
            {
              attribute: "workload.kubernetes.namespace",
              eq: {
                value: "w2w-demo"
              }
            },
            {
              attribute: "workload.kubernetes.service_account",
              eq: {
                value: "backend-2"
              }
            }
          ]
        }
      ]
    }
  },
}, { provider: teleportProvider })

export const appBotWebRole = new teleport.Role("w2w-demo-app-bot-web", {
  version: "v7",
  metadata: {
    name: "w2w-demo-app-bot-web",
  },
  spec: {
    allow: {
      workloadIdentityLabels: {
        "env": ["w2w-demo"],
        "component": ["web"],
      },
      rules: [
        {
          resources: ["workload_identity"],
          verbs: ["list", "read"],
        }
      ]
    }
  }
}, { provider: teleportProvider })

export const appBotBackend1Role = new teleport.Role("w2w-demo-app-bot-backend-1", {
  version: "v7",
  metadata: {
    name: "w2w-demo-app-bot-backend-1",
  },
  spec: {
    allow: {
      workloadIdentityLabels: {
        "env": ["w2w-demo"],
        "component": ["backend-1"],
      },
      rules: [
        {
          resources: ["workload_identity"],
          verbs: ["list", "read"],
        }
      ],
    }
  }
}, { provider: teleportProvider })

export const appBotBackend2Role = new teleport.Role("w2w-demo-app-bot-backend-2", {
  version: "v7",
  metadata: {
    name: "w2w-demo-app-bot-backend-2",
  },
  spec: {
    allow: {
      workloadIdentityLabels: {
        "env": ["w2w-demo"],
        "component": ["backend-2"],
      },
      rules: [
        {
          resources: ["workload_identity"],
          verbs: ["list", "read"],
        }
      ],
    }
  }
}, { provider: teleportProvider })

export const appBot = new teleport.Bot("w2w-demo-app", {
  name: "w2w-demo-app-bot",
  roles: ["w2w-demo-app-bot-web", "w2w-demo-app-bot-backend-1", "w2w-demo-app-bot-backend-2"],
}, { provider: teleportProvider })

export const appBotIAMJoinToken = new teleport.ProvisionToken("w2w-demo-web-bot", {
  version: "v2",
  metadata: {
    name: "w2w-demo-web-bot",
  },
  spec: {
    botName: appBot.name,
    joinMethod: "iam",
    roles: ["Bot"],
    allows: [
      {
        awsAccount: "668558765449",
        awsArn: `arn:aws:sts::668558765449:assumed-role/MWIw2wDemoInstance/i-*`
      }
    ]
  },
}, { provider: teleportProvider })

export const appBotK8sJoinToken = new teleport.ProvisionToken("w2w-demo-web-backend", {
  version: "v2",
  metadata: {
    name: "w2w-demo-backend-bot",
  },
  spec: {
    botName: appBot.name,
    joinMethod: "kubernetes",
    roles: ["Bot"],
    kubernetes: {
      type: "static_jwks",
      staticJwks: {
        jwks: fetch("https://oidc.eks.us-west-2.amazonaws.com/id/3930A6E36DE6AC70C1F1E99B3CFA9EF6/keys").text(),
      },
      allows: [
        {
          serviceAccount: "tbot:tbot"
        }
      ]
    }
  },
}, { provider: teleportProvider })
