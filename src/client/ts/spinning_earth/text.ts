import { lightPos, camMat } from "./camera";
import { linAlg } from "./math";
import { entityCount, particleCount } from "./world";

export function renderText(d2: CanvasRenderingContext2D, deltaTime: number, hits: string[]) {
    const width = d2.canvas.clientWidth;
    const height = d2.canvas.clientHeight;
    const lineHeight = Math.min(width, height) / 40;
    d2.clearRect(0, 0, width, height);
    d2.font = `bold ${lineHeight}px monospace `;
    d2.fillStyle = "#ffffff";
    let controlText = [
        "controls:",
        "  camera move  : A D / W S / Space C",
        "  roll         : Q E",
        "  move light   : hold shift + (A D / W S / Space C)",
        "light:",
        "  " + lightPos.data.slice(0, 3),
        "character:",
        "  " + camMat.t.data.slice(0, 3),
        "dT:",
        "  " + deltaTime + "ms",
        "entities:",
        "  " + entityCount(),
        "particles:",
        "  " + particleCount(),
        "linalg:",
        "  " + linAlg.bufferUsage(),
        "  " + linAlg.iteratorUsage(),
        "hits:",
        ...hits
    ];
    for (let i = 0; i < controlText.length; i++)
        d2.fillText(controlText[i]!, 0, (i + 1) * lineHeight);
}

