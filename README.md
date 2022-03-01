# HLS Telehealth


## <a name="install"></a>Installation Information

This section details the requirements for a successful deployment and installation of the prototype application.

### Prerequisites

The following prerequisites must be satisfied prior to installing the application.

**Twilio account**

- Create a Twilio account by signing up [here](https://www.twilio.com/try-twilio)
- Once the Twilio account is created,
  please note the `ACCOUNT SID` and `AUTH TOKEN`
  from the [Twilio console](https://console.twilio.com/) for use below
- If you have multiple Twilio Projects under your account, make sure that you are logged into the Project that you want the application to be deployed to

**Twilio phone number**

- After provisioning your Twilio account,
  you will need to [purchase a phone number](https://www.twilio.com/console/phone-numbers/incoming)
  to use in the application for sending SMS texts
- Make sure the phone number is SMS enabled
- (This will be the phone number patients receive texts from)
- <em>Note: authentication is required in order to complete deployment via the application page,
  which will generate a nominal SMS charge to your connected Twilio account.
  Each authentication SMS sent will cost $0.0075,
  plus an additional $0.05 per successful authentication
  (multi-factor authentication leverages Twilio Verify).
  See Twilio SMS pricing and Twilio Verify pricing for more information.</em>

**Ensure unique application name**

In order to deploy correctly, it is important
that you do not have an existing Twilio Functions Service called ‘hls-telehealth.’
If you do, you will need to delete (or appropriately update the existing name of)
the existing functions service to ensure a conflict doesn’t occur during installation.

**Install Docker Desktop**

Docker desktop will be used to run the application installer locally on your machine.
Goto [Docker Desktop](https://www.docker.com/products/docker-desktop)
and install with default options.
After installation make sure to start Docker desktop.


### Installation Steps


*Installation of this application is supported on the browser that support
[WebRTC Video](https://www.twilio.com/docs/video/javascript#supported-browsers)*


**Ensure completed prerequisites** - ensure that you have completed all prerequisite steps listed above

1. (Optional) if you suspect corrupted docker image and want to build fresh image
   ```shell
   docker rmi hls-telehealth-installer
   ```
2. github repo is not yet, public.
   First, log into github
   Second, let BJ/Leon know your github profile, so they can grant you acess
   Third, if you have twilio email, you need to get personal access token as password authentication is blocked. See https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token
   ```shell
   git clone https://github.com/twilio/hls-telehealth.git
   ```

   ```shell
   docker build --tag hls-telehealth-installer --no-cache .
   ```

   **Do not follow this until repo is public!!!** Build docker image of installer by executing
   ```shell
   docker build --tag hls-telehealth-installer --no-cache https://github.com/twilio/hls-telehealth.git#main
   ```
   For machines running Apple M1 chip add the option `--platform linux/amd64`.

3. Run the built docker image by executing below supplying your Twilio credentials from above
   (replace `{YOUR_ACCOUNT_SID}` and `{YOUR_AUTH_TOKEN}` with your Twilio credentials Account SID and Auth token, respectively).
    ```shell
    docker run --name hls-telehealth-installer --rm --publish 3000:3000 \
   --env ACCOUNT_SID={YOUR_ACCOUNT_SID} --env AUTH_TOKEN={YOUR_AUTH_TOKEN} -it hls-telehealth-installer
    ```

4. Open http://localhost:3000/installer.html using a broswer.

5. Follow the instructions in the installer to complete installation & configuration.

6. Launch the admnistration page by clicking 'Open Application' button.

7. 'Stop' the docker container `hls-telehealth-installer` in the docker dashboard.
   Alternatively, you can enter `Control-C` in the terminal where you executed the `docker run` command.

## Development

To get started developing, you'll want to spin up to servers, either a front-end or back-end or both together.
NOTE: You'll want to uncomment and edit this line to the right port number when working with the backend so that you can hit your endpoints properly.  Do not push that line into the repo as when you deploy you will run into problems if the wrong backendRoot Uri is incorrect - https://github.com/twilio/hls-telehealth/blob/main/app/services/constants.ts#L2 

You'll need to create `.env.localhst` file in the root directory with the following variables set

```shell
ACCOUNT_SID={your-twilio-account account sid}
AUTH_TOKEN={your-twilio-account auth token}
DISABLE_AUTH_FOR_LOCALHOST=true
```

`DISABLE_AUTH_FOR_LOCALHOST` will by-pass MFA when accessing administration page.

### To run the whole app in development mode:
1. ```cd``` into the ```app/``` directory.
2. Run this command to spin up both front-end and back-end servers in parallel on a single terminal window: ```npm run devo```
  a. This runs the front-end server on port 3000 and the back-end on port 3001.

### Front-end only development:
1. ```cd``` into the ```app/``` directory.
2. Then run the command ```npm run dev``` which kicks up a next JS dev server for the front-end.

### Back-end only Developement:
1. At the top level of the repo, run ```twilio serverless:start -p <YOUR PORT NUMBER>```, the front-end command above runs the front-end app on port 3000. 

### Deploy without using Docker installer

1. Build React components into `assets` folder
   ```shell
   make build-react
   ```
2. Deploy via CLI
   ```shell
   make deploy
   ```
   or via using installer page.
   Start serverless locally
   ```shell
   twilio serverless:start --env=.env.localhost
   ```
   Open `http://localhost:3000` in your browser and (re-)deploy
