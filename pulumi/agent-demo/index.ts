import { instanceJoinToken, deploymentJoinToken, deploymentBot, deploymentBotRole } from "./teleport";
import { agentBotRole, agentBot } from "./app-team";
import { instanceRole, instanceRolePolicy, instanceProfile, agentTargetInstance, agentAppInstance } from "./ec2";

export default () => ({
  instanceJoinToken,
  deploymentJoinToken,
  deploymentBot,
  deploymentBotRole,
  agentBotRole,
  agentBot,
  instanceRole,
  instanceRolePolicy,
  instanceProfile,
  agentTargetInstance,
  agentAppInstance,
});