# react-3d

A hexagon-tiled sphere rendered with [three.js](https://threejs.org/) and
[@react-three/fiber](https://docs.pmnd.rs/react-three-fiber), with three interactive algorithms:

- **Pathfinder** — pick a start and a target tile, paint obstacles, and watch A* search the sphere.
- **Maze Creator** — carve a maze over the sphere with a randomised depth-first walk.
- **Maze Pathfinder** — load a precomputed maze and let A* solve it.

## Getting started

Requires Node.js 24 (`.nvmrc`) and pnpm 11 (`packageManager` in `package.json`).

```bash
pnpm install
pnpm dev        # http://localhost:3000
```

## Scripts

| Command             | Purpose                       |
| ------------------- | ----------------------------- |
| `pnpm dev`          | Vite dev server               |
| `pnpm build`        | Production build to `dist/`   |
| `pnpm preview`      | Serve the production build    |
| `pnpm typecheck`    | TypeScript                    |
| `pnpm lint`         | oxlint (type-aware)           |
| `pnpm test`         | Vitest                        |
| `pnpm format`       | Prettier (write)              |
| `pnpm format:check` | Prettier (check only)         |
| `pnpm secrets:scan` | gitleaks over the git history |

See `AGENTS.md` for the code layout, conventions and the list of legacy scenes still to be ported.
