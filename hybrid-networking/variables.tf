variable "onprem_project_id" {
    type = string
    description = "The project ID for simulated on-premise environment"
}

variable "hub_project_id" {
    type = string
    description = "The project ID for hub environment"
}

variable "spoke_project_id" {
    type = string
    description = "The project ID for spoke environment"
}

variable "region" {
    type = string
    description = "The region for all environment"
}
