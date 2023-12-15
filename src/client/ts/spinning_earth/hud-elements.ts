import { mat4, linAlg, vec2, vec4 } from "./math";
import { Model } from "./models";
import { orthographicDimensions } from "./util";

export class HUDElement {
    private static readonly _identity = linAlg.createIdentityMatrix(4);

    private readonly _model: Model;
    private readonly _pos: vec4;

    public constructor(model: Model, pos: vec2) {
        this._model = model;
        this._pos = linAlg.createVector(4, [pos.data[0], pos.data[1], -1, 1]);
    }

    public render(gl: WebGL2RenderingContext, shader: WebGLProgram, P: mat4) {
        const pos = orthographicDimensions(P);
        this._pos.mulR(pos);
        const O = linAlg.Affine.translate(linAlg.createIdentityMatrix(4), pos);
        this._model.render(gl, shader, P, HUDElement._identity, O);
    }
}