<script setup lang="ts">
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch
} from "vue";
import {
  isTencentMapConfigured,
  loadTencentMap
} from "@/utils/map/tencent-map-loader";

defineOptions({ name: "MfmGeoPointPicker" });

export type GeoPointValue = { lng?: number; lat?: number };

type PoiItem = {
  title?: string;
  address?: string;
  location?: { lat: number; lng: number };
};

type SuggestOption = {
  value: string;
  item: PoiItem;
};

const props = withDefaults(
  defineProps<{
    modelValue?: GeoPointValue;
    city?: string;
    hint?: string;
  }>(),
  {
    modelValue: () => ({}),
    city: "济南",
    hint: ""
  }
);

const emit = defineEmits<{
  "update:modelValue": [value: GeoPointValue];
}>();

const mapEl = ref<HTMLDivElement | null>(null);
const searchText = ref("");
const mapReady = ref(false);
const mapError = ref("");
const mapEnabled = isTencentMapConfigured();

type GeoMap = InstanceType<NonNullable<Window["TMap"]>["Map"]>;
type GeoMultiMarker = InstanceType<NonNullable<Window["TMap"]>["MultiMarker"]>;

let TMapLib: NonNullable<Window["TMap"]> | null = null;
let map: GeoMap | null = null;
let markerLayer: GeoMultiMarker | null = null;
let suggestService: InstanceType<
  NonNullable<Window["TMap"]>["service"]["Suggestion"]
> | null = null;

const coord = computed(() => ({
  lng: props.modelValue?.lng,
  lat: props.modelValue?.lat
}));

function emitCoord(lng?: number, lat?: number) {
  emit("update:modelValue", {
    lng: lng == null || !Number.isFinite(lng) ? undefined : Number(lng),
    lat: lat == null || !Number.isFinite(lat) ? undefined : Number(lat)
  });
}

function setMarkerPosition(lng: number, lat: number, moveMap = true) {
  if (!map || !TMapLib) return;
  const position = new TMapLib.LatLng(lat, lng);
  if (markerLayer) {
    markerLayer.updateGeometries([
      { id: "picked", styleId: "marker", position }
    ]);
  } else {
    markerLayer = new TMapLib.MultiMarker({
      map,
      styles: {
        marker: new TMapLib.MarkerStyle({
          width: 25,
          height: 35,
          anchor: { x: 12, y: 35 }
        })
      },
      geometries: [{ id: "picked", styleId: "marker", position }]
    });
  }
  if (moveMap) map.setCenter(position);
  emitCoord(lng, lat);
}

async function fetchSuggestions(
  query: string,
  cb: (items: SuggestOption[]) => void
): Promise<SuggestOption[]> {
  if (!query.trim() || !suggestService || !TMapLib) {
    cb([]);
    return [];
  }
  try {
    const result = await suggestService.getSuggestions({
      keyword: query.trim(),
      region: props.city,
      region_fix: 1,
      location: map?.getCenter()
    });
    const items = (result.data ?? []).map(item => ({
      value: [item.title, item.address].filter(Boolean).join(" · "),
      item
    }));
    cb(items);
    return items;
  } catch {
    cb([]);
    return [];
  }
}

function onSelectPoi(option: SuggestOption) {
  const loc = option.item.location;
  if (loc?.lng != null && loc?.lat != null) {
    setMarkerPosition(loc.lng, loc.lat);
    map?.setZoom(16);
  }
}

async function initMap() {
  if (!mapEnabled || !mapEl.value) return;
  try {
    TMapLib = await loadTencentMap();
    await nextTick();

    const lng = coord.value.lng ?? 117.0;
    const lat = coord.value.lat ?? 36.65;

    map = new TMapLib.Map(mapEl.value, {
      center: new TMapLib.LatLng(lat, lng),
      zoom: 13
    });

    map.on("click", ev => {
      setMarkerPosition(ev.latLng.getLng(), ev.latLng.getLat(), false);
    });

    if (coord.value.lng != null && coord.value.lat != null) {
      setMarkerPosition(coord.value.lng, coord.value.lat, false);
    }

    suggestService = new TMapLib.service.Suggestion({ pageSize: 10 });
    mapReady.value = true;
  } catch (err) {
    mapError.value = err instanceof Error ? err.message : "地图加载失败";
  }
}

function destroyMap() {
  markerLayer?.setMap(null);
  markerLayer = null;
  suggestService = null;
  if (map) {
    map.destroy();
    map = null;
  }
  TMapLib = null;
  mapReady.value = false;
}

onMounted(() => {
  if (mapEnabled) void initMap();
});

onBeforeUnmount(() => {
  destroyMap();
});

watch(
  () => [props.modelValue?.lng, props.modelValue?.lat] as const,
  ([lng, lat], prev) => {
    if (lng == null || lat == null || !map) return;
    if (prev && lng === prev[0] && lat === prev[1]) return;
    setMarkerPosition(lng, lat, false);
  }
);
</script>

<template>
  <div class="mfm-geo-point-picker">
    <el-alert
      v-if="!mapEnabled"
      type="info"
      :closable="false"
      show-icon
      class="mfm-geo-point-picker__alert"
      title="未配置腾讯地图 Web Key"
      description="在 .env 中设置 VITE_TENCENT_MAP_KEY 后可地图选点/搜索；当前请手动输入经纬度。"
    />
    <el-alert
      v-else-if="mapError"
      type="warning"
      :closable="false"
      show-icon
      class="mfm-geo-point-picker__alert"
      :title="mapError"
    />

    <template v-if="mapEnabled && !mapError">
      <el-autocomplete
        v-model="searchText"
        :fetch-suggestions="fetchSuggestions"
        :trigger-on-focus="false"
        placeholder="搜索地址、小区或 POI（腾讯地图）"
        clearable
        class="mfm-geo-point-picker__search"
        @select="onSelectPoi"
      />
      <div ref="mapEl" class="mfm-geo-point-picker__map" />
      <p v-if="!mapReady" class="mfm-geo-point-picker__loading">地图加载中…</p>
    </template>

    <div class="mfm-geo-point-picker__coords">
      <el-input-number
        :model-value="coord.lng"
        :precision="6"
        :step="0.0001"
        placeholder="经度"
        controls-position="right"
        class="mfm-geo-point-picker__coord-input"
        @update:model-value="emitCoord($event, coord.lat)"
      />
      <el-input-number
        :model-value="coord.lat"
        :precision="6"
        :step="0.0001"
        placeholder="纬度"
        controls-position="right"
        class="mfm-geo-point-picker__coord-input"
        @update:model-value="emitCoord(coord.lng, $event)"
      />
    </div>

    <p v-if="hint" class="mfm-geo-point-picker__hint">{{ hint }}</p>
  </div>
</template>

<style scoped lang="scss">
.mfm-geo-point-picker {
  width: 100%;

  &__alert {
    margin-bottom: 12px;
  }

  &__search {
    width: 100%;
    margin-bottom: 10px;
  }

  &__map {
    width: 100%;
    height: 320px;
    overflow: hidden;
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 6px;
  }

  &__loading {
    margin: 8px 0 0;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  &__coords {
    display: flex;
    gap: 12px;
    margin-top: 12px;
  }

  &__coord-input {
    flex: 1;
    width: 100%;
  }

  &__hint {
    margin: 8px 0 0;
    font-size: 12px;
    line-height: 1.4;
    color: var(--el-text-color-secondary);
  }
}
</style>
