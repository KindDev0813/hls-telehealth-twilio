exports.handler = async function(context, event, callback) {
    const client = context.getTwilioClient();
    const { assertLocalhost } = require(Runtime.getFunctions()['helpers'].path);
    assertLocalhost(context);

    const response = new Twilio.Response();
    const to_phone = await client.lookups.v1.phoneNumbers(event.PHONE)
        .fetch({countryCode: 'US'})
        .then(phone => {
            if (phone.hasOwnProperty("phoneNumber")) {
                response.setStatusCode(200);
                response.setBody({
                    phone: phone.phoneNumber
                });
                return callback(null,response);
            } else{
                console.log("No property");
                throw Error("error");
            }

        })
        .catch(err => {
            console.log("ERROR",err);
            response.setStatusCode(400);
            response.setBody({error: err})
            return callback(null,response);
        })
}


