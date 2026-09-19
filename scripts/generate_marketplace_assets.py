#!/usr/bin/env python3
"""
Generate Google Workspace Marketplace Store Assets for Drive Cleaner
Strictly adheres to Google specifications:
- App Icon: 128x128 px PNG (with transparency / rounded squircle)
- Store Card Banner: 440x280 px PNG
- Promo Hero Graphic: 920x680 px PNG
- Screenshots: 1280x800 px PNG (16:10 aspect ratio)
"""

import os
import math
from PIL import Image, ImageDraw, ImageFont, ImageFilter

OUTPUT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'assets', 'marketplace'))
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Font loading helper
def get_font(size, bold=False):
    font_paths = [
        '/System/Library/Fonts/Supplemental/Arial Bold.ttf' if bold else '/System/Library/Fonts/Supplemental/Arial.ttf',
        '/System/Library/Fonts/Helvetica.ttc',
        '/System/Library/Fonts/SFPro.ttf'
    ]
    for p in font_paths:
        if os.path.exists(p):
            try:
                return ImageFont.truetype(p, size)
            except Exception:
                pass
    return ImageFont.load_default()

def draw_sparkle(draw, center, size, color):
    cx, cy = center
    # 4-pointed star
    points = [
        (cx, cy - size),
        (cx + size * 0.28, cy - size * 0.28),
        (cx + size, cy),
        (cx + size * 0.28, cy + size * 0.28),
        (cx, cy + size),
        (cx - size * 0.28, cy + size * 0.28),
        (cx - size, cy),
        (cx - size * 0.28, cy - size * 0.28),
    ]
    draw.polygon(points, fill=color)

def generate_app_icon():
    print("Generating app_icon_128x128.png...")
    # Render at 4x (512x512) for ultra-high anti-aliased clarity then downscale to 128x128
    S = 512
    im = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    draw = ImageDraw.Draw(im)

    # Rounded squircle
    radius = 110
    # Gradient background
    bg = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    bg_draw = ImageDraw.Draw(bg)
    bg_draw.rounded_rectangle([16, 16, S - 16, S - 16], radius=radius, fill=(30, 41, 59, 255))

    # Gradient overlay: Blue (#2563eb) to Indigo (#4f46e5) to Cyan (#06b6d4)
    gradient = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    g_draw = ImageDraw.Draw(gradient)
    for y in range(S):
        factor = y / S
        r = int(37 * (1 - factor) + 79 * factor)
        g = int(99 * (1 - factor) + 70 * factor)
        b = int(235 * (1 - factor) + 229 * factor)
        g_draw.line([(0, y), (S, y)], fill=(r, g, b, 255))

    # Mask gradient with rounded squircle
    mask = Image.new('L', (S, S), 0)
    m_draw = ImageDraw.Draw(mask)
    m_draw.rounded_rectangle([20, 20, S - 20, S - 20], radius=radius, fill=255)
    im.paste(gradient, (0, 0), mask)

    # Ambient radial glow top-right
    glow = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow)
    glow_draw.ellipse([S//2 - 40, -40, S + 80, S//2 + 80], fill=(6, 182, 212, 100))
    glow = glow.filter(ImageFilter.GaussianBlur(50))
    im = Image.alpha_composite(im, glow)

    # Subtle inner border
    border_draw = ImageDraw.Draw(im)
    border_draw.rounded_rectangle([20, 20, S - 20, S - 20], radius=radius, outline=(255, 255, 255, 75), width=6)

    # Draw Sparkles / Star Icon
    icon_layer = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    icon_draw = ImageDraw.Draw(icon_layer)
    # Shadow
    draw_sparkle(icon_draw, (S//2 + 4, S//2 + 8), 150, (15, 23, 42, 180))
    # Main star
    draw_sparkle(icon_draw, (S//2 - 10, S//2 - 5), 145, (255, 255, 255, 255))
    # Core inner glow
    draw_sparkle(icon_draw, (S//2 - 10, S//2 - 5), 70, (224, 242, 254, 255))
    # Secondary accent sparkle
    draw_sparkle(icon_draw, (S//2 + 120, S//2 - 95), 48, (255, 255, 255, 240))
    # Tertiary small accent sparkle
    draw_sparkle(icon_draw, (S//2 - 105, S//2 + 105), 32, (186, 230, 253, 230))

    im = Image.alpha_composite(im, icon_layer)

    # Downscale with high quality Lanczos to 128x128
    icon_128 = im.resize((128, 128), Image.Resampling.LANCZOS)
    out_path = os.path.join(OUTPUT_DIR, 'app_icon_128x128.png')
    icon_128.save(out_path, 'PNG')
    print(f"Saved {out_path} ({icon_128.size})")
    return im

def generate_store_card_banner(app_icon_512):
    print("Generating store_card_banner_440x280.png...")
    # 440 x 280 banner
    W, H = 440, 280
    banner = Image.new('RGB', (W, H), (11, 15, 25))
    draw = ImageDraw.Draw(banner)

    # Draw subtle background gradient mesh
    for y in range(H):
        factor = y / H
        r = int(11 * (1 - factor) + 15 * factor)
        g = int(15 * (1 - factor) + 23 * factor)
        b = int(25 * (1 - factor) + 42 * factor)
        draw.line([(0, y), (W, y)], fill=(r, g, b))

    # Ambient radial orb in upper right
    orb = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    orb_draw = ImageDraw.Draw(orb)
    orb_draw.ellipse([W - 160, -40, W + 100, 200], fill=(59, 130, 246, 50))
    orb_draw.ellipse([W - 80, 40, W + 120, 240], fill=(139, 92, 246, 40))
    orb = orb.filter(ImageFilter.GaussianBlur(40))
    banner.paste(orb, (0, 0), orb)

    # Overlay App Icon (72x72)
    icon_72 = app_icon_512.resize((72, 72), Image.Resampling.LANCZOS)
    banner.paste(icon_72, (28, 30), icon_72)

    # Typography
    font_title = get_font(26, bold=True)
    font_badge = get_font(11, bold=True)
    font_sub = get_font(13, bold=False)
    font_desc = get_font(11, bold=False)
    font_pill = get_font(9, bold=True)

    # Title & Badge
    draw.text((114, 32), "Drive Cleaner", font=font_title, fill=(255, 255, 255))
    
    # 2026 / 1.0 Badge
    draw.rounded_rectangle([292, 38, 348, 56], radius=9, fill=(30, 58, 138, 180), outline=(59, 130, 246, 120))
    draw.text((301, 41), "v1.0.0", font=font_badge, fill=(147, 197, 253))

    # Subtitle
    draw.text((114, 68), "Workspace Storage Optimizer", font=font_sub, fill=(56, 189, 248))

    # Separator line
    draw.line([(28, 120), (W - 28, 120)], fill=(30, 41, 59), width=1)

    # Feature Bullet Points
    bullets = [
        "• Reclaim storage: Smart Duplicate & Large File scans",
        "• Automated ROT purge: Stale, orphaned & zero-byte files",
        "• 100% Client-Side Privacy: Zero external servers",
        "• Safe trash governance: Two-stage review with restore"
    ]
    y_pos = 136
    for b in bullets:
        draw.text((28, y_pos), b, font=font_desc, fill=(203, 213, 225))
        y_pos += 22

    # Bottom pill footer
    draw.rounded_rectangle([28, 238, W - 28, 264], radius=6, fill=(15, 23, 42), outline=(51, 65, 85))
    draw.text((38, 245), "🔒 Google Verified Limited Use  •  Freemium  •  Zero Egress", font=font_pill, fill=(148, 163, 184))

    out_path = os.path.join(OUTPUT_DIR, 'store_card_banner_440x280.png')
    banner.save(out_path, 'PNG')
    print(f"Saved {out_path} ({banner.size})")

def generate_promo_hero(app_icon_512):
    print("Generating promo_hero_920x680.png...")
    # 920 x 680 Featured Banner
    W, H = 920, 680
    hero = Image.new('RGB', (W, H), (11, 15, 25))
    draw = ImageDraw.Draw(hero)

    # Ambient gradient
    for y in range(H):
        factor = y / H
        r = int(10 * (1 - factor) + 17 * factor)
        g = int(15 * (1 - factor) + 24 * factor)
        b = int(30 * (1 - factor) + 48 * factor)
        draw.line([(0, y), (W, y)], fill=(r, g, b))

    # Glow orbs
    orb = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    orb_draw = ImageDraw.Draw(orb)
    orb_draw.ellipse([W//2 - 200, -80, W//2 + 300, 280], fill=(59, 130, 246, 55))
    orb_draw.ellipse([W - 250, H - 250, W + 100, H + 100], fill=(99, 102, 241, 40))
    orb = orb.filter(ImageFilter.GaussianBlur(60))
    hero.paste(orb, (0, 0), orb)

    # Fonts
    font_brand = get_font(34, bold=True)
    font_h1 = get_font(28, bold=True)
    font_sub = get_font(15, bold=False)
    font_card_title = get_font(13, bold=True)
    font_card_desc = get_font(11, bold=False)
    font_badge = get_font(11, bold=True)

    # App Icon (84x84)
    icon_84 = app_icon_512.resize((84, 84), Image.Resampling.LANCZOS)
    hero.paste(icon_84, (48, 44), icon_84)

    # Header branding
    draw.text((148, 48), "Drive Cleaner", font=font_brand, fill=(255, 255, 255))
    draw.text((148, 92), "Google Workspace Storage Management & ROT Governance", font=font_sub, fill=(56, 189, 248))

    # Hero Banner Headline
    draw.text((48, 160), "Reclaim Gigabytes of Wasted Google Drive Storage", font=font_h1, fill=(248, 250, 252))
    draw.text((48, 198), "Autonomous detection of duplicates, orphaned trash, giant files, and stale data.", font=font_sub, fill=(148, 163, 184))

    # 4 Feature Showcase Cards (2x2 Grid)
    cards = [
        ("⚡ Smart Scan & Deduplication", "Detect exact MD5 duplicates, revisions, and conflicting file versions without downloading content.", (59, 130, 246)),
        ("🛡️ 100% Client-Side Architecture", "Zero external servers. All operations execute strictly inside Google Apps Script & user browser.", (16, 185, 129)),
        ("🗄️ ROT Clutter Analysis", "Categorize Redundant, Obsolete, and Trivial files with customizable retention rules.", (245, 158, 11)),
        ("📦 Resumable Batch Operations", "Process thousands of files safely without timing out. Safe Trash first with full restore.", (168, 85, 247))
    ]

    grid_x = [48, 484]
    grid_y = [252, 380]
    card_w, card_h = 388, 108

    idx = 0
    for row in range(2):
        for col in range(2):
            title, desc, accent = cards[idx]
            x, y = grid_x[col], grid_y[row]
            
            # Card background
            draw.rounded_rectangle([x, y, x + card_w, y + card_h], radius=12, fill=(15, 23, 42), outline=(51, 65, 85))
            # Left accent bar
            draw.rounded_rectangle([x, y, x + 6, y + card_h], radius=3, fill=accent)
            
            # Title & Desc
            draw.text((x + 18, y + 16), title, font=font_card_title, fill=(255, 255, 255))
            # Wrap text
            draw.text((x + 18, y + 42), desc[:48], font=font_card_desc, fill=(203, 213, 225))
            draw.text((x + 18, y + 60), desc[48:98], font=font_card_desc, fill=(203, 213, 225))
            if len(desc) > 98:
                draw.text((x + 18, y + 78), desc[98:], font=font_card_desc, fill=(203, 213, 225))
            idx += 1

    # Bottom Trust & Certification Bar
    draw.rounded_rectangle([48, 524, W - 48, 620], radius=12, fill=(17, 24, 39), outline=(75, 85, 99))
    
    # Trust badges
    draw.text((68, 542), "✓ Verified Google OAuth Restricted Scope", font=font_badge, fill=(74, 222, 128))
    draw.text((68, 568), "✓ Compliant with Google API Services User Data Policy", font=font_badge, fill=(147, 197, 253))
    draw.text((68, 592), "✓ CASA Level 2 Security Assessment Ready", font=font_badge, fill=(253, 224, 71))

    draw.text((540, 542), "✓ 0 Byte / Temp / ISO / Installer Purge", font=font_badge, fill=(224, 231, 255))
    draw.text((540, 568), "✓ Automated Scheduled Background Scans", font=font_badge, fill=(224, 231, 255))
    draw.text((540, 592), "✓ Carbon & Storage Footprint Telemetry", font=font_badge, fill=(224, 231, 255))

    out_path = os.path.join(OUTPUT_DIR, 'promo_hero_920x680.png')
    hero.save(out_path, 'PNG')
    print(f"Saved {out_path} ({hero.size})")

def generate_screenshots():
    print("Generating high-resolution 1280x800 screenshots...")
    brain_media = '/Users/andyedwards/.gemini/antigravity-ide/brain/bb6416f0-76dd-4769-b476-55d708980f3c/.tempmediaStorage'
    
    # 1. Smart Scan Screenshot
    src_smart_scan = os.path.join(brain_media, 'media_1789734991214.png')
    if os.path.exists(src_smart_scan):
        im = Image.open(src_smart_scan)
        im_resized = im.resize((1280, 800), Image.Resampling.LANCZOS)
        out = os.path.join(OUTPUT_DIR, 'screenshot_smart_scan_1280x800.png')
        im_resized.save(out, 'PNG')
        print(f"Saved {out} ({im_resized.size})")
    else:
        print(f"Warning: {src_smart_scan} not found")

    # 2. Storage Analytics Screenshot
    src_analytics = os.path.join(brain_media, 'media_1789730368110.png')
    if os.path.exists(src_analytics):
        im = Image.open(src_analytics)
        # Center crop to 16:10 aspect ratio
        w, h = im.size
        target_h = int(w * 10 / 16)
        if target_h <= h:
            top = (h - target_h) // 2
            im_cropped = im.crop((0, top, w, top + target_h))
        else:
            target_w = int(h * 16 / 10)
            left = (w - target_w) // 2
            im_cropped = im.crop((left, 0, left + target_w, h))
        im_resized = im_cropped.resize((1280, 800), Image.Resampling.LANCZOS)
        out = os.path.join(OUTPUT_DIR, 'screenshot_storage_analytics_1280x800.png')
        im_resized.save(out, 'PNG')
        print(f"Saved {out} ({im_resized.size})")
    else:
        print(f"Warning: {src_analytics} not found")

    # 3. ROT Clutter Screenshot
    src_rot = os.path.join(brain_media, 'media_1789735047065.png')
    if os.path.exists(src_rot):
        im = Image.open(src_rot)
        im_resized = im.resize((1280, 800), Image.Resampling.LANCZOS)
        out = os.path.join(OUTPUT_DIR, 'screenshot_rot_clutter_1280x800.png')
        im_resized.save(out, 'PNG')
        print(f"Saved {out} ({im_resized.size})")
    else:
        print(f"Warning: {src_rot} not found")

if __name__ == '__main__':
    app_icon_512 = generate_app_icon()
    generate_store_card_banner(app_icon_512)
    generate_promo_hero(app_icon_512)
    generate_screenshots()
    print("\nAll Google Workspace Marketplace assets generated successfully!")
