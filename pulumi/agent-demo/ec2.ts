import * as aws from "@pulumi/aws";
import { awsProvider } from "../providers";
import { tags } from "../tags";
import { vpc } from "../vpc";
import { instanceJoinToken } from "./teleport";
import { getAgentTargetInitScript, getAgentAppInitScript } from "./init-script";

export const instanceRole = new aws.iam.Role("agent-demo-instance-role", {
  name: "AgentDemoInstance",
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

export const instanceRolePolicy = new aws.iam.RolePolicy("agent-demo-instance-role-policy", {
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
    "Resource": "arn:aws:ecr:us-west-2:668558765449:repository/agent-demo-30bad72"
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


export const instanceProfile = new aws.iam.InstanceProfile("agent-demo-ssm-instance-profile", {
  name: "AgentDemoInstance",
  role: instanceRole.name,
}, { provider: awsProvider });

export const agentTargetInstance = new aws.ec2.Instance("agent-target-instance", {
  ami: "ami-0e8c824f386e1de06", // ubuntu 24.04 arm64
  instanceType: aws.ec2.InstanceType.T4g_Micro,
  iamInstanceProfile: instanceProfile.name,
  subnetId: vpc.privateSubnetIds[0],
  tags: {
    ...tags,
    Name: "agent-demo-target",
  },
  volumeTags: tags,
  userData: getAgentTargetInitScript(),
}, { dependsOn: instanceJoinToken, provider: awsProvider });

export const agentAppInstance = new aws.ec2.Instance("agent-app-instance", {
  ami: "ami-0e8c824f386e1de06", // ubuntu 24.04 arm64
  instanceType: aws.ec2.InstanceType.T4g_Micro,
  iamInstanceProfile: instanceProfile.name,
  subnetId: vpc.privateSubnetIds[0],
  tags: {
    ...tags,
    Name: "agent-demo-app",
  },
  volumeTags: tags,
  userData: getAgentAppInitScript(),
}, { dependsOn: instanceJoinToken, provider: awsProvider });
