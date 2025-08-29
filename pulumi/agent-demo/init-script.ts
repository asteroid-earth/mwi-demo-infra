export function getAgentTargetInitScript() {
  return `#! /usr/bin/env bash

set -euxo pipefail

cat << EOF > /etc/teleport.yaml
version: v3
teleport:
  nodename: agent-demo-target
  data_dir: /var/lib/teleport
  proxy_server: mwidemo.cloud.gravitational.io:443
  join_params:
    token_name: agent-demo-instance
    method: iam
  log:
    output: stderr
    severity: INFO
    format:
      output: text
auth_service:
  enabled: false
ssh_service:
  enabled: true
  labels:
    env: agent-demo
  commands:
  - name: hostname
    command: [hostname]
    period: 1m0s
proxy_service:
  enabled: false
EOF

curl -sL https://mwidemo.cloud.gravitational.io/scripts/install.sh | bash

teleport install systemd
systemctl enable teleport
systemctl start teleport
`
}

export function getAgentAppInitScript() {
  return `#! /usr/bin/env bash

set -euxo pipefail

cat << EOF > /etc/teleport.yaml
version: v3
teleport:
  nodename: agent-demo-app
  data_dir: /var/lib/teleport
  proxy_server: mwidemo.cloud.gravitational.io:443
  join_params:
    token_name: agent-demo-instance
    method: iam
  log:
    output: stderr
    severity: INFO
    format:
      output: text
auth_service:
  enabled: false
app_service:
  enabled: "yes"
  apps:
  - name: awesome-agent
    uri: "http://localhost:5200"
    labels:
      app: "awesome-agent"
ssh_service:
  enabled: true
  labels:
    env: agent-demo
  commands:
  - name: hostname
    command: [hostname]
    period: 1m0s
proxy_service:
  enabled: false
EOF

curl -sL https://mwidemo.cloud.gravitational.io/scripts/install.sh | bash

teleport install systemd
systemctl enable teleport
systemctl start teleport
`
}
