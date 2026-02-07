#กำหนดตัวแปรสำหรับ Cleanup Function
variable "cleanup_function_url" {
  default = "https://cleanup-tasks-231380388494.asia-southeast1.run.app"
}

variable "service_account_email" {
  default = "231380388494-compute@developer.gserviceaccount.com"
}

#สร้าง Cloud Scheduler แบบ HTTP Target สำหรับ Cleanup Tasks
resource "google_cloud_scheduler_job" "cleanup_scheduler" {
  name             = "cleanup-tasks-daily-tf" # เติม -tf ให้รู้ว่าสร้างจาก Terraform
  description      = "Cleanup expired tasks at midnight (Created by Terraform)"
  schedule         = "0 0 * * *" # รันทุกเที่ยงคืน
  time_zone        = "Asia/Bangkok"
  region           = "asia-southeast1"
  attempt_deadline = "320s"

  http_target {
    http_method = "POST"
    uri         = var.cleanup_function_url

    # ส่วนสำคัญ: การยืนยันตัวตนผ่าน OIDC Token เพื่อให้มีสิทธิ์เรียก Function
    oidc_token {
      service_account_email = var.service_account_email
    }
  }
}