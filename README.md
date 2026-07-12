# Rafi Al Imran — Personal Portfolio Website

A premium, zero-build portfolio for GitHub Pages. **You never need to touch HTML or code.** All content lives in simple text files you can edit in your browser on GitHub.

---

## 🚀 Publish the site (one time, 5 minutes)

1. Go to **github.com** and log in.
2. Click **New repository**. Name it exactly: `rafialimran.github.io` (your username + `.github.io`).
3. Click **uploading an existing file**, drag ALL the files and folders from this project in, and click **Commit changes**.
4. Go to the repository's **Settings → Pages**. Under "Source", choose **GitHub Actions** (or "Deploy from a branch → main → / (root)"; both work).
5. Wait 1–2 minutes. Your site is live at **https://rafialimran.github.io** 🎉

---

## ✏️ How to update the website (no coding)

Everything you see on the site comes from files in the **`data/`** and **`content/`** folders. Edit a file on GitHub (click the file → pencil icon → change text → **Commit changes**) and the site updates itself within a minute.

| To change... | Edit this file |
|---|---|
| Name, tagline, roles, statistics, email, links | `data/profile.json` |
| Work experience | `data/experience.json` |
| Project case studies | `data/projects.json` |
| Dashboard charts & numbers | `data/dashboard.json` |
| Documentation portfolio items | `data/portfolio.json` |
| Publications | `data/publications.json` |
| Photo gallery | `data/photos.json` |
| Skills | `data/skills.json` |
| Education, certificates, languages, references | `data/cv.json` |
| Blog posts | `content/blog/` (see below) |

**Golden rule for JSON files:** keep the quotes `"` and commas `,` exactly as they are — only change the text between the quotes. If the page goes blank after an edit, check for a missing comma or quote at https://jsonlint.com (paste the file, it shows you the mistake).

### ➕ Add a blog post
1. Create a new file in `content/blog/`, for example `my-new-post.md`. Write in it normally (Markdown: `#` for headings, `**bold**`, `-` for lists).
2. Open `content/blog/index.json` and copy one existing block, changing the filename, title, date, category and excerpt. Put newest posts first.

### 🖼️ Add your photos
1. Upload your images to `assets/img/` (create a `photos` subfolder if you like).
2. In `data/photos.json`, change each `"src"` to your file, e.g. `"assets/img/photos/training1.jpg"`. The gallery currently shows placeholder images.
3. Tip: resize photos to about 1200px wide before uploading (use any free tool like squoosh.app) so the site stays fast.

### 📄 Add your PDF CV
Upload your CV as `assets/Rafi_Al_Imran_CV.pdf`. The "Download CV" buttons already point there.

### 📷 Add project & publication covers
Project cards look for images named in `data/projects.json` (`"cover"`). If an image is missing, the site automatically shows an elegant text cover instead — nothing breaks.

---

## 👀 Previewing on your own computer (optional)

Browsers block reading local data files, so double-clicking `index.html` shows a hint instead of content. To preview properly:
1. Install Python (python.org), open a terminal/command prompt in this folder.
2. Run: `python -m http.server`
3. Open http://localhost:8000

(Or just edit on GitHub and check the live site — that works too.)

---

## 🧰 What's inside

- **Pure static site** — no build step, nothing to install, nothing can fail to compile
- Light + dark mode (remembers the visitor's choice)
- Typing animation, animated statistics, scroll reveals
- Interactive Chart.js MEAL dashboard driven by JSON
- Case-study project pages (`project.html?id=...`)
- Markdown blog, Pinterest-style photo gallery with lightbox
- SEO: sitemap.xml, robots.txt, Open Graph tags, RSS feed
- Fully responsive, keyboard accessible, respects reduced-motion
