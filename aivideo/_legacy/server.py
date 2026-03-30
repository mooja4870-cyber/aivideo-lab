from __future__ import annotations

import json
import os
import subprocess
import sys
from pathlib import Path

from flask import Flask, jsonify, request

PROJECT_ROOT = Path(__file__).resolve().parent
INPUT_PATH = PROJECT_ROOT / "output.json"
REQUIRED_KEYS = {"hook", "story", "image_prompts", "thumbnail_prompt"}

app = Flask(__name__)


def has_render_payload(payload: dict) -> bool:
    return REQUIRED_KEYS.issubset(payload.keys())


@app.get("/health")
def health_check():
    return jsonify({"status": "ok"})


@app.post("/generate")
def generate():
    payload = request.get_json(silent=True)
    if not isinstance(payload, dict):
        return jsonify({"ok": False, "error": "JSON body is required."}), 400

    command = [sys.executable, "main.py"]

    if has_render_payload(payload):
        INPUT_PATH.write_text(
            json.dumps(payload, ensure_ascii=False, indent=2),
            encoding="utf-8",
        )
        command.extend(["--input", str(INPUT_PATH)])
    elif payload.get("topic"):
        command.extend(["--topic", str(payload["topic"])])
    else:
        return jsonify(
            {
                "ok": False,
                "error": "Provide either a full output payload or a topic field.",
            }
        ), 400

    completed = subprocess.run(
        command,
        cwd=PROJECT_ROOT,
        capture_output=True,
        text=True,
    )

    try:
        result = json.loads(completed.stdout.strip()) if completed.stdout.strip() else {}
    except json.JSONDecodeError:
        result = {"raw_stdout": completed.stdout.strip()}

    status_code = 200 if completed.returncode == 0 else 500
    return (
        jsonify(
            {
                "ok": completed.returncode == 0,
                "command": command,
                "result": result,
                "stderr": completed.stderr.strip(),
            }
        ),
        status_code,
    )


if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=int(os.getenv("PORT", "5000")),
        debug=os.getenv("FLASK_DEBUG", "0") == "1",
    )
