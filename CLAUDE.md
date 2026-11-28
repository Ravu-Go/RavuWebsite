# RAVU website: instructions for Claude

## Git workflow (always)

1. Start every change from the latest `staging` branch, on a new branch named for the change.
2. Push the branch and open a pull request **into `staging`** (never into `main`).
3. Once the build passes and the PR has no merge conflicts, **merge the PR into `staging`** yourself. Don't stop at an open PR.
4. Never push directly to `staging` or `main`, and never merge into `main`. Promoting `staging` to `main` is done by the team.

## Before opening a PR

- Run `npm run build` and fix anything it reports.
- For changes to the public pages, check them in a browser at phone (390px) and desktop (1440px) widths.
- Page copy lives in `resources/content/*.json`. These are only the defaults: anything published through the Super Admin content editor overrides them, so mention that in the PR when copy changes.
