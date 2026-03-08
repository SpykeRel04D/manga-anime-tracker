ifndef PROJECT_NAME
$(error PROJECT_NAME must be defined before loading make/02_docker.mk)
endif

DOCKER_COMPOSE = docker compose --file .docker/docker-compose.yaml --project-name $(PROJECT_NAME)

up: setup ## Start the containers.
	$(DOCKER_COMPOSE) up --wait
.PHONY: up

halt: ## Stop the containers.
	$(DOCKER_COMPOSE) stop
.PHONY: halt

destroy: ## Stop and remove the containers.
	$(DOCKER_COMPOSE) down --remove-orphans --volumes
.PHONY: destroy

ps: ## List the containers.
	$(DOCKER_COMPOSE) ps
.PHONY: ps

logs: ## Follow the logs.
	$(DOCKER_COMPOSE) logs --follow
.PHONY: logs
