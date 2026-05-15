provider "aws" {
  region = var.aws_region
}

variable "aws_region" {
  default = "us-east-1"
}

variable "cluster_name" {
  default = "aegis-os-cluster"
}

# EKS Cluster for distributed load workers and control plane
module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "~> 20.0"

  cluster_name    = var.cluster_name
  cluster_version = "1.29"

  vpc_id                   = module.vpc.vpc_id
  subnet_ids               = module.vpc.private_subnets
  control_plane_subnet_ids = module.vpc.intra_subnets

  eks_managed_node_groups = {
    # Control Plane & Backend
    core_services = {
      instance_types = ["t3.large"]
      min_size       = 2
      max_size       = 5
      desired_size   = 2
    }
    # High-cpu nodes for Go Load Generators
    load_workers = {
      instance_types = ["c6i.2xlarge"]
      min_size       = 0
      max_size       = 100 # Can scale massively to simulate huge traffic
      desired_size   = 0   # Scaled up by the SRE Supervisor Agent
      labels = {
        role = "load-generator"
      }
    }
  }
}

# Required for Prometheus / Grafana observability plane storage
resource "aws_ebs_volume" "prometheus_data" {
  availability_zone = "${var.aws_region}a"
  size              = 100
  type              = "gp3"
}
