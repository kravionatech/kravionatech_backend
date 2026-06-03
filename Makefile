# kravionatech_backend - developer quickstart
# All targets assume you are in this directory.

.PHONY: help install env up down logs seed seed-admin dev start clean

help:           ## Show this help
	@echo "Targets:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN{FS=":.*?## "}{printf "  \033[36m%-12s\033[0m %s\n", $$1, $$2}'

install:        ## Install dependencies
	npm install

env:            ## Copy .env.example to .env (idempotent)
	@if [ ! -f .env ]; then cp .env.example .env && echo "Created .env - edit it before booting"; else echo ".env already exists - leaving it alone"; fi

up:             ## Bring up Mongo + Redis via docker compose
	docker compose up -d
	@echo "Mongo on 27017, Redis on 6379. Wait ~5s for healthchecks then 'make dev'."

down:           ## Tear down the stack (keep volumes)
	docker compose down

nuke:           ## Tear down AND drop volumes (full reset)
	docker compose down -v

logs:           ## Tail docker compose logs
	docker compose logs -f

seed:           ## Idempotent site data seed
	npm run seed

seed-admin:     ## Ensure kravionatech@gmail.com / Asdf@123 super_admin exists
	node src/scripts/seedAdmin.js

dev:            ## Start backend in dev mode (nodemon on :$(PORT))
	npm run dev

start:          ## Start backend in production mode
	npm start

clean:          ## Remove node_modules + build artifacts
	rm -rf node_modules dist
