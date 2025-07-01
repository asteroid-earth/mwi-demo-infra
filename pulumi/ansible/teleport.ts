import * as pulumi from "@pulumi/pulumi";
import * as teleport from "@pulumi/teleport";
import { teleportProvider } from "../providers";
import { ansibleInstance } from "./ec2";

export const instanceJoinToken = new teleport.ProvisionToken("mwi-demo-instances", {
  version: "v2",
  metadata: {
    name: "mwi-demo-instances",
  },
  spec: {
    joinMethod: "iam",
    roles: ["Node"],
    allows: [
      {
        awsAccount: "668558765449",
        awsArn: `arn:aws:sts::668558765449:assumed-role/MWIDemoInstance/i-*`
      }
    ]
  },
}, { provider: teleportProvider })

export const ansibleJoinToken = new teleport.ProvisionToken("mwi-demo-ansible", {
  version: "v2",
  metadata: {
    name: "mwi-demo-ansible",
  },
  spec: {
    joinMethod: "iam",
    roles: ["Bot"],
    botName: "mwi-demo-ansible",
    allows: [
      {
        awsAccount: "668558765449",
        awsArn: "arn:aws:sts::668558765449:assumed-role/MWIDemoInstance/i-08e162d4dc454ccea"
      }
    ]
  },
}, { provider: teleportProvider })

export const ansibleBotRole = new teleport.Role("mwi-demo-ansible", {
  version: "v7",
  metadata: {
    name: "mwi-demo-ansible",
  },
  spec: {
    allow: {
      nodeLabels: {
       "env": ["mwi-demo"]
      },
      logins: ["ubuntu", "root"],
      dbLabels: {
        "env": ["dev"]
      },
      dbUsers: ["teleport"],
      dbNames: ["dev"],
    }
  }
}, { provider: teleportProvider })

export const ansibleBot = new teleport.Bot("mwi-demo-ansible", {
  name: "mwi-demo-ansible",
  roles: ["mwi-demo-ansible"]
}, { provider: teleportProvider })