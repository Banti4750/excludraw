import { Tool } from "../component/Canvas";
//@ts-ignore
import { getExistingShapes } from "./http";

type Shape = {
    type: "rect";
    x: number;
    y: number;
    width: number;
    height: number;
    text?: string;
    isSelected?: boolean;
} | {
    type: "circle";
    centerX: number;
    centerY: number;
    radius: number;
} | {
    type: "pencil";
    points: Array<{x: number, y: number}>;
} | {
    type: "text";
    x: number;
    y: number;
    content: string;
}

export class Game {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private existingShapes: Shape[];
    private roomId: string;
    private clicked: boolean;
    private startX: number;
    private startY: number;
    private selectedTool: Tool;
    private currentPoints: Array<{x: number, y: number}>;
    private selectedShape: Shape | null;
    private textInput: HTMLTextAreaElement | null;

    socket: WebSocket;

    constructor(canvas: HTMLCanvasElement, roomId: string, socket: WebSocket) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d")!;
        this.existingShapes = [];
        this.roomId = roomId;
        this.socket = socket;
        this.clicked = false;
        this.startX = 0;
        this.startY = 0;
        this.selectedTool = "circle";
        this.currentPoints = [];
        this.selectedShape = null;
        this.textInput = null;

        this.init();
        this.initHandlers();
        this.initMouseHandlers();
        this.initKeyboardHandlers();
    }

    destroy() {
        this.canvas.removeEventListener("mousedown", this.mouseDownHandler);
        this.canvas.removeEventListener("mouseup", this.mouseUpHandler);
        this.canvas.removeEventListener("mousemove", this.mouseMoveHandler);
        this.removeTextInput();
    }

    private createTextInput(x: number, y: number) {
        this.removeTextInput(); // Remove any existing text input

        const textArea = document.createElement('textarea');
        textArea.style.position = 'absolute';
        textArea.style.left = `${x}px`;
        textArea.style.top = `${y}px`;
        textArea.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        textArea.style.color = 'white';
        textArea.style.border = '1px solid white';
        textArea.style.padding = '4px';
        textArea.style.minWidth = '100px';
        textArea.style.minHeight = '20px';
        textArea.style.resize = 'none';
        textArea.style.outline = 'none';
        textArea.style.overflow = 'hidden';
        textArea.style.fontFamily = 'Arial';
        textArea.style.fontSize = '14px';

        this.canvas.parentElement?.appendChild(textArea);
        textArea.focus();

        this.textInput = textArea;
        return textArea;
    }

    private removeTextInput() {
        if (this.textInput && this.textInput.parentElement) {
            this.textInput.parentElement.removeChild(this.textInput);
            this.textInput = null;
        }
    }

    private isPointInRect(x: number, y: number, rect: Shape & { type: "rect" }): boolean {
        return x >= rect.x &&
               x <= rect.x + rect.width &&
               y >= rect.y &&
               y <= rect.y + rect.height;
    }

    private findSelectedShape(x: number, y: number): Shape | null {
        for (let i = this.existingShapes.length - 1; i >= 0; i--) {
            const shape = this.existingShapes[i];
            if (shape.type === "rect" && this.isPointInRect(x, y, shape)) {
                return shape;
            }
        }
        return null;
    }

    setTool(tool: Tool) {
        this.selectedTool = tool;
        this.removeTextInput();
    }

    async loadShapes(shapes: Shape[]) {
        this.existingShapes = await getExistingShapes(this.roomId);; // Store the updated shapes
        this.clearCanvas(); // Clear canvas before redrawing
    }


    async init() {
        this.existingShapes = await getExistingShapes(this.roomId);
        this.clearCanvas();
    }

    initHandlers() {
        this.socket.onmessage = (event) => {
            const message = JSON.parse(event.data);
            if (message.type === "chat") {
                const parsedShape = JSON.parse(message.message);
                this.existingShapes.push(parsedShape.shape);
                this.clearCanvas();
            }
        }
    }

    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = "rgba(0, 0, 0)";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.strokeStyle = "rgba(255, 255, 255)";
        this.ctx.lineWidth = 2;

        for (const shape of this.existingShapes) {
            if (shape.type === "rect") {
                this.ctx.strokeStyle = shape.isSelected ? "rgba(0, 255, 0)" : "rgba(255, 255, 255)";
                this.ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);

                if (shape.text) {
                    this.ctx.fillStyle = "rgba(255, 255, 255)";
                    this.ctx.font = "14px Arial";
                    this.ctx.textBaseline = "top";

                    // Word wrap text
                    const words = shape.text.split(' ');
                    let line = '';
                    let y = shape.y + 5;
                    const lineHeight = 20;
                    const maxWidth = shape.width - 10;

                    for (const word of words) {
                        const testLine = line + word + ' ';
                        const metrics = this.ctx.measureText(testLine);

                        if (metrics.width > maxWidth && line !== '') {
                            this.ctx.fillText(line, shape.x + 5, y);
                            line = word + ' ';
                            y += lineHeight;
                        } else {
                            line = testLine;
                        }
                    }
                    this.ctx.fillText(line, shape.x + 5, y);
                }
            }
            else if (shape.type === "circle") {
                this.ctx.strokeStyle = "rgba(255, 255, 255)";
                this.ctx.beginPath();
                this.ctx.arc(shape.centerX, shape.centerY, Math.abs(shape.radius), 0, Math.PI * 2);
                this.ctx.stroke();
                this.ctx.closePath();
            }
            else if (shape.type === "pencil") {
                this.ctx.strokeStyle = "rgba(255, 255, 255)";
                if (shape.points.length > 0) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(shape.points[0].x, shape.points[0].y);
                    for (let i = 1; i < shape.points.length; i++) {
                        this.ctx.lineTo(shape.points[i].x, shape.points[i].y);
                    }
                    this.ctx.stroke();
                    this.ctx.closePath();
                }
            }
        }
    }

    private getCanvasCoordinates(e: MouseEvent): {x: number, y: number} {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    }

    mouseDownHandler = (e: MouseEvent) => {
        const coords = this.getCanvasCoordinates(e);

        // Check if clicked on an existing rectangle
        const clickedShape = this.findSelectedShape(coords.x, coords.y);

        if (clickedShape && clickedShape.type === "rect") {
            // Deselect previous shape
            if (this.selectedShape && this.selectedShape.type === "rect") {
                this.selectedShape.isSelected = false;
            }

            // Select new shape
            this.selectedShape = clickedShape;
            clickedShape.isSelected = true;
            this.clearCanvas();

            // Create text input if double clicked
            if (e.detail === 2) {
                const textArea = this.createTextInput(
                    clickedShape.x + this.canvas.offsetLeft,
                    clickedShape.y + this.canvas.offsetTop
                );

                textArea.value = clickedShape.text || '';
                textArea.style.width = `${clickedShape.width}px`;
                textArea.style.height = `${clickedShape.height}px`;

                textArea.addEventListener('blur', () => {
                    if (clickedShape && clickedShape.type === "rect") {
                        clickedShape.text = textArea.value;
                        this.removeTextInput();
                        this.clearCanvas();

                        // Broadcast the updated shape
                        this.socket.send(JSON.stringify({
                            type: "chat",
                            message: JSON.stringify({ shape: clickedShape }),
                            roomId: this.roomId
                        }));
                    }
                });
            }
        } else {
            // Start drawing new shape
            this.clicked = true;
            this.startX = coords.x;
            this.startY = coords.y;

            if (this.selectedTool === "pencil") {
                this.currentPoints = [{x: this.startX, y: this.startY}];
            }

            // Deselect previous shape
            if (this.selectedShape && this.selectedShape.type === "rect") {
                this.selectedShape.isSelected = false;
                this.selectedShape = null;
                this.clearCanvas();
            }
        }
    }

    mouseUpHandler = (e: MouseEvent) => {
        if (!this.clicked) return;

        this.clicked = false;
        const coords = this.getCanvasCoordinates(e);
        let shape: Shape | null = null;

        if (this.selectedTool === "rect") {
            const width = coords.x - this.startX;
            const height = coords.y - this.startY;
            shape = {
                type: "rect",
                x: this.startX,
                y: this.startY,
                width,
                height,
                text: "",
                isSelected: false
            };
        }
        else if (this.selectedTool === "circle") {
            const width = coords.x - this.startX;
            const height = coords.y - this.startY;
            const radius = Math.sqrt(width * width + height * height) / 2;
            shape = {
                type: "circle",
                centerX: this.startX + width / 2,
                centerY: this.startY + height / 2,
                radius
            };
        }
        else if (this.selectedTool === "pencil" && this.currentPoints.length > 0) {
            shape = {
                type: "pencil",
                points: [...this.currentPoints]
            };
            this.currentPoints = [];
        }

        if (shape) {
            this.existingShapes.push(shape);
            this.socket.send(JSON.stringify({
                type: "chat",
                message: JSON.stringify({ shape }),
                roomId: this.roomId
            }));
            this.clearCanvas();
        }
    }

    mouseMoveHandler = (e: MouseEvent) => {
        if (!this.clicked) return;

        const coords = this.getCanvasCoordinates(e);
        this.clearCanvas();
        this.ctx.strokeStyle = "rgba(255, 255, 255)";

        if (this.selectedTool === "rect") {
            const width = coords.x - this.startX;
            const height = coords.y - this.startY;
            this.ctx.strokeRect(this.startX, this.startY, width, height);
        }
        else if (this.selectedTool === "circle") {
            const width = coords.x - this.startX;
            const height = coords.y - this.startY;
            const radius = Math.sqrt(width * width + height * height) / 2;
            const centerX = this.startX + width / 2;
            const centerY = this.startY + height / 2;

            this.ctx.beginPath();
            this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            this.ctx.stroke();
            this.ctx.closePath();
        }
        else if (this.selectedTool === "pencil") {
            this.currentPoints.push(coords);

            this.ctx.beginPath();
            this.ctx.moveTo(this.currentPoints[0].x, this.currentPoints[0].y);
            for (const point of this.currentPoints) {
                this.ctx.lineTo(point.x, point.y);
            }
            this.ctx.stroke();
            this.ctx.closePath();
        }
    }

    initMouseHandlers() {
        this.canvas.addEventListener("mousedown", this.mouseDownHandler);
        this.canvas.addEventListener("mouseup", this.mouseUpHandler);
        this.canvas.addEventListener("mousemove", this.mouseMoveHandler);
    }

    initKeyboardHandlers() {
        document.addEventListener('keydown', (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                this.removeTextInput();
                if (this.selectedShape && this.selectedShape.type === "rect") {
                    this.selectedShape.isSelected = false;
                    this.selectedShape = null;
                    this.clearCanvas();
                }
            }
        });
    }
}