# inframe.studios

Website for inframe.studios — an actors studio in London (headshots, showreels, self-tapes).
Plain HTML, CSS and JavaScript, no build step.

## Structure

```
site/
  index.html          homepage (loading screen, hero, showreel, headshots, reels, about, contact)
  sessions.html       all sessions with prices and example carousels
  services/*.html     one page per session (generated, see below)
  css/style.css
  js/main.js          smooth scroll (Lenis), scroll reveals, sliders, accordions, video players, contact form
  assets/             optimised images and videos used by the site
tools/
  serve.py            local dev server without browser caching
  build_services.py   regenerates site/services/*.html from the copy inside the script
```

## Run locally

```bash
python3 tools/serve.py site 4173
```

Then open http://localhost:4173.

## Edit the service pages

The copy for the eight service pages lives in `tools/build_services.py`. Edit it there, then run:

```bash
python3 tools/build_services.py site/services
```

## Notes

- The contact form opens the visitor's email app (mailto). Swap in a form service (e.g. Formspree) once hosted.
- `site/assets/video/showreel.mp4` is ~96 MB. It works on GitHub, but long term the showreel is better hosted on Vimeo/YouTube (the video players accept those links via `data-src`).
- Hero reviews and the 5.0/5 rating are placeholders.
