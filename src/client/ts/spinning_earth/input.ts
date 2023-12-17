import { camMat } from "./camera";
import { Meteorite } from "./entities";
import { linAlg, vec4 } from "./math";
import { createOrbit } from "./util";
import { addEntity, earth } from "./world";

const _pressed = new Map<string, boolean>();
const _mouse: [number, number] = [0, 0];

export function initKeys(canvas: HTMLCanvasElement): void {
    document.addEventListener("keydown", (event) => {
        _pressed.set(event.code, true);
    });
    document.addEventListener("keyup", (event) => {
        _pressed.set(event.code, false);
    });
    document.addEventListener("mousemove", (event) => {
        _mouse[0] = -event.movementX / canvas.width * 3 * Math.PI;
        _mouse[1] = -event.movementY / canvas.height * 3 * Math.PI;
    });
    document.addEventListener("click", (event) => {
        if (event.button == 0) {
            if (!document.pointerLockElement) {
                canvas.requestPointerLock();
            } else if (camMat.C != undefined) {
                const dir = linAlg.createVector(4, [-camMat.C.data[8], -camMat.C.data[9], -camMat.C.data[10], 0]);
                const pos = camMat.t;
                const [orbit, radius] = createOrbit(dir, pos);
                addEntity(new Meteorite(orbit, radius, camMat.t, ["", "", "", "2023-Dec-23 20:28", "", "0", "", "0"]));
            }
        } else if (event.button == 2) {
            console.log("lol");
            Meteorite.updateMarked();
        }
    });
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

export enum MovementType {
    LOCKED,
    ROTATING,
    FREE,
    TRACKING
}
let _movement = MovementType.LOCKED;
let _switchedLock = false;
export function movementType(): MovementType {
    if (_pressed.get("KeyX")) {
        if (!_switchedLock) {
            _switchedLock = true;
            _movement = (_movement + 1) % 4;
            if (_movement == MovementType.LOCKED) {
                const earthPos = earth()?.orientation.t;
                if (earthPos != undefined)
                    camMat.lock(earthPos);
            }
        }
    } else
        _switchedLock = false;
    return _movement;
}
