import { goHome } from "../base";
import { camMat } from "./camera";
import { Meteorite } from "./entities";
import { linAlg, vec4 } from "./math";
import { setRender } from "./spinning-earth";
import { earth, sun } from "./world";

const _pressed = new Map<string, boolean>();
const _mouse: [number, number] = [0, 0];

interface Listeners {
    onKeyDown: (event: KeyboardEvent) => void,
    onKeyUp: (event: KeyboardEvent) => void,
    onMouseMove: (event: MouseEvent) => void,
    onClick: (event: MouseEvent) => void
}
let _listeners: Listeners | undefined;

export function initInput(canvas: HTMLCanvasElement): void {
    _listeners = {
        onKeyDown: (event) => {
            _pressed.set(event.code, true);
        },
        onKeyUp: (event) => {
            _pressed.set(event.code, false);
        },
        onMouseMove: (event) => {
            _mouse[0] = -event.movementX / canvas.width * 3 * Math.PI;
            _mouse[1] = -event.movementY / canvas.height * 3 * Math.PI;
        },
        onClick: (event) => {
            /*if (event.button == 0) {
                if (!document.pointerLockElement) {
                    canvas.requestPointerLock();
                } else if (camMat.C != undefined) {
                    const dir = linAlg.createVector(4, [-camMat.C.data[8], -camMat.C.data[9], -camMat.C.data[10], 0]);
                    const pos = camMat.t;
                    const [orbit, radius] = createOrbit(dir, pos);
                    addEntity(new Meteorite(orbit, radius, camMat.t, ["", "", "", "2023-Dec-23 20:28", "", "0", "", "0"]));
                }
            } else */if (event.button == 0) {
                if (!document.pointerLockElement)
                    canvas.requestPointerLock();
                else {
                    Meteorite.updateMarked();
                    const C = camMat.C!;
                    const dir = linAlg.createVector(3, [C.data[8], C.data[9], C.data[10]]);
                    const ray = linAlg.createZeroVector(3).loadMatrix(sun().pos);
                    const h = ray.dot(ray) / dir.dot(ray);
                    const diff = dir.scale(h).subL(ray).norm();
                    if (diff < 2) {
                        document.exitPointerLock();
                        setRender(false);
                        stopInput();
                        goHome();
                    }
                }
            }
        }
    };
    document.addEventListener("keydown", _listeners.onKeyDown);
    document.addEventListener("keyup", _listeners.onKeyUp);
    document.addEventListener("mousemove", _listeners.onMouseMove);
    document.addEventListener("click", _listeners.onClick);
}

export function stopInput(): void {
    if (_listeners == undefined)
        return;
    document.removeEventListener("keydown", _listeners.onKeyDown);
    document.removeEventListener("keyup", _listeners.onKeyUp);
    document.removeEventListener("mousemove", _listeners.onMouseMove);
    document.removeEventListener("click", _listeners.onClick);
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
    DETACHED,
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
