"""Check physics, render the explainer, and verify the resulting video locally."""
import argparse
import json
from pathlib import Path
import shutil
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]


def step(label, command):
    print(f'\n[{label}]', flush=True)
    subprocess.run(command, cwd=ROOT, check=True)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check-only', action='store_true')
    parser.add_argument('--output', default='media/interference.mp4')
    parser.add_argument('--fps', type=int, default=24)
    parser.add_argument('--duration', type=float, default=36)
    args = parser.parse_args()
    if not 1 <= args.fps <= 60 or not 12 <= args.duration <= 90:
        parser.error('Use 1–60 fps and 12–90 seconds.')
    step('1/3 Physics checks', [sys.executable, '-m', 'unittest', 'discover', '-s', 'tests', '-v'])
    if args.check_only:
        return
    if not shutil.which('ffmpeg') or not shutil.which('ffprobe'):
        raise SystemExit('Install ffmpeg (including ffprobe) to render video.')
    try:
        import PIL  # noqa: F401
    except ImportError:
        raise SystemExit('Use a Python environment with Pillow to render video.')
    output = Path(args.output).resolve() if Path(args.output).is_absolute() else ROOT / args.output
    output.parent.mkdir(parents=True, exist_ok=True)
    step('2/3 Render', [sys.executable, 'scripts/render_interference.py', '--output', str(output), '--fps', str(args.fps), '--duration', str(args.duration)])
    print('\n[3/3 Verify video]', flush=True)
    probe = json.loads(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration,size:stream=codec_name,width,height,pix_fmt', '-of', 'json', str(output)]))
    if abs(float(probe['format']['duration']) - args.duration) > 1 / args.fps + .05:
        raise SystemExit('Rendered duration differs from requested duration.')
    if not probe.get('streams') or int(probe['format']['size']) == 0:
        raise SystemExit('Video has no usable output stream.')
    manifest = {'video': output.name, 'duration_seconds': float(probe['format']['duration']),
                'fps': args.fps, 'streams': probe['streams'],
                'model': 'Ideal four-qubit GHZ relative phase; X measurement probabilities',
                'hardware_experiment': False, 'generative_video': False,
                'limitations': 'Phase vectors represent amplitudes, not physical trajectories. No device noise.'}
    output.with_suffix('.json').write_text(json.dumps(manifest, indent=2) + '\n')
    print(f'Ready: {output}\nMetadata: {output.with_suffix(".json")}', flush=True)


if __name__ == '__main__':
    main()
