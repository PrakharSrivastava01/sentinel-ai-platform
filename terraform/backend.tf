terraform {
  backend "s3" {
    bucket       = "sentinelai-terraform-state"   # S3 bucket for storing Terraform state
    key          = "sentinelai/terraform.tfstate" # Path within the bucket to store the state file
    region       = "ap-south-1"                   # Mumbai region
    use_lockfile = true                           # instead of DynamoDB for state locking
  }
}