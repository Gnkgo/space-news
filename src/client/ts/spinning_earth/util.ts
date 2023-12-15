import { SizedArray, MatrixDataLayout, Vector } from "../../../common/linalg";
import { mat4, linAlg, vec4 } from "./math";

const fieldOfView = 45. * Math.PI / 180.;
const zNear = 0.1;
const zFar = 100.0;

function createPerspectiveNO(fovy: number, aspect: number, near: number, far: number): mat4 {
    const out: SizedArray<16, number> = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    var f = 1.0 / Math.tan(fovy / 2);
    out[0] = f / aspect;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = f;
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[11] = -1;
    out[12] = 0;
    out[13] = 0;
    out[15] = 0;
    if (far != null && far !== Infinity) {
        var nf = 1 / (near - far);
        out[10] = (far + near) * nf;
        out[14] = 2 * far * near * nf;
    } else {
        out[10] = -1;
        out[14] = -2 * near;
    }
    return linAlg.createMatrix(4, 4, out, MatrixDataLayout.COL_MAJOR);
}

export function getPerspectiveNO(clientWidth: number, clientHeight: number): mat4 {
    const aspect = clientWidth / clientHeight;
    return createPerspectiveNO(fieldOfView, aspect, zNear, zFar);
}

function createOrthographicNO(left: number, right: number, bottom: number, top: number, near: number, far: number): mat4 {
    const out: SizedArray<16, number> = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    const lr = 1 / (left - right);
    const bt = 1 / (bottom - top);
    const nf = 1 / (near - far);
    out[0] = -2 * lr;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = -2 * bt;
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[10] = 2 * nf;
    out[11] = 0;
    out[12] = (left + right) * lr;
    out[13] = (top + bottom) * bt;
    out[14] = (far + near) * nf;
    out[15] = 1;
    return linAlg.createMatrix(4, 4, out, MatrixDataLayout.COL_MAJOR);
}

export function orthographicDimensions(O: mat4): vec4 {
    const width = 2 / O.data[0];
    const height = 2 / O.data[5];
    const nf = 2 / O.data[10];
    const near = nf * (1 + (O.data[14] - 1)/2);
    return linAlg.createVector(4, [width/2, height/2, near, 1]);
}

export function getOrthographicNO(clientWidth: number, clientHeight: number): mat4 {
    const aspect = clientWidth / clientHeight;
    const h = Math.tan(fieldOfView / 2) * 2*zNear;
    const w = aspect * h;
    console.log(w + ", " + h + "\r\n");
    const O = createOrthographicNO(-w/2, w/2, -h/2, h/2, zNear, zFar);
    console.log(O + "\r\n");
    return O;
}

/*function isPowerOf2(value: number) {
    return (value & (value - 1)) === 0;
}*/

export function initTexture(gl: WebGL2RenderingContext, url: string): WebGLTexture {
    const texture = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, texture);

    const level = 0;
    const internalFormat = gl.RGBA;
    const width = 1;
    const height = 1;
    const border = 0;
    const srcFormat = gl.RGBA;
    const srcType = gl.UNSIGNED_BYTE;
    const pixel = new Uint8Array([255, 255, 0, 255]); // opaque blue
    gl.texImage2D(
        gl.TEXTURE_2D,
        level,
        internalFormat,
        width,
        height,
        border,
        srcFormat,
        srcType,
        pixel,
    );
    const image = new Image();
    image.onload = () => {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(
            gl.TEXTURE_2D,
            level,
            internalFormat,
            srcFormat,
            srcType,
            image,
        );
        //if (isPowerOf2(image.width) && isPowerOf2(image.height))
        gl.generateMipmap(gl.TEXTURE_2D);
        /*else {
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        }*/
    };
    image.src = url;
    return texture;
}

export function getRandomVec4(r: number): vec4 {
    const inc = Math.acos(2*Math.random() - 1);
    const azi = Math.random() * 2*Math.PI;
    return latLongToVec4(inc, azi, r);
}

export function latLongToVec4(inc: number, azi: number, r: number = 1): vec4 {
    const sinInc = Math.sin(inc);
    const cosInc = Math.cos(inc);
    const sinAzi = Math.sin(azi);
    const cosAzi = Math.cos(azi);
    return linAlg.createVector(4, [
        r * sinInc * sinAzi,
        r * cosInc,
        r * sinInc * cosAzi,
        1 
    ]);
}

export function solveQuad(a: number, b: number, c: number): [number, number] {
    if (a == 0) {
        if (b == 0)
            return c == 0 ? [0, 0] : [Number.NaN, Number.NaN];
        const lin = -c / b;
        return [lin, lin];
    }
    let d = b * b - 4 * a * c;
    if (d < 0)
        return [Number.NaN, Number.NaN];
    d = Math.sqrt(d);
    let x1: number;
    if (b >= 0)
        x1 = (-b - d) / (2 * a);
    else
        x1 = (-b + d) / (2 * a);
    let x2: number;
    if (c == 0)
        x2 = 0;
    else
        x2 = c / (a * x1);
    if (x1 < x2)
        return [x1, x2];
    else
        return [x2, x1];
}

export function checkSphereCollision<N extends number>(pos: Vector<N, number>, dir: Vector<N, number>, r: number): boolean {
    const a = dir.dot(dir);
    const b = 2 * dir.dot(pos);
    const c = pos.dot(pos) - r*r;
    const sols = solveQuad(a, b, c);
    return !Number.isNaN(sols[0]);
}

export function resizeCanvasToDisplaySize(canvas: HTMLCanvasElement): boolean {
    const displayWidth  = canvas.clientWidth;
    const displayHeight = canvas.clientHeight;
    if (canvas.width != displayWidth || canvas.height != displayHeight) {
      canvas.width  = displayWidth;
      canvas.height = displayHeight;
      return true;
    }
    return false;
  }