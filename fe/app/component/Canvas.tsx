import { useEffect, useRef, useState } from "react";
import { IconButton } from "./IconButton";
import { Pencil, RectangleHorizontalIcon, Circle, Type, Undo, Redo } from "lucide-react";
import { Game } from "../draw/Game";
import axios from "axios";
import { getExistingShapes } from "../draw/http";

export type Tool = "circle" | "rect" | "pencil" | "text";

export function Canvas({
    roomId,
    socket
}: {
    socket: WebSocket;
    roomId: string;
}) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [game, setGame] = useState<Game | null>(null);
    const [selectedTool, setSelectedTool] = useState<Tool>("circle");

    useEffect(() => {
        game?.setTool(selectedTool);
    }, [selectedTool, game]);

    useEffect(() => {
        async function loadShapes() {
            try {
                const shapes = await getExistingShapes(roomId);
                game?.loadShapes(shapes); // Assuming Game class has a loadShapes() method
            } catch (error) {
                console.error("Failed to load shapes:", error);
            }
        }

        function handleResize() {
            if (canvasRef.current && containerRef.current) {
                canvasRef.current.width = containerRef.current.clientWidth;
                canvasRef.current.height = containerRef.current.clientHeight;
                game?.clearCanvas(); // Redraw after resize
                loadShapes(); // Reload shapes after resizing
            }
        }

        if (canvasRef.current) {
            const g = new Game(canvasRef.current, roomId, socket);
            setGame(g);
            handleResize(); // Initial size setup

            window.addEventListener("resize", handleResize);

            return () => {
                g.destroy();
                window.removeEventListener("resize", handleResize);
            };
        }
    }, [roomId, socket]);

    async function handleUndoRedo(action: "undo" | "redo") {
        try {
            const response = await axios.post(`http://localhost:3001/${action}/${roomId}`);
            if (response.status === 200) {
                const updatedShapes = response.data.shapes;
                await game?.loadShapes(updatedShapes); // ✅ This will work now
            }
            else {
                alert("done")
            }
        } catch (error) {
            console.error(`${action.toUpperCase()} failed`, error);
        }
    }


    return (
        <div ref={containerRef} className="relative h-screen w-full overflow-hidden bg-black">
            <canvas ref={canvasRef} className="absolute top-0 left-0" />
            <Topbar
                setSelectedTool={setSelectedTool}
                selectedTool={selectedTool}
                roomId={roomId}
                handleUndoRedo={handleUndoRedo}
            />
        </div>
    );
}

function Topbar({
    selectedTool,
    setSelectedTool,
    roomId,
    handleUndoRedo
}: {
    selectedTool: string;
    setSelectedTool: (s: string) => void;
    roomId: string;
    handleUndoRedo: (action: "undo" | "redo") => void;
}) {
    return (
        <>
            <div className="fixed top-4 left-4 z-10 bg-gray-800 rounded-lg p-2 shadow-lg">
                <div className="flex gap-2">
                    <IconButton
                        onClick={() => setSelectedTool("pencil")}
                        activated={selectedTool === "pencil"}
                        icon={<Pencil className="w-5 h-5" />}
                        tooltip="Pencil Tool"
                    />
                    <IconButton
                        onClick={() => setSelectedTool("rect")}
                        activated={selectedTool === "rect"}
                        icon={<RectangleHorizontalIcon className="w-5 h-5" />}
                        tooltip="Rectangle Tool"
                    />
                    <IconButton
                        onClick={() => setSelectedTool("circle")}
                        activated={selectedTool === "circle"}
                        icon={<Circle className="w-5 h-5" />}
                        tooltip="Circle Tool"
                    />
                    <IconButton
                        onClick={() => setSelectedTool("text")}
                        activated={selectedTool === "text"}
                        icon={<Type className="w-5 h-5" />}
                        tooltip="Text Tool"
                    />
                </div>
            </div>

            {/* Undo / Redo Buttons */}
            <div className="fixed bottom-4 left-16 z-10 bg-gray-800 rounded-lg p-2 shadow-lg flex gap-4">
                <button
                    className="p-2 rounded-lg bg-slate-600 flex items-center gap-2"
                    onClick={() => handleUndoRedo("undo")}
                >
                    <Undo className="w-4 h-4" />
                    Undo
                </button>
                <button
                    className="p-2 rounded-lg bg-slate-600 flex items-center gap-2"
                    onClick={() => handleUndoRedo("redo")}
                >
                    <Redo className="w-4 h-4" />
                    Redo
                </button>
            </div>
        </>
    );
}

// IconButton component with added tooltip
interface IconButtonProps {
    icon: React.ReactNode;
    onClick: () => void;
    activated: boolean;
    tooltip?: string;
}

export function IconButton({
    icon,
    onClick,
    activated,
    tooltip
}: IconButtonProps) {
    return (
        <>
            <div className="flex justify-center items-center w-full">
                <button
                    onClick={onClick}
                    className={`p-2 rounded-lg transition-colors ${activated
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                    title={tooltip}
                >
                    {icon}
                </button>
            </div>

        </>

    );
}