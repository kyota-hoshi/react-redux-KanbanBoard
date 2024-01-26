/**
 * ランダムなIDを生成する
 */
export function randomId() {
    const alphabet = '0123456789abcdefghijklmnopqrstuvwxyz_ABCDEFGHIJKLMNOPQRSTUVWXYZ-';
    let id = '';
    for (let i = 12; i > 0; i--) {
        id += alphabet[(Math.random() * 64) | 0];
    }
    return id;
}
/**
 * リストを順序情報に従ってソートした新しいリストを返す
 *
 * @param list リスト
 * @param order 順序情報
 * @param head リストの先頭キー
 */
export function sortBy(list, order, head) {
    const map = list.reduce((m, e) => m.set(e.id, e), new Map());
    const sorted = [];
    let id = order[head];
    for (let i = list.length; i > 0; i--) {
        if (!id || id === head)
            break;
        const e = map.get(id);
        if (e)
            sorted.push(e);
        id = order[id];
    }
    return sorted;
}
/**
 * リストの順序情報を並べ替える PATCH リクエストのための情報を生成する
 *
 * @param order リストの順序情報
 * @param id 移動対象のID
 * @param toId 移動先のID
 */
export function reorderPatch(order, id, toId = null) {
    const patch = {};
    if (id === toId || order[id] === toId) {
        return patch;
    }
    const [deletekey] = Object.entries(order).find(([, v]) => v && v === id) || [];
    if (deletekey) {
        patch[deletekey] = order[id];
    }
    const [insertKey] = Object.entries(order).find(([, v]) => v && v === toId) || [];
    if (insertKey) {
        patch[insertKey] = id;
    }
    patch[id] = toId;
    return patch;
}
