# AGENTS.md

Guidelines for AI agents and contributors working in react-3d, a browser app that renders a
hexagon-tiled sphere with three.js and animates maze generation and A* pathfinding on it.

`CLAUDE.md` is a symlink to this file. Never edit `CLAUDE.md` directly.

---

## Structure

Single package (no workspaces). Vite builds `index.html` + `src/main.tsx` into `dist/`.

| Path                                                        | What it is                                                                                                                                                                           |
| ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `src/context/`                                              | Global options store (`createContext` + `useReducer`)                                                                                                                                |
| `src/components/editor/three/three.tsx`                     | The `<Canvas>`: lights, orbit controls, the active scene                                                                                                                             |
| `src/components/editor/three/navigation/`                   | DOM navigation bar and the algorithm/option buttons                                                                                                                                  |
| `src/components/editor/three/algorithms/hexasphere/`        | `HexaSphere.tsx`, the live scene component                                                                                                                                           |
| `src/components/editor/three/algorithms/shapes/hexasphere/` | Geometry (`topology`, `hexasphere`, `tile`, `painter`), the algorithms (`astar`, `maze`), the `Simulation` controller that owns their state, and `ReadyMazes.js` (precomputed mazes) |
| `src/utils/orbit/`                                          | Orbit controls wrapper and the camera button panel                                                                                                                                   |

### Legacy scene families (not yet ported)

The following directories still hold the original 2020 JavaScript and are **not** reachable from
`src/main.tsx`. They are excluded from `tsc` (`tsconfig.json` `include`), oxlint
(`.oxlintrc.json` `ignorePatterns`) and Prettier (`.prettierignore`) until each is migrated to
TypeScript and wired back into the scene switcher:

`algorithms/{astar,cubeAstar,cubemaze,cubeMazePathfinder,maze,mazeAStar}/`,
`algorithms/hexasphere/{hexaSpherePathfinder,hexaSphereMaze,hexaMazePathfinder}.js`,
`algorithms/shapes/*.js`, `panel/`, `instance/`, `instancing.js`, `src/utils/{edit,calculations,helpers,other}/`.

When porting one, remove it from all three exclusion lists in the same change.

---

## Commands

**Prerequisites:** Node.js 24.12.0 (`.nvmrc`), pnpm 11.24.0 (`packageManager` in `package.json`).

```bash
pnpm install                     # Install dependencies
pnpm dev                         # Vite dev server at http://localhost:3000
pnpm build                       # Production build to dist/
pnpm preview                     # Serve dist/

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
  non-null assertions. Guard indexed access instead.
- The hexasphere geometry is two non-indexed `BufferGeometry`s with an RGBA `color` attribute.
  Colour changes go through `Tile.setColor` / `Tile.setWallColors`; never mutate the geometry
  attributes directly.
- Tile indices are the vertex order of three r117's `IcosahedronGeometry`, reproduced by
  `topology.ts` (`IcosahedronGeometry(size, 2 ** detail - 1)` + first-occurrence dedupe).
  `ReadyMazes.js` depends on that order; do not change it.
