#!/usr/bin/env python3
"""Claude adapter for the shared warning-only Node validator."""
from pathlib import Path
import subprocess
import sys

if __name__ == "__main__":
    script = Path(__file__).resolve().parents[2] / "SYSTEM/SCRIPTS/validate-vault-write.js"
    try:
        sys.exit(subprocess.run(["node", str(script)], input=sys.stdin.buffer.read()).returncode)
    except OSError as error:
        print("Vault hook validation incomplete: " + str(error), file=sys.stderr)
        sys.exit(2)
