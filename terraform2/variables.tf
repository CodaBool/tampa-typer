variable "role_name" {
  default = "custom-role"
}
variable "account_id" {
  default = "959582639150"
  sensitive = true
}
variable "container_env"{
  sensitive = true
}