/**
 * Size-safe array of length N.
 * 
 * Note: Indexing bounds are not checked (impossible in TS's type system).
 */
export type SizedArray<N extends number, T> = { length: N } & _SizedArrayHelper<N, T>;
type _SizedArrayHelper<N extends number, T, R extends T[] = []> = R extends { length: N } ? R : _SizedArrayHelper<N, T, [T, ...R]>;
/**
 * Size-safe matrix data of dimension M x N.
 * 
 * Note: This is literally just a nested SizeArray type.
 */
export type MatrixData<M extends number, N extends number, T> = SizedArray<M, SizedArray<N, T>>;
type _Canonical<N extends number, R extends any[] = []> = R extends { length: N } ? R : _Canonical<N, [any, ...R]>;
type _Length<T extends any[]> = number & (T extends { length: infer L } ? L : never);
type _Add<A extends number, B extends number> = _Length<[..._Canonical<A>, ..._Canonical<B>]>;
type _Subtract<A extends number, B extends number> = number & (_Canonical<A> extends [..._Canonical<infer U>, ..._Canonical<B>] ? U : 0);
type _LessThanOrEqual<B extends number> = B | _LessThan<B>;
type _LessThan<B extends number> = B extends 0 ? never : _LessThanOrEqual<_Subtract<B, 1>>;

/**
 * A M x N matrix with elements of type T.
 */
export type Matrix<M extends number, N extends number, T> = IMatrix<M, N, T>;
/**
 * A N x 1 (column) vector with elements of type T.
 */
export type Vector<N extends number, T> = Matrix<N, 1, T>;
/**
 * A M x N matrix with numeric elements.
 */
export type MatrixN<M extends number, N extends number> = Matrix<M, N, number>;
/**
 * A N x 1 (column) vector with numeric elements.
 */
export type VectorN<N extends number> = Vector<N, number>;
/**
 * A 2 x 2 matrix, intended for regular use in a 2D environment.
 */
export type Matrix2D = MatrixN<2, 2>;
/**
 * A 2 x 1 (column) vector, intended for regular use in a 2D environment.
 */
export type Vector2D = VectorN<2>;
/**
 * A 3 x 3 matrix, intended for affine use in a 2D environment or regular use in a 3D environment.
 */
export type Matrix3D = MatrixN<3, 3>;
/**
 * A 3 x 1 (column) vector, intended for affine use in a 2D environment or regular use in a 3D environment.
 */
export type Vector3D = VectorN<3>;
/**
 * A 4 x 4 matrix, intended for affine use in a 3D environment.
 */
export type Matrix4D = MatrixN<4, 4>;
/**
 * A 4 x 1 (column) vector, intended for affine use in a 3D environment.
 */
export type Vector4D = VectorN<4>;

/**
 * Defines numerical operations for a type T.
 */
export interface INumericOps<T> {
    /**
     * Add two elements of type T.
     * @param a The first element.
     * @param b The second element.
     * @returns The sum of the two elements.
     */
    readonly add: (a: T, b: T) => T;
    /**
     * Subtract two elements of type T.
     * @param a The first element.
     * @param b The second element.
     * @returns The difference of the two elements.
     */
    readonly sub: (a: T, b: T) => T;
    /**
     * Multiply two elements of type T.
     * @param a The first element.
     * @param b The second element.
     * @returns The product of the two elements.
     */
    readonly mul: (a: T, b: T) => T;
    /**
     * Divide two elements of type T.
     * @param a The first element.
     * @param b The second element.
     * @returns The quotient of the two elements.
     */
    readonly div: (a: T, b: T) => T;

    /**
     * Returns the additive identity of type T (e.g. 0 for numbers).
     * @returns The additive identity of type T.
     */
    readonly addId: () => T;
    /**
     * Returns the multiplicative identity of type T (e.g. 1 for numbers).
     * @returns The multiplicative identity of type T.
     */
    readonly mulId: () => T;
    /**
     * Returns the 'dot product' of type T (e.g. multiplication of a complex number with its conjugate).
     * 
     * Note: The term 'dot product' was chosen as a lack of a better word and might get changed in the future.
     * @param a The value whose dot product shall be computed.
     * @returns The dot product.
     */
    readonly dot: (a: T) => number;
    /**
     * Computes the sine of type T (e.g. a complex number).
     * @param angle The angle in radians.
     * @returns The sine.
     */
    readonly sin: (angle: number) => T;
    /**
     * Computes the cosine of type T (e.g. a complex number).
     * @param angle The angle in radians.
     * @returns The cosine.
     */
    readonly cos: (angle: number) => T;
}

/**
 * Defines matrix operations for a M x N matrix with elements of type T.
 */
export interface IMatrix<M extends number, N extends number, T> {
    /**
     * The row dimension of the matrix.
     */
    readonly m: M;
    /**
     * The column dimension of the matrix.
     */
    readonly n: N;
    /**
     * The raw data of the matrix in two-dimensional array form (type-safe to be of size M x N with elements of type T).
     */
    readonly data: MatrixData<M, N, T>;
    /**
     * Get a single T element at the specified indices.
     * @param i The row index.
     * @param j The column index.
     */
    get(i: number, j: number): T;
    /**
     * Set a single T element at the specified indices. Returns the new value (can be used for chaining).
     * @param i The row index.
     * @param j The column index.
     * @param v The new value.
     */
    set(i: number, j: number, v: T): T;

    /**
     * Load a (sub-)matrix into the upper left corner of this matrix.
     * @param data The (sub-)matrix.
     */
    load<P extends _LessThanOrEqual<M>, Q extends _LessThanOrEqual<N>>(data: MatrixData<P, Q, T>): void;
    
    /**
     * Add another matrix to this matrix (component-wise) and store the result in another (possibly the same) matrix.
     * @param other The second operand.
     * @param store The matrix which will hold the result.
     */
    add(other: IMatrix<M, N, T>, store: IMatrix<M, N, T>): IMatrix<M, N, T>;
    /**
     * Subtract another matrix from this matrix (component-wise) and store the result in another (possibly the same) matrix.
     * @param other The second operand.
     * @param store The matrix which will hold the result.
     */
    sub(other: IMatrix<M, N, T>, store: IMatrix<M, N, T>): IMatrix<M, N, T>;
    /**
     * Multiply this matrix with another matrix (component-wise) and store the result in another (possibly the same) matrix.
     * @param other The second operand.
     * @param store The matrix which will hold the result.
     */
    mul(other: IMatrix<M, N, T>, store: IMatrix<M, N, T>): IMatrix<M, N, T>;
    /**
     * Divide this matrix by another matrix (component-wise) and store the result in another (possibly the same) matrix.
     * @param other The second operand.
     * @param store The matrix which will hold the result.
     */
    div(other: IMatrix<M, N, T>, store: IMatrix<M, N, T>): IMatrix<M, N, T>;
    /**
     * Add another matrix to this matrix (component-wise) and store the result in this matrix.
     * @param other The second operand.
     */
    addL(other: IMatrix<M, N, T>): IMatrix<M, N, T>;
    /**
     * Subtract another matrix from this matrix (component-wise) and store the result in this matrix.
     * @param other The second operand.
     */
    subL(other: IMatrix<M, N, T>): IMatrix<M, N, T>;
    /**
     * Multiply this matrix with another matrix (component-wise) and store the result in this matrix.
     * @param other The second operand.
     */
    mulL(other: IMatrix<M, N, T>): IMatrix<M, N, T>;
    /**
     * Divide this matrix by another matrix (component-wise) and store the result in this matrix.
     * @param other The second operand.
     */
    divL(other: IMatrix<M, N, T>): IMatrix<M, N, T>;
    /**
     * Add another matrix to this matrix (component-wise) and store the result in the other matrix.
     * @param other The second operand.
     */
    addR(other: IMatrix<M, N, T>): IMatrix<M, N, T>;
    /**
     * Subtract another matrix from this matrix (component-wise) and store the result in the other matrix.
     * @param other The second operand.
     */
    subR(other: IMatrix<M, N, T>): IMatrix<M, N, T>;
    /**
     * Multiply this matrix with another matrix (component-wise) and store the result in the other matrix.
     * @param other The second operand.
     */
    mulR(other: IMatrix<M, N, T>): IMatrix<M, N, T>;
    /**
     * Divide this matrix by another matrix (component-wise) and store the result in the other matrix.
     * @param other The second operand.
     */
    divR(other: IMatrix<M, N, T>): IMatrix<M, N, T>;

    /**
     * Returns the component-wise 'dot-product' of this matrix.
     * 
     * Note: Currently only used by the norm.
     */
    dot(): number;
    /**
     * Returns the Euclidean norm of this matrix.
     */
    norm(): number;
    /**
     * Returns a new matrix of size N x M and elements of same type T with transposed rows / columns.
     */
    transposed(): IMatrix<N, M, T>;
}

export class _Affine<T> {
    readonly linAlg: LinAlg<T>;

    constructor(linAlg: LinAlg<T>) {
        this.linAlg = linAlg;
    }

    /**
     * Creates a new (N + 1) x (N + 1) translation matrix with the given (column) vector of length N as translation.
     * @param t The translation vector.
     * @returns The translation matrix.
     */
    public createTranslationMatrix<N extends number, NPlusOne extends _Add<N, 1>>(t: Vector<N, T>): Matrix<NPlusOne, NPlusOne, T> {
        const n = t.m;
        const mat = this.linAlg.createIdentityMatrix((n + 1) as NPlusOne);
        for (let i = 0; i < n; ++i)
            mat.data[i][n] = t.data[i][0];
        return mat;
    }
};
export class _Affine2D<T> extends _Affine<T> {    
    constructor(linAlg: LinAlg<T>) {
        super(linAlg);
    }

    /**
     * Creates a new affine 2D rotation matrix for the given angle.
     * @param angle The angle in radians.
     * @returns The rotation matrix.
     */
    public createRotationMatrix(angle: number): Matrix<3, 3, T> {
        const mat = this.linAlg.createIdentityMatrix(3);
        const rot = this.linAlg.TwoD.createRotationMatrix(angle);
        const test: _LessThanOrEqual<7> = 6;
        mat.load(rot.data);
        return mat;
    }
};
export class _Affine3D<T> extends _Affine<T> {    
    constructor(linAlg: LinAlg<T>) {
        super(linAlg);
    }

    /**
    * Creates a new affine 3D rotation matrix for the given angle around the x-axis.
    * @param angle The angle in radians.
    * @returns The rotation matrix.
    */
    public createXRotationMatrix(angle: number): Matrix<4, 4, T> {
        const mat = this.linAlg.createIdentityMatrix(4);
        const rot = this.linAlg.ThreeD.createXRotationMatrix(angle);
        mat.load(rot.data);
        return mat;
    }
    /**
    * Creates a new affine 3D rotation matrix for the given angle around the y-axis.
    * @param angle The angle in radians.
    * @returns The rotation matrix.
    */
    public createYRotationMatrix(angle: number): Matrix<4, 4, T> {
        const mat = this.linAlg.createIdentityMatrix(4);
        const rot = this.linAlg.ThreeD.createYRotationMatrix(angle);
        mat.load(rot.data);
        return mat;
    }
    /**
    * Creates a new affine 3D rotation matrix for the given angle around the z-axis.
    * @param angle The angle in radians.
    * @returns The rotation matrix.
    */
    public createZRotationMatrix(angle: number): Matrix<4, 4, T> {
        const mat = this.linAlg.createIdentityMatrix(4);
        const rot = this.linAlg.ThreeD.createZRotationMatrix(angle);
        mat.load(rot.data);
        return mat;
    }
};

/**
 * The entry point for all linear algebra operations.
 * 
 * A LinAlg object provides the following capabilities:
 * 
 * - Creating matrices / vectors of arbitrary sizes with elements of type T.
 * 
 * - Multiplying matrices / vectors of matching sizes.
 * 
 * - Specialized 2D and 3D matrix functions for convenient use.
 * 
 * - Specialized affine matrix creation functions for convenient use
 * (also available separately for 2D and 3D, for even more convenience).
 * 
 * If your application is multi-threaded, use one LinAlg object per thread. Linear algebra operations
 * use pre-allocated buffers under the hood to ensure relatively good performance. Sharing a LinAlg
 * objects between threads can lead to completely wrong results even if thread-local matrices are involved.
 */
export class LinAlg<T> {
    private static readonly _numberOps: INumericOps<number> = {
        add: (a, b) => a + b,
        sub: (a, b) => a - b,
        mul: (a, b) => a * b,
        div: (a, b) => a / b,
    
        addId: () => 0,
        mulId: () => 1,
        dot: (a) => a * a,

        sin: Math.sin,
        cos: Math.cos
    }

    private readonly _ops: INumericOps<T>;
    private readonly _buffers: Map<number, Map<number, unknown>>;

    private constructor(ops: INumericOps<T>) {
        this._ops = ops;
        this._buffers = new Map<number, Map<number, unknown>>();
    }

    /**
     * Create a new LinAlg with the provided numerical operations.
     * @param ops The numerical operations.
     * @returns The new LinAlg.
     */
    public static create<T>(ops: INumericOps<T>) {
        return new LinAlg<T>(ops);
    }

    /**
     * Create a new LinAlg with numerical operations for the built-in 'number' type.
     * @returns The new LinAlg.
     */
    public static number() {
        return this.create(this._numberOps);
    }

    private readonly _MatrixImpl = class<M extends number, N extends number, T> implements IMatrix<M, N, T> {
        readonly linAlg: LinAlg<T>;
        readonly m: M;
        readonly n: N;
        readonly data: MatrixData<M, N, T>;
    
        constructor(linAlg: LinAlg<T>, data: MatrixData<M, N, T>) {
            this.linAlg = linAlg;
            this.m = data.length as M;
            this.n = (data[0] as SizedArray<N, T>).length as N;
            this.data = data;
        }
        get(i: number, j: number): T {
            return (this.data[i] as SizedArray<N, T>)[j];
        }
        set(i: number, j: number, v: T): T {
            return this.data[i][j] = v;
        }
        forEach(op: (selfRow: SizedArray<N, T>, i: number, j: number) => void): void {
            let selfRow: SizedArray<N, T>;
            for (let i = 0; i < this.m; ++i) {
                selfRow = this.data[i];
                for (let j = 0; j < this.n; ++j)
                    op(selfRow, i, j);
            }
        }
        zip<P extends number, Q extends number>(op: (selfRow: SizedArray<N, T>, dataRow: SizedArray<Q, T>, i: number, j: number) => T, otherData: MatrixData<P, Q, T>, target: IMatrix<M, N, T>) {
            let selfRow: SizedArray<N, T>;
            let dataRow: SizedArray<Q, T>
            const p = otherData.length as P;
            const q = (otherData[0] as SizedArray<Q, T>).length as Q;
            for (let i = 0; i < p; ++i) {
                selfRow = this.data[i];
                dataRow = otherData[i];
                for (let j = 0; j < q; ++j)
                    selfRow[j] = op(selfRow, dataRow, i, j);
            }
        }
        load<P extends _LessThanOrEqual<M>, Q extends _LessThanOrEqual<N>>(data: MatrixData<P, Q, T>) {
            this.zip<P, Q>((_selfRow, dataRow, _i, j) => dataRow[j], data, this);
        }
        cwiseBinOp(op: (a: T, b: T) => T, other: IMatrix<M, N, T>, target: IMatrix<M, N, T>): IMatrix<M, N, T> {
            this.zip<M, N>((selfRow, dataRow, _i, j) => op(selfRow[j], dataRow[j]), other.data, target);
            return this;
        }
        add(other: IMatrix<M, N, T>, store: IMatrix<M, N, T>) {
            return this.cwiseBinOp(this.linAlg._ops.add, other, store);
        }
        sub(other: IMatrix<M, N, T>, store: IMatrix<M, N, T>) {
            return this.cwiseBinOp(this.linAlg._ops.sub, other, store);
        }
        mul(other: IMatrix<M, N, T>, store: IMatrix<M, N, T>) {
            return this.cwiseBinOp(this.linAlg._ops.mul, other, store);
        }
        div(other: IMatrix<M, N, T>, store: IMatrix<M, N, T>) {
            return this.cwiseBinOp(this.linAlg._ops.div, other, store);
        }
        addL(other: IMatrix<M, N, T>): IMatrix<M, N, T> {
            return this.add(other, this);
        }
        addR(other: IMatrix<M, N, T>): IMatrix<M, N, T> {
            return this.add(other, other);
        }
        subL(other: IMatrix<M, N, T>): IMatrix<M, N, T> {
            return this.sub(other, this);
        }
        subR(other: IMatrix<M, N, T>): IMatrix<M, N, T> {
            return this.sub(other, other);
        }
        mulL(other: IMatrix<M, N, T>): IMatrix<M, N, T> {
            return this.mul(other, this);
        }
        mulR(other: IMatrix<M, N, T>): IMatrix<M, N, T> {
            return this.mul(other, other);
        }
        divL(other: IMatrix<M, N, T>): IMatrix<M, N, T> {
            return this.div(other, this);
        }
        divR(other: IMatrix<M, N, T>): IMatrix<M, N, T> {
            return this.div(other, other);
        }
        dot(): number {
            let sum = 0;
            this.forEach((selfRow, _i, j) => sum += this.linAlg._ops.dot(selfRow[j]));
            return sum;
        }
        norm(): number {
            return Math.sqrt(this.dot());
        }
        transposed(): IMatrix<N, M, T> {
            return this.linAlg.createMatrix(this.linAlg._transposedMatrixData<M, N>(this.data));
        }

        toString() {
            return (this.data as T[][]).join("\r\n") + "\r\n";
        }
    }

    private _createMatrixData<M extends number, N extends number>(m: M, n: N): MatrixData<M, N, T> {
        const data: Array<Array<T>> = new Array<Array<T>>(m);
        let row: Array<T>;
        for (let i = 0; i < m; ++i) {
            data[i] = row = new Array<T>(n);
            for (let j = 0; j < n; ++j)
                row[j] = this._ops.addId();
        }
        return data as MatrixData<M, N, T>;
    }
    private _transposedMatrixData<M extends number, N extends number>(data: MatrixData<M, N, T>): MatrixData<N, M, T> {
        const m = data.length;
        const n = data[0].length;
        const transposed = this._createMatrixData<N, M>(n, m);
        for (let i = 0; i < n; ++i)
            for (let j = 0; j < m; ++j)
                transposed[i][j] = data[j][i];
        return transposed;
    }

    /**
     * Create a new M x N matrix with the given data (can be given as an M x N two-dimensional array).
     * @param data The backing data (not copied!).
     * @returns The created matrix.
     */
    public createMatrix<M extends number, N extends number>(data: MatrixData<M, N, T>): Matrix<M, N, T> {
        return new this._MatrixImpl<M, N, T>(this, data);
    }
    /**
     * Create a new N x 1 (column) vector with the given data (can be given as a one-dimensional array of length N).
     * @param data The backing data (not copied!).
     * @returns The created vector.
     */
    public createVector<N extends number>(data: SizedArray<N, T>): Vector<N, T> {
        return this.createMatrix<N, 1>(this._transposedMatrixData<1, N>([data]));
    }
    /**
     * Create a new M x N matrix where entries are initialized to 0.
     * @param m The row count.
     * @param n The column count.
     * @returns The created matrix.
     */
    public createZeroMatrix<M extends number, N extends number>(m: M, n: N): Matrix<M, N, T> {
        return this.createMatrix<M, N>(this._createMatrixData<M, N>(m, n));
    }
    /**
     * Create a new N x N matrix where the diagonal entries are initialized to 1.
     * @param n The row / column count.
     * @returns The created matrix.
     */
    public createIdentityMatrix<N extends number>(n: N): Matrix<N, N, T> {
        const mat = this.createZeroMatrix<N, N>(n, n);
        for (let i = 0; i < n; ++i)
            mat.data[i][i] = this._ops.mulId();
        return mat;
    }
    public loadVector<N extends number, Q extends _LessThanOrEqual<N>>(vec: Vector<N, T>, data: SizedArray<Q, T>): void {
        for (let i = 0; i < data.length; ++i)
            vec.data[i][0] = data[i];
    }

    private _getOrCreateBuffer<M extends number, N extends number>(m: M, n: N): MatrixData<M, N, T> {
        let row = this._buffers.get(m);
        if (row == undefined)
            this._buffers.set(m, row = new Map<number, unknown>());
        let col = row.get(n);
        if (col == undefined)
            row.set(n, col = this._createMatrixData(m, n));
        return col as MatrixData<M, N, T>;
    }
    private _mmul<M extends number, N extends number, P extends number>(a: Matrix<M, N, T>, b: Matrix<N, P, T>): MatrixData<M, P, T> {
        const buf = this._getOrCreateBuffer(a.m, b.n);
        let m = a.m;
        let n = a.n;
        let p = b.n;
        let ops = this._ops;
        let aRow: SizedArray<N, T>;
        let bufRow: SizedArray<P, T>;
        let acc: T;
        for (let i = 0; i < m; ++i) {
            aRow = a.data[i];
            bufRow = buf[i];
            for (let j = 0; j < p; ++j) {
                acc = ops.addId();
                for (let k = 0; k < n; ++k)
                    acc = ops.add(acc, ops.mul(aRow[k], b.data[k][j]));
                bufRow[j] = acc;
            }
        }
        return buf;
    }
    /**
     * Does a matrix multiplication between two matrices and stores the result in the third matrix.
     * @param a The first matrix (of size M x N).
     * @param b The second matrix (of size N x P).
     * @param c The third matrix (of size M x P).
     * @returns The third matrix (which has the result stored).
     */
    public mmul<M extends number, N extends number, P extends number>(a: Matrix<M, N, T>, b: Matrix<N, P, T>, c: Matrix<M, P, T>): Matrix<M, P, T> {
        const buf = this._mmul<M, N, P>(a, b);
        c.load<M, P>(buf);
        return c;
    }
    /**
     * Does a matrix multiplication between two matrices and stores the result in the first matrix.
     * @param a The first matrix (of size M x N).
     * @param b The second matrix (of size N x N).
     * @returns The first matrix (which has the result stored).
     */
    public mmulL<M extends number, N extends number>(a: Matrix<M, N, T>, b: Matrix<N, N, T>): Matrix<M, N, T> {
        const buf = this._mmul<M, N, N>(a, b);
        a.load<M, N>(buf);
        return a;
    }
    /**
     * Does a matrix multiplication between two matrices and stores the result in the second matrix.
     * @param a The first matrix (of size N x N).
     * @param b The second matrix (of size N x P).
     * @returns The second matrix (which has the result stored).
     */
    public mmulR<N extends number, P extends number>(a: Matrix<N, N, T>, b: Matrix<N, P, T>): Matrix<N, P, T> {
        const buf = this._mmul<N, N, P>(a, b);
        b.load<N, P>(buf);
        return b;
    }

    /**
     * Used to access 2D-specific matrix functions.
     */
    public readonly TwoD = new class {
        readonly linAlg: LinAlg<T>;

        constructor(linAlg: LinAlg<T>) {
            this.linAlg = linAlg;
            this.Affine = new _Affine2D(linAlg);
        }

        /**
         * Computes the cross product between two 2D vectors.
         * @param a The first vector.
         * @param b The second vector.
         * @returns The cross product.
         */
        public cross(a: Vector<2, T>, b: Vector<2, T>): T {
            const ops = this.linAlg._ops;
            return ops.sub(ops.mul(a.data[0][0], b.data[1][0]), ops.mul(a.data[1][0], b.data[0][0]));
        }

        /**
         * Creates a new (non-affine) 2D rotation matrix for the given angle.
         * @param angle The angle in radians.
         * @returns The rotation matrix.
         */
        public createRotationMatrix(angle: number): Matrix<2, 2, T> {
            const ops = this.linAlg._ops;
            const sin = ops.sin(angle);
            const cos = ops.cos(angle);
            return this.linAlg.createMatrix<2, 2>([
                [cos, ops.sub(ops.addId(), sin)],
                [sin, cos]
            ]);
        }
        
        /**
         * Used to access 2D-specific affine matrix functions.
         */
        public readonly Affine: _Affine2D<T>;
    }(this);

    /**
     * Used to access 3D-specific matrix functions.
     */
    public readonly ThreeD = new class {
        readonly linAlg: LinAlg<T>;

        constructor(linAlg: LinAlg<T>) {
            this.linAlg = linAlg;
            this.Affine = new _Affine3D(linAlg);
        }

        /**
         * Computes the cross product vector between two 3D vectors.
         * @param a The first vector.
         * @param b The second vector.
         * @param c (optional) The vector which stores the result. A new vector will be created if none is provided.
         * @returns The cross product.
         */
        public cross(a: Vector<3, T>, b: Vector<3, T>, c?: Vector<3, T>): Vector<3, T> {
            const ops = this.linAlg._ops;
            const x = ops.sub(ops.mul(a.data[1][0], b.data[2][0]), ops.mul(a.data[2][0], b.data[1][0]));
            const y = ops.sub(ops.mul(a.data[3][0], b.data[0][0]), ops.mul(a.data[0][0], b.data[3][0]));
            const z = ops.sub(ops.mul(a.data[0][0], b.data[1][0]), ops.mul(a.data[1][0], b.data[0][0]));
            const data = [x, y, z] as SizedArray<3, T>;
            if (c == undefined)
                return this.linAlg.createVector<3>(data);
            else {
                this.linAlg.loadVector(c, data);
                return c;
            }
        }

        private _createRotationMatrix(angle: number, assembler: (zero: T, one: T, sin: T, minusSin: T, cos: T) => MatrixData<3, 3, T>): Matrix<3, 3, T> {
            const ops = this.linAlg._ops;
            const zero = ops.addId();
            const one = ops.mulId();
            const sin = ops.sin(angle);
            const minusSin = ops.sub(ops.addId(), sin);
            const cos = ops.cos(angle);
            return this.linAlg.createMatrix(assembler(zero, one, sin, minusSin, cos));
        }

        /**
         * Creates a new (non-affine) 3D rotation matrix for the given angle around the x-axis.
         * @param angle The angle in radians.
         * @returns The rotation matrix.
         */
        public createXRotationMatrix(angle: number): Matrix<3, 3, T> {
            return this._createRotationMatrix(angle, (zero, one, sin, minusSin, cos) => {
                return [
                    [one,  zero, zero],
                    [zero, cos,  minusSin],
                    [zero, sin,  cos]
                ]
            });
        }
        /**
         * Creates a new (non-affine) 3D rotation matrix for the given angle around the y-axis.
         * @param angle The angle in radians.
         * @returns The rotation matrix.
         */
        public createYRotationMatrix(angle: number): Matrix<3, 3, T> {
            return this._createRotationMatrix(angle, (zero, one, sin, minusSin, cos) => {
                return [
                    [cos,      zero, sin],
                    [zero,     one,  zero],
                    [minusSin, zero, cos]
                ]
            });
        }
        /**
         * Creates a new (non-affine) 3D rotation matrix for the given angle around the z-axis.
         * @param angle The angle in radians.
         * @returns The rotation matrix.
         */
        public createZRotationMatrix(angle: number): Matrix<3, 3, T> {
            return this._createRotationMatrix(angle, (zero, one, sin, minusSin, cos) => {
                return [
                    [cos,  minusSin, zero],
                    [sin,  cos,      zero],
                    [zero, zero,     one]
                ]
            });
        }

        /**
         * Used to access 3D-specific affine matrix functions.
         */
        public readonly Affine: _Affine3D<T>;
    }(this);

    /**
     * Used to access (general) affine matrix functions.
     */
    public readonly Affine = new _Affine(this);
    
}
/*const linAlg = LinAlg.number();
const mat1: MatrixN<4,4> = linAlg.ThreeD.Affine.createTranslationMatrix(linAlg.createVector<3>([1,2,3]));
const mat2: MatrixN<4,4> = linAlg.ThreeD.Affine.createXRotationMatrix(Math.PI / 2);
console.log(mat1);
console.log(mat2);
console.log(linAlg.mmulL(mat1, mat2));*/