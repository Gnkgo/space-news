import { LinAlg, Matrix3D, Matrix4D, MatrixDataLayout, Vector2D, Vector3D, Vector4D } from "../../../common/linalg";

export const linAlg = LinAlg.number(MatrixDataLayout.COL_MAJOR);
export type mat4 = Matrix4D;
export type mat3 = Matrix3D;
export type vec4 = Vector4D;
export type vec3 = Vector3D;
export type vec2 = Vector2D;