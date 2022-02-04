import { PatientUser, RoomType, TelehealthUser } from "../types";
import { Uris } from "./constants";

export type PatientRoomResponse = {
    roomSid: string,
    roomAvailable: boolean,
    conversationAvailable: boolean,
    roomType: RoomType,
    token: string
}

export type RecordingAction = 'start' | 'stop';

function checkRoom(patient: PatientUser, roomName: string): Promise<PatientRoomResponse> {
    return fetch(Uris.get(Uris.visits.patientRoomToken), {
        method: 'POST',
        body: JSON.stringify({ room_name: roomName}),
        headers: { 
            authorization: `Bearer ${patient.token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    }).then(r => r.json())
    .then(roomTokenResp => roomTokenResp as PatientRoomResponse);
}

function createRoom(provider: TelehealthUser, roomName: string): Promise<PatientRoomResponse> {
    return fetch(Uris.get(Uris.visits.providerRoomToken), {
        method: 'POST',
        body: JSON.stringify({ room_name: roomName }),
        headers: { 
            authorization: `Bearer ${provider.token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    }).then(r => r.json())
    .then(roomTokenResp => roomTokenResp as PatientRoomResponse);
}

async function toggleRecording(provider: TelehealthUser, roomSid: string, action: RecordingAction): Promise<void> {
    await fetch(Uris.get(Uris.visits.recording), {
        method: 'POST',
        body: JSON.stringify({ room_sid: roomSid, action}),
        headers: { 
            authorization: `Bearer ${provider.token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    }).then(r => r.json());
}

export const roomService = {
    checkRoom,
    createRoom,
    toggleRecording
};
