# --------------------------------------------------------------------------------------------------------------
# FOR DEVELOPER USE ONLY!!!
# --------------------------------------------------------------------------------------------------------------

# ---------- acquire twilio credentials from environment variables
# when below 2 variables are set, it will be the 'active' profile of twilio cli
ifndef TWILIO_ACCOUNT_SID
$(info Lookup your "ACCOUNT SID" at https://console.twilio.com/)
$(info execute in your terminal, 'export TWILIO_ACCOUNT_SID=AC********************************')
$(error TWILIO_ACCOUNT_SID environment variable is not set)
endif

ifndef TWILIO_AUTH_TOKEN
$(info Lookup your "AUTH TOKEN" at https://console.twilio.com/)
$(info execute in your terminal, 'export TWILIO_AUTH_TOKEN=********************************')
$(info TWILIO_AUTH_TOKEN environment variable is not set)
endif


# ---------- variables
BLUEPRINT_NAME   := $(shell basename `pwd`)
SERVERLESS_NAME  := $(BLUEPRINT_NAME)
GIT_REPO_URL     := $(shell git config --get remote.origin.url)
VERSION          := $(shell jq --raw-output .version package.json)
INSTALLER_NAME   := hls-telehealth-installer
INSTALLER_TAG_V  := twiliohls/$(INSTALLER_NAME):$(VERSION)
INSTALLER_TAG_L  := twiliohls/$(INSTALLER_NAME):latest
CPU_HARDWARE     := $(shell uname -m)
DOCKER_EMULATION := $(shell [[ `uname -m` == "arm64" ]] && echo --platform linux/amd64)
$(info ================================================================================)
$(info BLUEPRINT_NAME     : $(BLUEPRINT_NAME))
$(info GIT_REPO_URL       : $(GIT_REPO_URL))
$(info INSTALLER_NAME     : $(INSTALLER_NAME))
$(info INSTALLER_TAG_V    : $(INSTALLER_TAG_V))
$(info CPU_HARDWARE       : $(shell uname -m))
$(info DOCKER_EMULATION   : $(DOCKER_EMULATION))
$(info TWILIO_ACCOUNT_NAME: $(shell twilio api:core:accounts:fetch --sid=$(TWILIO_ACCOUNT_SID) --no-header --properties=friendlyName))
$(info TWILIO_ACCOUNT_SID : $(TWILIO_ACCOUNT_SID))
$(info TWILIO_AUTH_TOKEN  : $(shell echo $(TWILIO_AUTH_TOKEN) | sed 's/./*/g'))
$(info SERVERLESS_NAME    : $(SERVERLESS_NAME))
$(info ================================================================================)


targets:
	@echo ----- avaiable make targets:
	@grep '^[A-Za-z0-9\-]*:' Makefile | cut -d ':' -f 1 | sort


installer-build-github:
	docker build --tag $(INSTALLER_TAG_V) --tag $(INSTALLER_TAG_L) $(DOCKER_EMULATION) --no-cache $(GIT_REPO_URL)#main


installer-build-local:
	docker build --tag $(INSTALLER_TAG_V) --tag $(INSTALLER_TAG_L) $(DOCKER_EMULATION) --no-cache .


installer-push:
	docker login --username twiliohls
	docker push $(INSTALLER_TAG_V)
	docker push $(INSTALLER_TAG_L)
	docker logout
	open -a "Google Chrome" https://hub.docker.com/r/twiliohls/$(INSTALLER_NAME)


installer-run:
	docker run --name $(INSTALLER_NAME) --rm --publish 3000:3000  $(DOCKER_EMULATION) \
	--env ACCOUNT_SID=$(TWILIO_ACCOUNT_SID) --env AUTH_TOKEN=$(TWILIO_AUTH_TOKEN) \
	--interactive --tty $(INSTALLER_TAG_V)


installer-open:
	@while [[ -z $(curl --silent --head http://localhost:3000/installer/index.html) ]]; do \
      sleep 2 \
      echo "installer not up yet..." \
    done
	open -a "Google Chrome" http://localhost:3000/installer/index.html


get-service-name:
	$(eval SERVICE_NAME := $(shell grep -w APPLICATION_NAME .env | head -1 | sed 's/^.*=//'))


get-service-sid: get-service-name
	$(eval SERVICE_SID := $(shell twilio api:serverless:v1:services:list -o=json \
	| jq --raw-output '.[] | select(.friendlyName == "$(SERVICE_NAME)") | .sid'))
	@if [[ ! -z "$(SERVICE_SID)" ]]; then \
      echo "SERVICE_SID=$(SERVICE_SID)"; \
    else \
	  echo "$@: Service named $(SERVICE_NAME) is not deployed!!! aborting..."; \
	fi
	@[[ ! -z "$(SERVICE_SID)" ]]


get-environment-sid: get-service-sid
	$(eval ENVIRONMENT_SID := $(shell twilio api:serverless:v1:services:environments:list --service-sid $(SERVICE_SID) -o=json \
	| jq --raw-output '.[0].sid'))
	@if [[ ! -z "$(ENVIRONMENT_SID)" ]]; then \
	  echo "ENVIRONMENT_SID=$(ENVIRONMENT_SID)"; \
	else \
	  echo "$@: Environment for service named $(SERVICE_NAME) is not found!!! aborting..."; \
	fi
	@[[ ! -z "$(ENVIRONMENT_SID)" ]]


clean:
	@echo "remove react build files/directory"
	rm -f -r app/out
#	@echo "remove react build files in assets"
#	git ls-files --others --exclude-standard | grep "^assets" | xargs rm -v


build: clean
	cd app && npm install
	cd app && npm run build
	cd app && npm run export
	@echo "copy react build files to assets"
	cp -r app/out/* assets/


make-service-editable: get-service-sid
	twilio api:serverless:v1:services:update --sid=$(SERVICE_SID) --ui-editable -o=json

build-react:
	@echo build react app
	cd app && npm install
	cd app && npm run build
	cd app && npm run export
	cp -r app/out/* assets

deploy: build-react
	@echo twilio serverless:deploy
	twilio serverless:deploy --runtime node14
	@echo If initial deployment, also execute 'make make-service-editable'


# separate make target needed to be abortable
confirm-delete:
	@read -p "Delete $(SERVICE_NAME) service? [y/n] " answer && [[ $${answer:-N} = y ]]


undeploy: get-service-sid confirm-delete
	twilio api:serverless:v1:services:remove --sid $(SERVICE_SID)
	rm -f .twiliodeployinfo


run-app:
	cd app && npm install
	cd app && npm run start


run-serverless:
	npm install
	@if [[ ! -f .env.localhost ]]; then \
      echo ".env.localhost needs to be copied from .env and value set!!! aborting..."; \
    fi
	@[[ -f .env.localhost ]]
	twilio serverless:start --env=.env.localhost


tail-log: get-environment-sid
	twilio serverless:logs --service-sid=$(SERVICE_SID) --environment=$(ENVIRONMENT_SID) --tail
