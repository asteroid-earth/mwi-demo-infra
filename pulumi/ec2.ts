import * as aws from "@pulumi/aws";
import * as teleport from "@pulumi/teleport";
import { awsProvider, teleportProvider } from "./providers";
import { tags } from "./tags";
import { vpc } from "./vpc";

const instanceRole = new aws.iam.Role("mwi-demo-instance", {
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

const instanceJoinToken = new teleport.ProvisionToken("mwi-demo-instances", {
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
        awsArn: "arn:aws:sts::668558765449:assumed-role/MWIDemoInstances/i-*"
      }
    ]
  },
}, { provider: teleportProvider })

const instanceRolePolicy = new aws.iam.RolePolicy("instance-role-policy", {
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

const instanceProfile = new aws.iam.InstanceProfile("ssm_instance_profile", {
  name: "MWIDemoInstance",
  role: instanceRole.name,
}, { provider: awsProvider });

const ansibleInstance = new aws.ec2.Instance("ansible-instance", {
  ami: "ami-0e8c824f386e1de06", // ubuntu 24.04 arm64
  instanceType: aws.ec2.InstanceType.T4g_Micro,
  iamInstanceProfile: instanceProfile.name,
  subnetId: vpc.privateSubnetIds[0],
  tags,
  volumeTags: tags,
  userData: `#! /usr/bin/env bash

set -euxo pipefail

cat << EOF > /etc/teleport.yaml
version: v3
teleport:
  nodename: ansible
  data_dir: /var/lib/teleport
  proxy_server: mwidemo.cloud.gravitational.io:443
  join_params:
    token_name: mwi-demo-instances
    method: iam
  log:
    output: stderr
    severity: INFO
    format:
      output: text
auth_service:
  enabled: "no"
ssh_service:
  enabled: "yes"
  labels:
    env: workload-id-demo
  commands:
  - name: hostname
    command: [hostname]
    period: 1m0s
proxy_service:
  enabled: "no"
EOF

curl -sL https://mwidemo.cloud.gravitational.io/scripts/install.sh | bash

teleport install systemd
systemctl enable teleport
systemctl start teleport
`
}, { dependsOn: instanceJoinToken, provider: awsProvider });

export default () => ({
  instanceRole,
  instanceJoinToken,
  instanceRolePolicy,
  instanceProfile,
  ansibleInstance,
})