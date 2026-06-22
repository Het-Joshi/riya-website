/* =========================================================================
   app.js — shared behaviour
   - mobile nav toggle
   - tiny dependency-free Markdown -> HTML parser
   - blog list + single-post rendering (reads window.POSTS from posts.js)
   No external libraries. No AI. Works fully offline once fonts cache.
   ========================================================================= */

/* ---------- mobile nav ---------- */
function initNav() {
  var toggle = document.querySelector('.nav-toggle');
  var links = document.getElementById('nav-links');
  if (!toggle || !links) return;
  toggle.addEventListener('click', function () {
    var open = links.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  links.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () {
      links.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
}

/* ---------- helpers ---------- */
function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
function slugify(s) {
  return String(s).toLowerCase().trim()
    .replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');
}

/* ---------- inline markdown (bold, italic, code, links, images) ---------- */
function inlineMd(text) {
  // images first:  ![alt](url)
  text = text.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g,
    function (_, alt, url) { return '<img src="' + url + '" alt="' + alt + '">'; });
  // links: [text](url)
  text = text.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g,
    function (_, t, url) { return '<a href="' + url + '" target="_blank" rel="noopener">' + t + '</a>'; });
  // inline code: `code`
  text = text.replace(/`([^`]+)`/g, function (_, c) { return '<code>' + c + '</code>'; });
  // bold: **text**
  text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  // italic: *text*  (avoid touching ** already consumed)
  text = text.replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>');
  return text;
}

/* ---------- block-level markdown ---------- */
function renderMarkdown(src) {
  var lines = String(src).replace(/\r\n/g, '\n').split('\n');
  var html = [];
  var i = 0;
  var listType = null; // 'ul' | 'ol' | null

  function closeList() {
    if (listType) { html.push('</' + listType + '>'); listType = null; }
  }

  while (i < lines.length) {
    var line = lines[i];

    // fenced code block ```
    if (/^```/.test(line)) {
      closeList();
      var buf = [];
      i++;
      while (i < lines.length && !/^```/.test(lines[i])) { buf.push(lines[i]); i++; }
      i++; // skip closing fence
      html.push('<pre><code>' + escapeHtml(buf.join('\n')) + '</code></pre>');
      continue;
    }

    // horizontal rule
    if (/^\s*---\s*$/.test(line)) { closeList(); html.push('<hr>'); i++; continue; }

    // headings
    var h = line.match(/^(#{1,4})\s+(.*)$/);
    if (h) {
      closeList();
      var level = h[1].length + 1; // start at h2 inside article
      if (level > 4) level = 4;
      html.push('<h' + level + '>' + inlineMd(escapeHtml(h[2])) + '</h' + level + '>');
      i++; continue;
    }

    // blockquote
    if (/^>\s?/.test(line)) {
      closeList();
      var q = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) { q.push(lines[i].replace(/^>\s?/, '')); i++; }
      html.push('<blockquote>' + inlineMd(escapeHtml(q.join(' '))) + '</blockquote>');
      continue;
    }

    // unordered list
    if (/^\s*[-*]\s+/.test(line)) {
      if (listType !== 'ul') { closeList(); html.push('<ul>'); listType = 'ul'; }
      html.push('<li>' + inlineMd(escapeHtml(line.replace(/^\s*[-*]\s+/, ''))) + '</li>');
      i++; continue;
    }
    // ordered list
    if (/^\s*\d+\.\s+/.test(line)) {
      if (listType !== 'ol') { closeList(); html.push('<ol>'); listType = 'ol'; }
      html.push('<li>' + inlineMd(escapeHtml(line.replace(/^\s*\d+\.\s+/, ''))) + '</li>');
      i++; continue;
    }

    // blank line
    if (/^\s*$/.test(line)) { closeList(); i++; continue; }

    // paragraph (collect consecutive non-empty, non-special lines)
    closeList();
    var para = [line];
    i++;
    while (i < lines.length && !/^\s*$/.test(lines[i]) &&
           !/^(#{1,4}\s|>\s?|\s*[-*]\s+|\s*\d+\.\s+|```|\s*---\s*$)/.test(lines[i])) {
      para.push(lines[i]); i++;
    }
    html.push('<p>' + inlineMd(escapeHtml(para.join(' '))) + '</p>');
  }
  closeList();
  return html.join('\n');
}

/* ---------- blog rendering ---------- */
function sortedPosts() {
  var posts = (window.POSTS || []).slice();
  posts.sort(function (a, b) { return (b.date || '').localeCompare(a.date || ''); });
  return posts;
}
function findPost(slug) {
  return (window.POSTS || []).find(function (p) {
    return (p.slug || slugify(p.title)) === slug;
  });
}
function fmtDate(iso) {
  if (!iso) return '';
  var d = new Date(iso + 'T00:00:00');
  if (isNaN(d)) return iso;
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function renderPostList(mount) {
  var posts = sortedPosts();
  if (!posts.length) {
    mount.innerHTML = '<div class="empty">No posts yet. Riya can write her first one in the <a href="write.html">writer</a>.</div>';
    return;
  }
  mount.innerHTML = posts.map(function (p) {
    var slug = p.slug || slugify(p.title);
    var tags = (p.tags || []).map(function (t) { return '<span class="tag">' + escapeHtml(t) + '</span>'; }).join('');
    return '<a class="post-card" href="#' + slug + '">' +
      '<div class="p-meta">' + fmtDate(p.date) + (p.readingTime ? ' &middot; ' + p.readingTime + ' min read' : '') + '</div>' +
      '<h3>' + escapeHtml(p.title) + '</h3>' +
      '<p>' + escapeHtml(p.excerpt || '') + '</p>' +
      '<div class="p-tags">' + tags + '</div>' +
      '</a>';
  }).join('');
}

function renderSinglePost(mount, slug) {
  var p = findPost(slug);
  if (!p) { mount.innerHTML = '<div class="empty">Post not found. <a href="blog.html">Back to all posts</a>.</div>'; return; }
  var tags = (p.tags || []).map(function (t) { return '<span class="tag">' + escapeHtml(t) + '</span>'; }).join('');
  mount.innerHTML =
    '<a class="back-link" href="blog.html">&larr; All posts</a>' +
    '<article class="article">' +
      '<div class="p-meta">' + fmtDate(p.date) + '</div>' +
      '<h1>' + escapeHtml(p.title) + '</h1>' +
      '<div class="p-tags" style="margin-bottom:1.2rem">' + tags + '</div>' +
      '<div class="article-body">' + renderMarkdown(p.content || '') + '</div>' +
    '</article>';
  window.scrollTo(0, 0);
}

function initBlog() {
  var mount = document.getElementById('blog-mount');
  if (!mount) return;
  function route() {
    var slug = decodeURIComponent(location.hash.replace(/^#/, ''));
    if (slug) renderSinglePost(mount, slug);
    else renderPostList(mount);
  }
  window.addEventListener('hashchange', route);
  route();
}

document.addEventListener('DOMContentLoaded', function () {
  initNav();
  initBlog();
});
