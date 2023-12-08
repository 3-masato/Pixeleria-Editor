export type TypedArray =
  | Int8Array
  | Uint8Array
  | Uint8ClampedArray
  | Int16Array
  | Uint16Array
  | Int32Array
  | Uint32Array
  | Float32Array
  | Float64Array;

export type NumericArray = Array<number> | TypedArray;

export type Vec2 = {
  x: number;
  y: number;
};

export type PaintMode = "pen";
