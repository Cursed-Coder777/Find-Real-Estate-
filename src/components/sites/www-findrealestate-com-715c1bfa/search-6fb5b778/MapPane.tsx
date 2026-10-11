"use client";

/**
 * Map pane — placeholder for now.
 *
 * Measured on the live /search at 1440x900: the pane is 630x761 inside
 * `.property-listing-page_map-container`, and the origin's map element is
 *
 *   div.map-view_map-view
 *     div#map.map_map     (background rgb(179,179,179) before tiles paint)
 *
 * with 12 `map_marker-popup` cards behind it.
 *
 * IMPORTANT: the map is **Google Maps**, not Mapbox. The live DOM carries
 * `gm-style`, `gm-style-moc`, `gm-style-mot`, `gm-control-active`,
 * `gm-fullscreen-control` and `gm-bundled-control` — all Google Maps JS API
 * classes, and zero Mapbox/MapLibre classes.
 *
 * This component therefore reserves the exact measured box so the layout is
 * correct, and paints the same grey the origin shows before its tiles load.
 * The real integration slots in behind `MAP_MOUNT_ID` without moving anything.
 */

export const MAP_MOUNT_ID = "map";

/** Measured surface colour of the origin's map element before tiles paint. */
export const MAP_PLACEHOLDER_BG = "rgb(179, 179, 179)";

export function MapPane() {
  return (
    <div className="map-view_map-view">
      <div id={MAP_MOUNT_ID} className="map_map" style={{ background: MAP_PLACEHOLDER_BG }}>
        {/* Real map mounts here. Nothing else may live inside this element,
            the origin's script clears it before initialising. */}
      </div>
    </div>
  );
}

export default MapPane;