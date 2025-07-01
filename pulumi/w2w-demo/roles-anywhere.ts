import * as aws from "@pulumi/aws";
import { tags } from "../tags";
import { awsProvider } from "../providers";

export const deploymentRole = new aws.iam.Role("w2w-demo-deployment", {
  assumeRolePolicy: JSON.stringify({
    Version: "2012-10-17",
    Statement: [
      {
        Effect: "Allow",
        Principal: {
          Service: "rolesanywhere.amazonaws.com"
        },
        Action: [
          "sts:AssumeRole",
          "sts:TagSession",
          "sts:SetSourceIdentity"
        ],
        Condition: {
          StringEquals: {
            "aws:PrincipalTag/x509SAN/URI": "spiffe://mwidemo.cloud.gravitational.io/infra/w2w-demo-deployment"
          },
          ArnEquals: {
            "aws:SourceArn": "arn:aws:rolesanywhere:us-west-2:668558765449:trust-anchor/37b8fbad-5b60-4220-a062-f1a9fb14d438"
          }
        }
      }
    ]
}),
  name: "MWIw2wDemoDeployment",
  tags: {
    ...tags,
    Environment: "w2w-demo",
  }
}, { provider: awsProvider });

export const deploymentRolePolicy = new aws.iam.RolePolicy("w2w-demo-deployment", {
  role: deploymentRole.name,
  policy: `{
    "Version": "2012-10-17",
    "Statement": [
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
                "ecr:TagResource",
                "ecr:UntagResource",
                "ecr:ListImages",
                "ecr:CreateRepository",
                "ecr:PutImage",
                "ecr:InitiateLayerUpload",
                "ecr:UploadLayerPart",
                "ecr:CompleteLayerUpload",
                "cloudtrail:LookupEvents"
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

export const rolesAnywhereProfile = new aws.rolesanywhere.Profile("w2w-demo-deployment", {
  name: "MWIw2wDemoDeployment",
  roleArns: [deploymentRole.arn],
}, { provider: awsProvider });