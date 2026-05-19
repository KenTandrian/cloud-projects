variable "project_id" {
  description = "The Google Cloud Project ID"
  type        = string
}

variable "region" {
  description = "The Google Cloud region to deploy resources in"
  type        = string
  default     = "asia-southeast1"
}

variable "enable_telegram" {
  description = "Enable Telegram notifications"
  type        = bool
  default     = true
}

variable "telegram_bot_token" {
  description = "Telegram Bot HTTP API Token"
  type        = string
  sensitive   = true
}

variable "telegram_chat_id" {
  description = "Telegram Chat ID (personal or group)"
  type        = string
}

variable "bq_table_name" {
  description = "The fully qualified BigQuery table name for billing export"
  type        = string
}

variable "breakdown_limit" {
  description = "Number of individual services to show before grouping to 'Other'"
  type        = number
  default     = 5
}
