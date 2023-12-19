import { ComposedRTSMatrix } from "./composed-matrices";
import { linAlg, mat4, vec4 } from "./math";
import { CROSSHAIR_MESH, DISK_MESH, INVERSE_TRIANGLE_MESH, Mesh, SPHERE_MESH, SQUARE_MESH, STAR_MESH, TRIANGLE_MESH } from "./meshes";

export class Model {
    public readonly mesh: Mesh;
    public readonly matrix: mat4;
    public readonly normal: mat4;

    public constructor(mesh: Mesh, r: vec4 = linAlg.createZeroMatrix(4, 1), t: vec4 = linAlg.createVector(4, [0, 0, 0, 1]), s: vec4 = linAlg.createOnesMatrix(4, 1)) {
        this.mesh = mesh;
        const com = new ComposedRTSMatrix(r, t, s);
        this.matrix = com.composed();
        this.normal = com.inverted().transposed();
    }

    public render(gl: WebGL2RenderingContext, shader: WebGLProgram, P: mat4, V: mat4, O: mat4, On?: mat4): void {
        const M = this.matrix;
        linAlg.mmulL(O, M);
        const uModelMatrix = gl.getUniformLocation(shader, 'uModelMatrix');
        gl.uniformMatrix4fv(uModelMatrix, false, new Float32Array(O.data));
        if (On != undefined) {
            const Mn = this.normal;
            linAlg.mmulL(On, Mn);
            const uModelNormalMatrix = gl.getUniformLocation(shader, 'uModelNormalMatrix');
            gl.uniformMatrix4fv(uModelNormalMatrix, false, new Float32Array(On.data));
        }
        linAlg.mmulR(P, linAlg.mmulR(V, O));
        const uPerspectiveMatrix = gl.getUniformLocation(shader, 'uPerspectiveMatrix');
        gl.uniformMatrix4fv(uPerspectiveMatrix, false, new Float32Array(O.data));
        this.mesh.render(gl, shader);
    }
}

export const EARTH_MODEL = new Model(SPHERE_MESH,
    linAlg.createVector(4, [-Math.PI/2, -Math.PI/5.7, -Math.PI/10, 0]),
    linAlg.createVector(4, [0, 0, 0, 1]),
    linAlg.createVector(4, [5, 5, 5, 1])
);
export const METEORITE_MODEL = new Model(SPHERE_MESH,
    linAlg.createVector(4, [0, 0, 0, 0]),
    linAlg.createVector(4, [0, 0, 0, 1]),
    linAlg.createVector(4, [0.5, 0.5, 0.5, 1])
);
export const CROSSHAIR_MODEL = new Model(CROSSHAIR_MESH, linAlg.createZeroMatrix(4, 1), linAlg.createVector(4, [0, 0, 0, 1]), linAlg.createVector(4, [0.001, 0.001, 0.001, 1]));
export const FIRE_MODEL = new Model(TRIANGLE_MESH, linAlg.createZeroMatrix(4, 1), linAlg.createVector(4, [0, 0, 0, 1]), linAlg.createVector(4, [0.1, 0.1, 0.1, 1]));
export const STAR_MODEL = new Model(STAR_MESH, linAlg.createZeroMatrix(4, 1), linAlg.createVector(4, [0, 0, 0, 1]), linAlg.createVector(4, [0.3, 0.3, 0.3, 1]));
export const PIN_MODEL = new Model(INVERSE_TRIANGLE_MESH, linAlg.createZeroMatrix(4, 1), linAlg.createVector(4, [0, 0, 0, 1]), linAlg.createVector(4, [0.5, 0.5, 0.5, 1]));
export const SQUARE_MODEL = new Model(SQUARE_MESH, linAlg.createZeroMatrix(4, 1), linAlg.createVector(4, [0, 0, 0, 1]), linAlg.createVector(4, [5, 5, 5, 1]));
export const BACKGROUND_MODEL = new Model(SPHERE_MESH);
export const FIREBALL_MODEL = new Model(DISK_MESH);