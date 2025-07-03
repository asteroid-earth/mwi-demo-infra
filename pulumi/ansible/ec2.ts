import * as aws from "@pulumi/aws";
import { awsProvider } from "../providers";
import { tags } from "../tags";
import { vpc } from "../vpc";
import { instanceJoinToken } from "./teleport";
import { getTeleportInitScript, getAnsibleInitScript } from "./init-scripts";

export const instanceRole = new aws.iam.Role("mwi-demo-instance", {
  name: "MWIDemoInstance",
  assumeRolePolicy: `{
"Version": "2012-10-17",
"Statement": [
  {
    "Action": "sts:AssumeRole",
    "Principal": {
      "Service": "ec2.amazonaws.com"
    },
    "Effect": "Allow",
    "Sid": ""
  }
]
}
`,
tags,
}, { provider: awsProvider });

export const instanceRolePolicy = new aws.iam.RolePolicy("instance-role-policy", {
  role: instanceRole.name,
  policy: `{
"Version": "2012-10-17",
"Statement": [
  {
    "Action": ["sts:GetCallerIdentity"],
    "Effect": "Allow",
    "Resource": "*"
  }
]
}`
}, { provider: awsProvider });

export const instanceProfile = new aws.iam.InstanceProfile("ssm_instance_profile", {
  name: "MWIDemoInstance",
  role: instanceRole.name,
}, { provider: awsProvider });

export const ansibleInstance = new aws.ec2.Instance("ansible-instance", {
  ami: "ami-0e8c824f386e1de06", // ubuntu 24.04 arm64
  instanceType: aws.ec2.InstanceType.T4g_Micro,
  iamInstanceProfile: instanceProfile.name,
  subnetId: vpc.privateSubnetIds[0],
  tags: {
    ...tags,
    Name: "mwi-demo-ansible",
  },
  volumeTags: tags,
  userData: `${getTeleportInitScript("ansible")}${getAnsibleInitScript()}`,
}, { dependsOn: instanceJoinToken, provider: awsProvider });

export const targetInstanceOne = new aws.ec2.Instance("target-instance-1", {
  ami: "ami-0e8c824f386e1de06", // ubuntu 24.04 arm64
  instanceType: aws.ec2.InstanceType.T4g_Micro,
  iamInstanceProfile: instanceProfile.name,
  subnetId: vpc.privateSubnetIds[0],
  tags: {
    ...tags,
    Name: "mwi-demo-target1",
  },
  volumeTags: tags,
  userData: getTeleportInitScript("target1"),
}, { dependsOn: instanceJoinToken, provider: awsProvider });

export const targetInstanceTwo = new aws.ec2.Instance("target-instance-2", {
  ami: "ami-0e8c824f386e1de06", // ubuntu 24.04 arm64
  instanceType: aws.ec2.InstanceType.T4g_Micro,
  iamInstanceProfile: instanceProfile.name,
  subnetId: vpc.privateSubnetIds[0],
  tags: {
    ...tags,
    Name: "mwi-demo-target2",
  },
  volumeTags: tags,
  userData: getTeleportInitScript("target2"),
}, { dependsOn: instanceJoinToken, provider: awsProvider });
