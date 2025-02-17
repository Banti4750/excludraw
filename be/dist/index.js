"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const default_1 = require("../../db/node_modules/@prisma/client/default");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("./config");
const midleware_1 = require("./midleware");
// import { Stack } from './stack';
const app = (0, express_1.default)();
const prisma = new default_1.PrismaClient();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.post('/signup', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password, name } = req.body;
    try {
        if (!email || !password || !name) {
            res.status(400).send({ message: "Input invalid" });
            return;
        }
        const existingUser = yield prisma.user.findFirst({
            where: {
                email: email
            }
        });
        if (existingUser) {
            res.status(403).send({
                message: "User already exists"
            });
            return;
        }
        const hashPassword = yield bcrypt_1.default.hash(password, 10); // Corrected hash usage
        yield prisma.user.create({
            data: {
                email,
                password: hashPassword,
                name
            },
        });
        res.status(201).send({ message: "Signup successful" });
    }
    catch (e) {
        console.error(e); // Log actual error for debugging
        res.status(500).send({ message: "Internal server error" });
    }
}));
app.post('/signin', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        if (!email || !password) {
            res.status(400).send({ message: "Input invalid" });
            return;
        }
        const user = yield prisma.user.findUnique({
            where: { email }
        });
        if (!user) {
            res.status(404).send({ message: "User does not exist" });
            return;
        }
        const isPasswordValid = yield bcrypt_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            res.status(401).send({ message: "Invalid email or password" });
            return;
        }
        const token = jsonwebtoken_1.default.sign({ userId: user.id }, config_1.JWT_SECRET);
        res.status(200).send({
            message: "Login successful",
            token
        });
    }
    catch (e) {
        console.error(e);
        res.status(500).send({ message: "Internal server error" });
        return;
    }
}));
//@ts-ignore
app.post('/room', midleware_1.middleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const slug = req.body.slug;
    //@ts-ignore
    const userId = req.userId;
    try {
        if (!slug) {
            res.status(400).send({ message: "Input invalid" });
            return;
        }
        const room = yield prisma.room.create({
            data: {
                slug: slug,
                adminId: userId
            }
        });
        res.json({
            message: "Room Created",
            roomId: room.id
        });
    }
    catch (e) {
        res.status(411).json({
            message: "Room already exists with this name"
        });
    }
}));
app.get("/chats/:roomId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const roomId = Number(req.params.roomId);
        console.log(req.params.roomId);
        const messages = yield prisma.chat.findMany({
            where: {
                roomId: roomId
            },
            orderBy: {
                id: "desc"
            },
            take: 1000
        });
        res.json({
            messages
        });
    }
    catch (e) {
        console.log(e);
        res.json({
            messages: []
        });
    }
}));
app.get("/room/:slug", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const slug = req.params.slug;
    const room = yield prisma.room.findFirst({
        where: {
            slug
        }
    });
    res.json({
        room
    });
}));
const undoStack = new Map();
const redoStack = new Map();
class Stack {
    constructor() {
        this.items = [];
    }
    push(item) { this.items.push(item); }
    pop() { return this.items.pop(); }
    isEmpty() { return this.items.length === 0; }
}
//@ts-ignore
app.post("/undo/:roomId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const roomId = Number(req.params.roomId);
        if (!undoStack.has(roomId))
            undoStack.set(roomId, new Stack());
        if (!redoStack.has(roomId))
            redoStack.set(roomId, new Stack());
        // Fetch last inserted chat message for this room
        const lastMessage = yield prisma.chat.findFirst({
            where: { roomId },
            orderBy: { id: "desc" }
        });
        if (!lastMessage)
            return res.status(400).json({ message: "Nothing to undo" });
        // Delete from database
        yield prisma.chat.delete({ where: { id: lastMessage.id } });
        // Store in undo stack
        (_a = undoStack.get(roomId)) === null || _a === void 0 ? void 0 : _a.push(lastMessage);
        res.json({ message: "Undo successful", action: lastMessage });
    }
    catch (error) {
        //@ts-ignore
        res.status(500).json({ error: error.message });
    }
}));
// Redo operation
//@ts-ignore
app.post("/redo/:roomId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const roomId = Number(req.params.roomId);
        if (!undoStack.has(roomId) || ((_a = undoStack.get(roomId)) === null || _a === void 0 ? void 0 : _a.isEmpty()))
            return res.status(400).json({ message: "Nothing to redo" });
        const lastUndoneMessage = (_b = undoStack.get(roomId)) === null || _b === void 0 ? void 0 : _b.pop();
        if (!lastUndoneMessage)
            return res.status(400).json({ message: "No messages to redo" });
        // Insert back into database
        const restoredMessage = yield prisma.chat.create({
            data: {
                roomId: lastUndoneMessage.roomId,
                message: lastUndoneMessage.message,
                userId: lastUndoneMessage.userId,
            }
        });
        // Move to redo stack
        (_c = redoStack.get(roomId)) === null || _c === void 0 ? void 0 : _c.push(restoredMessage);
        res.json({ message: "Redo successful", action: restoredMessage });
    }
    catch (error) {
        //@ts-ignore
        res.status(500).json({ error: error.message });
    }
}));
app.listen(3001, () => {
    console.log("server listenting at port 3001");
});
