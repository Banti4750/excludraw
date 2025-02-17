import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import {PrismaClient} from '../../db/node_modules/@prisma/client/default';
import jwt from 'jsonwebtoken'
import { JWT_SECRET } from './config';
import { middleware } from './midleware';
// import { Stack } from './stack';

const app = express();
const prisma= new PrismaClient();
app.use(express.json());
app.use(cors());

app.post('/signup', async (req, res) => {
    const { email, password, name } = req.body;

    try {
        if (!email || !password || !name) {
            res.status(400).send({ message: "Input invalid" });
            return
        }

        const existingUser = await prisma.user.findFirst({
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
        const hashPassword = await bcrypt.hash(password, 10); // Corrected hash usage
        await prisma.user.create({
            data: {
                email,
                password: hashPassword,
                name
            },
        });

         res.status(201).send({ message: "Signup successful" });
    } catch (e) {
        console.error(e); // Log actual error for debugging
         res.status(500).send({ message: "Internal server error" });
    }
});

app.post('/signin', async (req, res) => {
    const { email, password } = req.body;

    try {
        if (!email || !password) {
             res.status(400).send({ message: "Input invalid" });
             return
        }

        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
           res.status(404).send({ message: "User does not exist" });
           return
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
             res.status(401).send({ message: "Invalid email or password" });
             return
        }

        const token = jwt.sign({ userId: user.id }, JWT_SECRET);

         res.status(200).send({
            message: "Login successful",
            token
        });

    } catch (e) {
        console.error(e);
         res.status(500).send({ message: "Internal server error" });
         return
    }
});

//@ts-ignore
app.post('/room' ,middleware ,  async(req , res)=>{
    const slug = req.body.slug;
      //@ts-ignore
    const userId = req.userId;
    try{
        if(!slug){
            res.status(400).send({ message: "Input invalid" });
            return;
        }

        const room = await prisma.room.create({
            data:{
                slug:slug,
                adminId:userId
            }
        })

        res.json({
            message:"Room Created",
            roomId: room.id
        })

    }catch(e){
        res.status(411).json({
            message: "Room already exists with this name"
        })
    }
})

app.get("/chats/:roomId", async (req, res) => {
    try {
        const roomId = Number(req.params.roomId);
        console.log(req.params.roomId);
        const messages = await prisma.chat.findMany({
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
        })
    } catch(e) {
        console.log(e);
        res.json({
            messages: []
        })
    }

})

app.get("/room/:slug", async (req, res) => {
    const slug = req.params.slug;
    const room = await prisma.room.findFirst({
        where: {
            slug
        }
    });

    res.json({
        room
    })
})
const undoStack = new Map<number, Stack<any>>();
const redoStack = new Map<number, Stack<any>>();

class Stack<T> {
    private items: T[] = [];
    push(item: T) { this.items.push(item); }
    pop(): T | undefined { return this.items.pop(); }
    isEmpty(): boolean { return this.items.length === 0; }
}

//@ts-ignore
app.post("/undo/:roomId", async (req, res) => {
    try {
        const roomId = Number(req.params.roomId);
        if (!undoStack.has(roomId)) undoStack.set(roomId, new Stack());
        if (!redoStack.has(roomId)) redoStack.set(roomId, new Stack());

        // Fetch last inserted chat message for this room
        const lastMessage = await prisma.chat.findFirst({
            where: { roomId },
            orderBy: { id: "desc" }
        });

        if (!lastMessage) return res.status(400).json({ message: "Nothing to undo" });

        // Delete from database
        await prisma.chat.delete({ where: { id: lastMessage.id } });

        // Store in undo stack
        undoStack.get(roomId)?.push(lastMessage);
        res.json({ message: "Undo successful", action: lastMessage });
    } catch (error) {
        //@ts-ignore
        res.status(500).json({ error: error.message });
    }
});

// Redo operation
//@ts-ignore
app.post("/redo/:roomId", async (req, res) => {
    try {
        const roomId = Number(req.params.roomId);
        if (!undoStack.has(roomId) || undoStack.get(roomId)?.isEmpty())
            return res.status(400).json({ message: "Nothing to redo" });

        const lastUndoneMessage = undoStack.get(roomId)?.pop();
        if (!lastUndoneMessage) return res.status(400).json({ message: "No messages to redo" });

        // Insert back into database
        const restoredMessage = await prisma.chat.create({
            data: {
                roomId: lastUndoneMessage.roomId,
                message: lastUndoneMessage.message,
                userId: lastUndoneMessage.userId,
            }
        });

        // Move to redo stack
        redoStack.get(roomId)?.push(restoredMessage);
        res.json({ message: "Redo successful", action: restoredMessage });
    } catch (error) {
        //@ts-ignore
        res.status(500).json({ error: error.message });
    }
});
app.listen(3001 , ()=>{
    console.log("server listenting at port 3001")
})




