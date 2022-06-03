import { PatientUser, ProviderUser } from '../types';
import jwtDecode from 'jwt-decode';
import { Uris } from './constants';

type UserJwtToken = {
  visitId?: string;
  role: string;
  id: string;
  name?: string;
};

/** for some reason twilio API sends broken SMS with '§' instead of '_' in the text to Android devices (mainly because of ASCII/GSM charset difference)
 * return it back here
 */
function modifyPasscode(passcode: string): string {
  return passcode.replace('§', '_');
}

function authenticateVisitorOrPatient(passcode: string): Promise<PatientUser> {
  return fetch(Uris.get(Uris.visits.token), {
    method: 'POST',
    body: JSON.stringify({
      action: 'TOKEN',
      passcode: modifyPasscode(passcode),
    }),
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  })
    .then((r) => r.json())
    .then((tokenResp) => {
      const tokenInfo = jwtDecode(tokenResp.token) as UserJwtToken;
      return {
        ...tokenInfo,
        isAuthenticated: true,
        token: tokenResp.token,
        name: tokenInfo.name,
        id: tokenInfo.id,
      } as PatientUser;
    });
}

function authenticatePractitioner(passcode: string): Promise<ProviderUser> {
  return fetch(Uris.get(Uris.visits.token), {
    method: 'POST',
    body: JSON.stringify({
      action: 'TOKEN',
      passcode: modifyPasscode(passcode),
    }),
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  })
    .then((r) => r.json())
    .then((tokenResp) => {
      const tokenInfo = jwtDecode(tokenResp.token) as UserJwtToken;
      return {
        ...tokenInfo,
        isAuthenticated: true,
        token: tokenResp.token,
        name: tokenInfo.name,
        id: tokenInfo.id,
      } as ProviderUser;
    });
}

export default {
  authenticateVisitorOrPatient,
  authenticatePractitioner,
};
