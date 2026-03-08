NODE_MODULES_DIR = node_modules

setup: ${NODE_MODULES_DIR} ## Create the directories and files needed for local development.
.PHONY: setup

${NODE_MODULES_DIR}:
	mkdir -p ${NODE_MODULES_DIR}
