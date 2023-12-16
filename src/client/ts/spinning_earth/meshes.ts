import { vec3, vec4, vec2, linAlg } from "./math";

const meshes: Mesh[] = [];
function addMesh(mesh: Mesh): Mesh {
    meshes.push(mesh);
    return mesh;
}

export function initMeshes(gl: WebGL2RenderingContext, ...shaders: WebGLProgram[]) {
    for (const m of meshes)
        m.init(gl, shaders);
}

export class Mesh {
    private readonly _indices: Uint16Array;
    private readonly _vertices: Float32Array;
    private readonly _vertexNormals: Float32Array;
    private readonly _vertexColors: Float32Array;
    private readonly _texCoords: Float32Array | undefined;
    private readonly _vaos: Map<WebGLProgram, WebGLVertexArrayObject | null>;

    public constructor(indices: vec3[], vertices: vec3[], vertexColors: vec4[], texCoords?: vec2[]) {
        this._indices = new Uint16Array(indices.flatMap(i => i.data));
        this._vertices = new Float32Array(vertices.flatMap(v => v.data));
        this._vertexNormals = new Float32Array(this._calcVertexNormals(indices, vertices));
        this._vertexColors = new Float32Array(vertexColors.flatMap(c => c.data));
        this._texCoords = texCoords == undefined ? undefined : new Float32Array(texCoords.flatMap(t => t.data));
        this._vaos = new Map();
    }

    private _calcVertexNormals(indices: vec3[], vertices: vec3[]): number[] {
        const vertexNormals = vertices.map(_v => linAlg.createVector(3, [0, 0, 0]));
        let i0: number, i1: number, i2: number;
        for (const index of indices) {
            const v0 = vertices[i0 = index.get(0, 0)]!;
            const v1 = vertices[i1 = index.get(1, 0)]!;
            const v2 = vertices[i2 = index.get(2, 0)]!;
            const a = v1.copy().subL(v0).normalize();
            const b = v2.copy().subL(v0).normalize();
            const w = Math.acos(a.dot(b));
            const n = linAlg.ThreeD.cross(a, b).normalize().scale(w);
            vertexNormals[i0]!.addL(n);
            vertexNormals[i1]!.addL(n);
            vertexNormals[i2]!.addL(n);
        }
        return vertexNormals.flatMap(n => n.normalize().data)
    }

    public init(gl: WebGL2RenderingContext, shaders: WebGLProgram[]): void {
        for (const shader of shaders) {
            const vao = gl.createVertexArray();
            gl.bindVertexArray(vao);
            let location: number;
            let buffer: WebGLBuffer | null;

            // Vertices
            location = gl.getAttribLocation(shader, "aVertexPosition");
            if (location != -1) {
                buffer = gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
                gl.bufferData(gl.ARRAY_BUFFER, this._vertices, gl.STATIC_DRAW);
                gl.vertexAttribPointer(location, 3, gl.FLOAT, false, 0, 0);
                gl.enableVertexAttribArray(location);
            }            

            // Vertex Normals
            location = gl.getAttribLocation(shader, "aVertexNormal");
            if (location != -1) {
                buffer = gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
                gl.bufferData(gl.ARRAY_BUFFER, this._vertexNormals, gl.STATIC_DRAW);
                gl.vertexAttribPointer(location, 3, gl.FLOAT, false, 0, 0);
                gl.enableVertexAttribArray(location);
            }

            // Vertex Colors
            location = gl.getAttribLocation(shader, "aVertexColor");
            if (location != -1) {
                buffer = gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
                gl.bufferData(gl.ARRAY_BUFFER, this._vertexColors, gl.STATIC_DRAW);
                gl.vertexAttribPointer(location, 4, gl.FLOAT, false, 0, 0);
                gl.enableVertexAttribArray(location);
            }

            // Texture
            if (this._texCoords != undefined) {
                location = gl.getAttribLocation(shader, "aTextureCoord");
                if (location != -1) {
                    buffer = gl.createBuffer();
                    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
                    gl.bufferData(gl.ARRAY_BUFFER, this._texCoords, gl.STATIC_DRAW);
                    gl.vertexAttribPointer(location, 2, gl.FLOAT, false, 0, 0);
                    gl.enableVertexAttribArray(location)
                }
            }

            // Faces (i.e, vertex indices for forming the triangles)
            buffer = gl.createBuffer();
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this._indices, gl.STATIC_DRAW);

            gl.bindVertexArray(null);
            this._vaos.set(shader, vao);
        }
    }

    public render(gl: WebGL2RenderingContext, shader: WebGLProgram): void {
        gl.bindVertexArray(this._vaos.get(shader) ?? null);
        gl.drawElements(gl.TRIANGLES, this._indices.length, gl.UNSIGNED_SHORT, 0);
        gl.bindVertexArray(null);
    }
}

export const CROSSHAIR_MESH = addMesh(new Mesh(
    [
        linAlg.createVector(3, [0, 3, 4]),
        linAlg.createVector(3, [1, 2, 5]),
        linAlg.createVector(3, [4, 7, 0]),
        linAlg.createVector(3, [5, 6, 1]),
    ],
    [
        linAlg.createVector(3, [1, 0.25, 0]),
        linAlg.createVector(3, [0.25, 1, 0]),
        linAlg.createVector(3, [-0.25, 1, 0]),
        linAlg.createVector(3, [-1, 0.25, 0]),
        linAlg.createVector(3, [-1, -0.25, 0]),
        linAlg.createVector(3, [-0.25, -1, 0]),
        linAlg.createVector(3, [0.25, -1, 0]),
        linAlg.createVector(3, [1, -0.25, 0])
    ],
    [
        linAlg.createVector(4, [1, 1, 1, 0.1]),
        linAlg.createVector(4, [1, 1, 1, 0.1]),
        linAlg.createVector(4, [1, 1, 1, 0.1]),
        linAlg.createVector(4, [1, 1, 1, 0.1]),
        linAlg.createVector(4, [1, 1, 1, 0.1]),
        linAlg.createVector(4, [1, 1, 1, 0.1]),
        linAlg.createVector(4, [1, 1, 1, 0.1]),
        linAlg.createVector(4, [1, 1, 1, 0.1])
    ]
));

const sqrt3Over2 = Math.sqrt(3) / 2;
export const TRIANGLE_MESH = addMesh(new Mesh(
    [
        linAlg.createVector(3, [0, 1, 2]),
        linAlg.createVector(3, [3, 4, 5])
    ],
    [
        linAlg.createVector(3, [0, 1, 0.01]),
        linAlg.createVector(3, [-sqrt3Over2, -0.5, 0.01]),
        linAlg.createVector(3, [sqrt3Over2, -0.5, 0.01]),
        linAlg.createVector(3, [0, 1, -0.01]),
        linAlg.createVector(3, [sqrt3Over2, -0.5, -0.01]),
        linAlg.createVector(3, [-sqrt3Over2, -0.5, -0.01])
    ],
    [
        linAlg.createVector(4, [1, 0.5, 0, 1]),
        linAlg.createVector(4, [1, 0.5, 0, 1]),
        linAlg.createVector(4, [1, 0.5, 0, 1]),
        linAlg.createVector(4, [1, 0.5, 0, 1]),
        linAlg.createVector(4, [1, 0.5, 0, 1]),
        linAlg.createVector(4, [1, 0.5, 0, 1])
    ]
));
export const INVERSE_TRIANGLE_MESH = addMesh(new Mesh(
    [
        linAlg.createVector(3, [0, 1, 2]),
        linAlg.createVector(3, [3, 4, 5])
    ],
    [
        linAlg.createVector(3, [0, -1, 0.01]),
        linAlg.createVector(3, [sqrt3Over2, 0.5, 0.01]),
        linAlg.createVector(3, [-sqrt3Over2, 0.5, 0.01]),
        linAlg.createVector(3, [0, -1, -0.01]),
        linAlg.createVector(3, [-sqrt3Over2, 0.5, -0.01]),
        linAlg.createVector(3, [sqrt3Over2, 0.5, -0.01])
    ],
    [
        linAlg.createVector(4, [1, 0, 0, 1]),
        linAlg.createVector(4, [1, 0, 0, 1]),
        linAlg.createVector(4, [1, 0, 0, 1]),
        linAlg.createVector(4, [1, 0, 0, 1]),
        linAlg.createVector(4, [1, 0, 0, 1]),
        linAlg.createVector(4, [1, 0, 0, 1])
    ]
));

export const STAR_MESH = addMesh(new Mesh(
    [
        linAlg.createVector(3, [0, 1, 2]),
        linAlg.createVector(3, [3, 4, 5]),
    ],
    [
        linAlg.createVector(3, [0, 1, 0]),
        linAlg.createVector(3, [-sqrt3Over2, -0.5, 0]),
        linAlg.createVector(3, [sqrt3Over2, -0.5, 0]),
        linAlg.createVector(3, [0, -1, 0]),
        linAlg.createVector(3, [sqrt3Over2, 0.5, 0]),
        linAlg.createVector(3, [-sqrt3Over2, 0.5, 0])
    ],
    [
        linAlg.createVector(4, [1, 1, 1, 1]),
        linAlg.createVector(4, [1, 1, 1, 1]),
        linAlg.createVector(4, [1, 1, 1, 1]),
        linAlg.createVector(4, [1, 1, 1, 1]),
        linAlg.createVector(4, [1, 1, 1, 1]),
        linAlg.createVector(4, [1, 1, 1, 1])
    ]
));

const sqrt2Over4 = Math.sqrt(2) / 4;
export const SQUARE_MESH = addMesh(new Mesh(
    [
        linAlg.createVector(3, [0, 1, 2]),
        linAlg.createVector(3, [2, 3, 0])
    ],
    [
        linAlg.createVector(3, [sqrt2Over4, sqrt2Over4, 0]),
        linAlg.createVector(3, [-sqrt2Over4, sqrt2Over4, 0]),
        linAlg.createVector(3, [-sqrt2Over4, -sqrt2Over4, 0]),
        linAlg.createVector(3, [sqrt2Over4, -sqrt2Over4, 0])
    ],
    [
        linAlg.createVector(4, [1, 1, 1, 1]),
        linAlg.createVector(4, [1, 1, 1, 1]),
        linAlg.createVector(4, [1, 1, 1, 1]),
        linAlg.createVector(4, [1, 1, 1, 1]),
    ],
    [
        linAlg.createVector(2, [1, 0]),
        linAlg.createVector(2, [0, 0]),
        linAlg.createVector(2, [0, 1]),
        linAlg.createVector(2, [1, 1])
    ]
));

export class Icosahedron extends Mesh {
    private constructor(indices: vec3[], vertices: vec3[], vertexColors: vec4[], texCoords: vec2[]) {
        super(indices, vertices, vertexColors, texCoords);
    }

    private static _computeVertices(radius: number): vec3[] {
        const H_ANGLE = Math.PI / 180 * 72;
        const V_ANGLE = Math.atan(1.0 / 2);
        const vertices = new Array<vec3>(12);
        let i1: number, i2: number;
        let z: number, xy: number;
        let hAngle1 = -Math.PI / 2 - H_ANGLE / 2;
        let hAngle2 = -Math.PI / 2;
        vertices[0] = linAlg.createVector(3, [0, 0, radius]);
        for (let i = 1; i <= 5; ++i) {
            i1 = i;
            i2 = i + 5;
            z = radius * Math.sin(V_ANGLE);
            xy = radius * Math.cos(V_ANGLE);
            vertices[i1] = linAlg.createVector(3, [xy * Math.cos(hAngle1), xy * Math.sin(hAngle1), z]);
            vertices[i2] = linAlg.createVector(3, [xy * Math.cos(hAngle2), xy * Math.sin(hAngle2), -z]);
            hAngle1 += H_ANGLE;
            hAngle2 += H_ANGLE;
        }
        vertices[11] = linAlg.createVector(3, [0, 0, -radius]);
        return vertices;
    }

    public static create(radius: number, subdivision: number): Icosahedron {
        const S_STEP = 186.0 / 2048;
        const T_STEP = 322.0 / 1024;

        const tmpVertices = this._computeVertices(radius);
        const indices: vec3[] = [];
        const vertices: vec3[] = [];
        const vertexColors: vec4[] = [];
        const texCoords: vec2[] = [];

        const red = linAlg.createVector(4, [0.5, 0, 0, 1]);
        const blue = linAlg.createVector(4, [0, 0, 0.5, 1]);

        let v0: vec3, v1: vec3, v2: vec3, v3: vec3, v4: vec3, v11: vec3;
        let t0: vec2, t1: vec2, t2: vec2, t3: vec2, t4: vec2, t11: vec2;
        let index = 0;

        v0 = tmpVertices[0]!;
        v11 = tmpVertices[11]!;
        for (let i = 1; i <= 5; ++i) {
            v1 = tmpVertices[i]!;
            if (i < 5)
                v2 = tmpVertices[i + 1]!;
            else
                v2 = tmpVertices[1]!;
            v3 = tmpVertices[i + 5]!;
            if ((i + 5) < 10)
                v4 = tmpVertices[i + 6]!;
            else
                v4 = tmpVertices[6]!;

            const epsilon = 0.000;
            t0 = linAlg.createVector(2, [(2 * i - 1) * S_STEP, epsilon]);
            t1 = linAlg.createVector(2, [(2 * i - 2) * S_STEP + epsilon, T_STEP]);
            t2 = linAlg.createVector(2, [(2 * i - 0) * S_STEP - epsilon, T_STEP]);
            t3 = linAlg.createVector(2, [(2 * i - 1) * S_STEP + epsilon, T_STEP * 2]);
            t4 = linAlg.createVector(2, [(2 * i + 1) * S_STEP - epsilon, T_STEP * 2]);
            t11 = linAlg.createVector(2, [2 * i * S_STEP, T_STEP * 3 - epsilon]);

            // add a triangle in 1st row
            indices.push(linAlg.createVector(3, [index, index + 1, index + 2]));
            vertices.push(v0, v1, v2);
            vertexColors.push(blue.copy(), red.copy(), red.copy());
            texCoords.push(t0, t1, t2);

            // add 2 triangles in 2nd row
            indices.push(linAlg.createVector(3, [index + 3, index + 4, index + 5]));
            vertices.push(v1, v3, v2);
            vertexColors.push(red.copy(), red.copy(), red.copy());
            texCoords.push(t1, t3, t2);

            indices.push(linAlg.createVector(3, [index + 6, index + 7, index + 8]));
            vertices.push(v2, v3, v4);
            vertexColors.push(red.copy(), red.copy(), red.copy());
            texCoords.push(t2, t3, t4);

            // add a triangle in 3rd row
            indices.push(linAlg.createVector(3, [index + 9, index + 10, index + 11]));
            vertices.push(v3, v11, v4);
            vertexColors.push(red.copy(), red.copy(), red.copy());
            texCoords.push(t3, t11, t4);

            // next index
            index += 12;
        }
        this._subdivide(indices, vertices, vertexColors, texCoords, radius, subdivision);
        return new Icosahedron(indices, vertices, vertexColors, texCoords);
    }

    private static _subdivide(indices: vec3[], vertices: vec3[], vertexColors: vec4[], texCoords: vec2[], radius: number, subdivision: number): void {
        let tmpIndices: vec3[];
        let tmpVertices: vec3[];
        let tmpVertexColors: vec4[];
        let tmpTexCoords: vec2[];
        let v1: vec3, v2: vec3, v3: vec3;
        let t1: vec2, t2: vec2, t3: vec2;
        let newV1: vec3, newV2: vec3, newV3: vec3;
        let newT1: vec2, newT2: vec2, newT3: vec2;
        let index = 0;

        const red = linAlg.createVector(4, [0.5, 0, 0, 1]);

        for (let i = 1; i <= subdivision; ++i) {
            tmpIndices = [...indices];
            tmpVertices = [...vertices];
            tmpVertexColors = [...vertexColors];
            tmpTexCoords = [...texCoords];

            // clear prev arrays
            indices.length = 0;
            vertices.length = 0;
            vertexColors.length = 0;
            texCoords.length = 0;

            index = 0;
            let j0: number, j1: number, j2: number;
            for (const j of tmpIndices) {
                // get 3 vertice and texcoords of a triangle
                v1 = tmpVertices[j0 = j.get(0, 0)]!;
                v2 = tmpVertices[j1 = j.get(1, 0)]!;
                v3 = tmpVertices[j2 = j.get(2, 0)]!;
                t1 = tmpTexCoords[j0]!;
                t2 = tmpTexCoords[j1]!;
                t3 = tmpTexCoords[j2]!;

                // get 3 new vertices by spliting half on each edge
                newV1 = v1.copy().addL(v2).normalize().scale(radius);
                newV2 = v2.copy().addL(v3).normalize().scale(radius);
                newV3 = v3.copy().addL(v1).normalize().scale(radius);
                newT1 = t1.copy().addL(t2).scale(0.5);
                newT2 = t2.copy().addL(t3).scale(0.5);
                newT3 = t3.copy().addL(t1).scale(0.5);

                // add 4 new triangles
                indices.push(linAlg.createVector(3, [index, index + 1, index + 2]));
                vertices.push(v1, newV1, newV3);
                vertexColors.push(tmpVertexColors[j0]!, red.copy(), red.copy());
                texCoords.push(t1, newT1, newT3);

                indices.push(linAlg.createVector(3, [index + 3, index + 4, index + 5]));
                vertices.push(newV1, v2, newV2);
                vertexColors.push(red.copy(), tmpVertexColors[j1]!, red.copy());
                texCoords.push(newT1, t2, newT2);

                indices.push(linAlg.createVector(3, [index + 6, index + 7, index + 8]));
                vertices.push(newV1, newV2, newV3);
                vertexColors.push(red.copy(), red.copy(), red.copy());
                texCoords.push(newT1, newT2, newT3);

                indices.push(linAlg.createVector(3, [index + 9, index + 10, index + 11]));
                vertices.push(newV3, newV2, v3);
                vertexColors.push(red.copy(), red.copy(), tmpVertexColors[j2]!);
                texCoords.push(newT3, newT2, t3);

                // next index
                index += 12;
            }
        }
    }
}
export const SPHERE_MESH = addMesh(Icosahedron.create(1, 3));