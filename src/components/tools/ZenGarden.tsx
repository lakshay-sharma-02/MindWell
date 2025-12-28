import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Eraser, Move, Circle } from "lucide-react";

interface Stone {
    id: number;
    x: number;
    y: number;
}

export const ZenGarden = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [tool, setTool] = useState<"rake" | "stone">("rake");
    const [stones, setStones] = useState<Stone[]>([]);
    const [isDrawing, setIsDrawing] = useState(false);

    // Initialize/Reset Sand
    const initSand = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Set dimensions
        const parent = canvas.parentElement;
        if (parent) {
            canvas.width = parent.clientWidth;
            canvas.height = 500;
        }

        // Fill with sand color
        ctx.fillStyle = "#f3e5ab"; // Light beige sand
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Add subtle noise/texture
        for (let i = 0; i < 5000; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            ctx.fillStyle = Math.random() > 0.5 ? "#ebdcb2" : "#faedc2";
            ctx.fillRect(x, y, 2, 2);
        }

        setStones([]);
    };

    useEffect(() => {
        initSand();
        window.addEventListener("resize", initSand);
        return () => window.removeEventListener("resize", initSand);
    }, []);

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        if (tool === "stone") {
            addStone(e);
            return;
        }
        setIsDrawing(true);
        draw(e);
    };

    const stopDrawing = () => {
        setIsDrawing(false);
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext("2d");
            ctx?.beginPath(); // Reset path to avoid connecting separate lines
        }
    };

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing && tool !== "stone") return;
        if (tool !== "rake") return;

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Get coordinates
        const rect = canvas.getBoundingClientRect();
        let x, y;

        if ('touches' in e) {
            x = e.touches[0].clientX - rect.left;
            y = e.touches[0].clientY - rect.top;
        } else {
            x = (e as React.MouseEvent).clientX - rect.left;
            y = (e as React.MouseEvent).clientY - rect.top;
        }

        ctx.lineWidth = 20;
        ctx.lineCap = "round";
        ctx.strokeStyle = "#e0cda7"; // Darker sand for the groove

        // Shadow effect for depth
        ctx.shadowBlur = 2;
        ctx.shadowColor = "rgba(0,0,0,0.1)";

        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, y);
    };

    const addStone = (e: React.MouseEvent | React.TouchEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();

        let x, y;
        if ('touches' in e) {
            x = e.touches[0].clientX - rect.left;
            y = e.touches[0].clientY - rect.top;
        } else {
            x = (e as React.MouseEvent).clientX - rect.left;
            y = (e as React.MouseEvent).clientY - rect.top;
        }

        setStones([...stones, { id: Date.now(), x, y }]);
    };

    return (
        <Card className="relative overflow-hidden border-none shadow-xl bg-[#f3e5ab]/20">
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex gap-2 bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-sm">
                <Button
                    variant={tool === "rake" ? "default" : "ghost"}
                    size="sm"
                    className="rounded-full"
                    onClick={() => setTool("rake")}
                >
                    <Move className="w-4 h-4 mr-2" />
                    Rake
                </Button>
                <Button
                    variant={tool === "stone" ? "default" : "ghost"}
                    size="sm"
                    className="rounded-full"
                    onClick={() => setTool("stone")}
                >
                    <Circle className="w-4 h-4 mr-2" />
                    Place Stone
                </Button>
                <div className="w-px h-8 bg-border mx-1" />
                <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full text-muted-foreground hover:text-destructive"
                    onClick={initSand}
                    title="Clear Garden"
                >
                    <Eraser className="w-4 h-4" />
                </Button>
            </div>

            <div className="relative w-full h-[500px] cursor-crosshair touch-none">
                <canvas
                    ref={canvasRef}
                    onMouseDown={startDrawing}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onMouseMove={draw}
                    onTouchStart={startDrawing}
                    onTouchEnd={stopDrawing}
                    onTouchMove={draw}
                    className="w-full h-full block"
                />

                {/* Render Stones */}
                {stones.map((stone) => (
                    <div
                        key={stone.id}
                        className="absolute w-8 h-8 md:w-12 md:h-12 rounded-full bg-stone-700 shadow-2xl"
                        style={{
                            left: stone.x,
                            top: stone.y,
                            transform: "translate(-50%, -50%)",
                            boxShadow: "5px 5px 15px rgba(0,0,0,0.3), inset -2px -2px 5px rgba(0,0,0,0.5)"
                        }}
                    >
                        {/* Highlights on stone */}
                        <div className="absolute top-2 left-3 w-3 h-2 bg-white/20 rounded-full rotate-[-45deg] blur-[1px]" />
                    </div>
                ))}
            </div>

            <div className="p-4 text-center text-sm text-stone-600 bg-[#f3e5ab]">
                Find peace in the pattern. Take a deep breath and design your sanctuary.
            </div>
        </Card>
    );
};
