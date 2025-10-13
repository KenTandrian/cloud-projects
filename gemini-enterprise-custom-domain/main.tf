data "google_compute_network" "gemini_enterprise_vpc" {
  name = "default"
}

resource "google_compute_global_address" "external_ip" {
  name       = "gemini-enterprise-external-ip"
  ip_version = "IPV4"
}

resource "google_compute_global_network_endpoint_group" "gemini_enterprise_ineg" {
  name                  = "gemini-enterprise-ineg"
  network_endpoint_type = "INTERNET_FQDN_PORT"
  default_port          = 443
}

resource "google_compute_global_network_endpoint" "gemini_enterprise_ineg_endpoint" {
  global_network_endpoint_group = google_compute_global_network_endpoint_group.gemini_enterprise_ineg.name
  port                          = 443
  fqdn                          = "vertexaisearch.cloud.google.com"
}

resource "google_compute_backend_service" "gemini_enterprise_ineg_bes" {
  name                  = "gemini-enterprise-ineg-bes"
  protocol              = "HTTPS"
  load_balancing_scheme = "EXTERNAL_MANAGED"
  backend {
    group = google_compute_global_network_endpoint_group.gemini_enterprise_ineg.id
  }
}

resource "google_compute_managed_ssl_certificate" "ssl_cert" {
  name = "gemini-enterprise-ssl-certificate"
  managed {
    domains = ["gemini-enterprise.${var.domain_name}"]
  }
}

resource "google_compute_url_map" "gemini_enterprise_lb" {
  name            = "gemini-enterprise-lb"
  default_service = google_compute_backend_service.gemini_enterprise_ineg_bes.id

  host_rule {
    hosts        = ["gemini-enterprise.${var.domain_name}"]
    path_matcher = "matcher-1"
  }

  path_matcher {
    name            = "matcher-1"
    default_service = google_compute_backend_service.gemini_enterprise_ineg_bes.id

    route_rules {
      match_rules {
        prefix_match = "/travel"
      }
      priority = 1
      route_action {
        weighted_backend_services {
          backend_service = google_compute_backend_service.gemini_enterprise_ineg_bes.name
          weight          = 100
        }
        url_rewrite {
          host_rewrite        = "vertexaisearch.cloud.google.com"
          path_prefix_rewrite = "/home/cid/${var.app_travel_id}"
        }
      }
    }
  }
}

resource "google_compute_target_https_proxy" "https_proxy" {
  name             = "gemini-enterprise-https-proxy"
  url_map          = google_compute_url_map.gemini_enterprise_lb.id
  ssl_certificates = [google_compute_managed_ssl_certificate.ssl_cert.id]
}

resource "google_compute_global_forwarding_rule" "gemini_enterprise_fr" {
  name                  = "gemini-enterprise-fr"
  target                = google_compute_target_https_proxy.https_proxy.id
  ip_address            = google_compute_global_address.external_ip.id
  port_range            = "443"
  load_balancing_scheme = "EXTERNAL_MANAGED"
}
