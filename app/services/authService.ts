import { PatientUser, ProviderUser } from "../types";
import jwtDecode from "jwt-decode";
import { Uris } from "./constants";

type UserJwtToken = {    
    visitId?: string,
    role: string,
    id: string,
    name?: string
}

function authenticateVisitorOrPatient(passcode: string): Promise<PatientUser> {
    return fetch(Uris.get(Uris.visits.token), {
        method: 'POST',
        body: JSON.stringify({ action: "TOKEN", passcode }),
        headers: { 
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    }).then(r => r.json())
    .then(tokenResp => {
        const tokenInfo = jwtDecode(tokenResp.token) as UserJwtToken;
        return {
            ...tokenInfo,
            isAuthenticated: true,
            token: tokenResp.token,
            name: tokenInfo.name,
            id: tokenInfo.id
        } as PatientUser;
    });
}

function authenticatePractitioner(passcode: string): Promise<ProviderUser> {
    return fetch(Uris.get(Uris.visits.token), {
        method: 'POST',
        body: JSON.stringify({ action: "TOKEN", passcode }),
        headers: { 
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    }).then(r => r.json())
    .then(tokenResp => {
        const tokenInfo = jwtDecode(tokenResp.token) as UserJwtToken;
        return {
            ...tokenInfo,
            isAuthenticated: true,
            token: tokenResp.token,
            name: tokenInfo.name,
            id: tokenInfo.id
        } as ProviderUser;
    });
}

export default {
    authenticateVisitorOrPatient,
    authenticatePractitioner
};