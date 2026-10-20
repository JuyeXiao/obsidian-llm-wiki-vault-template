#!/usr/bin/env python3
"""Compatibility entrypoint; delegates all checks to the shared Node engine."""
from pathlib import Path
import subprocess
import sys

if __name__ == "__main__":
    sys.exit(subprocess.call(["node", str(Path(__file__).with_suffix(".js")), *sys.argv[1:]]))
