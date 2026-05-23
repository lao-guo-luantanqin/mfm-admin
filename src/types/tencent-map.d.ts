/** 腾讯地图 Javascript API GL（Web 端，与小程序内置腾讯地图同系） */

declare global {
  interface Window {
    TMap?: TencentMapApi;
  }
}

interface TencentMapApi {
  Map: new (
    container: HTMLElement,
    options: { center: TMapLatLng; zoom: number }
  ) => TMapMap;
  LatLng: new (lat: number, lng: number) => TMapLatLng;
  MultiMarker: new (options: {
    map: TMapMap;
    styles: Record<string, TMapMarkerStyle>;
    geometries: TMapMarkerGeometry[];
  }) => TMapMultiMarker;
  MarkerStyle: new (options: {
    width: number;
    height: number;
    anchor: { x: number; y: number };
  }) => TMapMarkerStyle;
  service: {
    Suggestion: new (options?: { pageSize?: number }) => TMapSuggestion;
  };
}

interface TMapLatLng {
  getLat(): number;
  getLng(): number;
}

interface TMapMap {
  on(event: "click", handler: (ev: TMapClickEvent) => void): void;
  setCenter(center: TMapLatLng): void;
  setZoom(zoom: number): void;
  getCenter(): TMapLatLng;
  destroy(): void;
}

interface TMapClickEvent {
  latLng: TMapLatLng;
}

interface TMapMarkerGeometry {
  id: string;
  styleId: string;
  position: TMapLatLng;
}

interface TMapMultiMarker {
  updateGeometries(geometries: TMapMarkerGeometry[]): void;
  setMap(map: TMapMap | null): void;
}

interface TMapMarkerStyle {
  width: number;
  height: number;
}

interface TMapSuggestion {
  getSuggestions(options: {
    keyword: string;
    region?: string;
    region_fix?: number;
    location?: TMapLatLng;
  }): Promise<{ data?: TMapSuggestionItem[] }>;
}

interface TMapSuggestionItem {
  title?: string;
  address?: string;
  location?: { lat: number; lng: number };
}

export {};
