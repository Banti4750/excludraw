import { NextFunction, Request, Response } from "express";
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from "./config";


export function middleware(req:Request , res:Response , next:NextFunction){
    const authHeader = req.headers["authorization"];

    if (!authHeader ) {
        return res.status(401).json({ error: "Unauthorized: No token provided" });
    }
    const token = authHeader.split(" ")[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET) ;

        // @ts-ignore
        req.userId = decoded.userId;
        next();
    } catch (error) {
        return res.status(403).json({ error: "Forbidden: Invalid token" });
    }
}


