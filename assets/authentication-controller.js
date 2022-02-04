/*
 * main controller javascript used by index.html
 */

let accessToken = null;
let refreshToken = null;
let userActive = true;
const ACCESS_TOKEN_REFRESH_INTERVAL = 20 * 60 * 1000;


async function mfa(e) {
    e.preventDefault();
    const mfaCode =  $('#mfa-input').val();

    fetch('/authentication', {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({command: "mfa", code: mfaCode, token:accessToken})
    }).then((response) => {
        if (!response.ok) {
            response.json().then(json => {
                const messageTarget = $('#mfa-error');
                messageTarget.text(json.message );
                messageTarget.show();
            })
            throw Error(response.statusText)
        }
        return response;
    }).then((response) => response.json())
        .then((r) => {
            accessToken = r.accessToken;
            refreshToken = r.refreshToken;
            $('#mfa-form').hide();
            $('#mfa-input').val('');
            $('#auth-successful').show();
            $('main').show();
            initialize();
        })
        .catch((err) => console.log(err));
}

// --------------------------------------------------------------------

async function login(e) {
    e.preventDefault();
    $('#btn-authenticate').prop('disabled', true);
    const passwordInput = $('#password-input').val();

    fetch('/authentication', {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({password: passwordInput, command: "login"}),
    }).then((response) => {
        if (!response.ok) {
            $('#btn-authenticate').prop('disabled', false);
            response.json().then(json => {
                const messageTarget = $('#login-error');
                messageTarget.text(json.message );
                messageTarget.show();
            })
            throw Error(response.statusText)
        }
        return response;
    }).then((response) => response.json())
        .then((r) => {
            console.log(r);
            accessToken = r.accessToken;
            $('#password-form').hide();
            $('#password-input').val('');

            // if DISABLE_AUTH_FOR_LOCALHOST is true, instead of getting a token for MFA we get an access token and refresh token
            var decodedToken = parseJwt(accessToken);
            if (decodedToken['aud'] === 'app') {
                refreshToken = r.refreshToken;
                accessToken = r.accessToken;
                $('#auth-successful').show();
                scheduleTokenRefresh();
                // Post AUTHENTICATION code goes here
                $('main').show();
                initialize();
            } else {
                $('#mfa-form').show();
                $('#mfa-input').focus();
            }
        }).catch((err) => console.log(err));

}
// --------------------------------------------------------------------------------

function parseJwt(token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(
        atob(base64)
            .split('')
            .map(function (c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            })
            .join('')
    );

    return JSON.parse(jsonPayload);
}

// --------------------------------------------------------------------------------

function scheduleTokenRefresh() {
    setTimeout(refresh, ACCESS_TOKEN_REFRESH_INTERVAL);
}
// -----------------------------------------------------------------------------
async function refresh() {
    if (!userActive) return;

    fetch('/authentication', {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({command: "refresh", token: refreshToken }),
    })
        .then((response) => {
            return response;
        })
        .then((response) => response.json())
        .then((r) => {
            scheduleTokenRefresh();
            accessToken = r.accessToken;
        })
        .catch((err) => console.log(err));
}

