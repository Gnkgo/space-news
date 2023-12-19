/**
 * Size-safe array of length N.
 * 
 * Note: Indexing bounds are not checked (impossible in TS's type system).
 */
export type SizedArray<N extends number, T>
    = { [index: number]: T, length: N } & _SizedArrayHelper<N, T>;
type _SizedArrayHelper<N extends number, T, R extends T[] = []>
    = R extends { length: N } ? R : _SizedArrayHelper<N, T, [T, ...R]>;
type _Canonical<N extends number, R extends any[] = []>
    = R extends { length: N } ? R : _Canonical<N, [any, ...R]>;
type _Length<T extends any[]>
    = number & (T extends { length: infer L } ? L : never);
type _Add<A extends number, B extends number>
    = _Length<[..._Canonical<A>, ..._Canonical<B>]>;
type _Subtract<A extends number, B extends number>
    = number & (_Canonical<A> extends [..._Canonical<infer U>, ..._Canonical<B>] ? U : 0);
type _MultiAdd<A extends number, B extends number, R extends number>
    = number & (A extends 0 ? R : _MultiAdd<_Subtract<A, 1>, B, _Add<R, B>>);
type _Multiply<A extends number, B extends number>
    = _MultiAdd<A, B, 0>;

/**
 * Represents the way a matrix should be laid out in memory as 1D array.
 */
export enum MatrixDataLayout {
    ROW_MAJOR = 0,
    COL_MAJOR = 1
}

class Stack<T> {
    private readonly _arr: T[];
    private _index = 0;

    constructor(initial: T[] = []) {
        this._arr = initial;
    }

    /*public using<R>(supplier: () => T, consumer: (value: T) => R): R {
        let value: T
        if (this._index < this._arr.length)
            value = this._arr[this._index++]!;
        else
            this._index = this._arr.push(value = supplier());
        const res = consumer(value);
        --this._index;
        return res;
    }*/

    public push(value: T): void {
        this._arr[--this._index] = value;
    }

    public pop(supplier: () => T): T {
        if (this._index < this._arr.length)
            return this._arr[this._index++]!;
        const value = supplier();
        this._index = this._arr.push(value);
        return value;
    }

    public size(): number {
        return this._arr.length;
    }
}

/**
 * A data-representation-agnostic iterator over the elements of a matrix.
 * Under the hood, two specific implementations are used for row and column major data representations. 
 */
export interface IMatrixIterator {
    /**
     * Prepare the iterator to iterate over a new matrix and resets the internal pointers. Returns the iterator.
     * 
     * Note: This leaves the iterator in a state where both {@link jumpRows} and {@link jumpCols} need to be called (even for the first element).
     * @param m The row count.
     * @param n The column count;
     */
    load(m: number, n: number): IMatrixIterator;
    /**
     * Returns the index for the current element.
     */
    current(): number;
    /**
     * Advance the iterator by the provided amount of rows. Returns the iterator.
     * @param r The amount of rows to jump.
     */
    jumpRows(r?: number): IMatrixIterator;
    /**
     * Advance the iterator by the provided amount of columns. Returns the iterator.
     * @param r The amount of columns to jump.
     */
    jumpCols(c?: number): IMatrixIterator;
    /**
     * Returns the index for the element at the specified row and column index without advancing the iterator. Returns the iterator.
     * @param r The row index.
     * @param c The column index.
     */
    at(r: number, c: number): number;
    /**
     * Jump back to the start of the current row. Returns the iterator. 
     */
    resetRow(): IMatrixIterator;
    /**
     * Jump back to the start of the current column. Returns the iterator.
     */
    resetCol(): IMatrixIterator;
    /**
     * Gets the layout of matrices this iterator can loop over.
     */
    layout(): MatrixDataLayout;
}
class _RowMajorIterator implements IMatrixIterator {
    private n: number = 0;
    private index: number = 0;
    private col: number = 0;
    load<M extends number, N extends number>(_m: M, n: N): IMatrixIterator {
        this.n = n;
        return this.resetRow().resetCol();
    }
    current(): number {
        return this.index;
    }
    jumpRows(r: number = 1): IMatrixIterator {
        this.index += r * this.n;
        return this;
    }
    jumpCols(c: number = 1): IMatrixIterator {
        this.index += c;
        this.col += c;
        return this;
    }
    at(r: number, c: number) {
        return r * this.n + c;
    }
    resetRow(): IMatrixIterator {
        return this.jumpCols(-(this.col + 1));
    }
    resetCol(): IMatrixIterator {
        this.index = this.col - this.n;
        return this;
    }
    layout(): MatrixDataLayout {
        return MatrixDataLayout.ROW_MAJOR;
    }
}
class _ColMajorIterator implements IMatrixIterator {
    private m: number = 0;
    private index: number = 0;
    private row: number = 0;
    load<M extends number, N extends number>(m: M, _n: N): IMatrixIterator {
        this.m = m;
        return this.resetCol().resetRow();
    }
    current(): number {
        return this.index;
    }
    jumpRows(r: number = 1): IMatrixIterator {
        this.index += r;
        this.row += r;
        return this;
    }
    jumpCols(c: number = 1): IMatrixIterator {
        this.index += c * this.m;
        return this;
    }
    at(r: number, c: number) {
        return c * this.m + r;
    }
    resetRow() {
        this.index = this.row - this.m;
        return this;
    }
    resetCol() {
        return this.jumpRows(-(this.row + 1));
    }
    layout(): MatrixDataLayout {
        return MatrixDataLayout.COL_MAJOR;
    }
}

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
     * Returns the 'dot product' of type T.
     * 
     * Note: The term 'dot product' was chosen as a lack of a better word and might get changed in the future.
     * @param a The value whose dot product shall be computed.
     * @returns The dot product.
     */
    readonly dot: (a: T, b: T) => T;
    /**
     * 'Norm' the 'dot product' of type T.
     * 
     * Note: The term 'norm' was chosen somewhat arbitrarily and might get changed in the future.
     * Currently, this function is only used as part of vector normalization.
     * @param a 
     * @returns 
     */
    readonly norm: (a: T) => number;
    /**
     * Compute the sine of type T (e.g. a complex number).
     * @param angle The angle in radians.
     * @returns The sine.
     */
    readonly sin: (angle: number) => T;
    /**
     * Compute the cosine of type T (e.g. a complex number).
     * @param angle The angle in radians.
     * @returns The cosine.
     */
    readonly cos: (angle: number) => T;
    /**
     * 'Embed' a numeric value into a value of type T. Think of converting a real value to a complex value.
     * @param n The numeric value.
     * @returns The embedded value.
     */
    readonly embed: (n: number) => T;
}

export interface IMatrixBase {
    /**
     * The row dimension of the matrix.
     */
    readonly m: number;
    /**
     * The column dimension of the matrix.
     */
    readonly n: number;
    /**
     * The data layout of the matrix.
     */
    readonly layout: MatrixDataLayout;
}
/**
 * Defines matrix operations for a M x N matrix with elements of type T.
 */
export interface IMatrix<M extends number, N extends number, T> extends IMatrixBase {
    /**
     * The row count of the matrix.
     */
    readonly m: M;
    /**
     * The column count of the matrix.
     */
    readonly n: N;
    /**
     * The raw data of the matrix in two-dimensional array form (type-safe to be of size M x N with elements of type T).
     */
    readonly data: SizedArray<_Multiply<M, N>, T>;
    /**
     * Get a single T element at the specified indices.
     * @param i The row index.
     * @param j The column index.
     */
    get(i: number, j: number): T;
    /**
     * Set a single T element at the specified indices. Returns the new value.
     * @param i The row index.
     * @param j The column index.
     * @param v The new value.
     */
    set(i: number, j: number, v: T): T;
    /**
     * Run the given operation for each element of the matrix. Returns the matrix.
     * @param op An operation taking the underlying data array, the row and column index (layout-agnostic) and the corresponding 1D index.
     */
    forEach(op: (data: SizedArray<_Multiply<M, N>, T>, i: number, j: number, ij: number) => void): IMatrix<M, N, T>;
    /**
     * Load data of another matrix into the upper left corner of this matrix. Returns this matrix.
     * @param p The row count of the provided matrix data.
     * @param q The column count of the provided matrix data.
     * @param data The matrix data.
     * @param layout The layout of the provided matrix data.
     */
    load<P extends number, Q extends number>(p: P, q: Q, data: SizedArray<_Multiply<P, Q>, T>, layout?: MatrixDataLayout): IMatrix<M, N, T>;
    /**
     * Load another matrix into the upper left corner of this matrix. Returns this matrix.
     * @param other The matrix to load.
     */
    loadMatrix<P extends number, Q extends number>(other: IMatrix<P, Q, T>): IMatrix<M, N, T>;
    /**
     * Set all entries of this matrix to 0. Returns the matrix.
     */
    resetToZero(): IMatrix<M, N, T>;
    /**
     * Set all entries along the diagonal of this matrix to 1. Returns the matrix.
     */
    resetToIdentity(): IMatrix<M, N, T>;
    /**
     * Add another matrix to this matrix (component-wise) and store the result in another (possibly the same) matrix. Returns that matrix.
     * @param other The second operand.
     * @param store The matrix which will hold the result.
     */
    add(other: IMatrix<M, N, T>, store: IMatrix<M, N, T>): IMatrix<M, N, T>;
    /**
     * Subtract another matrix from this matrix (component-wise) and store the result in another (possibly the same) matrix. Returns that matrix.
     * @param other The second operand.
     * @param store The matrix which will hold the result.
     */
    sub(other: IMatrix<M, N, T>, store: IMatrix<M, N, T>): IMatrix<M, N, T>;
    /**
     * Multiply this matrix with another matrix (component-wise) and store the result in another (possibly the same) matrix. Returns that matrix.
     * @param other The second operand.
     * @param store The matrix which will hold the result.
     */
    mul(other: IMatrix<M, N, T>, store: IMatrix<M, N, T>): IMatrix<M, N, T>;
    /**
     * Divide this matrix by another matrix (component-wise) and store the result in another (possibly the same) matrix. Returns that matrix.
     * @param other The second operand.
     * @param store The matrix which will hold the result.
     */
    div(other: IMatrix<M, N, T>, store: IMatrix<M, N, T>): IMatrix<M, N, T>;
    /**
     * Add another matrix to this matrix (component-wise) and store the result in this matrix. Returns this matrix.
     * @param other The second operand.
     */
    addL(other: IMatrix<M, N, T>): IMatrix<M, N, T>;
    /**
     * Subtract another matrix from this matrix (component-wise) and store the result in this matrix. Returns this matrix.
     * @param other The second operand.
     */
    subL(other: IMatrix<M, N, T>): IMatrix<M, N, T>;
    /**
     * Multiply this matrix with another matrix (component-wise) and store the result in this matrix. Returns this matrix.
     * @param other The second operand.
     */
    mulL(other: IMatrix<M, N, T>): IMatrix<M, N, T>;
    /**
     * Divide this matrix by another matrix (component-wise) and store the result in this matrix. Returns this matrix.
     * @param other The second operand.
     */
    divL(other: IMatrix<M, N, T>): IMatrix<M, N, T>;
    /**
     * Add another matrix to this matrix (component-wise) and store the result in the other matrix. Returns the other matrix.
     * @param other The second operand.
     */
    addR(other: IMatrix<M, N, T>): IMatrix<M, N, T>;
    /**
     * Subtract another matrix from this matrix (component-wise) and store the result in the other matrix. Returns the other matrix.
     * @param other The second operand.
     */
    subR(other: IMatrix<M, N, T>): IMatrix<M, N, T>;
    /**
     * Multiply this matrix with another matrix (component-wise) and store the result in the other matrix. Returns the other matrix.
     * @param other The second operand.
     */
    mulR(other: IMatrix<M, N, T>): IMatrix<M, N, T>;
    /**
     * Divide this matrix by another matrix (component-wise) and store the result in the other matrix. Returns the other matrix.
     * @param other The second operand.
     */
    divR(other: IMatrix<M, N, T>): IMatrix<M, N, T>;
    /**
     * Returns the component-wise 'dot-product' of this matrix with another matrix.
     */
    dot(other: IMatrix<M, N, T>): T;
    /**
     * Returns the Euclidean norm of this matrix.
     */
    norm(): number;
    /**
     * Store the transposed version of this matrix into another (provided / new) matrix. Returns that matrix.
     * @param target The provided matrix.
     */
    transposed(target?: IMatrix<N, M, T>): IMatrix<N, M, T>;
    /**
     * Scale all elements of this matrix by a constant factor. Returns the matrix.
     * @param s The factor.
     */
    scale(s: T): IMatrix<M, N, T>;
    /**
     * Scale each row of this matrix by a different factor. Returns the matrix.
     * @param s The factor vector.
     */
    scaleRows(s: Vector<M, T>): IMatrix<M, N, T>;
    /**
     * Scale each column of this matrix by a different factor. Returns the matrix.
     * @param s The factor vector.
     */
    scaleCols(s: Vector<N, T>): IMatrix<M, N, T>;
    /**
     * Store the normalized version of this matrix into another (provided / new) matrix. Returns that matrix.
     * @param target 
     */
    normalized(target?: IMatrix<M, N, T>): IMatrix<M, N, T>;
    /**
     * Normalize this matrix. Returns the matrix.
     */
    normalize(): IMatrix<M, N, T>;
    /**
     * Copy the elements of this matrix into another (provided / new) matrix. Returns that matrix.
     * @param target 
     */
    copy(target?: IMatrix<M, N, T>): IMatrix<M, N, T>;
}

export class _Affine<T> {
    readonly linAlg: LinAlg<T>;

    constructor(linAlg: LinAlg<T>) {
        this.linAlg = linAlg;
    }

    /**
     * Create an (affine) translation matrix from a vector.
     * @param mat The matrix to hold the translation.
     * @param vec The translation vector.
     * @returns The modified translation matrix.
     */
    translate<N extends number, NMinusOne extends N | _Subtract<N, 1>>(mat: IMatrix<N, N, T>, vec: Vector<NMinusOne, T>): IMatrix<N, N, T> {
        const aIt = this.linAlg.popMatIt(mat).jumpCols(mat.n);
        const bIt = this.linAlg.popMatIt(vec).jumpCols();
        for (let i = 0; i < mat.m - 1; ++i)
            mat.data[aIt.jumpRows().current()] = vec.data[bIt.jumpRows().current()]!;
        this.linAlg.pushIt(bIt);
        this.linAlg.pushIt(aIt);
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
 * use pre-allocated buffers and iterators under the hood to ensure relatively good performance. Sharing a LinAlg
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
        dot: (a, b) => a * b,
        norm: Math.sqrt,

        sin: Math.sin,
        cos: Math.cos,

        embed: n => n
    }

    private readonly _ops: INumericOps<T>;
    private readonly _buffers: Map<number, Stack<unknown>>;
    private readonly _iterators: Map<MatrixDataLayout, Stack<IMatrixIterator>>;
    /**
     * The default layout used when creating new matrices / vectors from this LinAlg object.
     */
    public readonly defaultLayout: MatrixDataLayout;

    private constructor(ops: INumericOps<T>, defaultLayout: MatrixDataLayout = MatrixDataLayout.ROW_MAJOR) {
        this._ops = ops;
        this._buffers = new Map<number, Stack<IMatrixIterator>>();
        this._iterators = new Map<MatrixDataLayout, Stack<IMatrixIterator>>();
        this.defaultLayout = defaultLayout;
    }

    /**
     * Create a new LinAlg with the provided numerical operations.
     * @param ops The numerical operations.
     * @returns The new LinAlg.
     */
    public static create<T>(ops: INumericOps<T>, dataLayout?: MatrixDataLayout) {
        return new LinAlg<T>(ops, dataLayout);
    }

    /**
     * Create a new LinAlg with numerical operations for the built-in 'number' type.
     * @returns The new LinAlg.
     */
    public static number(dataLayout?: MatrixDataLayout) {
        return this.create(this._numberOps, dataLayout);
    }

    private readonly _MatrixImpl = class<M extends number, N extends number, T> implements IMatrix<M, N, T> {
        readonly linAlg: LinAlg<T>;
        readonly m: M;
        readonly n: N;
        readonly data: SizedArray<_Multiply<M, N>, T>;
        readonly layout: MatrixDataLayout;
    
        constructor(linAlg: LinAlg<T>, m: M, n: N, data: SizedArray<_Multiply<M, N>, T>, layout: MatrixDataLayout = linAlg.defaultLayout) {
            this.linAlg = linAlg;
            this.m = m;
            this.n = n;
            this.data = data;
            this.layout = layout;
        }
        get(i: number, j: number): T {
            const it = this.linAlg.popMatIt(this);
            const value = this.data[it.at(i, j)]!;
            this.linAlg.pushIt(it);
            return value;
        }
        set(i: number, j: number, v: T): T {
            const it = this.linAlg.popMatIt(this);
            this.data[it.at(i, j)] = v;
            this.linAlg.pushIt(it);
            return v;
        }
        forEach(op: (data: SizedArray<_Multiply<M, N>, T>, i: number, j: number, ij: number) => void): IMatrix<M, N, T> {
            const it = this.linAlg.popMatIt(this);
            for (let i = 0; i < this.m; ++i) {
                it.jumpRows().resetRow();
                for (let j = 0; j < this.n; ++j)
                    op(this.data, i, j, it.jumpCols().current());
            }
            this.linAlg.pushIt(it);
            return this;
        }
        zip<P extends number, Q extends number>(p: P, q: Q, op: (selfData: SizedArray<_Multiply<M, N>, T>, otherData: SizedArray<_Multiply<P, Q>, T>, i: number, j: number, ijSelf: number, ijOther: number) => T, otherData: SizedArray<_Multiply<P, Q>, T>, otherLayout: MatrixDataLayout, target: IMatrix<M, N, T>): void {
            const aIt = this.linAlg.popMatIt(this);
            const bIt = this.linAlg.popRawIt(p, q, otherLayout);
            const cIt = this.linAlg.popMatIt(target);
            const m = Math.min(this.m, p);
            const n = Math.min(this.n, q);
            for (let i = 0; i < m; ++i) {
                aIt.jumpRows().resetRow();
                bIt.jumpRows().resetRow();
                cIt.jumpRows().resetRow();
                for (let j = 0; j < n; ++j) {
                    target.data[cIt.jumpCols().current()] = op(this.data, otherData, i, j, aIt.jumpCols().current(), bIt.jumpCols().current())
                    //console.log(`i=${i} j=${j}: ${aIt.current()} ${bIt.current()} ${cIt.current()}\r\n`);
                }
            }
            //console.log("done:\r\n" + target + "\r\n")
            this.linAlg.pushIt(cIt);
            this.linAlg.pushIt(bIt);
            this.linAlg.pushIt(aIt);
        }
        load<P extends number, Q extends number>(p: P, q: Q, data: SizedArray<_Multiply<P, Q>, T>, layout: MatrixDataLayout = this.linAlg.defaultLayout) {
            this.zip<P, Q>(p, q, (_selfData, otherData, _i, _j, _ijSelf, ijOther) => otherData[ijOther]!, data, layout, this);
            return this;
        }
        loadMatrix<P extends number, Q extends number>(other: IMatrix<P, Q, T>): IMatrix<M, N, T> {
            return this.load(other.m, other.n, other.data, other.layout);
        }
        resetToZero(): IMatrix<M, N, T> {
            return this.forEach((data, _i, _j, ij) => data[ij] = this.linAlg._ops.addId());
        }
        resetToIdentity(): IMatrix<M, N, T> {
            return this.forEach((data, i, j, ij) => data[ij] = i == j ? this.linAlg._ops.mulId() : this.linAlg._ops.addId());
        }
        cwiseBinOp(op: (a: T, b: T) => T, other: IMatrix<M, N, T>, target: IMatrix<M, N, T>): IMatrix<M, N, T> {
            this.zip<M, N>(this.m, this.n, (selfData, otherData, _i, _j, ijSelf, ijOther) => op(selfData[ijSelf]!, otherData[ijOther]!), other.data, other.layout, target);
            return target;
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
        dot(other: IMatrix<M, N, T>): T {
            const ops = this.linAlg._ops;
            let sum = ops.addId();
            const aIt = this.linAlg.popMatIt(this);
            const bIt = this.linAlg.popMatIt(other);
            for (let i = 0; i < this.m; ++i) {
                aIt.jumpRows().resetRow();
                bIt.jumpRows().resetRow();
                for (let j = 0; j < this.n; ++j) {
                    sum = ops.add(sum, ops.dot(this.data[aIt.jumpCols().current()]!, other.data[bIt.jumpCols().current()]!));
                }
            }
            this.linAlg.pushIt(bIt);
            this.linAlg.pushIt(aIt);
            return sum;
        }
        norm(): number {
            return this.linAlg._ops.norm(this.dot(this));
        }
        transposed(target: IMatrix<N, M, T> = this.linAlg.createZeroMatrix(this.n, this.m)): IMatrix<N, M, T> {
            const aIt = this.linAlg.popMatIt(this);
            const bIt = this.linAlg.popRawIt(this.n, this.m);
            const buf = this.linAlg.popBuffer(this.n, this.m);
            for (let i = 0; i < target.m; ++i) {
                aIt.jumpCols().resetCol();
                bIt.jumpRows().resetRow();
                for (let j = 0; j < target.n; ++j) {
                    buf[bIt.jumpCols().current()] = this.data[aIt.jumpRows().current()]!;
                    //console.log(`i=${i} j=${j}: a=${aIt.current()} b=${bIt.current()}\r\n`);
                }
            }
            target.load(this.n, this.m, buf);
            this.linAlg.pushBuffer(buf);
            this.linAlg.pushIt(bIt);
            this.linAlg.pushIt(aIt);
            return target;
        }
        scale(s: T): IMatrix<M, N, T> {
            const ops = this.linAlg._ops;
            return this.forEach((data, _i, _j, ij) => {
                data[ij] = ops.mul(s, data[ij]!);
            });
        }
        scaleRows(s: Vector<M, T>): IMatrix<M, N, T> {
            const aIt = this.linAlg.popMatIt(this);
            const bIt = this.linAlg.popMatIt(s).jumpCols();
            const ops = this.linAlg._ops;
            let f: T;
            let e: T;
            for (let i = 0; i < this.m; ++i) {
                aIt.jumpRows().resetRow();
                f = s.data[bIt.jumpRows().current()]!;
                for (let j = 0; j < this.n; ++j) {
                    e = this.data[aIt.jumpCols().current()]!;
                    this.data[aIt.current()] = ops.mul(f, e);
                }
            }
            this.linAlg.pushIt(bIt);
            this.linAlg.pushIt(aIt);
            return this;
        }
        scaleCols(s: Vector<N, T>): IMatrix<M, N, T> {
            const aIt = this.linAlg.popMatIt(this);
            const bIt = this.linAlg.popMatIt(s).jumpCols();
            const ops = this.linAlg._ops;
            let f: T;
            let e: T;
            for (let j = 0; j < this.n; ++j) {
                aIt.jumpCols().resetCol();
                f = s.data[bIt.jumpRows().current()]!;
                for (let i = 0; i < this.m; ++i) {
                    e = this.data[aIt.jumpRows().current()]!;
                    this.data[aIt.current()] = ops.mul(f, e);
                }
            }
            this.linAlg.pushIt(bIt);
            this.linAlg.pushIt(aIt);
            return this;
        }
        normalized(target: IMatrix<M, N, T> = this.linAlg.createZeroMatrix(this.m, this.n)): IMatrix<M, N, T> {
            const ops = this.linAlg._ops;
            const invNorm = ops.div(ops.mulId(), ops.embed(this.norm()));
            return target.forEach((data, _i, _j, ij) => {
                data[ij] = ops.mul(invNorm, this.data[ij]!);
            });
        }
        normalize(): IMatrix<M, N, T> {
            return this.normalized(this);
        }
        copy(target: IMatrix<M, N, T> = this.linAlg.createZeroMatrix(this.m, this.n)): IMatrix<M, N, T> {
            return target.load(this.m, this.n, this.data);
        }
        toString(): string {
            let str = "";
            const it = this.linAlg.popMatIt(this);
            for (let i = 0; i < this.m; ++i) {
                it.jumpRows().resetRow();
                for (let j = 0; j < this.n; ++j)
                    str += this.data[it.jumpCols().current()] + ", ";
                str += "\r\n";
            }
            this.linAlg.pushIt(it);
            return str;         
        }
    }

    /**
     * Returns a string describing the iterator usage of this LinAlg object.
     * @returns The describtive string.
     */
    public iteratorUsage(): string {
        let str = "";
        this._iterators.forEach((v, k, _m) => str += `${k}:${v.size()},`);
        return str;
    }
    /**
     * Returns a string describing the iterator usage of this LinAlg object.
     * @returns The describtive string.
     */
    public bufferUsage(): string {
        let str = "";
        this._buffers.forEach((v, k, _m) => str += `${k}:${v.size()},`);
        return str;
    }
    private _createMatrixData<M extends number, N extends number>(m: M, n: N): SizedArray<_Multiply<M, N>, T> {
        const length = m * n;
        const data: Array<T> = new Array<T>(length);
        for (let ij = 0; ij < length; ++ij)
            data[ij] = this._ops.addId();
        return data as SizedArray<_Multiply<M, N>, T>;
    }
    /**
     * Pop an iterator to raw matrix data from the stack. Remember to push it again using {@link pushIt}!
     * @param m The row count of the matrix data.
     * @param n The column count of the matrix data.
     * @param layout The layout of the matrix data.
     * @returns The iterator (already size-loaded).
     */
    public popRawIt(m: number, n: number, layout: MatrixDataLayout = this.defaultLayout): IMatrixIterator {
        let stack = this._iterators.get(layout);
        if (stack == undefined)
            this._iterators.set(layout, stack = new Stack());
        const supplier = layout == MatrixDataLayout.ROW_MAJOR ? () => new _RowMajorIterator() : () => new _ColMajorIterator();
        const it = stack.pop(supplier);
        it.load(m, n);
        return it;
    }
    /**
     * Pop an iterator to a matrix from the stack. Remember to push it again using {@link pushIt}!
     * @param mat The matrix.
     * @returns The iterator (already size-loaded).
     */
    public popMatIt(mat: IMatrixBase): IMatrixIterator {
        return this.popRawIt(mat.m, mat.n, mat.layout);
    }
    /**
     * Push an iterator back to the stack. Used for both types of iterators after popping.
     * @param it The iterator.
     */
    public pushIt(it: IMatrixIterator) {
        this._iterators.get(it.layout())!.push(it);
    }
    /**
     * Create a new M x N matrix with the given data (can be given as an M x N two-dimensional array).
     * @param data The backing data (not copied!).
     * @returns The created matrix.
     */
    public createMatrix<M extends number, N extends number>(m: M, n: N, data: SizedArray<_Multiply<M, N>, T>, layout: MatrixDataLayout = this.defaultLayout): IMatrix<M, N, T> {
        return new this._MatrixImpl<M, N, T>(this, m, n, data, layout);
    }
    /**
     * Create a new N x 1 (column) vector with the given data (can be given as a one-dimensional array of length N).
     * @param data The backing data (not copied!).
     * @returns The created vector.
     */
    public createVector<N extends number>(n: N, data: SizedArray<_Multiply<N, 1>, T>): Vector<N, T> {
        return this.createMatrix<N, 1>(n, 1, data);
    }
    /**
     * Create a new M x N matrix where entries are initialized to 0.
     * @param m The row count.
     * @param n The column count.
     * @returns The created matrix.
     */
    public createZeroMatrix<M extends number, N extends number>(m: M, n: N, layout: MatrixDataLayout = this.defaultLayout): IMatrix<M, N, T> {
        return this.createMatrix<M, N>(m, n, this._createMatrixData<M, N>(m, n), layout);
    }
    /**
     * Create a new N x 1 vector where entries are initialized to 0.
     * @param m The row count.
     * @param n The column count.
     * @returns The created vector.
     */
    public createZeroVector<N extends number>(n: N, layout: MatrixDataLayout = this.defaultLayout): IMatrix<N, 1, T> {
        return this.createZeroMatrix(n, 1, layout);
    }
    /**
     * Create a new M x N matrix where entries are initialized to 1.
     * @param m The row count.
     * @param n The column count.
     * @returns The created matrix.
     */
    public createOnesMatrix<M extends number, N extends number>(m: M, n: N, layout: MatrixDataLayout = this.defaultLayout): IMatrix<M, N, T> {
        const mat = this.createZeroMatrix<M, N>(m, n, layout);
        const it = this.popMatIt(mat);
        for (let i = 0; i < m; ++i) {
            it.jumpRows().resetRow();
            for (let j = 0; j < n; ++j)
                mat.data[it.jumpCols().current()] = this._ops.mulId();
        }
        this.pushIt(it);
        return mat;
    }
    /**
     * Create a new N x 1 vector where entries are initialized to 1.
     * @param m The row count.
     * @param n The column count.
     * @returns The created vector.
     */
    public createOnesVector<N extends number>(n: N, layout: MatrixDataLayout = this.defaultLayout): IMatrix<N, 1, T> {
        return this.createOnesMatrix(n, 1, layout);
    }
    /**
     * Create a new N x N matrix where the diagonal entries are initialized to 1.
     * @param n The row / column count.
     * @returns The created matrix.
     */
    public createIdentityMatrix<N extends number>(n: N, layout: MatrixDataLayout = this.defaultLayout): IMatrix<N, N, T> {
        const mat = this.createZeroMatrix<N, N>(n, n, layout);
        //console.log(mat + "\r\n");
        const it = this.popMatIt(mat);
        for (let i = 0; i < n; ++i) {
            mat.data[it.jumpRows().jumpCols().current()] = this._ops.mulId();
            //console.log(it.current());
        }
        this.pushIt(it);
        return mat;
    }
    /**
     * Pop a buffer from the stack. Remember to push it again using {@link pushBuffer}!
     * @param m The row count of the buffer.
     * @param n The column count of the buffer.
     * @returns The buffer.
     */
    public popBuffer<M extends number, N extends number>(m: M, n: N): SizedArray<_Multiply<M, N>, T>  {
        const length = m * n;
        let stack = this._buffers.get(length);
        if (stack == undefined)
            this._buffers.set(length, stack = new Stack());
        return stack.pop(() => this._createMatrixData(m, n)) as SizedArray<_Multiply<M, N>, T>;
    }
    /**
     * Push a buffer back to the stack. 
     * @param buf The buffer.
     */
    public pushBuffer<MN extends number>(buf: SizedArray<MN, T>) {
        this._buffers.get(buf.length)!.push(buf);
    }
    /**
     * Multiply two matrices and store the result in the buffer.
     * @param a The first matrix (of size M x N).
     * @param b The second matrix (of size N x P).
     * @param buf The buffer.
     */
    public mmulBuf<M extends number, N extends number, P extends number>(a: IMatrix<M, N, T>, b: IMatrix<N, P, T>, buf: SizedArray<_Multiply<M, P>, T>): void {
        let m = a.m;
        let n = a.n;
        let p = b.n;
        let ops = this._ops;
        let acc: T;
        const aIt = this.popMatIt(a);
        const bIt = this.popMatIt(b);
        const cIt = this.popRawIt(a.m, b.n);
        for (let i = 0; i < m; ++i) {
            aIt.jumpRows();
            bIt.resetRow();
            cIt.jumpRows().resetRow();
            //console.log(`start of i=${i}: b=${bIt.current()} c=${cIt.current()}`);
            for (let j = 0; j < p; ++j) {
                acc = ops.addId();
                aIt.resetRow();
                bIt.jumpCols().resetCol();
                cIt.jumpCols();
                //console.log(`start of j=${j}: b=${bIt.current()} c=${cIt.current()}`);
                for (let k = 0; k < n; ++k) {
                    acc = ops.add(acc, ops.mul(a.data[aIt.jumpCols().current()]!, b.data[bIt.jumpRows().current()]!));
                    //console.log(`i=${i} j=${j} k=${k}: a=${aIt.current()} b=${bIt.current()} c=${cIt.current()}\r\n`);
                }
                buf[cIt.current()] = acc;
            }
        }
        this.pushIt(cIt);
        this.pushIt(bIt);
        this.pushIt(aIt);
    }
    /**
     * Multiply two matrices and store the result in the third matrix.
     * @param a The first matrix (of size M x N).
     * @param b The second matrix (of size N x P).
     * @param c The third matrix (of size M x P).
     * @returns The third matrix (which has the result stored).
     */
    public mmul<M extends number, N extends number, P extends number>(a: IMatrix<M, N, T>, b: IMatrix<N, P, T>, c: IMatrix<M, P, T> = this.createZeroMatrix(a.m, b.n)): IMatrix<M, P, T> {
        const buf = this.popBuffer(a.m, b.n);
        this.mmulBuf<M, N, P>(a, b, buf);
        c.load(c.m, c.n, buf);
        this.pushBuffer(buf);
        return c;
    }
    /**
     * Multiply two matrices and store the result in the first matrix.
     * @param a The first matrix (of size M x N).
     * @param b The second matrix (of size N x N).
     * @returns The first matrix (which has the result stored).
     */
    public mmulL<M extends number, N extends number>(a: IMatrix<M, N, T>, b: IMatrix<N, N, T>): IMatrix<M, N, T> {
        return this.mmul(a, b, a);
    }
    /**
     * Multiply two matrices and store the result in the second matrix.
     * @param a The first matrix (of size N x N).
     * @param b The second matrix (of size N x P).
     * @returns The second matrix (which has the result stored).
     */
    public mmulR<N extends number, P extends number>(a: IMatrix<N, N, T>, b: IMatrix<N, P, T>): IMatrix<N, P, T> {
        return this.mmul(a, b, b);
    }

    /**
     * Used to access 2D-specific matrix functions.
     */
    public readonly TwoD = new class {
        readonly linAlg: LinAlg<T>;

        constructor(linAlg: LinAlg<T>) {
            this.linAlg = linAlg;
        }

        /**
         * Compute the cross product between two 2D vectors.
         * @param a The first vector.
         * @param b The second vector.
         * @returns The cross product.
         */
        public cross(a: Vector<2, T>, b: Vector<2, T>): T {
            const aIt = this.linAlg.popMatIt(a).jumpCols();
            const bIt = this.linAlg.popMatIt(b).jumpCols();
            const ops = this.linAlg._ops;
            const a00 = a.data[aIt.jumpRows().current()]!;
            const a10 = a.data[aIt.jumpRows().current()]!;
            const b00 = b.data[bIt.jumpRows().current()]!;
            const b10 = b.data[bIt.jumpRows().current()]!;
            return ops.sub(ops.mul(a00, b10), ops.mul(a10, b00));
        }
        /**
         * Create a 2D rotation matrix.
         * @param angle The rotation angle in radians.
         * @param mat The matrix to use.
         * @returns The rotation matrix.
         */
        public rotate(angle: number, mat: IMatrix<2, 2, T>): IMatrix<2, 2, T> {
            const ops = this.linAlg._ops;
            const sin = ops.sin(angle);
            const cos = ops.cos(angle);
            const buf = this.linAlg.popBuffer(2, 2);
            buf[0] = cos; buf[1] = ops.sub(ops.addId(), sin);
            buf[2] = sin; buf[3] = cos;
            mat.load(2, 2, buf, MatrixDataLayout.ROW_MAJOR);
            this.linAlg.pushBuffer(buf);
            return mat;
        }
        /**
         * Create an affine 2D rotation matrix.
         * @param angle The rotation angle in radians.
         * @param mat The matrix to use.
         * @returns The rotation matrix.
         */
        public rotateAffine(angle: number, mat: IMatrix<3, 3, T>): IMatrix<3, 3, T> {
            const ops = this.linAlg._ops;
            const sin = ops.sin(angle);
            const cos = ops.cos(angle);
            const buf = this.linAlg.popBuffer(2, 2);
            buf[0] = cos; buf[1] = ops.sub(ops.addId(), sin);
            buf[2] = sin; buf[3] = cos;
            mat.load(2, 2, buf, MatrixDataLayout.ROW_MAJOR);
            this.linAlg.pushBuffer(buf);
            return mat;
        }
    }(this);

    /**
     * Used to access 3D-specific matrix functions.
     */
    public readonly ThreeD = new class {
        readonly linAlg: LinAlg<T>;

        constructor(linAlg: LinAlg<T>) {
            this.linAlg = linAlg;
        }

        /**
         * Compute the cross product vector between two 3D vectors.
         * @param a The first vector.
         * @param b The second vector.
         * @param c The (provided / new) vector which stores the result.
         * @returns The cross product.
         */
        public cross(a: Vector<3, T>, b: Vector<3, T>, c: Vector<3, T> = this.linAlg.createZeroMatrix(3, 1)): Vector<3, T> {
            const ops = this.linAlg._ops;
            const aIt = this.linAlg.popMatIt(a).jumpCols();
            const bIt = this.linAlg.popMatIt(b).jumpCols();
            const a00 = a.data[aIt.jumpRows().current()]!;
            const a10 = a.data[aIt.jumpRows().current()]!;
            const a20 = a.data[aIt.jumpRows().current()]!;
            const b00 = b.data[bIt.jumpRows().current()]!;
            const b10 = b.data[bIt.jumpRows().current()]!;
            const b20 = b.data[bIt.jumpRows().current()]!;
            const x = ops.sub(ops.mul(a10, b20), ops.mul(a20, b10));
            const y = ops.sub(ops.mul(a20, b00), ops.mul(a00, b20));
            const z = ops.sub(ops.mul(a00, b10), ops.mul(a10, b00));
            c.load(3, 1, [x, y, z]);
            this.linAlg.pushIt(bIt);
            this.linAlg.pushIt(aIt);
            return c;
        }
        private _withRotation<TMat extends IMatrix<3, 3, T> | IMatrix<4, 4, T>>(angle: number, builder: (zero: T, one: T, sin: T, minusSin: T, cos: T, buf: SizedArray<9, T>) => void, mat: TMat): TMat {
            const ops = this.linAlg._ops;
            const zero = ops.addId();
            const one = ops.mulId();
            const sin = ops.sin(angle);
            const minusSin = ops.sub(ops.addId(), sin);
            const cos = ops.cos(angle);
            const buf = this.linAlg.popBuffer(3, 3);
            builder(zero, one, sin, minusSin, cos, buf);
            mat.load(3, 3, buf, MatrixDataLayout.ROW_MAJOR);
            this.linAlg.pushBuffer(buf);
            return mat;       
        }
        private _buildXRotation<T>(zero: T, one: T, sin: T, minusSin: T, cos: T, buf: SizedArray<9, T>): void {
            buf[0] = one;  buf[1] = zero; buf[2] = zero;
            buf[3] = zero; buf[4] = cos;  buf[5] = minusSin;
            buf[6] = zero; buf[7] = sin;  buf[8] = cos;
        }
        private _buildYRotation<T>(zero: T, one: T, sin: T, minusSin: T, cos: T, buf: SizedArray<9, T>): void {
            buf[0] = cos;      buf[1] = zero; buf[2] = sin;
            buf[3] = zero;     buf[4] = one;  buf[5] = zero;
            buf[6] = minusSin; buf[7] = zero; buf[8] = cos;
        }
        private _buildZRotation<T>(zero: T, one: T, sin: T, minusSin: T, cos: T, buf: SizedArray<9, T>): void {
            buf[0] = cos;  buf[1] = minusSin; buf[2] = zero;
            buf[3] = sin;  buf[4] = cos;      buf[5] = zero;
            buf[6] = zero; buf[7] = zero;     buf[8] = one;
        }
        /**
         * Create a 3D rotation matrix around the X axis.
         * @param angle The rotation angle.
         * @param mat The matrix to use.
         * @returns The rotation matrix.
         */
        public rotateX(angle: number, mat: IMatrix<3, 3, T> = this.linAlg.createIdentityMatrix(3)): IMatrix<3, 3, T> {
            return this._withRotation(angle, this._buildXRotation, mat);
        }
        /**
         * Create an affine 3D rotation matrix around the X axis.
         * @param angle The rotation angle.
         * @param mat The matrix to use.
         * @returns The rotation matrix.
         */
        public rotateAffineX(angle: number, mat: IMatrix<4, 4, T> = this.linAlg.createIdentityMatrix(4)): IMatrix<4, 4, T> {
            return this._withRotation(angle, this._buildXRotation, mat);
        }
        /**
         * Create a 3D rotation matrix around the Y axis.
         * @param angle The rotation angle.
         * @param mat The matrix to use.
         * @returns The rotation matrix.
         */
        public rotateY(angle: number, mat: IMatrix<3, 3, T> = this.linAlg.createIdentityMatrix(3)): IMatrix<3, 3, T> {
            return this._withRotation(angle, this._buildYRotation, mat);
        }
        /**
         * Create an affine 3D rotation matrix around the Y axis.
         * @param angle The rotation angle.
         * @param mat The matrix to use.
         * @returns The rotation matrix.
         */
        public rotateAffineY(angle: number, mat: IMatrix<4, 4, T> = this.linAlg.createIdentityMatrix(4)): IMatrix<4, 4, T> {
            return this._withRotation(angle, this._buildYRotation, mat);
        }
        /**
         * Create a 3D rotation matrix around the Z axis.
         * @param angle The rotation angle.
         * @param mat The matrix to use.
         * @returns The rotation matrix.
         */
        public rotateZ(angle: number, mat: IMatrix<3, 3, T> = this.linAlg.createIdentityMatrix(3)): IMatrix<3, 3, T> {
            return this._withRotation(angle, this._buildZRotation, mat);
        }
        /**
         * Create an affine 3D rotation matrix around the Z axis.
         * @param angle The rotation angle.
         * @param mat The matrix to use.
         * @returns The rotation matrix.
         */
        public rotateAffineZ(angle: number, mat: IMatrix<4, 4, T> = this.linAlg.createIdentityMatrix(4)): IMatrix<4, 4, T> {
            return this._withRotation(angle, this._buildZRotation, mat);
        }
    }(this);

    /**
     * Used to access (general) affine matrix functions.
     */
    public readonly Affine = new _Affine(this);
}