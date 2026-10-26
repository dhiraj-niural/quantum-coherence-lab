"""Create a 24-second animated explainer from exact challenge probabilities.
Requires Pillow and ffmpeg; no models, network calls or footage.
"""
import math, subprocess, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from quantum_coherence.challenge import measurement_probabilities
from PIL import Image, ImageDraw, ImageFont
root=Path(__file__).resolve().parents[1]
font='/System/Library/Fonts/Helvetica.ttc'
f=lambda n:ImageFont.truetype(font,n)
W,H,FPS=1280,720,24
out=root/'media/quantum-teaser.mp4'
process=subprocess.Popen(['ffmpeg','-hide_banner','-loglevel','error','-y','-f','rawvideo','-pix_fmt','rgb24','-s',f'{W}x{H}','-r',str(FPS),'-i','-','-an','-c:v','libx264','-pix_fmt','yuv420p','-movflags','+faststart',str(out)],stdin=subprocess.PIPE)
for frame in range(24*FPS):
 t=frame/FPS; im=Image.new('RGB',(W,H),'#101b2a');d=ImageDraw.Draw(im)
 phase=0 if t<8 else 1 if t<16 else 2
 title=['Same probabilities. Different states.','Change the measurement.','The difference was hiding in the phase.'][phase]
 sub=['Can you find the coherent box?','Count the 1s. One box only gives odd counts.','Play the quantum puzzle. No physics degree needed.'][phase]
 d.text((64,42),'QUANTUM COHERENCE LAB / DHIRAJ KHANAL',font=f(18),fill='#b8ccca')
 d.text((64,94),title,font=f(43),fill='#eff2e9');d.text((64,156),sub,font=f(24),fill='#c2cece')
 alpha=min(1,max(0,(t-8)/1.2));alpha=alpha*alpha*(3-2*alpha)
 for box,(state,x) in enumerate([('coherent',64),('mixed',676)]):
  d.rounded_rectangle((x,225,x+540,570),radius=18,fill='#eef0e8')
  label=f'BOX {"AB"[box]}' if phase<2 else ('COHERENT' if box==0 else 'MIXTURE')
  d.text((x+24,246),label,font=f(23),fill='#152f38')
  z=measurement_probabilities(state,'Z');xp=measurement_probabilities(state,'X')
  values=[a*(1-alpha)+b*alpha for a,b in zip(z,xp)];scale=.55*(1-alpha)+.16*alpha
  for i,v in enumerate(values):
   bx=x+25+i*30
   d.rectangle((bx,502-v/scale*180,bx+19,502),fill='#315e57' if i.bit_count()%2 else '#82a89a')
  d.line((x+24,503,x+514,503),fill='#687a77')
  d.text((x+24,530),('Z view: 0000 or 1111' if phase==0 else ('X view: odd only' if box==0 else 'X view: odd + even')),font=f(20),fill='#23443f')
 d.text((64,607),'Exact probabilities · ideal simulation · two promised preparations',font=f(19),fill='#b4c7c9')
 d.text((64,650),'quantum-coherence-game.hanczvs.chatgpt.site',font=f(24),fill='#d7ef94')
 process.stdin.write(im.tobytes())
process.stdin.close();assert process.wait()==0
print(out)
