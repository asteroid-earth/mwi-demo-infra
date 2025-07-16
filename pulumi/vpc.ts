import * as awsx from "@pulumi/awsx";
import { awsxProvider } from "./providers";
import { tags } from "./tags";

export const vpc = new awsx.ec2.Vpc(
  "mwi-demo",
  {
    enableDnsHostnames: true,
    tags,
  },
  { provider: awsxProvider },
);

export default () => ({
  vpc,
});
