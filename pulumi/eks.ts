import * as aws from "@pulumi/aws";
import { awsProvider } from "./providers";
import { tags } from "./tags";
import { vpc } from "./vpc";

const clusterRole = new aws.iam.Role(
  "mwi-demo",
  {
    name: "MWIDemoCluster",
    assumeRolePolicy: JSON.stringify({
      Version: "2012-10-17",
      Statement: [
        {
          Action: ["sts:AssumeRole", "sts:TagSession"],
          Effect: "Allow",
          Principal: {
            Service: "eks.amazonaws.com",
          },
        },
      ],
    }),
    tags,
  },
  { provider: awsProvider },
);

const clusterAmazonEKSClusterPolicy = new aws.iam.RolePolicyAttachment(
  "mwi-demo-cluster_AmazonEKSClusterPolicy",
  {
    policyArn: "arn:aws:iam::aws:policy/AmazonEKSClusterPolicy",
    role: clusterRole.name,
  },
);

const cluster = new aws.eks.Cluster(
  "mwi-demo",
  {
    name: "mwi-demo",
    accessConfig: {
      authenticationMode: "API",
      bootstrapClusterCreatorAdminPermissions: true,
    },
    roleArn: clusterRole.arn,
    version: "1.32",
    vpcConfig: {
      endpointPrivateAccess: true,
      endpointPublicAccess: true,
      subnetIds: vpc.privateSubnetIds,
    },
    bootstrapSelfManagedAddons: true,
    tags,
  },
  {
    dependsOn: [clusterAmazonEKSClusterPolicy],
    provider: awsProvider,
  },
);

const nodeRole = new aws.iam.Role(
  "mwi-demo-cluster-node",
  {
    name: "MWIDemoClusterNode",
    assumeRolePolicy: JSON.stringify({
      Version: "2012-10-17",
      Statement: [
        {
          Action: ["sts:AssumeRole"],
          Effect: "Allow",
          Principal: {
            Service: "ec2.amazonaws.com",
          },
        },
      ],
    }),
    tags,
  },
  { provider: awsProvider },
);

const nodeAmazonEKSWorkerNodePolicy = new aws.iam.RolePolicyAttachment(
  "mwi-demo-node_AmazonEKSWorkerNodePolicy",
  {
    policyArn: "arn:aws:iam::aws:policy/AmazonEKSWorkerNodePolicy",
    role: nodeRole.name,
  },
  { provider: awsProvider },
);

const nodeAmazonEC2ContainerRegistryReadOnly = new aws.iam.RolePolicyAttachment(
  "mwi-demo-node_AmazonEC2ContainerRegistryReadOnly",
  {
    policyArn: "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly",
    role: nodeRole.name,
  },
  { provider: awsProvider },
);

const nodeAmazonEKSCNIPolicy = new aws.iam.RolePolicyAttachment(
  "mwi-demo-node_AmazonEKSCNIPolicy",
  {
    policyArn: "arn:aws:iam::aws:policy/AmazonEKS_CNI_Policy",
    role: nodeRole.name,
  },
  { provider: awsProvider },
);

export const nodeGroup = new aws.eks.NodeGroup(
  "mwi-demo",
  {
    clusterName: cluster.name,
    nodeGroupName: "general",
    nodeRoleArn: nodeRole.arn,
    subnetIds: vpc.privateSubnetIds,
    scalingConfig: {
      desiredSize: 1,
      maxSize: 3,
      minSize: 1,
    },
    updateConfig: {
      maxUnavailable: 1,
    },
    tags,
  },
  {
    dependsOn: [
      nodeAmazonEC2ContainerRegistryReadOnly,
      nodeAmazonEKSCNIPolicy,
      nodeAmazonEKSWorkerNodePolicy,
    ],
    provider: awsProvider,
  },
);

export default () => ({
  cluster,
  nodeGroup,
  nodeRole,
  clusterRole,
  clusterAmazonEKSClusterPolicy,
  nodeAmazonEKSWorkerNodePolicy,
  nodeAmazonEC2ContainerRegistryReadOnly,
  nodeAmazonEKSCNIPolicy,
});
