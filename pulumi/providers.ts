import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";
import * as teleport from "@pulumi/teleport";

export const awsxProvider = new awsx.Provider("aws", {
  region: "us-west-2",
  profile: "mwi-demo-manager",
});

export const awsProvider = new aws.Provider("aws-default", {
  region: "us-west-2",
  profile: "mwi-demo-manager",
});

export const teleportProvider = new teleport.Provider("mwi-demo", {
  addr: "mwidemo.cloud.gravitational.io:443",
  // joinMethod: "github",
  // joinToken: "mwi-demo-aws-manager",
})
