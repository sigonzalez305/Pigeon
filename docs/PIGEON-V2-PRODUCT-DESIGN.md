# Pigeon Messenger v2 — Dusk Aviary

## North Star
Pigeon is a modern messenger where everyday communication is instant, but once a day a user can turn a meaningful message into a journey.

**Engineering rule:** Messaging is reliable. The pigeon is magical. Never confuse the two.

## Two-layer product

### Regular Messages
- Familiar Messenger/WhatsApp-style conversations.
- Optimistic UI and WebSocket reconciliation.
- Unlimited regular messaging.
- Network status: `sending -> sent -> delivered -> read`.

### Pigeon Messages
- One meaningful Pigeon Message per day in normal mode.
- Recipient -> pigeon -> scroll -> route -> weather -> launch -> flight -> arrival.
- Pigeon state is presentation/game state and must not gate network delivery.
- Test mode keeps theatrical flight duration between 1 and 5 minutes.

## Primary navigation
Mobile-first: **Coop | Messages | Send | Journal**.

## Dusk Aviary design system
- `--slate-dusk: #1B1F2A` app base
- `--coop-char: #12151D` elevated surfaces
- `--petrol: #2FBFA3` action / motion / in-flight
- `--feather-magenta: #E0509A` landed / delivered / read emphasis
- `--wheat: #E8D9B5` scroll paper / warmth
- `--sky-ash: #8A93A6` secondary / disabled

Typography: Bricolage Grotesque display, Inter body, Departure Mono utility/HUD. Pixel treatment belongs to the game/system voice, not every heading.

## Coop Town
The home is a living rooftop coop rather than a dashboard. The rendered world should eventually use PixiJS with a reduced-motion/static fallback. Interactions: pigeon, coop door, mailbox, launch pad, notice board and food bowl.

The pigeon supports identity, appearance, gear, level/XP, mood, energy and bond. Cosmetics never affect network deliverability.

## Flight Ribbon
A single arcing status line is the signature cross-product status element. Petrol while the pigeon is in motion; magenta dot on arrival; solid magenta on read. Tapping it opens flight details.

## Routing and location architecture
Pigeon must not couple flight logic to area codes. The flight engine consumes normalized coordinates and a location source.

### Routing source priority
1. `PRECISE` — device/browser geolocation that the user explicitly enabled/shared.
2. `APPROXIMATE` — saved city/region selected by the user.
3. `AREA_CODE` — U.S. phone area-code centroid.
4. `UNKNOWN` — ask for location information; do not invent coordinates.

### MVP behavior
Area-code routing works first. Parse U.S. phone numbers naturally; do not use a limited area-code dropdown. Resolve the area code to region plus approximate latitude/longitude. Use those coordinates for distance, weather and map endpoints.

### Precision Routing
Later, a user can explicitly enable location permission. Device coordinates then replace area-code centroids for that user's endpoint. Precise coordinates are private by default and must never be exposed to another user unless the owner explicitly shares them.

Do not continuously background-track location for MVP. Request/update location only at relevant moments such as enabling Precision Routing, opening a route, or sending a Pigeon Message.

### Endpoint model
```ts
export type LocationSource = 'AREA_CODE' | 'APPROXIMATE' | 'PRECISE' | 'UNKNOWN';

export interface RouteLocation {
  source: LocationSource;
  latitude: number;
  longitude: number;
  displayRegion: string;
  precisionRadiusMiles?: number;
  areaCode?: string;
  capturedAt?: string;
}
```

The route, distance, weather and flight systems accept `RouteLocation`; they must not care how coordinates were obtained.

## Weather
Use real weather for normalized origin/destination coordinates. Weather affects the theatrical flight simulation, never message reliability. If weather fails, visibly state that weather is unavailable and use neutral flight conditions. Never silently fabricate live weather.

## Flight
Persist launch and arrival timestamps. Reconstruct progress after refresh with:
`progress = clamp((now - launchTime) / (arrivalTime - launchTime), 0, 1)`.

Flight view shows origin, destination, route, distance, weather, ETA and animated pigeon. In test mode the final theatrical duration remains 1–5 minutes.

## Journal
Journal contains pigeon-life history: flights, distance, weather, duration, XP, badges and notable flight events. Conversation history stays in Messages.

## Developer mode
Provide a non-production developer affordance under/through the XP HUD. `Reset Daily Pigeon` clears only the daily special-message restriction. It must not clear pigeon profile, XP, history, cosmetics, badges or journal data. Additional test actions may complete a flight, trigger incoming messages, add XP and override test weather.

## Quality floor
- Mobile-first, minimum 375px.
- Visible keyboard focus and semantic controls.
- Respect `prefers-reduced-motion`.
- Interactions respond under 100ms where locally controllable.
- Target 60fps on mid-tier phones; remove effects that cannot sustain it.
- No emoji as production navigation/action icons.

## Implementation order
1. Replace legacy neon design tokens with Dusk Aviary tokens.
2. Add normalized routing/location domain types and area-code-first resolver boundary.
3. Add explicit opt-in browser geolocation service for future Precision Routing.
4. Refactor Send flow to recipient -> pigeon -> scroll -> skies -> launch.
5. Separate network message status from pigeon flight status.
6. Implement Flight Ribbon.
7. Build real flight view and persisted flight progress.
8. Upgrade Coop Town rendering and pigeon sprites.
9. Add Journal and developer controls.
