import { Request } from "express";
import { UserPayload } from "./user-login.interface";

export interface ExpressRequestWithUser extends Request {
    user: UserPayload & { iat: number; exp: number };
}