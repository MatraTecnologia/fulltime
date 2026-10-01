"""Generate the mascot's bundled narration. No TTS service runs in the app.

    py -m pip install --target .voice-tools edge-tts
    $env:PYTHONPATH = (Resolve-Path .voice-tools).Path
    py apps/app-games/scripts/generate-voice.py

Use --only preview to audition a voice, --voice to change the narrator,
and --overwrite after editing the script or voice-clips.json.
"""

import argparse
import asyncio
import json
from pathlib import Path

import edge_tts

APP = Path(__file__).resolve().parents[1]
CLIPS = json.loads((APP / "src/lib/voice-clips.json").read_text(encoding="utf-8"))
OUTPUT = APP / "public/audio/luna/v1"
CELEBRATIONS = {"complete", "preview", "achievements", "pet-play", "correct-0", "correct-1", "correct-2"}


async def generate(args):
    OUTPUT.mkdir(parents=True, exist_ok=True)
    semaphore = asyncio.Semaphore(3)

    async def clip(clip_id, text):
        path = OUTPUT / f"{clip_id}.mp3"
        if path.exists() and path.stat().st_size > 1000 and not args.overwrite:
            return
        async with semaphore:
            for attempt in range(3):
                try:
                    excited = clip_id in CELEBRATIONS
                    gentle = clip_id in {"retry", "pet-sleep"}
                    rate = "+8%" if excited else "-2%" if gentle else "+3%"
                    pitch = "+8Hz" if excited else "+2Hz" if gentle else "+5Hz"
                    temporary = path.with_suffix(".tmp.mp3")
                    await edge_tts.Communicate(text, args.voice, rate=rate, pitch=pitch).save(str(temporary))
                    if temporary.stat().st_size < 1000:
                        raise RuntimeError(f"Empty audio: {clip_id}")
                    temporary.replace(path)
                    print(f"Generated {clip_id}: {path.stat().st_size} bytes", flush=True)
                    return
                except Exception:
                    if attempt == 2:
                        raise
                    await asyncio.sleep(1 + attempt)

    chosen = {args.only: CLIPS[args.only]} if args.only else CLIPS
    await asyncio.gather(*(clip(clip_id, text) for clip_id, text in chosen.items()))
    print(f"Ready: {len(chosen)} clips, voice {args.voice}", flush=True)


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--voice", default="pt-BR-FranciscaNeural")
    parser.add_argument("--only", choices=CLIPS)
    parser.add_argument("--overwrite", action="store_true")
    asyncio.run(generate(parser.parse_args()))
