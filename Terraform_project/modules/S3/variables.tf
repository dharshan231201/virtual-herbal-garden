variable "s3_bucket_names" {
  type        = set(string)
  description = "List of S3 bucket names for count example"
  default     = ["tf-day08-count-bucket-a-20251016", "tf-day08-count-bucket-b-20251016"]
}
variable "environment" {
  description = "Environment name (dev, stage, prod)"
  type        = string
}

variable "enable_versioning" {
  description = "Enable S3 versioning"
  type        = bool
  default     = true
}
