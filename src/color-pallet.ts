import chroma from "chroma-js";

type ColorString = string & {};
export class ColorPallet {
  private _color: ColorString;
  private _pallet: ColorString[];

  constructor() {
    this._color = "#000000";
    this._pallet = [this._color];
  }

  get currentColor(): ColorString {
    return this._color;
  }

  push(color: string) {
    const rgbHex = this._getColorString(color);

    this._color = rgbHex;
    this._pallet.push(rgbHex);
  }

  remove(color: string) {
    const rgbHex = this._getColorString(color);
    const index = this._pallet.indexOf(rgbHex);

    if (index !== -1) {
      this._pallet.splice(index, 1);
    }

    if (rgbHex === this._color) {
      this._color = this._pallet[0];
    }
  }

  toArray(): Array<ColorString> {
    return [...this._pallet];
  }

  private _getColorString(color: string): ColorString {
    const chromaColor = chroma(color);
    const rgbHex = chromaColor.hex("rgb") as ColorString;

    return rgbHex;
  }
}
