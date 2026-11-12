# Sharukh's Blog

A minimal, static personal blog: plain HTML/CSS/JS, no build step. Works on GitHub Pages as-is.

```
index.html                 Home page (About + Latest Blog)
style.css                  All styles and animations
main.js                    Reveal animations, page transitions, loads posts.json
posts.json                 The list of posts shown under "Latest Blog"
posts/post-template.html   Copy this to write a new post
favicon.svg                Tab icon
.nojekyll                  Stops Jekyll from processing the site
.github/workflows/static.yml  Publishes the site on every push to main
```

## Edit the About text
Open `index.html` and find the block marked `ABOUT ME — EDIT THIS SECTION`.
Change the name, the small "Hello, I'm" label, and the paragraph.

## Publish a new post
1. Copy `posts/post-template.html` to a new file, e.g. `posts/my-first-post.html`.
2. Edit the parts marked `EDIT:` — tab title, date, title, subtitle, and the article body.
3. Add an entry to the top of `posts.json`:
   ```json
   {
     "title": "My First Post",
     "date": "2026-11-20",
     "excerpt": "One or two sentences that appear on the home page.",
     "url": "posts/my-first-post.html"
   }
   ```
   (Separate entries with commas. Posts are sorted newest first by `date`, format `YYYY-MM-DD`.)
4. Optional: update the static fallback `<li>` in `index.html` (only shown if JavaScript is off).

Use a path on this site (`posts/my-first-post.html`), not an external link. `main.js` sorts the list newest first.

> Previewing locally: `posts.json` is loaded with `fetch`, which browsers block on `file://`.
> Run `python3 -m http.server` in this folder and open http://localhost:8000.
> This project site is served from `/websiteme/`, so links and assets are relative and stay inside that path.

## Deploy to GitHub Pages
Pushes to `main` are published by `.github/workflows/static.yml` (Deploy static content to Pages). The Pages source is that workflow, not a branch folder. Leave the workflow in place.

The live site is https://rishuaba.github.io/websiteme/.
