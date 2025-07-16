import * as awsx from "@pulumi/awsx";
import { awsxProvider } from "../providers";
import { tags } from "../tags";

export const repo = new awsx.ecr.Repository(
  "mwi-demo",
  { tags },
  { provider: awsxProvider },
);
