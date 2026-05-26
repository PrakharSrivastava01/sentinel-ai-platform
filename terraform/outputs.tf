output "vpc_id" {
  description = "VPC ID"
  value       = aws_vpc.main.id
}

output "public_subnet_ids" {
  description = "Public subnet IDs"
  value       = aws_subnet.public[*].id
}

output "private_subnet_ids" {
  description = "Private subnet IDs"
  value       = aws_subnet.private[*].id
}

output "eks_cluster_name" {
  description = "EKS cluster name"
  value       = aws_eks_cluster.sentinel_ai_cluster.name
}

output "eks_cluster_endpoint" {
  description = "EKS cluster endpoint"
  value       = aws_eks_cluster.sentinel_ai_cluster.endpoint
}

output "eks_cluster_version" {
  description = "EKS cluster version"
  value       = aws_eks_cluster.sentinel_ai_cluster.version
}

output "ecr_repository_url" {
  description = "ECR repository URL"
  value       = aws_ecr_repository.sentinel_ai_platform.repository_url
}

output "eks_node_group_name" {
  description = "EKS node group name"
  value       = aws_eks_node_group.sentinel_ai_node_group.node_group_name
}