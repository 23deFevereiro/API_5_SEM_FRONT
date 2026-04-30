#!/usr/bin/env python3

import re
import sys

ALLOWED_TYPES = ["feat", "fix", "docs", "chore", "refactor", "test", "style", "ci", "perf"]

COMMIT_PATTERN = re.compile(
    r"^(?P<type>[a-z]+)"
    r"\((?P<id>#\d+|RF-\d+|RNF-\d+)\)"
    r": (?P<msg>.+)$"
)

MAX_FIRST_LINE = 72


def validate(commit_msg_file: str) -> None:
    with open(commit_msg_file, encoding="utf-8") as f:
        lines = f.readlines()

    content_lines = [l for l in lines if not l.startswith("#")]
    if not content_lines:
        _fail("Commit message is empty.")

    first_line = content_lines[0].rstrip()

    if len(first_line) > MAX_FIRST_LINE:
        _fail(
            f"First line too long ({len(first_line)} chars). Max: {MAX_FIRST_LINE}.\n"
            f"  Got: {first_line}"
        )

    match = COMMIT_PATTERN.match(first_line)
    if not match:
        _fail(
            "Commit message does not match the required format.\n\n"
            "  Expected:  type(#123): short message in English\n"
            "             type(RF-01): short message in English\n"
            "             type(RNF-01): short message in English\n\n"
            f"  Got:       {first_line}\n\n"
            f"  Allowed types: {', '.join(ALLOWED_TYPES)}"
        )

    commit_type = match.group("type")
    if commit_type not in ALLOWED_TYPES:
        _fail(
            f"Invalid commit type: '{commit_type}'.\n"
            f"  Allowed types: {', '.join(ALLOWED_TYPES)}"
        )

    print(f"✅ Commit message OK: {first_line}")


def _fail(message: str) -> None:
    print(f"\n❌ Invalid commit message:\n   {message}\n", file=sys.stderr)
    sys.exit(1)


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: validate_commit_msg.py <commit-msg-file>", file=sys.stderr)
        sys.exit(1)
    validate(sys.argv[1])