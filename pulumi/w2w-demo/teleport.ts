import * as teleport from "@pulumi/teleport";
import { teleportProvider } from "../providers";
import { rolesAnywhereProfile } from "./roles-anywhere";

export const instanceJoinToken = new teleport.ProvisionToken(
  "w2w-demo-instance",
  {
    version: "v2",
    metadata: {
      name: "w2w-demo-instance",
    },
    spec: {
      joinMethod: "iam",
      roles: ["Node", "App"],
      allows: [
        {
          awsAccount: "668558765449",
          awsArn: `arn:aws:sts::668558765449:assumed-role/MWIw2wDemoInstance/i-*`,
        },
      ],
    },
  },
  { provider: teleportProvider },
);

export const deploymentBotWorkloadID = new teleport.WorkloadIdentity(
  "w2w-demo-deployment-bot",
  {
    version: "v1",
    metadata: {
      name: "w2w-demo-deployment",
      description: "Workload ID for w2w-demo deployment bot",
      labels: {
        env: "w2w-demo",
        component: "deployment-bot",
        "aws-account": "dev-rel-staging",
      },
    },
    spec: {
      spiffe: {
        id: "/infra/w2w-demo-deployment",
      },
    },
  },
  { dependsOn: rolesAnywhereProfile, provider: teleportProvider },
);

export const deploymentBotRole = new teleport.Role(
  "w2w-demo-deployment-bot",
  {
    version: "v7",
    metadata: {
      name: "w2w-demo-deployment-bot",
    },
    spec: {
      allow: {
        nodeLabels: {
          env: ["w2w-demo"],
        },
        logins: ["ubuntu", "root"],
        kubernetesLabels: {
          "*": ["*"],
        },
        kubernetesGroups: ["system:masters"],
        kubernetesResources: [
          {
            kind: "*",
            verbs: ["*"],
            namespace: "w2w-demo",
            name: "*",
          },
          {
            kind: "*",
            verbs: ["*"],
            namespace: "tbot",
            name: "*",
          },
        ],
        rules: [
          {
            resources: ["workload_identity"],
            verbs: ["list", "read"],
          },
        ],
        workloadIdentityLabels: {
          env: ["w2w-demo"],
          component: ["deployment-bot"],
          "aws-account": ["dev-rel-staging"],
        },
      },
    },
  },
  { provider: teleportProvider },
);

export const deploymentBot = new teleport.Bot(
  "w2w-demo-deployment",
  {
    name: "w2w-demo-deployment",
    roles: ["w2w-demo-deployment-bot"],
  },
  { provider: teleportProvider },
);

export const deploymentJoinToken = new teleport.ProvisionToken(
  "w2w-demo-deployment",
  {
    version: "v2",
    metadata: {
      name: "w2w-demo-deployment",
    },
    spec: {
      joinMethod: "github",
      roles: ["Bot"],
      botName: "w2w-demo-deployment",
      github: {
        allows: [
          {
            repository: "asteroid-earth/workload-id-demo",
          },
        ],
        enterpriseSlug: "teleport",
      },
    },
  },
  { provider: teleportProvider },
);
