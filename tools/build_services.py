"""Generates site/services/*.html (London edition)."""
import html
import sys
from pathlib import Path

OUT = Path(sys.argv[1])
OUT.mkdir(parents=True, exist_ok=True)

INCLUDED, PRICING, BOOKING = "What's included", "Pricing & add-ons", "Turnaround & booking"
CTA = "Book a Session"

SERVICES = [
    dict(
        slug="infocus", layout="float", seo="60 minute headshot session",
        headline="One hour. One you. No factory line.",
        title="infocus. 60 minute headshot session", italic=True,
        intro="One hour in front of the lens, directed like a portrait sitting rather than a headshot factory line. Built for actors who need images that hold up next to their reel.",
        acc=[
            (INCLUDED, ["60-minute session, multiple backdrops/setups", "Headshot prep guide (PDF)", "As many outfit changes as you can fit in", "Professional lighting & direction throughout", "3 fully retouched, high-res images", "Private online gallery for your selects"]),
            (PRICING, ["The session costs £170", "Additional retouched image: £30 each", "Express turnaround (48h): +£50"]),
            (BOOKING, ["Selects gallery within 3 working days, finals within 7", "20% deposit to secure your date, balance on the day", "Reschedule up to 48h in advance, free of charge"]),
        ],
        floats=["headshot1", "headshot5", "headshot7", "headshot8"],
        gallery=["headshot2", "headshot6", "headshot10", "headshot12"],
    ),
    dict(
        slug="indepth", layout="float", seo="90 minute headshot session",
        headline="More looks. More range. One sitting.",
        title="indepth. 90 minute headshot session", italic=False,
        intro="More time, more range. For actors who want to walk away covering every casting bracket they're right for — in one sitting.",
        acc=[
            (INCLUDED, ["90-minute session, multiple backdrops/setups", "Headshot prep guide (PDF)", "As many outfit changes as you can fit in", "5 fully retouched, high-res images", "Private online gallery for your selects"]),
            (PRICING, ["The session costs £230", "Additional retouched image: £30 each", "Express turnaround (48h): +£50"]),
            (BOOKING, ["Selects gallery within 3 working days, finals within 7", "20% deposit to secure your date, balance on the day", "Reschedule up to 48h in advance, free of charge"]),
        ],
        floats=["headshot10", "headshot12", "headshot6", "headshot2"],
        gallery=["headshot1", "headshot5", "headshot7", "headshot8"],
    ),
    dict(
        slug="incharacter", layout="video", seo="Cinematic monologue",
        headline="The never-ending new material hack.",
        lede="Monologues are the simplest way to stay active and keep fresh material in front of casting directors.",
        video="tapes",
        title="incharacter. Not your typical self-tape.", italic=False,
        intro="One monologue, fully lit and directed — because a monologue is a real scene, not a self-tape placeholder.",
        acc=[
            (INCLUDED, ["Pre-session call to talk through the piece", "Up to 3 takes, single setup", "Professionally lit and shot", "Edited, colour-graded final cut"]),
            (PRICING, ["The session costs £170", "Second monologue in the same session: +£70", "Express edit turnaround (72h): +£50", "Location shoot instead of studio: +£50"]),
            (BOOKING, ["Edited cut delivered within 5 working days", "20% deposit to secure your date"]),
        ],
    ),
    dict(
        slug="inscene", layout="video", seo="Two-hander showreel scene",
        headline="It’s not only about the talking.",
        lede="Scene work is collaboration — and that's exactly what casting directors and decision-makers want to see.",
        video="showreel",
        title="inscene. Two-hander scene, shot and cut.", italic=False,
        intro="Real chemistry, properly captured — built to show casting exactly how you play off another actor, not just how you look alone in a room.",
        acc=[
            (INCLUDED, ["Pre-session call to talk through the scene & your partner", "Session with your scene partner (bring your own or ask about ours)", "Wide, medium and close-up coverage", "Edited, colour-graded final cut"]),
            (PRICING, ["The session costs £350", "Scene partner sourcing included", "Express edit turnaround: +£100"]),
            (BOOKING, ["Edited cut delivered within 5–7 working days", "20% deposit to secure your date"]),
        ],
    ),
    dict(
        slug="inmotion", layout="video", seo="Full showreel, edited",
        headline="Show your full range.",
        lede="What you put out there is what you get cast for. Market yourself with range.",
        video="showreel",
        title="inmotion. Full showreel, edited.", italic=False,
        intro="Multiple scenes, cut into one reel that carries your range from start to finish — not just a highlight clip.",
        acc=[
            (INCLUDED, ["Pre-session call to plan the reel's shape and order", "Session with your scene partner (or one of ours)", "Up to 1 scene & 2 monologues, over one or several days", "Scene shot on location", "Full edit, grade and sound mix into one reel (60–90 sec)", "One round of revisions"]),
            (PRICING, ["The full reel costs £860", "Additional scene: £250", "Extra revision round: £50", "Express edit turnaround (5 days): +£120"]),
            (BOOKING, ["First cut within 10 working days, final within 14", "20% deposit to secure your date"]),
        ],
    ),
    dict(
        slug="infull", layout="video", seo="Complete actors package",
        headline="Building from the ground up.",
        lede="Just starting out, or ready to refresh everything at once? This package is for you.",
        video="showreel",
        title="infull. Complete actors package — headshots, showreel & coaching.", italic=False,
        intro="Headshots, reel and coaching in one go — everything you need to walk into casting season properly covered.",
        acc=[
            (INCLUDED, ["Pre-session call to plan the full day", "90-minute headshot session", "Up to 1 scene & 2 monologues, shot and edited into a reel", "Scene partner for your scene (or bring your own)", "One 1:1 coaching session", "All retouched stills + final reel delivered together"]),
            (PRICING, ["The full package costs £980", "Additional scene: £150", "Extra coaching session: £50", "Express turnaround across the whole package: +£200"]),
            (BOOKING, ["Full package delivered within 14 working days", "20% deposit to secure your date"]),
        ],
        trio=["headshot2", "headshot6", "headshot10"],
    ),
    dict(
        slug="inperson", layout="video", seo="About Me video (Vienna only)",
        headline="Tell us about yourself…",
        lede="In the German-speaking industry, sometimes that's all they want: to see you. Not acting — just who you are.",
        # placeholder: tapes.mp4 until there's an About Me example
        video="tapes",
        title="inperson. About Me video", italic=True,
        intro="Sixty seconds of you, talking to camera — shot and cut the way casting actually wants to meet you. Available in Vienna only.",
        acc=[
            (INCLUDED, ["Pre-session chat to get to know you and shape the idea", "30-minute session, single setup", "Edited, colour-graded 60–90 sec video", "Skills can be worked in"]),
            (PRICING, ["The video costs €320", "Express turnaround (48h): +€70"]),
            (BOOKING, ["Delivered within 7 working days", "20% deposit to secure your date"]),
        ],
    ),
    dict(
        slug="inrange", layout="video", seo="Skills reel",
        headline="Show them what you’ve got.",
        lede="Accents, instruments, sport — if it's on your CV, casting wants to see it. Prove it on camera.",
        video="skills",
        title="inrange. Skills reel — accents, instruments, sport.", italic=False,
        intro="Whatever's on your CV, filmed properly. Singing, accents, movement — show them what you've got.",
        acc=[
            (INCLUDED, ["Up to 2 skills captured in one session", "Simple setup, shot and lightly edited", "Delivered as separate skill videos or one combined reel"]),
            (PRICING, ["The session costs £120", "Additional skill: £50", "On-location shoot (e.g. sport, instrument at a venue): +£50", "Express turnaround: +£50"]),
            (BOOKING, ["Delivered within 5 working days", "20% deposit to secure your date"]),
        ],
    ),
]

e = html.escape
PLAY = '<svg viewBox="0 0 34 38" fill="currentColor"><path d="M0 0l34 19L0 38z"/></svg>'
CHEVRON = '<svg viewBox="0 0 15 9" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M1 1l6.5 6.5L14 1"/></svg>'


def img(name, alt="Actor headshot by inframe.studios"):
    return f'<img src="../assets/{name}.jpg" alt="{e(alt)}" loading="lazy">'


def accordion(items):
    out = []
    for label, points in items:
        lis = "".join(f"<li>{e(p)}</li>" for p in points)
        out.append(f'          <details class="acc">\n'
                   f'            <summary>{e(label)}{CHEVRON}</summary>\n'
                   f'            <div class="acc__body"><ul>{lis}</ul></div>\n'
                   f'          </details>')
    return "\n".join(out)


def page(s):
    contact = f'../index.html?session={s["slug"]}#contact'

    if s["layout"] == "float":
        speeds = ["0.12", "0.26", "0.18", "0.32"]
        floats = "\n".join(
            f'      <div class="float float--{i + 1}" data-speed="{speeds[i]}"><div data-img style="--d: {150 * i}ms">{img(n)}</div></div>'
            for i, n in enumerate(s["floats"]))
        top = (f'    <section class="svc-float">\n{floats}\n'
               f'      <h1 class="svc-float__title serif" data-split>{e(s["headline"])}</h1>\n'
               f'      <div class="svc-float__cta" data-reveal style="--d: 400ms"><a class="btn btn--red" href="{contact}">{CTA}</a></div>\n'
               f'    </section>\n')
    else:
        v = s["video"]
        top = (f'    <section class="svc-feature">\n'
               f'      <h1 class="svc-feature__title serif" data-split>{e(s["headline"])}</h1>\n'
               f'      <div class="video" data-src="../assets/video/{v}.mp4" data-img>\n'
               f'        <img src="../assets/poster-{v}.jpg" alt="" loading="lazy">\n'
               f'        <button class="video__play" aria-label="Play video">{PLAY}</button>\n'
               f'      </div>\n'
               f'      <p class="svc-feature__text" data-reveal>{e(s["lede"])}</p>\n'
               f'      <div data-reveal><a class="btn btn--red btn--wide" href="{contact}">{CTA}</a></div>\n'
               f'    </section>\n')

    intro = (f'    <section class="svc-intro">\n'
             f'      <div>\n'
             f'        <h2 class="svc-intro__title serif" data-split>{e(s["title"])}</h2>\n'
             f'        <p class="svc-intro__text{" is-italic" if s["italic"] else ""}" data-reveal>{e(s["intro"])}</p>\n'
             f'      </div>\n'
             f'      <div class="acc-list" data-reveal style="--d: 150ms">\n{accordion(s["acc"])}\n      </div>\n'
             f'    </section>\n')

    media = ""
    if "gallery" in s:
        cells = "\n".join(f'      <div data-img style="--d: {90 * i}ms">{img(n)}</div>' for i, n in enumerate(s["gallery"]))
        media = f'    <section class="svc-gallery">\n{cells}\n    </section>\n'
    elif "trio" in s:
        cells = "\n".join(f'      <div data-img style="--d: {120 * i}ms">{img(n)}</div>' for i, n in enumerate(s["trio"]))
        media = f'    <section class="svc-trio">\n{cells}\n    </section>\n'

    book = (f'    <section class="svc-book">\n'
            f'      <h2 class="svc-book__title serif" data-split>Let’s get in frame.</h2>\n'
            f'      <p class="svc-book__text" data-reveal>Tell us what you need and we\'ll get back to you within 48 hours.</p>\n'
            f'      <div data-reveal><a class="btn btn--red" href="{contact}">Get in touch</a></div>\n'
            f'    </section>\n')

    return f"""<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{e(s["slug"])}. {e(s["seo"])} — inframe.studios London</title>
  <meta name="description" content="{e(s["intro"])}">
  <script>document.documentElement.classList.add("js")</script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,400;0,500;1,400&family=Playfair+Display:wght@700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="../css/style.css">
</head>
<body>

  <header class="header header--ink">
    <a class="logo" href="../index.html">inframe.studios</a>
    <button class="burger" aria-label="Menu" aria-expanded="false"><span></span><span></span></button>
    <nav class="nav" aria-label="Main">
      <div class="nav__links">
        <a href="../index.html#headshots">Headshots</a>
        <a href="../index.html#showreel">Showreel</a>
        <a href="../sessions.html">Sessions</a>
        <a href="../index.html#about">About</a>
        <a href="../index.html#contact">Contact</a>
      </div>
      <a class="btn btn--red" href="{contact}">Book now</a>
    </nav>
  </header>

  <main>
{top}{intro}{media}{book}  </main>

  <footer class="footer">
    <div class="footer__row">
      <p class="footer__big serif" style="margin:0" data-split>inframe.studio</p>
      <p class="footer__big serif" style="margin:0" data-split><a href="mailto:contact@inframe.studio">contact@inframe.studio</a></p>
    </div>
    <div class="footer__row footer__meta">
      <span>London</span>
      <div class="socials">
        <!-- TODO: point these at your profiles -->
        <a href="#" aria-label="X"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.75 3h3.07l-6.7 7.66L22 21h-6.17l-4.83-6.32L5.47 21H2.4l7.17-8.2L2 3h6.33l4.37 5.77L17.75 3Zm-1.08 16.2h1.7L7.4 4.73H5.58L16.67 19.2Z"/></svg></a>
        <a href="#" aria-label="Instagram"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg></a>
        <a href="#" aria-label="Facebook"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M13.5 22v-8h2.7l.4-3.2h-3.1V8.8c0-.9.3-1.6 1.6-1.6h1.7V4.3c-.3 0-1.3-.1-2.5-.1-2.5 0-4.1 1.5-4.1 4.2v2.4H7.4V14h2.8v8h3.3Z"/></svg></a>
      </div>
    </div>
  </footer>

  <script src="https://unpkg.com/lenis@1.1.13/dist/lenis.min.js"></script>
  <script src="../js/main.js"></script>
</body>
</html>
"""


for s in SERVICES:
    (OUT / f'{s["slug"]}.html').write_text(page(s), encoding="utf-8")
    print("wrote", s["slug"])
