export function getw2wDemoInitScript() {
  return `#! /usr/bin/env bash

set -euxo pipefail

cat << EOF > /etc/teleport.yaml
version: v3
teleport:
  nodename: w2w-demo-web
  data_dir: /var/lib/teleport
  proxy_server: mwidemo.cloud.gravitational.io:443
  join_params:
    token_name: w2w-demo-instance
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
    env: w2w-demo
    component: web
  commands:
  - name: hostname
    command: [hostname]
    period: 1m0s
proxy_service:
  enabled: false
app_service:
  enabled: true
  apps:
  - name: w2w-demo
    uri: "http://localhost:8080"
    labels:
      env: w2w-demo
EOF

curl -sL https://mwidemo.cloud.gravitational.io/scripts/install.sh | bash

teleport install systemd
systemctl enable teleport
systemctl start teleport
`;
}
