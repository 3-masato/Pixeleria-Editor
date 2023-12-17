export type Listener = (arg: any) => void;

export class EventDispatcher<
  EventMap extends {} = any,
  EventKey extends Extract<keyof EventMap, string> = Extract<keyof EventMap, string>
> {
  private _listeners = new Map<string, Listener[]>();

  on<K extends EventKey>(type: K, listener: (ev: EventMap[K]) => void): this {
    if (!this._listeners.has(type)) {
      this._listeners.set(type, []);
    }

    const listeners = this._listeners.get(type)!;
    listeners.push(listener);

    return this;
  }

  once<K extends EventKey>(type: K, listener: (ev: EventMap[K]) => void): this {
    const f: Listener = (data?) => {
      this.off(type, f);
      listener.call(this, data);
    };

    return this.on(type, f);
  }

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

  fire<K extends EventKey>(type: K, data?: EventMap[K]): boolean {
    if (!this._listeners.has(type)) {
      return !1;
    }
    const listeners = this._listeners.get(type)!;

    const handle = listeners.slice();

    for (let i = 0, len = handle.length; i < len; i++) {
      handle[i].call(this, data);
    }

    return !0;
  }
}
