# react-3d

Maze generation and pathfinding, visualised in 3D with [three.js](https://threejs.org/) and
[@react-three/fiber](https://docs.pmnd.rs/react-three-fiber). Pick a scene in the sidebar; each
scene has its own controls, and every URL hash (`#/grid-astar`) is a link to that scene.

[![A maze carved over a hexasphere, A* across the faces of a cube, and a grid maze solved](docs/promo.gif)](docs/promo.mp4)

_Preview at 2× speed. Click it for the full 20-second video._

| Scene                | What it shows                                                                                   |
| -------------------- | ----------------------------------------------------------------------------------------------- |
| Hexasphere           | A hexagon-tiled sphere: A\* with painted obstacles, a random maze, or a precomputed maze solved |
| Grid A\*             | A\* on a flat board with random or painted obstacles and a tracker that walks the path          |
| Grid Maze            | Recursive-backtracker maze on the board                                                         |
| Grid Maze Pathfinder | Carve a maze, then let A\* solve it                                                             |
| Cube A\*             | A\* across the faces of a cube; the cube turns to follow the search and can unfold into a net   |
| Cube Maze            | A maze that crosses cube edges                                                                  |
| Cube Maze Pathfinder | Maze, then A\*, then the tracker, across the cube                                               |
| Instancing           | Thousands of cylinders in one draw call, optionally animated                                    |
| Mesh Editor          | Select vertices, edges or faces of a box and drag them with a gizmo                             |

Common controls: Start / Pause / Reset with a speed slider, camera presets, grid and axes helpers.
Press `Esc` to leave any placing or painting mode and orbit again.

## Getting started

Requires Node.js 24 (`.nvmrc`) and pnpm 11 (`packageManager` in `package.json`).

```bash
pnpm install
pnpm dev        # http://localhost:3000
```

## Scripts

| Command             | Purpose                        |
| ------------------- | ------------------------------ |
| `pnpm dev`          | Vite dev server on port 3000   |
| `pnpm build`        | Production build to `dist/`    |
| `pnpm preview`      | Serve the production build     |
| `pnpm run deploy`   | Build and deploy to Cloudflare |
| `pnpm typecheck`    | TypeScript                     |
| `pnpm lint`         | oxlint (type-aware)            |
| `pnpm test`         | Vitest                         |
| `pnpm format`       | Prettier (write)               |
| `pnpm format:check` | Prettier (check only)          |
| `pnpm secrets:scan` | gitleaks over the git history  |

## Deploy

The site is a static-assets Cloudflare Worker, configured in `wrangler.jsonc`, that serves
Vite's `dist/`. Workers Builds uses the build command `pnpm run build` and the deploy command
`npx wrangler deploy`, which runs the pinned local wrangler. It picks up Node from `.nvmrc` and
pnpm from `packageManager`. To deploy by hand, run `pnpm run deploy` (`pnpm deploy` is a built-in
pnpm command, not this script).

Response headers (the CSP, which allows Cloudflare Web Analytics, and the cache rules) live in
`public/_headers`, which Vite copies into `dist/`.

See `AGENTS.md` for the code layout and conventions.
