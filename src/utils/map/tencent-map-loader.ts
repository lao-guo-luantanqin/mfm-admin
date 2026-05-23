/** 腾讯地图 Javascript API GL 按需加载 */

type LoadedTencentMap = NonNullable<Window["TMap"]>;

let loadPromise: Promise<LoadedTencentMap> | null = null;

export function getTencentMapKey(): string {
  return String(import.meta.env.VITE_TENCENT_MAP_KEY ?? "").trim();
}

export function isTencentMapConfigured(): boolean {
  return Boolean(getTencentMapKey());
}

export function loadTencentMap(): Promise<LoadedTencentMap> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("腾讯地图 SDK 仅可在浏览器中加载"));
  }
  if (window.TMap) {
    return Promise.resolve(window.TMap);
  }

  const key = getTencentMapKey();
  if (!key) {
    return Promise.reject(new Error("未配置 VITE_TENCENT_MAP_KEY"));
  }

  if (!loadPromise) {
    loadPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.type = "text/javascript";
      script.src = `https://map.qq.com/api/gljs?v=1.exp&key=${encodeURIComponent(
        key
      )}&libraries=service`;
      script.onload = () => {
        if (window.TMap) resolve(window.TMap);
        else reject(new Error("腾讯地图 SDK 加载失败"));
      };
      script.onerror = () => reject(new Error("腾讯地图 SDK 脚本加载失败"));
      document.head.appendChild(script);
    });
  }

  return loadPromise;
}
