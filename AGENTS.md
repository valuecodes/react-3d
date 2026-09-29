# AGENTS.md

Guidelines for AI agents and contributors working in react-3d, a browser app that visualises maze
generation and A\* pathfinding on a hexagon-tiled sphere, a flat grid and a cube, plus an
instancing demo and a small mesh editor, all rendered with three.js through @react-three/fiber.

`CLAUDE.md` is a symlink to this file. Never edit `CLAUDE.md` directly.

---

## Structure

Single package (no workspaces). Vite builds `index.html` + `src/main.tsx` into `dist/`.

| Path                     | What it is                                                                                                                                                         |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `src/index.css`          | Tailwind 4 entry: `@theme` colour tokens (light palette) and base styles                                                                                           |
| `src/components/shell/`  | The app shell: sidebar, scene picker, camera panel, mode pill, shared `SimulationControls` and `StatusSection`                                                     |
| `src/components/ui/`     | Small Tailwind primitives (`Button`, `SegmentedControl`, `Section`, `Slider`, `Badge`, `Kbd`)                                                                      |
| `src/three/`             | Canvas-level pieces: `Viewport`, `CameraRig` (orbit + damped presets), lights, helpers, `useSimulation`, `pathline`, `instancedPainter`, `pathCursor`              |
| `src/lib/`               | Framework-free helpers: external stores (`store`, `statusStore`, `viewportStore`), hash routing, `invariant`/`at`, and `graph/` (generic A\* and maze backtracker) |
| `src/scenes/types.ts`    | `SceneDefinition`: id, name, camera, `Provider`, `Scene` (inside the Canvas), `Panel` (sidebar)                                                                    |
| `src/scenes/registry.ts` | The ordered scene list; the first entry is the default route                                                                                                       |
| `src/scenes/hexasphere/` | Options + reducer, provider, scene, panel and `model/` (geometry, tiles, painter, `astar`, `maze`, `Simulation`, `ReadyMazes.js`)                                  |
| `src/scenes/grid/`       | Flat board: `grid` (cells), `gridMeshes` (instanced cells and walls), `GridSimulation`                                                                             |
| `src/scenes/cube/`       | Cube faces: `formations` (cube/net transforms), `cube` (cells with cross-face links), `cubeMeshes`, `CubeSimulation`                                               |
| `src/scenes/instancing/` | InstancedMesh demo                                                                                                                                                 |
| `src/scenes/meshEditor/` | Indexed box geometry, `topology`, `EditableMesh`, handles and the drei `TransformControls` gizmo                                                                   |

### How a scene works

The shell mounts `<scene.Provider key={id}>` around both the sidebar `Panel` and the in-canvas
`Scene` (react-three-fiber bridges React context into the Canvas). The provider owns scene-local
React state and the three.js model plus simulation instances (created with `useMemo`, disposed in
an effect). Simulations are plain classes with `start`/`pause`/`resume`/`reset`/`tick`; the
`useSimulation` hook calls `tick()` from `useFrame` while the shared `statusStore` phase is
"running". A simulation reports its status (phase, progress, message, `canStart`, details) after
every change, and the provider writes `viewportStore` (orbit on/off, cursor, floating mode pill)
from its interaction mode.

---

## Commands

**Prerequisites:** Node.js 24.21.0 (`.nvmrc`), pnpm 11.24.0 (`packageManager` in `package.json`).

```bash
pnpm install                     # Install dependencies
pnpm dev                         # Vite dev server at http://localhost:3000
pnpm build                       # Production build to dist/
pnpm preview                     # Serve dist/
pnpm run deploy                  # Build and `wrangler deploy` (static-assets Worker, wrangler.jsonc)

pnpm typecheck                   # tsc (TypeScript 7, native compiler)
pnpm lint                        # oxlint, type-aware, over the whole repo
pnpm test                        # vitest run
pnpm format                      # prettier --write .
pnpm format:check                # prettier --check . (no writes)
pnpm secrets:scan                # gitleaks over the full git history
pnpm clean                       # remove node_modules, dist, .cache
```

oxlint prints nothing when there are no findings, so silent output means clean. There is no
post-edit formatting hook: run `pnpm format` yourself before committing.

`secrets:scan` runs gitleaks (`scripts/secrets-scan.sh`, version pinned there) using a local
`gitleaks` v8.19+ if one is on PATH, otherwise the pinned Docker image.

CI (`.github/workflows/`) runs typecheck, lint, format-check, test, build and secrets-scan on
push to `master` and on PRs.

---

## Rules

- Keep diffs tight and focused; no drive-by refactors or new tooling without discussion.
- Never commit secrets, credentials, or `.env` files. All code must be public-safe.
- Add dependencies with `pnpm add <dep>` (exact versions, see `.npmrc`). `pnpm-workspace.yaml`
  sets a 14-day `minimumReleaseAge`, so "latest" means the newest version at least 14 days old.
- TypeScript is strict with `noUncheckedIndexedAccess`; the lint rules forbid `any` and `!`
  non-null assertions. Guard indexed access (`at()` from `src/lib/invariant.ts`) instead.
- The React Compiler lint rules are on: never assign properties on objects that came from a hook
  (`camera.position.x = …`); call methods (`position.set(…)`) or keep mutable state in a class.
- Tailwind only sees complete class names: write whole class strings, never build them from parts.
  Shared looks live in `src/components/ui/`, not in ad-hoc class constants.
- Colour changes go through a painter: `Tile.setColor` / `Tile.setWallColors` for the hexasphere,
  `InstancedPainter` for instanced meshes. Never write geometry attributes directly.
- Simulation state lives in a class driven by `useSimulation`; React only forwards options and
  pointer events. Scene-local UI state stays in the scene's Provider, never in the shell.
- Hexasphere tile indices are the vertex order of three r117's `IcosahedronGeometry`, reproduced by
  `topology.ts` (`IcosahedronGeometry(size, 2 ** detail - 1)` + first-occurrence dedupe).
  `ReadyMazes.js` depends on that order; do not change it.
