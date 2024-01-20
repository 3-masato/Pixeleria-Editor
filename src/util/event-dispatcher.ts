export type Listener = (arg: any) => void;

/**
 * イベントを扱うためのクラス。
 * @template EventMap - イベント名とイベントデータの型のマッピング。
 * @template EventKey - EventMap から抽出されるイベントのキーの型。通常は `string` 型となり、指定せずに省略可。
 */
export class EventDispatcher<
  EventMap extends {} = any,
  EventKey extends Extract<keyof EventMap, string> = Extract<keyof EventMap, string>
> {
  private _listeners = new Map<string, Listener[]>();

  /**
   * イベントリスナーを登録する。
   * @param type イベントの種類
   * @param listener イベント発生時に呼び出される関数
   */
  on<K extends EventKey>(type: K, listener: (ev: EventMap[K]) => void): this {
    if (!this._listeners.has(type)) {
      this._listeners.set(type, []);
    }

    const listeners = this._listeners.get(type)!;
    listeners.push(listener);

    return this;
  }

  /**
   * 一度だけ呼び出されるイベントリスナーを登録する。
   * @param type イベントの種類
   * @param listener イベント発生時に呼び出される関数
   */
  once<K extends EventKey>(type: K, listener: (ev: EventMap[K]) => void): this {
    const fn: Listener = (data?) => {
      this.off(type, fn);
      listener.call(this, data);
    };

    return this.on(type, fn);
  }

  /**
   * 指定されたイベントタイプからリスナーを削除する。
   * @param type イベントの種類
   * @param listener 削除するイベントリスナー関数
   */
  off<K extends EventKey>(type: K, listener: (ev: EventMap[K]) => void): this {
    if (!this._listeners.has(type)) {
      return this;
    }

    const listeners = this._listeners.get(type)!;
    const index = listeners.indexOf(listener);

    if (-1 !== index) {
      listeners.splice(index, 1);
    }

    return this;
  }

  /**
   * イベント名を指定してイベントを発火する。
   * @param type イベントの種類
   * @param data イベントリスナー関数にわたす引数
   * @returns イベントが発火できたときは `true`、イベントリスナーが存在せず発火されなかったときは `false` を返す
   */
  fire<K extends EventKey>(type: K, data: EventMap[K]): boolean {
    if (!this._listeners.has(type)) {
      return false;
    }

    const listeners = this._listeners.get(type)!;
    const handle = listeners.slice();

    for (let i = 0, len = handle.length; i < len; i++) {
      handle[i].call(this, data);
    }

    return true;
  }
}
