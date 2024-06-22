resource "google_dns_record_set" "test_cloud_local" {
  name = "test.cloud.local."
  type = "A"
  ttl  = 300

  managed_zone = google_dns_managed_zone.cloud-local-zone.name
  rrdatas = [google_compute_instance.hub-vm.network_interface[0].network_ip]
}

resource "google_dns_record_set" "test_spoke_cloud_local" {
  name = "test.spoke.cloud.local."
  type = "A"
  ttl  = 300

  managed_zone = google_dns_managed_zone.spoke-local-zone.name
  rrdatas = [google_compute_instance.spoke-vm.network_interface[0].network_ip]
}
