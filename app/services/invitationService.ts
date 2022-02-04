import { TelehealthUser } from "../types";
import { Uris } from "./constants";

async function inviteVisitor(user: TelehealthUser, phoneNumber: string, visitId: string): Promise<void> {
    await fetch(Uris.get(Uris.visits.token), {
        method: 'POST',
        body: JSON.stringify({ action: "PASSCODE", visitId, id: `visitor_${phoneNumber}` }),
        headers: { 
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.token}`
        }
    }).then(r => r.json())
    .then(tokenResp => {
        const inviteUri = `${window.location.origin}/invited-attendee/?token=${tokenResp.passcode}`
        return fetch(Uris.get(Uris.sms), {
            method: 'POST',
            body: JSON.stringify({ token: user.token, to_phone: phoneNumber, body: inviteUri }),
            headers: { 
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${user.token}`
            }
        });
    });
}

export default {
    inviteVisitor
};