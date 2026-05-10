export const COS_BASE = 'https://mothersday-1388989467.cos.accelerate.myqcloud.com';

let _preloadedModel = null;

export async function preloadModel(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    _preloadedModel = await res.arrayBuffer();
  } catch (err) {
    console.warn('预加载模型失败，进入 AR 时将重新加载:', err.message);
    _preloadedModel = null;
  }
}

export function consumePreloadedModel() {
  const buf = _preloadedModel;
  _preloadedModel = null;
  return buf;
}
