import { isPlainObject } from 'is-plain-object';

export const isMobile = (() => {
  if (typeof navigator === 'undefined' || typeof navigator.userAgent !== 'string') {
    return false;
  }
  return /Mobile/.test(navigator.userAgent);
})();

// Recursively removes any object keys with a value of undefined
export function removeUndefineds<T>(obj: T): T {
  if (!isPlainObject(obj)) return obj;

  const target: { [name: string]: any } = {};

  for (const key in obj) {
    const val = obj[key];
    if (typeof val !== 'undefined') {
      target[key] = removeUndefineds(val);
    }
  }

  return target as T;
}

export async function getDeviceInfo() {
  const devices = await navigator.mediaDevices.enumerateDevices();

  return {
    audioInputDevices: devices.filter(device => device.kind === 'audioinput'),
    videoInputDevices: devices.filter(device => device.kind === 'videoinput'),
    audioOutputDevices: devices.filter(device => device.kind === 'audiooutput'),
    hasAudioInputDevices: devices.some(device => device.kind === 'audioinput'),
    hasVideoInputDevices: devices.some(device => device.kind === 'videoinput'),
  };
}

// This function will return 'true' when the specified permission has been denied by the user.
// If the API doesn't exist, or the query function returns an error, 'false' will be returned.
export async function isPermissionDenied(name: PermissionName) {
  if (navigator.permissions) {
    try {
      const result = await navigator.permissions.query({ name });
      return result.state === 'denied';
    } catch {
      return false;
    }
  } else {
    return false;
  }
}

export async function requestPermissions() {
  if (navigator.mediaDevices) {
    try {
      return await navigator.mediaDevices.getUserMedia({video: true, audio: true})
        .then(() => {
          return true;
        }).catch(err => {
          console.log(`Error requesting audio and video: ${err}`);
          return false;
        });
    } catch {
      return Promise.resolve(false);
    }
  } else {
    return Promise.resolve(false);
  }
}

export function joinClasses(...classes) {
  return classes.filter(Boolean).join(' ');
}

export const ALPHA_REGEX = /^[A-Za-z]+$/i;
export const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
export const PHONE_REGEX =
  /^(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/;
export const ZIP_REGEX = /^\d{5}$/;

export const US_STATES = [
  'AK',
  'AL',
  'AR',
  'AS',
  'AZ',
  'CA',
  'CO',
  'CT',
  'DC',
  'DE',
  'FL',
  'GA',
  'GU',
  'HI',
  'IA',
  'ID',
  'IL',
  'IN',
  'KS',
  'KY',
  'LA',
  'MA',
  'MD',
  'ME',
  'MI',
  'MN',
  'MO',
  'MS',
  'MT',
  'NC',
  'ND',
  'NE',
  'NH',
  'NJ',
  'NM',
  'NV',
  'NY',
  'OH',
  'OK',
  'OR',
  'PA',
  'PR',
  'RI',
  'SC',
  'SD',
  'TN',
  'TX',
  'UT',
  'VA',
  'VI',
  'VT',
  'WA',
  'WI',
  'WV',
  'WY',
];