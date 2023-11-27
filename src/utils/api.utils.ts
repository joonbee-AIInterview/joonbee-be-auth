import { NextFunction, Request, Response } from "express";

export interface ApiResponse<T>{
    status: number;
    data: T;
}

export interface ResponseToken{
    accessToken: string;
    refreshToken: string;
}

export class CustomError extends Error{
    statusCode: number;
    
    constructor(message: string, statusCode: number){
        super(message);
        this.statusCode = statusCode;
    }
}

export const asyncErrorHandler = (fn: Function) =>
        (req: Request, res: Response, next: NextFunction) => 
            Promise.resolve(fn(req, res, next)).catch(next);
            


