# EKS Cluster 
resource "aws_eks_cluster" "sentinel_ai_cluster" {
  name     = "${var.project_name}-cluster"
  role_arn = aws_iam_role.eks_cluster_role.arn

  access_config {
    authentication_mode = "API"
  }

  version = "1.35"

  vpc_config {
    endpoint_private_access = true
    endpoint_public_access  = true

    subnet_ids = aws_subnet.public.*.id
  }
}

# EKS Node Group
resource "aws_eks_node_group" "sentinel_ai_node_group" {

  cluster_name   = aws_eks_cluster.sentinel_ai_cluster.name
  node_role_arn  = aws_iam_role.eks_node_group_role.arn
  subnet_ids     = aws_subnet.public.*.id
  instance_types = [var.eks_node_instance_type]

  scaling_config {
    desired_size = 2
    max_size     = 3
    min_size     = 1
  }
  update_config {
    max_unavailable = 1
  }
}