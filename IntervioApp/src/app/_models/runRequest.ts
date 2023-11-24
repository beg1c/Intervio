export interface RunRequest {
    source_code: string;
    language_id: number;
    wait: string;
    stdin: string;
}