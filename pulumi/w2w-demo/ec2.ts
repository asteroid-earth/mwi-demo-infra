import * as aws from "@pulumi/aws";
import { awsProvider } from "../providers";
import { tags } from "../tags";
import { vpc } from "../vpc";
import { getw2wDemoInitScript } from "./init-script";
import { instanceJoinToken } from "./teleport";

export const instanceRole = new aws.iam.Role("mwi-w2w-demo-instance", {
  name: "MWIw2wDemoInstance",
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

export const instanceRolePolicy = new aws.iam.RolePolicy("w2w-demo-instance-role-policy", {
  role: instanceRole.name,
  policy: `{
"Version": "2012-10-17",
"Statement": [
  {
    "Action": ["sts:GetCallerIdentity"],
    "Effect": "Allow",
    "Resource": "*"
  },
  {
    "Effect": "Allow",
    "Action": [
      "ecr:BatchCheckLayerAvailability",
      "ecr:BatchGetImage",
      "ecr:GetDownloadUrlForLayer",
      "ecr:GetAuthorizationToken",
      "ecr:DescribeRepositories",
      "ecr:ListImages",
      "ecr:DescribeImages",
      "ecr:DescribeRegistry",
      "ecr:GetRepositoryPolicy",
      "ecr:ListTagsForResource",
      "ecr:ListImages"
    ],
    "Resource": "arn:aws:ecr:us-west-2:668558765449:repository/mwi-demo-10bbb2a"
  },
  {
    "Action": [
      "ecr:GetAuthorizationToken"
    ],
    "Effect": "Allow",
    "Resource": "*"
  },
  {
    "Effect": "Allow",
    "Action": [
      "iam:CreateServiceLinkedRole"
    ],
    "Resource": "*",
    "Condition": {
      "StringEquals": {
        "iam:AWSServiceName": [
          "replication.ecr.amazonaws.com"
        ]
      }
    }
  }
]
}`
}, { provider: awsProvider });

export const instanceProfile = new aws.iam.InstanceProfile("w2w-demo-instance-profile", {
  name: "MWIw2wDemoInstance",
  role: instanceRole.name,
}, { provider: awsProvider });

export const instance = new aws.ec2.Instance("w2w-demo-instance", {
  ami: "ami-0e8c824f386e1de06", // ubuntu 24.04 arm64
  instanceType: aws.ec2.InstanceType.T4g_Micro,
  iamInstanceProfile: instanceProfile.name,
  subnetId: vpc.privateSubnetIds[0],
  tags: {
    ...tags,
    Name: "mwi-w2w-demo-instance",
  },
  volumeTags: tags,
  userData: getw2wDemoInitScript(),
}, { dependsOn: instanceJoinToken, provider: awsProvider });
