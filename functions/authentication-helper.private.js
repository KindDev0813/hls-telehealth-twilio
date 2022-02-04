/*
 * --------------------------------------------------------------------------------
 * include token validation function using:
 *    const {path} = Runtime.getFunctions()["authentication-helper"];
 *    const {isValidAppToken} = require(path);
 *
 * --------------------------------------------------------------------------------
 *
 *  helper functions to be used only by authentication.js twilio function
 *
 * isValidPassword(password,context)
 * createMfaToken(context,key)
 * createAppToken(issuer,context)
 * checkDisableAuthForLocalhost(context)
 * getVerifyServiceId(context)
 * isValidAppToken(token,context)
 * isValidMfaToken(token,context)
 * isValidRefreshToken

 * --------------------------------------------------------------------------------
 */

const jwt = require('jsonwebtoken');

const MFA_TOKEN_DURATION = 5 * 60;
const APP_TOKEN_DURATION = 30 * 60;
const REFRESH_TOKEN_DURATION = 24 * 60 * 60;
const USER_TOKEN_DURATION = 30 * 24 * 60 * 60;
const AUTH_HEADER_TYPE = "Bearer";

function isValidPassword(password, context) {
    return (checkDisableAuthForLocalhost(context) ||
        password === context.ADMINISTRATOR_PASSWORD);
}

// --------------------------------------------------------
function createUserToken(context, role, id, visitId, name) {
    return createToken(context, 'app', { role, id, visitId, name }, USER_TOKEN_DURATION);
}

function createAppToken(context) {
    return createToken(context, 'app', { role: 'administrator' }, APP_TOKEN_DURATION);
}

// --------------------------------------------------------
function createRefreshToken(issuer, context) {
    return createToken(context, 'refresh', { role: 'administrator' }, REFRESH_TOKEN_DURATION);
}

// --------------------------------------------------------

function createMfaToken(issuer, context) {
    if (checkDisableAuthForLocalhost(context)) {
        return createAppToken(issuer, context);
    }
    return createToken(context, 'mfa', { role: 'administrator' }, MFA_TOKEN_DURATION);
}

// --------------------------------------------------------
function checkDisableAuthForLocalhost(context) {
  return (
    context.DOMAIN_NAME &&
    context.DOMAIN_NAME.startsWith('localhost:') &&
    context.DISABLE_AUTH_FOR_LOCALHOST &&
    context.DISABLE_AUTH_FOR_LOCALHOST === 'true'
  );
}

/* -----------------------------------------------------------------------
 * This function returns Verify Service SID from context.
 *
 * TWILIO_VERIFY_SID environment variable MUST be set during service deployment
 */
async function getVerifyServiceId(context) {
  if ('TWILIO_VERIFY_SID' in context && context.TWILIO_VERIFY_SID) return context.TWILIO_VERIFY_SID;
  throw new Error('getVerifyServiceId: TWILIO_VERIFY_SID environment varialbe must be set!!!');
}
// -----------------------------------------------------

function isValidMfaToken(token, context) {
  try {
    return (
      checkDisableAuthForLocalhost(context) ||
      jwt.verify(token, context.TWILIO_API_KEY_SECRET, { audience: 'mfa' })
    );
  } catch (err) {
    return false;
  }
}

// ---------------------------------------------------------
function isValidAppToken(token, context) {
  try {
    return (
      checkDisableAuthForLocalhost(context) ||
      jwt.verify(token, context.TWILIO_API_KEY_SECRET, { audience: 'app' })
    );
  } catch (err) {
    console.log(err);
    return false;
  }
}

// ---------------------------------------------------------
function isValidRefreshToken(token, context) {
    try {
        return (
            checkDisableAuthForLocalhost(context) ||
            jwt.verify(token, context.TWILIO_API_KEY_SECRET, { audience: 'refresh' })
        );
    } catch (err) {
        console.log(err);
        return false;
    }
}

function createToken(context, tokenType, payload, duration) {
  const { ACCOUNT_SID, TWILIO_API_KEY_SID, TWILIO_API_KEY_SECRET } = context;
  return jwt.sign(payload, TWILIO_API_KEY_SECRET, {
      expiresIn: duration,
      audience: tokenType,
      issuer: TWILIO_API_KEY_SID,
      subject: ACCOUNT_SID,
  });
}

function validateAndDecodeAppToken(context, event, roles) {
    let token = null;
    let response = new Twilio.Response();
    response.appendHeader('Content-Type', 'application/json');
    if(event.token) {
        token = event.token;
    } else {
        const authHeader = event.request.headers.authorization;
        if (!authHeader || !authHeader.startsWith(AUTH_HEADER_TYPE)) {
            response.setStatusCode(401);
            response.setBody({
              error: {
                message: `Authorization Header should not be emty and should start with ${AUTH_HEADER_TYPE}`,
                explanation:
                  `Please provide Authorization Header in a form of '${AUTH_HEADER_TYPE} _jwt-token_'`,
              },
            });
            return { response };
        }
        token = authHeader.replace(`${AUTH_HEADER_TYPE} `, "");
    }  
  
    if (!token) {
      response.setStatusCode(401);
      response.setBody({
        error: {
          message: `Authorization Token is Empty`,
          explanation:
            `Please provide Authorization Header in a form of '${AUTH_HEADER_TYPE} _jwt-token_' or token parameter as a part of query string/body`,
        },
      });
      return { response };
    }
  
    if(!isValidAppToken(token, context)) {
      response.setStatusCode(403);
      response.setBody({
        error: {
          message: `Authorization Token is not valid`
        },
      });
      return { response };
    }

    var decoded = jwt.decode(token);

    if(roles) {
        if(!roles.find(r => decoded.role === r)) {
            response.setStatusCode(403);
            response.setBody({
                error: {
                message: `Role ${decoded.role} is not authorized to perform this operation`
                },
            });
            return { response };
        }
    }

    return { decoded };
}

// ---------------------------------------------------------
module.exports = {
    isValidPassword,
    createMfaToken,
    createAppToken,
    createRefreshToken,
    createUserToken,
    isValidMfaToken,
    getVerifyServiceId,
    isValidAppToken,
    isValidRefreshToken,
    checkDisableAuthForLocalhost,
    validateAndDecodeAppToken
}