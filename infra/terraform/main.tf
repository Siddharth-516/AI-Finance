# Purpose: Terraform stubs for production infra (RDS, EKS, S3)
terraform { required_version = ">=1.6.0" }
provider "aws" { region = var.aws_region }
variable "aws_region" { default = "ap-south-1" }
# TODO: define aws_db_instance, aws_eks_cluster, aws_s3_bucket resources.
