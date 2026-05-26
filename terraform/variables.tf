variable "aws_region" {
  description = "The AWS region to deploy resources in."
  type        = string
  default     = "ap-south-1" # Mumbai region
}

variable "project_name" {
  description = "The name of the project for tagging resources."
  type        = string
  default     = "sentinelai"
}

variable "environment" {
  description = "The environment to deploy resources in (e.g., dev, staging, prod)."
  type        = string
  default     = "production"
}

variable "eks_node_instance_type" {
  description = "The instance type for EKS worker nodes."
  type        = string
  default     = "t3.medium"
}

variable "eks_node_count" {
  description = "The number of worker nodes to create in the EKS cluster."
  type        = number
  default     = 1
}

variable "vpc_cidr" {
  description = "VPC CIDR block"
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnet_cidrs" {
  description = "Public subnet CIDRs"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24"]
}

variable "private_subnet_cidrs" {
  description = "Private subnet CIDRs"
  type        = list(string)
  default     = ["10.0.3.0/24", "10.0.4.0/24"]
}

variable "availability_zones" {
  description = "Availability zones"
  type        = list(string)
  default     = ["ap-south-1a", "ap-south-1b"]
}