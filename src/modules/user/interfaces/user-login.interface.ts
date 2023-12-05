export interface UserPayload {
    sub: number;
    email: string;
    name: string;
}

export interface LoginResponse {
    access_token: string;
}