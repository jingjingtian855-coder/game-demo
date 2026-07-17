from pathlib import Path
import math
import subprocess
import wave

import imageio.v2 as imageio
import imageio_ffmpeg
import numpy as np
from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parents[1]
SCENE = ROOT / "assets" / "video" / "scene-01"
KEYS = SCENE / "keyframes"
OUT = SCENE / "scene-01-zero-g-turbulence.mp4"
SILENT = SCENE / "scene-01-silent.mp4"
AUDIO = SCENE / "scene-01-audio.wav"
POSTER = SCENE / "scene-01-poster.jpg"

WIDTH, HEIGHT = 1280, 720
FPS, DURATION = 24, 15.0
TOTAL = int(FPS * DURATION)
FONT = Path(r"C:\Windows\Fonts\msyhbd.ttc")


def ease(x):
    x = max(0.0, min(1.0, x))
    return x * x * (3 - 2 * x)


def cover(image):
    ratio = max(WIDTH / image.width, HEIGHT / image.height)
    size = (int(image.width * ratio + .5), int(image.height * ratio + .5))
    return image.resize(size, Image.Resampling.LANCZOS)


def camera(image, scale=1.0, pan_x=0.0, pan_y=0.0, angle=0.0, shake=(0, 0)):
    base = cover(image)
    if angle:
        base = base.rotate(angle, resample=Image.Resampling.BICUBIC, expand=False)
    crop_w, crop_h = int(WIDTH / scale), int(HEIGHT / scale)
    cx = base.width / 2 + pan_x + shake[0]
    cy = base.height / 2 + pan_y + shake[1]
    left = int(max(0, min(base.width - crop_w, cx - crop_w / 2)))
    top = int(max(0, min(base.height - crop_h, cy - crop_h / 2)))
    return base.crop((left, top, left + crop_w, top + crop_h)).resize((WIDTH, HEIGHT), Image.Resampling.LANCZOS)


def cross(a, b, amount):
    return Image.blend(a, b, ease(amount))


def flash_cut(a, b, amount, color=(180, 235, 255)):
    """Hide a large pose change inside a bright exposure flash, avoiding double silhouettes."""
    solid = Image.new("RGB", (WIDTH, HEIGHT), color)
    if amount < .5:
        return Image.blend(a, solid, ease(amount * 2) * .92)
    return Image.blend(solid, b, ease((amount - .5) * 2))


def add_vignette(frame):
    y, x = np.ogrid[-1:1:HEIGHT*1j, -1:1:WIDTH*1j]
    radius = np.sqrt((x * .86) ** 2 + y ** 2)
    alpha = np.clip((radius - .48) * 95, 0, 48).astype(np.uint8)
    overlay = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    overlay.putalpha(Image.fromarray(alpha))
    return Image.alpha_composite(frame.convert("RGBA"), overlay)


def add_particles(frame, t, violent=False):
    draw = ImageDraw.Draw(frame, "RGBA")
    rng = np.random.default_rng(2749)
    count = 34 if not violent else 70
    for i in range(count):
        seed_x, seed_y = rng.random(2)
        speed = .012 + rng.random() * (.026 if violent else .012)
        if violent:
            x = ((seed_x + t * speed * 4) % 1.15 - .08) * WIDTH
            y = ((seed_y - t * speed * 1.7) % 1.2 - .1) * HEIGHT
            length = 5 + rng.random() * 24
            draw.line((x, y, x + length, y - length * .35), fill=(170, 236, 255, int(45 + rng.random()*90)), width=max(1, int(rng.random()*2)))
        else:
            x = ((seed_x + math.sin(t * .18 + i) * .018) % 1) * WIDTH
            y = ((seed_y - t * speed) % 1) * HEIGHT
            r = 1 + rng.random() * 1.8
            draw.ellipse((x-r, y-r, x+r, y+r), fill=(190, 238, 240, int(30+rng.random()*65)))
    return frame


def add_alert(frame, t):
    if t < 7.7:
        return frame
    pulse = max(0.0, math.sin((t - 7.7) * math.pi * 2.25)) ** 5
    if pulse:
        red = Image.new("RGBA", (WIDTH, HEIGHT), (244, 35, 116, int(38 * pulse)))
        frame = Image.alpha_composite(frame, red)
    return frame


def add_title(frame, t):
    if not (.55 <= t <= 2.8):
        return frame
    alpha = ease((t - .55) / .45) * (1 - ease((t - 2.25) / .55))
    layer = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer)
    f1 = ImageFont.truetype(str(FONT), 20)
    f2 = ImageFont.truetype(str(FONT), 11)
    draw.text((72, 74), "序章 · 失重乱流", font=f1, fill=(245, 249, 244, int(235 * alpha)))
    draw.text((74, 108), "PROLOGUE / ZERO-G EVENT", font=f2, fill=(117, 240, 236, int(210 * alpha)), spacing=5)
    draw.line((73, 129, 223, 129), fill=(117, 240, 236, int(150 * alpha)), width=1)
    return Image.alpha_composite(frame, layer)


def frame_at(t, images):
    calm, awake, turbulence, breach = images
    shake_x = shake_y = 0
    if t >= 7.7:
        power = min(1, (t - 7.7) / 1.3)
        shake_x = math.sin(t * 43) * 8 * power + math.sin(t * 71) * 3 * power
        shake_y = math.cos(t * 37) * 5 * power
    if t < 3.0:
        f = camera(calm, 1.015 + t * .007, pan_x=-18 + t*4, pan_y=3)
    elif t < 3.45:
        p = (t - 3.0) / .45
        a = camera(calm, 1.036, pan_x=-6)
        b = camera(awake, 1.026, pan_x=-12)
        f = flash_cut(a, b, p, (244, 210, 155))
    elif t < 7.65:
        p = (t - 3.45) / 4.2
        f = camera(awake, 1.026 + p*.044, pan_x=-12+p*25, pan_y=math.sin(t*1.7)*2)
    elif t < 8.15:
        p = (t - 7.65) / .5
        a = camera(awake, 1.07, pan_x=13, shake=(shake_x, shake_y))
        b = camera(turbulence, 1.035, pan_x=-15, angle=-1, shake=(shake_x, shake_y))
        f = flash_cut(a, b, p, (225, 110, 178))
    elif t < 11.45:
        p = (t - 8.15) / 3.3
        f = camera(turbulence, 1.035+p*.065, pan_x=-15+p*30, angle=-1+p*1.6, shake=(shake_x, shake_y))
    elif t < 11.95:
        p = (t - 11.45) / .5
        a = camera(turbulence, 1.1, pan_x=15, angle=.6, shake=(shake_x, shake_y))
        b = camera(breach, 1.025, pan_x=-18, angle=-.8, shake=(shake_x*.8, shake_y*.8))
        f = flash_cut(a, b, p, (170, 226, 255))
    elif t < 13.9:
        p = (t - 11.95) / 1.95
        f = camera(breach, 1.025+p*.085, pan_x=-18+p*36, pan_y=-4, angle=-.8+p*1.3, shake=(shake_x*.8, shake_y*.8))
    else:
        p = (t - 13.9) / 1.1
        f = camera(breach, 1.11+p*.02, pan_x=18, angle=.5)
        f = ImageEnhance.Brightness(f).enhance(max(0, 1 - ease(p)))
    f = f.convert("RGBA")
    f = add_particles(f, t, violent=t >= 7.7)
    f = add_alert(f, t)
    f = add_title(f, t)
    return add_vignette(f).convert("RGB")


def audio_track():
    sr = 48000
    n = int(DURATION * sr)
    t = np.arange(n, dtype=np.float64) / sr
    rng = np.random.default_rng(2749)
    drone = .05*np.sin(2*np.pi*48*t) + .022*np.sin(2*np.pi*73*t) + .012*np.sin(2*np.pi*111*t)
    noise = rng.normal(0, 1, n)
    kernel = np.ones(240) / 240
    rumble = np.convolve(noise, kernel, mode="same") * .65
    turbulent_env = np.clip((t-7.5)/2.3, 0, 1) * np.clip((15-t)/1.1, 0, 1)
    audio = drone + rumble * (.09 + turbulent_env*.75)
    # toy chimes
    for start, freq in [(4.25, 784), (4.39, 988), (6.65, 659)]:
        x = t-start; env = np.where((x>=0)&(x<.65), np.exp(-x*5.2), 0)
        audio += .08*np.sin(2*np.pi*freq*np.maximum(x,0))*env
    # emergency pulses
    for start in np.arange(7.75, 13.7, .86):
        x=t-start; env=np.where((x>=0)&(x<.24), np.sin(np.pi*np.clip(x/.24,0,1))**2,0)
        audio += .09*(np.sin(2*np.pi*520*np.maximum(x,0))+.45*np.sin(2*np.pi*260*np.maximum(x,0)))*env
    # sub impact and rising spatial tone
    x=t-7.72; impact=np.where(x>=0,np.exp(-np.maximum(x,0)*2.4),0)
    audio += .17*np.sin(2*np.pi*39*np.maximum(x,0))*impact
    rise=np.clip((t-10.2)/3.4,0,1)*np.clip((14.3-t)/.7,0,1)
    audio += .045*np.sin(2*np.pi*(180+250*rise)*t)*rise
    # stylized kitten cry
    x=t-12.15; env=np.where((x>=0)&(x<.8),np.sin(np.pi*np.clip(x/.8,0,1))**1.5,0)
    audio += .055*np.sin(2*np.pi*(610-190*np.clip(x/.8,0,1))*np.maximum(x,0))*env
    fade_in=np.clip(t/.35,0,1); fade_out=np.clip((DURATION-t)/.55,0,1)
    audio *= fade_in*fade_out
    audio /= max(1, np.max(np.abs(audio))/.88)
    pcm=(audio*32767).astype(np.int16)
    with wave.open(str(AUDIO),"wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr); w.writeframes(pcm.tobytes())


def main():
    SCENE.mkdir(parents=True, exist_ok=True)
    images=[Image.open(KEYS/f"0{i}-{name}.png").convert("RGB") for i,name in enumerate(["calm","awake","turbulence","breach"],1)]
    writer=imageio.get_writer(str(SILENT),fps=FPS,codec="libx264",quality=8,pixelformat="yuv420p",macro_block_size=None)
    poster=None
    for i in range(TOTAL):
        t=i/FPS
        frame=frame_at(t,images)
        if i==int(11.8*FPS): poster=frame.copy()
        writer.append_data(np.asarray(frame))
        if i % 48 == 0: print(f"render {i}/{TOTAL}")
    writer.close()
    (poster or frame_at(11.8,images)).save(POSTER,quality=92,subsampling=0)
    audio_track()
    ffmpeg=imageio_ffmpeg.get_ffmpeg_exe()
    subprocess.run([ffmpeg,"-y","-i",str(SILENT),"-i",str(AUDIO),"-c:v","copy","-c:a","aac","-b:a","192k","-shortest",str(OUT)],check=True)
    SILENT.unlink(missing_ok=True); AUDIO.unlink(missing_ok=True)
    print(OUT)


if __name__ == "__main__":
    main()
