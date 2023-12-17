/**
 * `createCustomEventDispatcher` 関数は、カスタムイベントを発行するためのディスパッチャーを作成します。
 *
 * @param component - イベントをディスパッチするHTMLElement。
 * @returns カスタムイベントをディスパッチする関数。
 *
 * @template EventMap - イベント名をキーとし、それに関連するデータ型を値とするレコード型。
 * @template EventKey - `EventMap` から抽出されたイベント名の型。
 *
 * この関数は、与えられたコンポーネントに対してカスタムイベントを発行するための関数を返します。
 * 返される関数は、イベント名 (`name`) とそのイベントに関連する詳細データ (`detail`) を受け取ります。
 *
 * 使用例：
 * ``` TypeScript
 * const dispatch = createCustomEventDispatcher<{ change: { value: string } }>(myElement);
 * dispatch('change', { value: 'newValue' }); // myElementに'change'イベントを発行
 * ```
 */
export const createCustomEventDispatcher = <
  EventMap extends Record<string, unknown>,
  EventKey extends Extract<keyof EventMap, string> = Extract<keyof EventMap, string>
>(
  component: HTMLElement
) => {
  /**
   * `dispatch` 関数は、特定の HTMLElement にカスタムイベントを発行するための関数です。
   *
   * @param name - 発行するイベントの名前。`EventMap` に定義されているイベント名のいずれかです。
   * @param detail - イベントに関連付けられたデータ。`EventMap` の対応するイベント名の値の型に基づきます。
   * @returns イベントが正常にディスパッチされた場合は `true`、それ以外は `false` を返します。
   *
   * この関数は、`name` で指定されたイベント名と、`detail` で与えられたイベント関連データを使用して、
   * 新しい `CustomEvent` インスタンスを作成し、それを `component` に対して発行します。
   * イベントはバブリングしないため、`component` の直接のリスナーのみがイベントを受け取ります。
   */
  const dispatch = (name: EventKey, detail: EventMap[EventKey]): boolean => {
    return component.dispatchEvent(new CustomEvent(name, { detail }));
  };

  return dispatch;
};
