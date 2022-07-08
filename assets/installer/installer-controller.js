
// array of user input variable values are stored here
// { key, required, css_class, value, is_valid }
const variableInput = [];

// -----------------------------------------------------------------------------
$(document).ready(async function () {
    $("button.get-twilio-phone").click(function () {
        window.open("https://console.twilio.com/");
    })
    await populate();
    checkApplication();
});


/* -----------------------------------------------------------------------------
 * add configuration variable entry
 *
 * input:
 * - variable: see https://www.npmjs.com/package/configure-env
 */
async function addVariable(variable, currentValue = null) {
    console.log(variable.key, currentValue);

    if (variable.key === 'TWILIO_PHONE_NUMBER') {
        // twilio phone number dropdown is handled outside, TODO: move inside
        variableInput.push({
            key: 'TWILIO_PHONE_NUMBER',
            required: variable.required,
            configurable: variable.configurable,
            css_id: '#twilio_phone_number',
        });
        return;
    }

    const originalElement = $('div.clone-original');

    const clonedElement = originalElement.clone().insertBefore(originalElement);
    clonedElement.removeClass("clone-original");
    clonedElement.addClass("clone-for-" + variable.key);

    const label = variable.key.toLowerCase().split('_').map(word => word[0].toUpperCase() + word.substr(1)).join(' ');
    (variable.required === true) ? clonedElement.find('.star').show() : clonedElement.find('.star').hide();
    clonedElement.find(".configure-label").text(label);

    css_id = `${variable.key.toLowerCase()}`;
    clonedElement.find('input').attr("id", css_id);
    clonedElement.find('input').attr("name", css_id);

    const value = currentValue ? currentValue : (variable.default ? variable.default: '');
    clonedElement.find('input').val(value);
    // clonedElement.find('input').attr("placeholder", (variable.default == null ? ' ' : variable.default));
    clonedElement.find('.tooltip').text(variable.description);
    const formats = {
        "secret": "password",
        "phone_number": "text",
        "email": "text",
        "text": "text"
    };
    clonedElement.find('input').attr("type", (formats.hasOwnProperty(variable.format) ? formats[variable.format] : "text"));

    variableInput.push({
        key: variable.key,
        required: variable.required,
        configurable: variable.configurable,
        css_id: `#${css_id}`,
        value: v.default ? v.default : v.value,
        isValid: true,
    });
    if (variable.configurable) {
        clonedElement.show();
    // } else {
    //     clonedElement.show();
    //     clonedElement.prop('disabled', true);
    //     clonedElement.find('input').prop('disabled', true);
    //     clonedElement.find('.configure-label').css('color','#aaaaaa');
    //     clonedElement.find('input').css('color','#aaaaaa');
    }
    // delete the original div after cloning
    //originalElement.remove();
}


// -----------------------------------------------------------------------------
async function populate() {
    const THIS = populate.name;
    try {
        const response = await fetch('/installer/get-application', {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
        });
        const info = await response.json();

        console.log(THIS, 'server returned:', info);

        $('#account_name').val(info.twilioAccountName);

        const phoneList = info.twilioPhoneNumbers;
        if (phoneList.length === 0)
          $(".configure-error-twilio-phone-number").show();
        phoneList.forEach(phone => {
          const html = `<option value="${phone.phoneNumber}">${phone.friendlyName}</option>`;
          $('#twilio_phone_number').append(html);
        });

        for (v of info.configurationVariables) {
            await addVariable(v, v.value);
        }

    } catch (err) {
        console.log(err);
        $(".configure-error-login").text("Your Twilio authentication failed. Please try again with correct credentials");
        $(".configure-error-login").show();
    }
}


// -----------------------------------------------------------------------------
async function selectPhone() {
    const selectedPhone = $('#twilio_phone_number').val();
    console.log('selected twilio phone:', selectedPhone)
    return selectedPhone;

}


async function validateAdministratorPhone(field, value) {
    return fetch('/installer/validate-phone', {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ADMINISTRATOR_PHONE: value})
    })
        .then((response) => {
            if (!response.ok) {
                $(".clone-for-" + field).find(".configure-error").text("'" + value + "' is not a valid E.164 number");
                $(".clone-for-" + field).find(".configure-error").show();
                throw Error();
            }
            return response;
        })
        .then((response) => response.json())
        .then((r) => {
            $("#" + field.toLowerCase()).val(r["phone"]);
            return true;
        })
        .catch((err) => {
            return false;
        });
}

/* --------------------------------------------------------------------------------
 * check deployment of Service (by uniqueName)
 * --------------------------------------------------------------------------------
 */
function checkApplication() {
    const THIS = checkApplication.name;
    try {
         fetch('/installer/check-application', {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
        })
           .then((response) => response.json())
           .then((response) => {
             console.log(THIS, 'server returned:', response);
             $('#service-deploy .button').removeClass('loading');
             $('.service-loader').hide();
             if (response.deploy_state === 'NOT-DEPLOYED') {
               $('#service-deploy-button').text('Deploy Telehealth Application');
               $('#service-deploy').show();
               $('#service-deployed').hide();
             } else if (response.deploy_state === 'DEPLOYED') {
               $('#service-deploy-button').text('Re-deploy Telehealth Application');
               $('#service-deploy').show();
               $('#service-deploying').hide();
               $('#service-deployed').show();
               $('#application-open').attr('href', response.application_url);
               $('#service-open').attr('href', `https://www.twilio.com/console/functions/api/start/${response.service_sid}`);
             } else {
               throw new Error(response);
             }
           });
    } catch (err) {
        console.log(THIS, err);
    }
}


/* --------------------------------------------------------------------------------
 * validates variable input values
 *
 * input:
 * global variableInput set in populate()
 *
 * returns:
 * variableInput adding 2 attributes
 * - value
 * - isValid
 * --------------------------------------------------------------------------------
 */
function validateInput() {
    $('.configure-error').text("");
    $('.configure-error').hide("");

    //console.log(THIS, Object.keys(variableInput));
    let hasValidationError = false;
    for (v of variableInput) {
        if (! v.configurable) continue; // skip non-configurable variables
        console.log(v);
        const inputValue = $(v.css_id).val();
        console.log('input is', inputValue);
        if (v.required && !inputValue) {
            $('.clone-for-' + v.key).find(".configure-error").text("This field is required");
            $('.clone-for-' + v.key).find(".configure-error").show();
            hasValidationError = true;
        }
        v['value'] = inputValue;
        v['isValid'] = ! hasValidationError;
    }

    return variableInput;
}


/* --------------------------------------------------------------------------------
 * check deployment of Service (by uniqueName)
 * --------------------------------------------------------------------------------
 */
function deployApplication(e) {
    const THIS = deployApplication.name;

    e.preventDefault();

    const input = validateInput();
    const validated = input.every(i => i.isValid);
    if (! validated) return;
    console.log(THIS, 'variable values validated');

    const configuration = {};
    for (i of input) {
        if (!i.value) continue;
        configuration[i.key] = i.value;
    }
    console.log(configuration);
    console.log(JSON.stringify(configuration));
//    $('#service-deploy .button').addClass('loading');
//    $('.service-loader.button-loader').show();
    $('#service-deploy-button').prop('disabled', true);
    $('#service-deploying').show();
    $('#service-deployed').hide();

//    return;

    fetch('/installer/deploy-application', {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ configuration: configuration }),
    })
      .then(() => {
          $('#service-deploying').hide();
          $('#service-deploy-button').prop('disabled', false);
          console.log(THIS, 'successfully deployed');
          checkApplication();
      })
      .catch ((err) => {
          console.log(THIS, err);
          $('#service-deploying').hide();
          $('#service-deploy-button').prop('disabled', false);
//          $('#service-deploy .button').removeClass('loading');
//          $('.service-loader.button-loader').hide();
      });
}

/* --------------------------------------------------------------------------------
 * reset data
 * --------------------------------------------------------------------------------
 */
function resetData(e) {
  const THIS = resetData.name;

  e.preventDefault();

  fetch('/datastore/seed', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({}),
  })
    .then(() => {
      console.log(THIS, 'successfully reset data');
      checkApplication();
    })
    .catch ((err) => {
      console.log(THIS, err);
      window.alert(err);
      checkApplication();
    });
}

