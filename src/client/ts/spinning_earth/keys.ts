import { linAlg, vec4 } from "./math";

const _pressed = new Map<string, boolean>();
const _mouse: [number, number] = [0, 0];

export function initKeys(canvas: HTMLCanvasElement): void {
    document.addEventListener("keydown", (event) => {
    _pressed.set(event.code, true);
    })
    document.addEventListener("keyup", (event) => {
    _pressed.set(event.code, false);
    })
    document.addEventListener("mousemove", (event) => {
    _mouse[0] = -event.movementX / canvas.width * 3 * Math.PI;
    _mouse[1] = -event.movementY / canvas.height * 3 * Math.PI;
    })
}

export function keyOffset(): vec4 {
    return linAlg.createVector(4, [
        (_pressed.get("KeyD") ? 1 : 0) - (_pressed.get("KeyA") ? 1 : 0),
        (_pressed.get("Space") ? 1 : 0) - (_pressed.get("KeyC") ? 1 : 0),
        (_pressed.get("KeyS") ? 1 : 0) - (_pressed.get("KeyW") ? 1 : 0),
        0
    ]);
}

export function mouseX(): number {
    return _mouse[0]!;
}

export function mouseY(): number {
    return _mouse[1]!;
}

export function resetMouse(): void {
    _mouse[0] = 0;
    _mouse[1] = 0;
}

export function keyRoll(): number {
    return (_pressed.get("KeyQ") ? 1 : 0) - (_pressed.get("KeyE") ? 1 : 0);
}

export function isLightModifierPressed(): boolean {
    return _pressed.get("ShiftLeft") ?? false;
}