"""Render a profile banner from the challenge's exact X probabilities (Pillow)."""
from pathlib import Path
import sys
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from quantum_coherence.challenge import measurement_probabilities
from PIL import Image, ImageDraw, ImageFont
root = Path(__file__).resolve().parents[1]
im = Image.new('RGB',(1500,500),'#101b25'); d=ImageDraw.Draw(im)
font='/System/Library/Fonts/Helvetica.ttc'
f=lambda n: ImageFont.truetype(font,n)
d.text((420,70),'SAME HISTOGRAM.',font=f(48),fill='#eef4ed')
d.text((420,130),'DIFFERENT PHYSICS.',font=f(48),fill='#b7ed83')
for offset,state,color in [(420,'coherent','#b7ed83'),(960,'mixed','#72cbd2')]:
    p=measurement_probabilities(state,'X')
    for i,v in enumerate(p):
        x=offset+i*26
        d.rectangle((x,360-v*900,x+17,360),fill=color)
    d.text((offset,385), 'COHERENT' if state=='coherent' else 'MIXTURE',font=f(18),fill=color)
d.text((420,440),'An exploration of quantum measurement · Dhiraj Khanal',font=f(19),fill='#a7b8c4')
im.save(root/'media/profile-banner.png')
