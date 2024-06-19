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

variable "vpn_shared_secret_1" {
    type = string
    description = "The VPN shared secret for first VPN tunnel between hub and simulated on-premise"
}

variable "vpn_shared_secret_2" {
    type = string
    description = "The VPN shared secret for second VPN tunnel between hub and simulated on-premise"
}
