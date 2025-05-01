import * as aws from "@pulumi/aws";
import { awsProvider } from "./providers";
import { tags } from "./tags";
import { vpc } from "./vpc";

const dbSubnets = new aws.rds.SubnetGroup("default", {
  name: "main",
  subnetIds: vpc.privateSubnetIds,
  tags: {
    ...tags,
    Name: "mwi-demo-db-subnet-group",
  }
}, { provider: awsProvider });

const devDB = new aws.rds.Instance("dev", {
  allocatedStorage: 10,
  dbName: "dev",
  engine: "postgres",
  engineVersion: "17",
  instanceClass: aws.rds.InstanceType.T3_Small,
  manageMasterUserPassword: true,
  iamDatabaseAuthenticationEnabled: true,
  username: "mwidemo",
  dbSubnetGroupName: dbSubnets.name,
  tags: {
    ...tags,
    env: "dev",
  },
  skipFinalSnapshot: true,
});

const prodDB = new aws.rds.Instance("prod", {
  allocatedStorage: 10,
  dbName: "prod",
  engine: "postgres",
  engineVersion: "17",
  instanceClass: aws.rds.InstanceType.T3_Small,
  manageMasterUserPassword: true,
  iamDatabaseAuthenticationEnabled: true,
  username: "mwidemo",
  dbSubnetGroupName: dbSubnets.name,
  tags: {
    ...tags,
    env: "prod",
  },
  skipFinalSnapshot: true,
});

export default () => ({
  dbSubnets,
  devDB,
  prodDB,
});