package com.pigeon.messenger.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * One endpoint of a flight route. Mirrors the frontend RouteLocation type.
 *
 * `source` records how the point was resolved (AREA_CODE, APPROXIMATE, PRECISE,
 * UNKNOWN) so the UI can label an area-code estimate differently from a precise
 * fix without having to guess from the coordinates.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RouteLocationDTO {
    private String source;
    private Double latitude;
    private Double longitude;
    private String displayRegion;
}
