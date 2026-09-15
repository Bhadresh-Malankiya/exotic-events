# Checks actually performed

- 74 GLB files: binary headers, chunk sizes/alignment, embedded buffers, accessor/index bounds, normals, material ranges and animation channels/timestamps checked with a custom validator. These are not Khronos certification results.
- 150 SVGs: parsed as XML, checked for viewBox and absence of script elements.
- 14 Lottie files: parsed and checked for the expected vector-only composition/transform structure, including 3D-sized layer transform vectors. No external assets. The production lottie-web runtime was unavailable and was not tested.
- 157 runtime raster files decoded, with transparent-alpha checks on model renders/overlays.
- 35 3D model designs rendered using VTK from their actual geometry.
- Catalogue rendered at desktop and 390px mobile widths with no horizontal overflow; category filtering, search, selection, animation-preview play/pause and explicit reduced-motion poster behavior tested in a browser.
- An animated-SVG orbit visibly changed over time. Its external-image media-query behavior was unreliable, so the catalogue applies its own explicit static fallback.
- Browser navigation to local URLs was blocked by the environment. The catalogue was tested by in-memory DOM rendering with local images embedded for the test. Local-server/file navigation itself remains untested here.
- The browser did not provide WebGL 2; the model inspector displayed its unavailable-WebGL fallback. Real-time GLB display/PBR and embedded clip playback were not browser-tested.
- No finished Next.js application was created or tested as part of packaging these assets.

See QUALITY_CHECKS.json for machine-readable detail.
