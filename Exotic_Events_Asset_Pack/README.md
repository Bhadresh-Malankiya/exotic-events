# Exotic Event & Entertainment — source asset pack

## Start here

1. Extract this ZIP. Open `START_HERE.html` to browse local previews, filter categories, and download a shortlist of your selections as JSON.
2. Copy **`public/assets/exotic/`** into your project's **`public/assets/exotic/`**. A served asset URL then looks like `/assets/exotic/models/portal-arch.glb` — without the word `public`.
3. Give the coding agent `BUILD_PROMPT.md`, `ASSET_MAP.md`, the manifest and your chosen reference image/selection. Choose only the best-fitting assets; do not load everything onto one page.

The flat file tree is designed for a Next.js/React project, but the assets are not framework-specific. Nothing here changes your project or publishes files automatically.

## What is actually included

35 original stylized 3D model/scene designs with GLB geometry and material factors; lighter variants; four animated counterparts; 52 custom SVG icon designs in two color treatments; 14 Lottie JSON designs plus animated-SVG alternatives; static motion posters; separate transparent model PNGs; ornaments, PNG overlays, text-free 3D background illustrations, textures, an original HDR environment, logo derivatives, favicons, design tokens and implementation guidance. The exact file inventory and checksums are in `ASSET_MANIFEST.json` and `CHECKSUMS.sha256`.

The preview images from the earlier conversation were available, but their underlying editable GLB/Lottie sources were not recovered. This is a newly built usable source pack matching that direction, with those earlier previews preserved separately under `references/`. It is not a promise that every object pictured in the generated collage has an identical editable counterpart.

## Offline previews

- The catalogue, image previews, standalone SVG animations and GIF previews work after extraction without a CDN dependency.
- `examples/model-viewer.html` can inspect actual GLB geometry offline using its file picker. It is an original lightweight geometry viewer, not a full PBR renderer; it does not play embedded animation clips.
- For direct model links in the catalogue, run `python serve-preview.py` from this folder and open the printed local URL. The server binds only to localhost. There is no upload, analytics or external connection in that preview.
- The preview model viewer supports the meshes/material colors in this pack. For complete PBR appearance and GLB clip playback, integrate with a production glTF renderer.

## Geometry notes

Models use glTF 2.0 binary files, +Y up and +Z front, generally metre-scale. Material factors and normals are embedded; there are no external texture/image dependencies. Mesh groups are named. Flower surfaces, ribbons, crowns and drapery can be open/double-sided surfaces; these are visual web assets, not watertight fabrication/CAD models. Reference the recorded bounds instead of assuming every object's origin is its exact geometric center.

The full floral scenes are deliberately detailed, with lower-resolution counterparts provided. Start with a light model and upgrade only when justified. No Draco/Meshopt compression or rigging is included. The four `models/animated/` files include simple transform clips, not cloth simulation, skeletal animation or photorealistic effects.

Gold reflections depend strongly on the application's lighting and renderer. PNG previews use a studio-style approximate renderer and are not a guarantee of an identical appearance in every engine. Optional `textures/studio-softbox.hdr` can help establish a consistent light environment.

## Motion notes

Lottie JSON files contain original vector shapes/keyframes, not filenames pasted onto a picture. One-shot recommendations and poster frames are recorded in `lottie-manifest.json`. Standalone SVG alternatives use native SVG animation and include a reduced-motion static alternative. Use only one visual format for any one interaction.

The animations were structurally inspected and their SVG counterparts previewed separately. The actual production `lottie-web` runtime was not installed in this environment, so final playback compatibility with your chosen Lottie version must be tested in your application. SVG fallback exports use simpler interpolation and are not guaranteed frame-identical to Lottie. Do not interpret this archive as a tested complete Next.js application.

Do not show a loader while no real load is pending. Do not delay first content for a decorative intro. Show the success animation only after an actual successful action. Respect reduced motion, pause offscreen/hidden-tab animation, and do not animate every decorative element simultaneously.

## Branding and imagery

The original supplied logo is low resolution. Transparent/color versions are derivatives of it. `logo-trace.svg` and `emblem-trace.svg` are approximate silhouettes, not exact master vectors. Review fine detail before use; use the official logo master when available.

`backgrounds/` contains original stylized 3D scene illustrations. `references/` contains AI-generated concepts. Neither establishes the business's real portfolio, clients, event counts, reviews, geographic coverage, contact details or awards. Verify all business content before publication.

## Documentation and sources

Official integration references are recorded in `docs/TECHNICAL_REFERENCES.md`. No font files are included. Asset provenance and the third-party-library situation are documented in `docs/PROVENANCE.md`.

`QUALITY_CHECKS.json` records the checks performed on this pack and any untested integration areas. Use `sources/` for the new procedural generators, not as a required runtime dependency. The `examples/` directory is a development aid; inspect and integrate it deliberately rather than copying it blindly into production.

### Reliable reduced-motion fallback
The animated SVG files contain internal reduced-motion styles, but browser image contexts may not propagate the preference consistently. The catalogue explicitly chooses static posters at the parent-page level. Production components should also select the static poster using matchMedia or useReducedMotion rather than relying only on an external SVG's media query.
