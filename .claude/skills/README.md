# Claude skills for this repo

Claude Code loads every folder here as a skill when it works in this repository.
Each folder keeps its upstream licence file. To update a skill, copy the newer
upstream version over its folder.

## Front end and design

| Skill | Use it for | Source | Licence |
|---|---|---|---|
| `impeccable` | Design, redesign, critique, audit, polish or animate UI (`/impeccable audit`, `/impeccable polish`, …) | [pbakaus/impeccable](https://github.com/pbakaus/impeccable) | Apache-2.0 |
| `design-taste-frontend` | Anti-generic website design, copy and finish checks ("tasteskill") | [Leonxlnx/taste-skill](https://github.com/Leonxlnx/taste-skill) | MIT |
| `frontend-design` | Distinctive, intentional visual design for new or reworked UI | [anthropics/skills](https://github.com/anthropics/skills) | Apache-2.0 |
| `webapp-testing` | Testing pages in a real browser with Playwright | [anthropics/skills](https://github.com/anthropics/skills) | Apache-2.0 |
| `react-patterns`, `tailwind-patterns` | React components/hooks and Tailwind conventions | [ennio-datatide/ultrapowers-dev](https://github.com/ennio-datatide/ultrapowers-dev) | MIT |

## Back end (Laravel, data, security)

| Skill | Source | Licence |
|---|---|---|
| `laravel-patterns`, `php-best-practices` | [ennio-datatide/ultrapowers-dev](https://github.com/ennio-datatide/ultrapowers-dev) | MIT |
| `auth-and-authorization`, `boring-by-default`, `data-modeling-discipline`, `debugging-discipline`, `error-handling-as-design`, `idempotency-and-side-effects`, `migration-safety`, `observability-by-default`, `performance-and-scaling`, `query-discipline`, `security-discipline`, `testing-with-discernment`, `think-before-coding` | [sheitabrk/backend-design](https://github.com/sheitabrk/backend-design) | MIT |

## Notes

- **Impeccable** runs a small engine binary. On first use its launcher downloads it from
  Impeccable's GitHub releases and verifies it against `scripts/engine-checksums.txt`.
  The binary is not committed (see `.gitignore`).
- **tasteskill** ships about 38 MB of stock photos, icons and demo scenes in `assets/`.
  They are left out to keep this repo light; RAVU uses its own photography. To pull
  them in locally, run `scripts/fetch-taste-skill-assets.sh` (the folder is gitignored).
