export function getTeleportInitScript(instanceName: string) {
  return `#! /usr/bin/env bash

set -euxo pipefail

cat << EOF > /etc/teleport.yaml
version: v3
teleport:
  nodename: ${instanceName}
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
    env: mwi-demo
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
}

export function getAnsibleInitScript() {
  return `

cat << EOF > /etc/tbot.yaml
version: v2
auth_server: mwidemo.cloud.gravitational.io:443
onboarding:
  join_method: iam
  token: mwi-demo-ansible
storage:
  type: directory
  path: /var/lib/teleport/bot
services:
  - type: ssh-multiplexer
    destination:
      type: directory
      path: /opt/tbot
    enable_resumption: true
    proxy_command:
    - /usr/local/bin/fdpass-teleport
  - type: database-tunnel
    listen: "tcp://127.0.0.1:25432"
    service: dev09eb88e-rds-us-west-2-668558765449
    database: dev
    username: teleport
EOF

tbot install systemd --config /etc/tbot.yaml --group root --user root --write
systemctl daemon-reload
systemctl enable tbot
systemctl start tbot

chmod 0777 /opt/tbot/ssh_config
chmod 0777 /opt/tbot/v1.sock
chmod 0777 /opt/tbot/agent.sock

apt update -y
apt install -y pipx
sudo su ubuntu -c "pipx install ansible"
sudo su ubuntu -c "pipx ensurepath"

sudo su ubuntu -c "mkdir /home/ubuntu/ansible"
sudo su ubuntu -c "touch /home/ubuntu/ansible/ansible.cfg"
sudo su ubuntu -c "touch /home/ubuntu/ansible/hosts"
sudo su ubuntu -c "touch /home/ubuntu/ansible/playbook.yaml"

cat << EOF > /home/ubuntu/ansible/ansible.cfg
[defaults]
host_key_checking = True
inventory=./hosts
remote_tmp=/tmp

[ssh_connection]
scp_if_ssh = True
ssh_args = -F /opt/tbot/ssh_config
EOF

cat << EOF > /home/ubuntu/ansible/hosts
target1.mwidemo.cloud.gravitational.io
target2.mwidemo.cloud.gravitational.io
EOF

cat << EOF > /home/ubuntu/ansible/playbook.yaml
- hosts: all
  remote_user: root
  tasks:
    - name: "hostname"
      command: "hostname"
    - name: "apt update"
      command: "apt update -y"
    - name: "apt upgrade"
      command: "apt upgrade -y"
EOF

apt install postgresql -y

sudo su ubuntu -c "mkdir /home/ubuntu/db_connect"

cat << EOF > /home/ubuntu/db_connect/create_table.sh
#! /usr/bin/env bash
psql -h localhost --port=25432 -U teleport --dbname=dev -c "CREATE TABLE IF NOT EXISTS app_logs ( id BIGSERIAL PRIMARY KEY, timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(), level VARCHAR(50) NOT NULL, message TEXT NOT NULL, application VARCHAR(100), service VARCHAR(100), request_id VARCHAR(255), user_id VARCHAR(255), metadata JSONB );"
EOF

cat << EOF > /home/ubuntu/db_connect/insert.sh
#! /usr/bin/env bash
psql -h localhost --port=25432 -U teleport --dbname=dev -c "INSERT INTO app_logs (level, message, application, service, request_id, user_id, metadata) VALUES ('INFO', 'User login successful', 'AuthService', 'LoginEndpoint', 'req_abc123', 'user_456', '{\"ip_address\": \"192.168.1.100\", \"browser\": \"Chrome\"}'::jsonb);"
EOF

cat << EOF > /home/ubuntu/db_connect/query.sh
#! /usr/bin/env bash
psql -h localhost --port=25432 -U teleport --dbname=dev -c "SELECT * FROM app_logs LIMIT 10;"
EOF

chmod +x /home/ubuntu/db_connect/create_table.sh
chmod +x /home/ubuntu/db_connect/insert.sh
chmod +x /home/ubuntu/db_connect/query.sh

sudo su ubuntu -c "touch /home/ubuntu/crontab"
cat << EOF > /home/ubuntu/crontab
*/30 * * * * ansible-playbook /home/ubuntu/ansible/playbook.yaml
*/30 * * * * /home/ubuntu/db_connect/query.sh
EOF

sudo su ubuntu -c "crontab /home/ubuntu/crontab"
`
}
