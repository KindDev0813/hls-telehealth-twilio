# --------------------------------------------------------------------------------
# Dockerfile for local installer
#
# To run,
#
# - install Docker desktop on your machine
# - run 'docker build --tag hls-installer https://github.com/twilio/hls-telehealth.git#main'
# - run 'docker run -p 3000:3000 -it hls-installer'
# - open in browser, http://localhost:3000/installer.html
#
# --------------------------------------------------------------------------------
FROM twilio/twilio-cli:3.0.0
ARG TWILIO_ACCOUNT_SID=sid
ARG TWILIO_AUTH_TOKEN=token

RUN twilio plugins:install @twilio-labs/plugin-serverless

COPY app /app
WORKDIR /app
RUN npm install
RUN npm run build
RUN npm run export
# directory to copy/run application
WORKDIR /hls-installer

# copy github files needed for running locally
COPY Dockerfile package.json .env /hls-installer
COPY assets /hls-installer/assets
COPY functions /hls-installer/functions
RUN mkdir assets/app
RUN cp -r /app/out/* /hls-installer/assets

# install node dependencies in package.json
RUN npm install

# RUN twilio serverless:deploy --override-existing-project

# expose default port for running locally
EXPOSE 3000

CMD ["twilio", "serverless:start", "--load-local-env"]
