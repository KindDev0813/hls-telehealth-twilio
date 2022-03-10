import { TelehealthUser, TelehealthRole } from '../types';
import { Uris } from "./constants";

async function inviteVisitor(user: TelehealthUser, phoneNumber: string, visitId: string, role: TelehealthRole): Promise<void> {
    //consider only 2 roles of visitor
    const action = role == 'visitor' ? 'VISITOR' : 'PROVIDERVISITOR';
    
    await fetch(Uris.get(Uris.visits.token), {
        method: 'POST',
        body: JSON.stringify({action: action, visitId, id: `${role}_${phoneNumber}` }),
        //TODO:investigate issue with name: user.name 
        //body: JSON.stringify({ name: user.name, action: action, visitId, id: `${role}_${phoneNumber}` }),
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