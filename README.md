# HLS Telehealth

- [Installation](#installation)


---

## Installation


### Prerequisites

The following prerequisites must be satisfied prior to installing the application.

#### Provision Twilio Account

You will need the following Twilio assets ready prior to installation:
- **Twilio account**
  - Create a Twilio account by signing up [here](https://www.twilio.com/try-twilio).
  - *(You will use your login information to get started with the Quick Deploy installation on the app's CodeExchange page)*
- **Twilio phone number**
  - After provisioning your Twilio account, you will need to [purchase a phone number](https://www.twilio.com/console/phone-numbers/incoming) to use in the application.
  - Make sure the phone number is SMS enabled
  - *(This will be the number patients receive texts from)*

#### Docker Desktop

Install Docker desktop that includes docker compose CLI will be used to run the application installer locally on your machine.
Goto [Docker Desktop](https://www.docker.com/products/docker-desktop) and install with default options.
After installation make sure to start Docker desktop.


### Installation Steps

<em>(Installation of this application is supported on the latest versions of Chrome, Firefox, and Safari.
Installation via Internet Explorer has not been officially tested
and although issues are not expected, unforeseen problems may occur)</em>

Please ensure that you do not have any running processes
that is listening on port `3000`
such as development servers or another HLS installer still running.

#### Remove Docker Image

First, to ensure installation using the latest docker image, execute the following in your terminal window

```shell
docker image rm twiliohls/hls-telehealth-installer
```

#### Run Installer Docker Container

Replace `${TWILIO_ACCOUNT_SID}` and `${TWILIO_AUTH_TOKEN}` with that of your target Twilio account
and execute the following in your terminal window.

```shell
docker run --pull=always --name hls-telehealth-installer --rm --publish 3000:3000  \
--env ACCOUNT_SID=${TWILIO_ACCOUNT_SID} --env AUTH_TOKEN=${TWILIO_AUTH_TOKEN} \
--interactive --tty twiliohls/hls-telehealth-installer
```

If running on Apple Silicon (M1 chip), add `--platform linux/amd64` option.


#### Open installer in browser

Open http://localhost:3000/installer/index.html

Fill in all required environment variables and/or change them to meet your needs.

Click `Deploy` to install the application to your Twilio account
and wait until installer indicates completion.


#### Terminate installer

To terminate installer:
- Enter Control-C in the terminal where `docker run ...` was executed
- Stop the `hls-telehealth-installer` docker container via the Docker Desktop
