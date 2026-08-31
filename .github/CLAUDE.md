# .github — CI and release workflows (ADR-002, ADR-016)

- `release.yml` runs only on a pushed `v*` tag and uploads assets: cut a release per
  CONTRIBUTING.md; never trigger it to test. Uploads have flaked ("other side closed") — re-run the
  job and verify both darwin assets.
- `ci.yml`'s checks job stays on macOS (`macos-14`): detection and tests assume it; gitleaks runs on
  ubuntu.
- `gh pr checks <n> --watch` says "no checks reported" for ~20 s after `gh pr create` — wait and
  retry rather than reading it as green.
