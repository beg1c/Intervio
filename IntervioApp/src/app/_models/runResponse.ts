import { User } from "./user";

export interface RunResponse {
    stdout: string;
    time: string;
    memory: number;
    stderr: string;
    token: string;
    compile_output: string;
    message: string;
    user: User;
    status: Status;
}

export interface Status {
    id: number;
    description: string;
}