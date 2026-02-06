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
		--allow-unauthenticated \
		--set-env-vars "DATABASE_CLIENT=postgres" \
		--set-env-vars "DATABASE_HOST=db.jiumbxrplspqtewwpvqa.supabase.co" \
		--set-env-vars "DATABASE_PORT=5432" \
		--set-env-vars "DATABASE_NAME=postgres" \
		--set-env-vars "DATABASE_USERNAME=postgres" \
		--set-env-vars "DATABASE_PASSWORD=TechnoCloud@Lnw007" \
		--set-env-vars "DATABASE_SSL=true" \
		--set-env-vars "NODE_ENV=production" \
		--set-env-vars "APP_KEYS=DkZj7w9x+1u5v5kL/5zQ==,8jK92d+4z9x1s5vL/1zQ==,3jK7w9x+1u5v5kL/5zQ==,4jK92d+4z9x1s5vL/1zQ==" \
		--set-env-vars "API_TOKEN_SALT=somerandomsalt123456" \
		--set-env-vars "ADMIN_JWT_SECRET=supersecretjwtkeyforadmin" \
		--set-env-vars "TRANSFER_TOKEN_SALT=anotherrandomsalt789012" \
		--set-env-vars "JWT_SECRET=jwtsecretforuserspermissionsplugin" \
		--timeout=300 \
		--cpu=1 \
		--memory=1Gi

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
