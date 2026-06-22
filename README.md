# Riya Shah — Portfolio

A neo-brutalist personal site for a CNA + UIC Biology (pre-med) student.
Plain HTML / CSS / JavaScript. No build step, no backend, no AI, no tracking.

## Files

| File | What it is |
|------|------------|
| `index.html` | Home / portfolio (about, experience, education, skills, contact) |
| `blog.html` | Blog list + reading view |
| `write.html` | In-browser writer that generates posts to publish |
| `posts.js` | Where your blog posts live (you edit this) |
| `styles.css` | All styling |
| `app.js` | Navigation + Markdown rendering (don't need to touch) |

## Put it online (free)

**GitHub Pages**
1. Make a repo named `your-username.github.io`.
2. Upload all the files in this folder (not the folder itself — the files).
3. Go to repo **Settings → Pages**, set the source to your main branch.
4. Your site is live at `https://your-username.github.io`.

Any static host works too (Netlify, Cloudflare Pages, Vercel) — just drag the folder in.

## Write a blog post

1. Open `write.html` in your browser.
2. Type your post. The right side shows a live preview. Your draft auto-saves in that browser.
3. Click **Generate post** → **Copy**.
4. Open `posts.js`, paste right under `window.POSTS = [`, save, and re-upload `posts.js`.

The newest post goes at the top. That's the whole workflow.

### Markdown you can use in a post
- `# Heading` and `## Smaller heading`
- `**bold**`, `*italic*`, `` `code` ``
- `[link text](https://url.com)`
- `- ` for bullet lists, `1. ` for numbered lists
- `> ` for a quote
- `![description](image-url.jpg)` for an image
- ` ``` ` on its own line to start/end a code block

## Make it yours

Search `index.html` for the grey notes that say "replace this" — they mark every placeholder (email, LinkedIn, job dates, bullet points). Swap in real details and you're done.

To change the look, the colors live at the top of `styles.css` under `:root`
(e.g. `--vermillion`, `--teal`, `--paper`).
