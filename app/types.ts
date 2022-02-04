import { LocalVideoTrack, RemoteVideoTrack, Track, TwilioError, VideoBandwidthProfileOptions } from 'twilio-video';
import { NextPage } from 'next';
import React from 'react';

export type TwilioPage = NextPage & { Layout?: React.FC }

export interface EHRPatient {
  id?: string,
  name: string,
  family_name?: string,
  given_name: string,
  phone: string,
  email?: string,
  gender: string,
  language?: string,
  medications?: string[],
  conditions?: string[],
}


// see assets/datastore/appointment-prototype.json
export interface EHRProvider {
  id: string,
  name: string,
  phone: string,
  on_call: Boolean,
}


export interface EHRAppointment {
  id?: string,
  type?: string,
  start_datetime_ltz?: Date,
  end_datetime_ltz?: Date,
  reason?: string,
  references?: string[],
  patient_id: string,
  provider_id: string,
}

export interface EHRContent {
  id: string,
  title: string,
  description: string,
  video_url: string,
  provider_ids: string[],
}


export type TelehealthRole = 'guest' | 'patient' | 'visitor' | 'practitioner' | 'provider' ;

export interface TelehealthUser {
  id?: string,
  name?: string
  isAuthenticated: Boolean
  role: TelehealthRole,
  token: string
}

export interface PatientUser extends TelehealthUser {
  visitId: string
}

export interface ProviderUser extends TelehealthUser {
}

export const GuestUser = {
  id: 'guest',
  name: "Guest",
  isAuthenticated: false,
  role: "guest",
  token: null
} as TelehealthUser;


export interface TelehealthVisit {
  id: string,
  visitDateTime?: Date,
  providerName?: string,
  roomName: string,
  patientName?: string
  ehrAppointment?: EHRAppointment, // see assets/datastore/appointment-prototype.json
  ehrPatient?: EHRPatient, // see assets/datastore/patient-prototype.json
  ehrProvider?: EHRProvider, // see assets/datastore/provider-prototype.json
}

declare module 'twilio-video' {
  // These help to create union types between Local and Remote VideoTracks
  interface LocalVideoTrack {
    isSwitchedOff: undefined;
    setPriority: undefined;
  }
}

declare global {

  interface MediaDevices {
    getDisplayMedia(constraints: MediaStreamConstraints): Promise<MediaStream>;
  }

  interface HTMLMediaElement {
    setSinkId?(sinkId: string): Promise<undefined>;
  }

  // Helps create a union type with TwilioError
  interface Error {
    code: undefined;
  }
}

export type Callback = (...args: any[]) => void;

export type ErrorCallback = (error: TwilioError | Error) => void;

export type IVideoTrack = LocalVideoTrack | RemoteVideoTrack;

export type RoomType = 'group' | 'group-small' | 'peer-to-peer' | 'go';

export interface Settings {
  trackSwitchOffMode: VideoBandwidthProfileOptions['trackSwitchOffMode'];
  dominantSpeakerPriority?: Track.Priority;
  bandwidthProfileMode: VideoBandwidthProfileOptions['mode'];
  maxAudioBitrate: string;
  contentPreferencesMode?: 'auto' | 'manual';
  clientTrackSwitchOffControl?: 'auto' | 'manual';
  roomType: RoomType
}

type SettingsKeys = keyof Settings;

export interface SettingsAction {
  name: SettingsKeys;
  value: string;
}

export type Thumbnail = 'none' | 'blur' | 'image';

export interface BackgroundSettings {
  type: Thumbnail;
  name: string;
  index?: number;
}

export type Reaction = 'thumb_up' | 'thumb_down';

export interface PostVisitSurvey {
  selectedThumb: Reaction;
  selectedIssues: string[];
  otherIssue: string;
}
