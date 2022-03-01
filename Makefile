# --------------------------------------------------------------------------------------------------------------
# to be used by demo developer
# --------------------------------------------------------------------------------------------------------------
APPLICATION_NAME := $(shell basename `pwd`)
$(info APPLICATION_NAME=$(APPLICATION_NAME))

ifdef ACCOUNT_SID
$(info Twilio ACCOUNT_SID=$(ACCOUNT_SID))
else
$(info Twilio ACCOUNT_SID environment variable is not set)
$(info Lookup your "ACCOUNT SID" at https://console.twilio.com/)
ACCOUNT_SID := $(shell read -p "Enter ACCOUNT_SID=" input && echo $$input)
$(info )
endif

ifdef AUTH_TOKEN
$(info Twilio AUTH_TOKEN=$(shell echo $(AUTH_TOKEN) | sed 's/./*/g'))
else
$(info Twilio Account SID environment variable is not set)
$(info Lookup your "AUTH TOKEN" at https://console.twilio.com/)
AUTH_TOKEN := $(shell read -p "Enter AUTH_TOKEN=" input && echo $$input)
$(info )
endif

targets:
	@grep '^[A-Za-z0-9\-]*:' Makefile | cut -d ':' -f 1 | sort


fetch-service-sid:
	$(eval SERVICE_SID := $(shell curl https://serverless.twilio.com/v1/Services \
		--silent --user $(ACCOUNT_SID):$(AUTH_TOKEN) \
		| jq --raw-output '.services[] | select(.unique_name | contains("'$(APPLICATION_NAME)'")) | .sid'))
	@if [[ -z '$(SERVICE_SID)' ]]; then \
		echo "Service named '$(APPLICATION_NAME)' is not deployed!"; \
		false; \
	fi
	@echo SERVICE_SID=$(SERVICE_SID)


confirm-delete:
	@read -p "Delete $(APPLICATION_NAME) functions service? [y/n] " answer && [ $${answer:-N} = y ]


delete: fetch-service-sid confirm-delete
	@curl -X DELETE https://serverless.twilio.com/v1/Services/$(SERVICE_SID) \
	--silent --user $(ACCOUNT_SID):$(AUTH_TOKEN) | jq .

	rm -f .twiliodeployinfo
	@echo ---------- "Deleted $(APPLICATION_NAME) Functions Service"


build-react:
	@echo build react app
	cd app && npm install
	cd app && npm run build
	cd app && npm run export
	cp -r app/out/* assets

deploy-serverless: build-react
	@echo twilio serverless:deploy
	npm install
	@twilio serverless:deploy --username=$(ACCOUNT_SID) --password=$(AUTH_TOKEN)


make-editable: fetch-service-sid
	@curl -X POST "https://serverless.twilio.com/v1/Services/$(SERVICE_SID)" \
	--data-urlencode "UiEditable=True" \
	--silent --user $(ACCOUNT_SID):$(AUTH_TOKEN) | jq .


deploy: deploy-serverless make-editable
	@echo ---------- "Deployed $(APPLICATION_NAME) solution blueprint"


run: build-react
	@echo running on localhost:3000
	npm install
	@if [[ ! -f .env.localhost ]]; then \
	  cp .env .env.localhost; \
      echo ".env.localhost created from .env"; \
	fi;
	twilio serverless:start --env=.env.localhost
