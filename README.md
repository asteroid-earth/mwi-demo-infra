# MWI Demo Infra
Infrastructure for the [MWI Demo environment](https://mwidemo.cloud.gravitational.io).

## Overview

This repo contains code managing all of the Teleport, compute and other cloud resources for the demo environment,
using Pulumi in TypeScript.

We manage the environment using Machine & Workload Identity features. The [GitHub Action](./.github/workflows/deploy.yaml)
that runs the Pulumi code relies on a Teleport Universal Identity that gives it admin control over a number of AWS functions 
including VPC, EC2, EKS, ECR, IAM and others, using IAM Roles Anywhere. The Teleport resources for that are managed in the
[MWI Demo Cluster](https://github.com/asteroid-earth/mwi-demo-cluster) repository, which uses the MWI integration for
HCP Terraform to manage the base cluster permissions in code.

The upshot of this is despite having such powerful permissions, there are no long-lived secrets in the GitHub Actions configuration
and every credential used is short-lived and generated at the time the job starts.

Pulumi itself is using the [Any Terraform Provider](https://www.pulumi.com/blog/any-terraform-provider/) feature. Everything
in this repository can be done with Terraform as well.

## Structure

There are several components of the demo env, organized by file or sub-directory in the [pulumi directory](./pulumi/).

### Ansible

The [ansible](./pulumi/ansible) dir creates three EC2 VMs, one that has Ansible playbooks against two target VMs. The VMs are all created
with no other ingress, but automatically join the Teleport cluster via IAM join tokens.

The Ansible VM also runs database queries against the databases created in the [rds](./pulumi/rds.ts) file.

### EKS

The [eks](./pulumi/eks) file creates an EKS cluster where other apps are run. The EKS cluster is joined to the Teleport cluster
using auto-discovery.

### W2W Demo

The [w2w-demo](./pulumi/w2w-demo/) dir contains many resources for the [Workload-to-Workload demo app](https://github.com/asteroid-earth/workload-id-demo). It creates IAM Roles Anywhere resources for that app's GitHub Actions to use to push containers to ECR. It creates many Teleport resources like Workload Identities for that app's dev team to use. Permission to modify/manage
the [app-team](./pulumi/w2w-demo/app-team.ts) file could theoretically be given to that dev team via policy.
