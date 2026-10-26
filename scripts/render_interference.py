"""Render the interference film or one inspectable frame; no network calls."""
import argparse
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from quantum_coherence.animation import DURATION, frame_at, render


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', type=Path, default=Path('media/interference.mp4'))
    parser.add_argument('--fps', type=int, default=24)
    parser.add_argument('--duration', type=float, default=DURATION)
    parser.add_argument('--frame', type=float)
    parser.add_argument('--frame-output', type=Path, default=Path('media/interference-frame.png'))
    args = parser.parse_args()
    if args.frame is not None:
        args.frame_output.parent.mkdir(parents=True, exist_ok=True)
        frame_at(args.frame, args.duration).save(args.frame_output)
        print(args.frame_output)
    else:
        print(render(args.output, args.fps, args.duration))


if __name__ == '__main__':
    main()
