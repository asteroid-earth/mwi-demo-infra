import {
  instanceRole,
  instanceRolePolicy,
  instanceProfile,
  instance,
} from "./ec2";

import { repo } from "./ecr";

import {
  instanceJoinToken,
  deploymentBot,
  deploymentBotRole,
  deploymentJoinToken,
  deploymentBotWorkloadID,
} from "./teleport";

import {
  deploymentRole,
  deploymentRolePolicy,
  rolesAnywhereProfile
} from "./roles-anywhere";

import {
  webWorkloadID,
  backendWorkloadIDTemplate,
  appBotWebRole,
  appBotBackendRole,
  appBot,
  appBotIAMJoinToken,
  appBotK8sJoinToken,
} from "./app-team";

export default () => ({
  instanceRole,
  instanceRolePolicy,
  instanceProfile,
  instance,
  instanceJoinToken,
  deploymentBot,
  deploymentBotRole,
  deploymentJoinToken,
  deploymentBotWorkloadID,
  repo,
  deploymentRole,
  deploymentRolePolicy,
  rolesAnywhereProfile,
  webWorkloadID,
  backendWorkloadIDTemplate,
  appBotWebRole,
  appBotBackendRole,
  appBot,
  appBotIAMJoinToken,
  appBotK8sJoinToken,
})