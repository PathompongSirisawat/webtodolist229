#กำหนด Provider 
provider "google" {
  project = "technocloudlnw007-486508" 
  region  = "asia-southeast1"
}

#สร้าง Pub/Sub Topic 
resource "google_pubsub_topic" "todo_topic" {
  name = "check-todos-topic-terraform" 
}

#สร้าง Cloud Scheduler (นาฬิกาปลุก)
resource "google_cloud_scheduler_job" "todo_scheduler" {
  name     = "cron-check-todos-terraform"
  schedule = "*/10 * * * *"
  time_zone = "Asia/Bangkok"

  pubsub_target {
    topic_name = google_pubsub_topic.todo_topic.id
    data       = base64encode("Check Now")
  }
}