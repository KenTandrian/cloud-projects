# Set Google ASN (Autonomous System Numbers) for each router
variable "asn_hub" {
    type = number
    default = 65001
}

variable "asn_onprem" {
    type = number
    default = 65002
}

# Create 2 HA VPN gateways, each in hub network and simulated on-premise network
resource "google_compute_ha_vpn_gateway" "hub-vpn-gw1" {
  name        = "hub-vpn-gw1"
  description = "HA VPN Gateway for hub network"
  project     = var.hub_project_id
  region      = var.region
  network     = google_compute_network.hub-network.id
  stack_type  = "IPV4_ONLY"
}

resource "google_compute_ha_vpn_gateway" "onprem-vpn-gw1" {
  name        = "onprem-vpn-gw1"
  description = "HA VPN Gateway for simulated on-premise network"
  project     = var.onprem_project_id
  region      = var.region
  network     = google_compute_network.onprem-network.id
  stack_type  = "IPV4_ONLY"
}

# Create 2 routers, each in hub network and simulated on-premise network
resource "google_compute_router" "hub-router1" {
  name    = "hub-router1"
  project = var.hub_project_id
  region  = var.region
  network = google_compute_network.hub-network.id
  bgp {
    asn = var.asn_hub
  }
}

resource "google_compute_router" "onprem-router1" {
  name    = "onprem-router1"
  project = var.onprem_project_id
  region  = var.region
  network = google_compute_network.onprem-network.id
  bgp {
    asn = var.asn_onprem
  }
}

# Create 2 VPN secrets
resource "random_id" "vpn-shared-secret-1" {
  byte_length = 16
}

resource "random_id" "vpn-shared-secret-2" {
  byte_length = 16
}

# Create 4 VPN tunnels, 2 in hub network and 2 in simulated on-premise network
resource "google_compute_vpn_tunnel" "hub-tunnel0" {
  name                  = "hub-tunnel0"
  project               = var.hub_project_id
  region                = var.region
  router                = google_compute_router.hub-router1.id
  peer_gcp_gateway      = google_compute_ha_vpn_gateway.onprem-vpn-gw1.id
  vpn_gateway_interface = 0
  ike_version           = 2
  # This secret is shared between hub-tunnel0 and onprem-tunnel0
  shared_secret         = random_id.vpn-shared-secret-1.b64_url
  vpn_gateway           = google_compute_ha_vpn_gateway.hub-vpn-gw1.id
}

resource "google_compute_vpn_tunnel" "hub-tunnel1" {
  name                  = "hub-tunnel1"
  project               = var.hub_project_id
  region                = var.region
  router                = google_compute_router.hub-router1.id
  peer_gcp_gateway      = google_compute_ha_vpn_gateway.onprem-vpn-gw1.id
  vpn_gateway_interface = 1
  ike_version           = 2
  # This secret is shared between hub-tunnel1 and onprem-tunnel1
  shared_secret         = random_id.vpn-shared-secret-2.b64_url
  vpn_gateway           = google_compute_ha_vpn_gateway.hub-vpn-gw1.id
}

resource "google_compute_vpn_tunnel" "onprem-tunnel0" {
  name                  = "onprem-tunnel0"
  project               = var.onprem_project_id
  region                = var.region
  router                = google_compute_router.onprem-router1.id
  peer_gcp_gateway      = google_compute_ha_vpn_gateway.onprem-vpn-gw1.id
  vpn_gateway_interface = 0
  ike_version           = 2
  # This secret is shared between hub-tunnel0 and onprem-tunnel0
  shared_secret         = random_id.vpn-shared-secret-1.b64_url
  vpn_gateway           = google_compute_ha_vpn_gateway.onprem-vpn-gw1.id
}

resource "google_compute_vpn_tunnel" "onprem-tunnel1" {
  name                  = "onprem-tunnel1"
  project               = var.onprem_project_id
  region                = var.region
  router                = google_compute_router.onprem-router1.id
  peer_gcp_gateway      = google_compute_ha_vpn_gateway.onprem-vpn-gw1.id
  vpn_gateway_interface = 1
  ike_version           = 2
  # This secret is shared between hub-tunnel1 and onprem-tunnel1
  shared_secret         = random_id.vpn-shared-secret-2.b64_url
  vpn_gateway           = google_compute_ha_vpn_gateway.onprem-vpn-gw1.id
}

# Create 4 interfaces and BGP sessions, 2 in hub network and 2 in simulated on-premise network
resource "google_compute_router_interface" "if-hub-tunnel0-to-onprem" {
  name       = "if-hub-tunnel0-to-onprem"
  router     = google_compute_router.hub-router1.name
  region     = var.region
  ip_range   = "169.254.0.1/30"
  vpn_tunnel = google_compute_vpn_tunnel.hub-tunnel0.name
}

resource "google_compute_router_peer" "bgp-hub-tunnel0-to-onprem" {
  name                      = "bgp-hub-tunnel0-to-onprem"
  router                    = google_compute_router.hub-router1.name
  region                    = var.region
  # This IP comes from tunnel 0 interface of on-premise router
  peer_ip_address           = "169.254.0.2"
  # The destination is on-premise network, hence use the ASN of on-premise router
  peer_asn                  = var.asn_onprem
  advertised_route_priority = 100
  interface                 = google_compute_router_interface.if-hub-tunnel0-to-onprem.name
}

resource "google_compute_router_interface" "if-hub-tunnel1-to-onprem" {
  name       = "if-hub-tunnel1-to-onprem"
  router     = google_compute_router.hub-router1.name
  region     = var.region
  ip_range   = "169.254.1.1/30"
  vpn_tunnel = google_compute_vpn_tunnel.hub-tunnel1.name
}

resource "google_compute_router_peer" "bgp-hub-tunnel1-to-onprem" {
  name                      = "bgp-hub-tunnel1-to-onprem"
  router                    = google_compute_router.hub-router1.name
  region                    = var.region
  # This IP comes from tunnel 1 interface of on-premise router
  peer_ip_address           = "169.254.1.2"
  # The destination is on-premise network, hence use the ASN of on-premise router
  peer_asn                  = var.asn_onprem
  advertised_route_priority = 100
  interface                 = google_compute_router_interface.if-hub-tunnel1-to-onprem.name
}

resource "google_compute_router_interface" "if-onprem-tunnel0-to-hub" {
  name       = "if-onprem-tunnel0-to-hub"
  router     = google_compute_router.onprem-router1.name
  region     = var.region
  ip_range   = "169.254.0.2/30"
  vpn_tunnel = google_compute_vpn_tunnel.onprem-tunnel0.name
}

resource "google_compute_router_peer" "bgp-onprem-tunnel0-to-hub" {
  name                      = "bgp-onprem-tunnel0-to-hub"
  router                    = google_compute_router.onprem-router1.name
  region                    = var.region
  # This IP comes from tunnel 0 interface of hub router
  peer_ip_address           = "169.254.0.1"
  # The destination is hub network, hence use the ASN of hub router
  peer_asn                  = var.asn_hub
  advertised_route_priority = 100
  interface                 = google_compute_router_interface.if-onprem-tunnel0-to-hub.name
}

resource "google_compute_router_interface" "if-onprem-tunnel1-to-hub" {
  name       = "if-onprem-tunnel1-to-hub"
  router     = google_compute_router.onprem-router1.name
  region     = var.region
  ip_range   = "169.254.1.2/30"
  vpn_tunnel = google_compute_vpn_tunnel.onprem-tunnel1.name
}

resource "google_compute_router_peer" "bgp-onprem-tunnel1-to-hub" {
  name                      = "bgp-onprem-tunnel1-to-hub"
  router                    = google_compute_router.onprem-router1.name
  region                    = var.region
  # This IP comes from tunnel 1 interface of hub router
  peer_ip_address           = "169.254.1.1"
  # The destination is hub network, hence use the ASN of hub router
  peer_asn                  = var.asn_hub
  advertised_route_priority = 100
  interface                 = google_compute_router_interface.if-onprem-tunnel1-to-hub.name
}
