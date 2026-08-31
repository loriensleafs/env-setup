# .github — CI and release workflows (ADR-002, ADR-016)

`ci.yml` runs the check gate and tests on macOS plus a gitleaks scan on ubuntu; `release.yml` builds
and attaches the darwin binaries. Drive them with `/run-github` (`gh` to inspect runs, the same
commands locally to reproduce).

- `release.yml` runs only on a pushed `v*` tag: a release is cut per CONTRIBUTING.md "Cutting a
  release", never by triggering the workflow to test it.
- The checks job stays on `macos-14`: item detection and the tests assume macOS.
- PR mechanics (checks lag after creation, merge commits) are in CONTRIBUTING.md step 8.
