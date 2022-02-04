/*
 * --------------------------------------------------------------------------------
 *  Twilio function used to login with MFA validation and generate JWT for application sessions
 *  This function is only accessable via the local installer and will not be public.
 *
 * mfa(context, event, callback)
 * login(context, event, callback)
 * sendMfaCode(context)
 * verifyMfaCode(code, context)
 *
 * --------------------------------------------------------------------------------
 */

exports.handler = function(context, event, callback) {
    const response = new Twilio.Response();
    response.appendHeader('Content-Type','application/json');

    switch(event.command) {
        case 'login':
            login(context, event, callback);
            break;

        case 'mfa':
            mfa(context, event, callback);
            break;

        case 'refresh':
            refresh(context, event, callback);
            break;

        default:
            response.setStatusCode(400);
            response.setBody({message:"Not a valid command."});
            return callback(null, response);
    }
}

// ----------------------------------------------------------

function mfa(context, event, callback) {
    const {path} = Runtime.getFunctions()["authentication-helper"];
    const {isValidMfaToken, createAppToken, createRefreshToken} = require(path);

    const response = new Twilio.Response();
    response.appendHeader('Content-Type', 'application/json');

    if(event.code === undefined || event.code === null || event.code === ""){
        response.setStatusCode(400);
        response.setBody({message:'Code is null or empty.'});
        return callback(null, response);
    }
    if(event.code.length !== 6){
        console.log("Code needs to be six");
        response.setStatusCode(400);
        response.setBody({message:'Code needs to be six digits.'});
        return callback(null, response);
    }
    if (!isValidMfaToken(event.token, context)) {
        response.setStatusCode(401);
        response.appendHeader('Content-Type', 'application/json');
        response.setBody({message: 'Invalid or expired token. Please refresh the page and login again.'});
        return callback(null, response);
    }

    verifyMfaCode(event.code, context)
        .then((verificationCheck) => {
            if (verificationCheck.status === 'approved') {
                response.setBody({
                    accessToken: createAppToken(context),
                    refreshToken: createRefreshToken('mfa', context)
                });
                return callback(null, response);
            }
            response.setStatusCode(401);
            response.setBody({message:'Invalid code. Please check your phone and try again.'});
            return callback(null, response);
        })
        .catch((error) => {
            response.setStatusCode(500);
            response.setBody({message:'We are not able to verify your code now. Please refresh and try again.'});
            return callback(response, null);
        });

}

// -----------------------------------------------------------

function login(context, event, callback) {
    const { path } = Runtime.getFunctions()["authentication-helper"];
    const { isValidPassword,createMfaToken,createAppToken,createRefreshToken,checkDisableAuthForLocalhost } = require(path);

    const response = new Twilio.Response();
    response.appendHeader('Content-Type','application/json');
    if(checkDisableAuthForLocalhost(context)){
        response.setStatusCode(200);
        response.setBody({
            accessToken: createAppToken(context),
            refreshToken: createRefreshToken('login', context),
        });
        return callback(null, response);
    }

    if(event.password === undefined || event.password === null || event.password === ""){
        response.setStatusCode(400);
        response.setBody({message:"Password is null or empty"});
        return callback(null, response);

    } else if(isValidPassword(event.password, context)) {
        response.setStatusCode(200);
        sendMfaCode(context).then(function(){
            response.setBody({
                accessToken: createMfaToken('authentication', context),
            });
            return callback(null, response);

        }).catch(function(err){
            if(err.status === 400)
            {
                response.setStatusCode(400);
                response.setBody({message: 'ADMINISTRATOR_PHONE is not set, unable to send MFA!.'});
                return callback(null, response);
            }
            console.log("Could not send MFA code to the phone number", err);
            response.setStatusCode(500);
            response.setBody({message: 'Authorized but could not send MFA'});
            return callback(null, response);
        });
    }else{
        response.setStatusCode(401);
        response.setBody({message: 'Password is incorrect'});
        return callback(null, response);
    }
}

// -------------------------------------------------------------------------

async function sendMfaCode(context) {
    const { path } = Runtime.getFunctions()["authentication-helper"];
    const { getVerifyServiceId } = require(path);

    context.TWILIO_VERIFY_SID = await getVerifyServiceId(context);
    const twilioClient = context.getTwilioClient();
    const channel = 'sms';
    return twilioClient.verify
        .services(context.TWILIO_VERIFY_SID)
        .verifications
        .create({
            to: context.ADMINISTRATOR_PHONE,
            channel
        })
}

// --------------------------------------------------------------------------

async function verifyMfaCode(code, context) {
    const { path } = Runtime.getFunctions()["authentication-helper"];
    const { getVerifyServiceId } = require(path);

    context.TWILIO_VERIFY_SID = await getVerifyServiceId(context);

    const twilioClient = context.getTwilioClient();
    return twilioClient.verify
        .services(context.TWILIO_VERIFY_SID)
        .verificationChecks.create({
            to: context.ADMINISTRATOR_PHONE,
            code,
        });
}

// -------------------------------------------------------------

async function refresh(context, event, callback) {
    const path = Runtime.getFunctions()['authentication-helper'].path;
    const { createAppToken, isValidRefreshToken } = require(path);

    const ac = context.ACCOUNT_SID;

    //assert(event.token, 'missing event.token');
    if (!isValidRefreshToken(event.token, context)) {
        const response = new Twilio.Response();
        response.setStatusCode(401);
        response.appendHeader('Content-Type', 'application/json');
        response.setBody({ message: 'Invalid or expired token. Please refresh the page and login again.'});

        return callback(null, response);
    }

    const response = new Twilio.Response();
    response.appendHeader('Content-Type', 'application/json');
    response.setBody({
        accessToken: createAppToken(context),
    });
    callback(null, response);
};
