# What to choose, where to use it

Choose from the library; do not load the library. The visual references are inspiration, not a list of claims about the business.

| Area | Main candidate | Supporting detail | Motion choice |
|---|---|---|---|
| Homepage hero | `models/mobile/scene-wedding-portal.glb` | `overlays/floral-corner-left.png` | brief one-shot `exotic-emblem-reveal` before a subtle arch-entry sequence |
| Minimal/lightweight hero | `models/portal-arch-triple.glb` | `ornaments/champagne-arc.svg` | small camera move; no forced intro |
| Wedding service | `models/mandap-pavilion.glb` | `icons/gold/wedding-rings.svg` | `petal-bloom` as a small detail only |
| Navratri service | `models/mobile/scene-festive-entry.glb` | `ornaments/mandala-navratri.svg` | `navratri-rhythm` |
| Corporate service | `models/suspended-halo.glb` | `models/podium-trio.glb` | restrained illumination, no bridal clutter |
| Hospitality service | `models/mobile/scene-hospitality.glb` | `icons/gold/hospitality.svg` | gentle section reveal |
| Custom décor | `models/animated/sculptural-ribbon.glb` | `icons/gold/floral-decor.svg` | embedded Float clip OR scroll transform, not both on one node |
| Destination planning | `models/mandap-pavilion.glb` | `icons/gold/globe-route.svg` | airy editorial transition; no invented global footprint |
| Planning process | `models/invitation-suite.glb` | `ornaments/progress-journey.svg` | `journey-draw` |
| Actual pending request | — | readable “Loading” status | `exotic-emblem-orbit` or `loading-dots` |
| Actual successful enquiry | — | meaningful status text | `booking-success`, one-shot |
| Final CTA | `model-renders/sculptural-ribbon.png` | `ornaments/divider-botanical.svg` | usually static |

All paths above are relative to `public/assets/exotic/`. In the application use `/assets/exotic/...`.

## Scene budgets

The full wedding scene is much denser than a single arch. Start with the lighter variant or the basic arch. Compare the geometry counts in `models-manifest.json`; do not preload all scenes. Four animated models are counterpart variants, not four additional design concepts.

## Library categories

- **3D**: 35 model/scene designs, 35 lower-resolution counterparts (one minimal sparkle cannot meaningfully simplify), plus four counterparts with embedded clips. No external textures required for base materials. `studio-softbox.hdr` is an optional original studio-light environment.
- **Icons**: 52 original designs in fixed champagne and currentColor variants. A currentColor SVG loaded as an external `<img>` does not inherit a parent's CSS color. Inline it or use a CSS mask, or choose the fixed-color variant.
- **Motion**: 14 Lottie JSON designs, 14 animated SVG alternatives, and static posters. The SVGs are independent preview/fallback exports with simpler interpolation; do not assume frame-perfect identity with a production Lottie player.
- **Logo**: original raster plus native-size transparent/color variants, approximate silhouette vector traces and favicon derivatives. The supplied raster limits fine detail. Replace with the official master artwork when available.
- **Images**: 35 transparent model renders, six text-free 3D background illustrations, ten PNG overlay designs, 16 SVG ornament designs with PNG counterparts, procedural textures and thumbnails.
- **Reference**: the earlier AI-generated homepage concepts and asset-board collage. These are flattened images, not editable 3D or Lottie sources.

## Important exclusions

This is not a finished website, not an archive of every original editable source implied by the earlier image collage, and not a photo library of the business's completed events. No `.blend`/After Effects source was recovered. Reproducible Python geometry/vector/animation generators for the new source assets are included instead. No font files, licensed stock-photo collections, private credentials or paid-model downloads are included.

### Reliable reduced-motion fallback
The animated SVG files contain internal reduced-motion styles, but browser image contexts may not propagate the preference consistently. The catalogue explicitly chooses static posters at the parent-page level. Production components should also select the static poster using matchMedia or useReducedMotion rather than relying only on an external SVG's media query.
