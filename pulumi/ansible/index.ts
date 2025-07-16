import {
  instanceRole,
  instanceRolePolicy,
  instanceProfile,
  ansibleInstance,
  targetInstanceOne,
  targetInstanceTwo,
} from "./ec2";

import {
  ansibleBot,
  ansibleBotRole,
  ansibleJoinToken,
  instanceJoinToken,
} from "./teleport";

export default () => ({
  ansibleBot,
  ansibleBotRole,
  ansibleJoinToken,
  instanceRole,
  instanceJoinToken,
  instanceRolePolicy,
  instanceProfile,
  ansibleInstance,
  targetInstanceOne,
  targetInstanceTwo,
});
