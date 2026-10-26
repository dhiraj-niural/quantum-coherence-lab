"""Exact GHZ-phase probabilities and an illustrated measurement film.

Arrows represent contributions to an output amplitude, not trajectories in space.
Pillow is imported only by the rendering helpers; probability functions are pure.
"""
import cmath
import math
import subprocess
from pathlib import Path

WIDTH, HEIGHT = 1280, 720
DURATION = 36.0
BG = '#0b1420'
PAPER = '#edf2eb'
MUTED = '#9cabb9'
TEAL = '#61dbce'
CORAL = '#ff927e'
LIME = '#d8ef93'


def phase_probabilities(phi, basis='X'):
    """GHZ(phi)=(|0000>+exp(i phi)|1111>)/sqrt(2); q4..q1 order."""
    if basis == 'Z':
        return [0.5 if i in (0, 15) else 0.0 for i in range(16)]
    if basis != 'X':
        raise ValueError('basis must be X or Z')
    return [(1 + (-1) ** bin(i).count('1') * math.cos(phi)) / 16 for i in range(16)]


def output_contributions(index, phi):
    if index not in range(16):
        raise ValueError('output index must be in 0..15')
    a = 1 / math.sqrt(32)
    return complex(a), (-1) ** bin(index).count('1') * cmath.exp(1j * phi) * a


def mixture_probabilities(basis='X'):
    if basis == 'X':
        return [1 / 16] * 16
    return phase_probabilities(0, basis)


def phase_at(t):
    """A preparation-phase sweep, not a continuous measurement or camera motion."""
    if t < 18:
        return math.pi
    if t >= 30:
        return math.pi
    if t < 22:
        return math.pi * (1 - .5 * (t - 18) / 4)
    if t < 24:
        return math.pi / 2
    if t < 26:
        return math.pi / 2 * (1 - (t - 24) / 2)
    return math.pi * (t - 26) / 4


def _font(size, mono=False):
    from PIL import ImageFont
    candidates = (['/System/Library/Fonts/Menlo.ttc'] if mono else []) + [
        '/System/Library/Fonts/Helvetica.ttc',
        '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
    ]
    for name in candidates:
        if Path(name).exists():
            return ImageFont.truetype(name, size)
    return ImageFont.load_default()


_FONTS = {}


def _text(draw, xy, text, size=24, fill=PAPER, mono=False):
    key = (size, mono)
    if key not in _FONTS:
        _FONTS[key] = _font(*key)
    draw.text(xy, text, font=_FONTS[key], fill=fill)


def _arrow(draw, start, end, color, width=5):
    x, y = start
    ex, ey = end
    if math.hypot(ex - x, ey - y) < 2:
        draw.ellipse((x - 6, y - 6, x + 6, y + 6), fill=color)
        return
    draw.line((x, y, ex, ey), fill=color, width=width)
    angle = math.atan2(ey - y, ex - x)
    tip = 14
    points = [(ex, ey),
              (ex - tip * math.cos(angle - .45), ey - tip * math.sin(angle - .45)),
              (ex - tip * math.cos(angle + .45), ey - tip * math.sin(angle + .45))]
    draw.polygon(points, fill=color)


def _panel(draw, rect):
    draw.rounded_rectangle(rect, radius=20, fill='#142333', outline='#2a3b4d', width=1)


def _chart(draw, values, x, y, w, h, color, maximum, labels=True):
    for frac in (.5, 1):
        yy = y + h * (1 - frac)
        draw.line((x, yy, x + w, yy), fill='#2c3a48')
    step = w / 16
    for i, p in enumerate(values):
        bx = x + i * step + 3
        bh = max(0, p / maximum * h)
        if bh > .5:
            draw.rounded_rectangle((bx, y + h - bh, bx + step - 7, y + h), radius=3, fill=color)
        if labels:
            _text(draw, (bx - 1, y + h + 12), format(i, '04b'), 12, MUTED, True)
    draw.line((x, y + h, x + w, y + h), fill='#607386')


def _phasor(draw, x, y, index, phi, progress=1):
    a, b = output_contributions(index, phi)
    unit = 1 / math.sqrt(32)
    scale = 112 / unit
    origin = (x, y)
    middle = (x + a.real * scale, y - a.imag * scale)
    end = (middle[0] + b.real * scale * progress, middle[1] - b.imag * scale * progress)
    # Faint circle marks the possible endpoint of the second contribution.
    r = 112
    draw.ellipse((middle[0]-r, middle[1]-r, middle[0]+r, middle[1]+r), outline='#304252', width=1)
    draw.line((x-15, y, x+250, y), fill='#34485a')
    _arrow(draw, origin, middle, TEAL, 6)
    _arrow(draw, middle, end, CORAL, 3)
    _arrow(draw, (x, y+32), (end[0], end[1]+32), LIME, 4)
    draw.ellipse((end[0]-5, end[1]-5, end[0]+5, end[1]+5), fill=PAPER)


def frame_at(seconds, duration=DURATION):
    from PIL import Image, ImageDraw
    t = max(0.0, min(DURATION, seconds / duration * DURATION))
    im = Image.new('RGB', (WIDTH, HEIGHT), BG)
    d = ImageDraw.Draw(im)
    _text(d, (54, 24), 'QUANTUM COHERENCE LAB', 17, MUTED)
    _text(d, (1050, 24), 'DHIRAJ KHANAL', 17, MUTED)
    d.line((54, 60, 1226, 60), fill='#2b3d4c')
    if t < 7:
        _text(d, (54, 84), 'Two preparations. The same first measurement.', 41)
        _text(d, (54, 143), 'Can more data tell you which one preserves quantum coherence?', 24, MUTED)
        for x, name, col in [(54, 'COHERENT STATE', TEAL), (662, 'RANDOM MIXTURE', CORAL)]:
            _panel(d, (x, 207, x+564, 550))
            _text(d, (x+24, 228), name, 23, col)
            growth = min(1, t / 1.4)
            _chart(d, [p*growth for p in phase_probabilities(math.pi,'Z')], x+30, 310, 504, 170, col, .5)
            _text(d, (x+30, 278), '50% 0000       50% 1111', 19, PAPER, True)
        _text(d, (54, 582), 'No. Their Z probabilities are identical.', 31, LIME)
        _text(d, (54, 632), 'Z measurement · exact probabilities · fresh preparation for every trial', 19, MUTED)
    elif t < 18:
        _text(d, (54, 84), 'Change the measurement. Watch the amplitudes.', 40)
        _text(d, (54, 143), 'In X, add the two contributions first. Then square the length.', 24, MUTED)
        progress = min(1, (t-7)/2)
        for x, idx, label in [(54, 0, '0000 · even number of 1s'), (662, 1, '0001 · odd number of 1s')]:
            _panel(d, (x, 203, x+564, 566))
            _text(d, (x+24, 223), label, 24)
            _phasor(d, x+125, 393, idx, math.pi, progress)
            text = 'Opposite contributions cancel: 0%' if idx==0 else 'Contributions reinforce: 12.5%'
            _text(d, (x+24, 516), text if progress >= 1 else 'Adding the amplitude contributions...', 23, LIME)
        _text(d, (54, 590), 'TEAL: from 0000     CORAL: from 1111     LIME: sum', 22, MUTED)
        _text(d, (54, 632), 'Arrows are mathematical amplitudes—not particles moving through space.', 20, MUTED)
    elif t < 30:
        phi = phase_at(t)
        _text(d, (54, 84), 'Turn the phase. The allowed outcomes trade places.', 39)
        _text(d, (54, 143), 'The Z histogram stays fixed. X reveals the changing relationship.', 24, MUTED)
        _panel(d, (54, 200, 430, 580))
        _text(d, (78, 220), 'OUTPUT 0000', 22)
        _text(d, (78, 255), f'Relative phase: {phi / math.pi:.2f}π', 22, LIME)
        _phasor(d, 115, 420, 0, phi)
        _panel(d, (453, 200, 1226, 580))
        _text(d, (478, 219), 'COHERENT STATE · X measurement', 21, TEAL)
        _chart(d, phase_probabilities(phi), 479, 275, 720, 80, TEAL, .125)
        _text(d, (478, 416), 'MIXTURE · unchanged at 6.25% per outcome', 20, CORAL)
        _chart(d, mixture_probabilities(), 479, 453, 720, 80, CORAL, .125, False)
        caption = ('At phase π/2, X also hides the coherence. The state is still coherent.'
                   if 22 <= t < 24 else 'Phase changes the preparation. Each frame shows exact probabilities.')
        _text(d, (54, 603), caption, 23, LIME)
        _text(d, (54, 644), 'Both chart ranges: 0–12.5% · no device noise · no hardware footage', 19, MUTED)
    else:
        _text(d, (54, 91), 'A histogram can hide the important part.', 47)
        _text(d, (54, 159), 'Choose a measurement that makes the difference visible.', 26, MUTED)
        _panel(d, (54, 224, 1226, 539))
        _text(d, (88, 252), 'X MEASUREMENT', 19, MUTED)
        _text(d, (88, 303), 'Coherent, phase π', 30, TEAL)
        _text(d, (88, 352), 'Only odd outcomes', 36, PAPER)
        _text(d, (709, 303), 'Mixture', 30, CORAL)
        _text(d, (709, 352), 'Odd + even outcomes', 36, PAPER)
        d.line((636, 280, 636, 435), fill='#3f5264')
        _text(d, (88, 463), 'Try it: predict, measure, change the phase, explain what changed.', 24, LIME)
        _text(d, (54, 588), 'Established physics. An ideal simulation of two specified preparations.', 23, MUTED)
        _text(d, (54, 633), 'Finite samples fluctuate; this film shows the underlying probabilities.', 21, MUTED)
    # Quiet timeline indicator, without an invented performance metric.
    d.rectangle((54, 696, 1226, 699), fill='#263747')
    d.rectangle((54, 696, 54 + 1172*t/DURATION, 699), fill=TEAL)
    return im


def render(output, fps=24, duration=DURATION):
    if fps < 1 or duration <= 0:
        raise ValueError('fps and duration must be positive')
    output = Path(output)
    output.parent.mkdir(parents=True, exist_ok=True)
    command = ['ffmpeg','-hide_banner','-loglevel','error','-y','-f','rawvideo',
               '-pix_fmt','rgb24','-s',f'{WIDTH}x{HEIGHT}','-r',str(fps),'-i','-',
               '-an','-c:v','libx264','-preset','fast','-crf','19','-pix_fmt','yuv420p',
               '-movflags','+faststart',str(output)]
    process = subprocess.Popen(command, stdin=subprocess.PIPE)
    try:
        for frame in range(round(fps*duration)):
            process.stdin.write(frame_at(frame/fps, duration).tobytes())
    finally:
        process.stdin.close()
    if process.wait():
        raise RuntimeError('ffmpeg rendering failed')
    return output
