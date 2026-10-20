#!/usr/bin/env bash
# Compatibility entrypoint. All rules live in the shared Node engine.
set -euo pipefail
exec node "$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)/wiki-lint.js" "$@"
