import { Meteorite } from "./entities";
import { movementType } from "./input";

let _lastFpsTime = 0;
let _lastFpsValue = "";
let _deltaTimeSum = 0;
let _deltaTimeFilter = 0;
export function renderText(d2: CanvasRenderingContext2D, deltaTime: number) {
    const width = d2.canvas.clientWidth;
    const height = d2.canvas.clientHeight;
    const lineHeight = Math.min(width, height) / 20;
    d2.clearRect(0, 0, width, height);
    d2.font = `bold ${lineHeight}px monospace `;
    d2.fillStyle = "#ffffff";
    /*let controlText = [
        "controls:",
        "  camera move  : A D / W S / Space C",
        "  roll         : Q E",
        "  move light   : hold shift + (A D / W S / Space C)",
        "light:",
        "  " + lightDir.data,
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
        "hit:",
        ...(hit == undefined ? ["  none"] : [
            "  " + hit.name,
            "  " + hit.date,
            "  " + hit.dist,
            "  " + hit.vel
        ]),
        "movement type:",
        "  " + movementType()
    ];*/
    const marked = Meteorite.marked() ?? Meteorite.tracked();
    const now = new Date().getTime();
    _deltaTimeSum += deltaTime - _deltaTimeFilter;
    _deltaTimeFilter = _deltaTimeSum / 100;
    if (now - _lastFpsTime > 1000) {
        _lastFpsTime = now;
        _lastFpsValue = (1000/_deltaTimeFilter).toFixed(0)
    }
    let text = [
        "Controls:",
        "  Move:                 A D / W S / Space C",
        "  Roll:                 Q E",
        "  Select Asteroid:      Hover",
        "  Mark Asteroid:        Left Click",
        "  Switch Movement Type: X",
        "Average FPS:",
        "  " + _lastFpsValue,
        "Selected Near Earth Object:",
        ...(marked == undefined ? ["  none"] : [
            "  Name:                  " + marked.name,
            "  Closest Approach Date: " + marked.date,
            "  Distance:              " + marked.dist,
            "  Velocity:              " + marked.vel
        ]),
        "Movement Type:",
        "  " + ["Locked", "Detached", "Free", "Tracking"][movementType()]
    ];
    for (let i = 0; i < text.length; i++)
        d2.fillText(text[i]!, 0, (i + 1) * lineHeight);
}

