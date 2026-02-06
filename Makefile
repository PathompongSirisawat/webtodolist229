# ตัวแปรสำหรับตั้งค่า
PROJECT_ID=technocloudlnw007-486508
REGION=asia-southeast1
REPO=strapi-repo
BACKEND_IMAGE=asia-southeast1-docker.pkg.dev/$(PROJECT_ID)/$(REPO)/strapi-backend
FRONTEND_IMAGE=asia-southeast1-docker.pkg.dev/$(PROJECT_ID)/$(REPO)/frontend-app
BACKEND_URL=https://strapi-backend-231380388494.asia-southeast1.run.app

# --- Backend Commands ---
build-be:
	@echo "Building Backend..."
	cd Backend && gcloud builds submit --tag $(BACKEND_IMAGE) .

deploy-be:
	@echo "Deploying Backend..."
	gcloud run deploy strapi-backend \
		--image $(BACKEND_IMAGE) \
		--platform managed \
		--region $(REGION) \
		--allow-unauthenticated

# --- Frontend Commands ---
build-fe:
	@echo "Creating .env for Frontend..."
	echo "REACT_APP_API_URL=$(BACKEND_URL)" > frontend/.env
	@echo "Building Frontend..."
	cd frontend && gcloud builds submit --tag $(FRONTEND_IMAGE) .

deploy-fe:
	@echo "Deploying Frontend..."
	gcloud run deploy frontend-service \
		--image $(FRONTEND_IMAGE) \
		--region $(REGION) \
		--allow-unauthenticated

# --- Shortcut Commands ---
all-be: build-be deploy-be
all-fe: build-fe deploy-fe

# --- Full Stack Update ---
deploy-all: all-be all-fe
	@echo "------------------------------------------------"
	@echo "SUCCESS: Backend and Frontend are updated!"
	@echo "Backend: $(BACKEND_URL)"
	@echo "Frontend: https://frontend-service-231380388494.asia-southeast1.run.app"
	@echo "------------------------------------------------"
