import { Room } from "./room";

export interface ConnectionResponse {
    users: Array<string>;
    room: Room;
    status: string;
}