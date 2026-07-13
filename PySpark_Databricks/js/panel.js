/* ================================================================
   PySpark & Databricks Cheatsheet — panel.js
   Centered modal — reads from CARD_DATA (cards.js). Offline-ready.
   ================================================================ */
(function () {
  'use strict';

  var DOC_URLS = {
    'imports':                       'https://spark.apache.org/docs/latest/api/python/reference/pyspark.sql/index.html',
    'sparksession':                  'https://spark.apache.org/docs/latest/api/python/reference/pyspark.sql/api/pyspark.sql.SparkSession.html',
    'creating dataframes':           'https://spark.apache.org/docs/latest/api/python/reference/pyspark.sql/api/pyspark.sql.SparkSession.createDataFrame.html',
    'inspection & basic ops':        'https://spark.apache.org/docs/latest/api/python/reference/pyspark.sql/api/pyspark.sql.DataFrame.html',
    'key functions (f.*)':           'https://spark.apache.org/docs/latest/api/python/reference/pyspark.sql/functions.html',
    'groupby & aggregations':        'https://spark.apache.org/docs/latest/api/python/reference/pyspark.sql/api/pyspark.sql.GroupedData.html',
    'joins, sort & dedup':           'https://spark.apache.org/docs/latest/api/python/reference/pyspark.sql/api/pyspark.sql.DataFrame.join.html',
    'sql interface':                 'https://spark.apache.org/docs/latest/api/python/reference/pyspark.sql/api/pyspark.sql.SparkSession.sql.html',
    'writing data':                  'https://spark.apache.org/docs/latest/api/python/reference/pyspark.sql/api/pyspark.sql.DataFrameWriter.html',
    'performance tips':              'https://spark.apache.org/docs/latest/sql-performance-tuning.html',
    'spark connect':                 'https://spark.apache.org/docs/latest/spark-connect-overview.html',
    'variant & semi-structured':     'https://spark.apache.org/docs/latest/sql-ref-datatypes.html',
    'native plotting':               'https://spark.apache.org/docs/latest/api/python/reference/pyspark.sql/api/pyspark.sql.DataFrame.plot.html',
    'python udtfs':                  'https://spark.apache.org/docs/latest/api/python/user_guide/sql/python_udtf.html',
    'notebook magic commands':       'https://docs.databricks.com/aws/en/notebooks/notebooks-code.html',
    'display & output':              'https://docs.databricks.com/aws/en/notebooks/visualizations/index.html',
    'dbutils':                       'https://docs.databricks.com/aws/en/dev-tools/databricks-utils.html',
    'delta lake':                    'https://docs.delta.io/latest/delta-intro.html',
    'liquid clustering':             'https://docs.databricks.com/aws/en/tables/clustering.html',
    'unity catalog':                 'https://docs.databricks.com/aws/en/data-governance/unity-catalog/index.html',
    'lakeflow pipelines':            'https://docs.databricks.com/aws/en/dlt/index.html',
    'databricks-specific i/o paths': 'https://docs.databricks.com/aws/en/files/index.html'
  };

  function getDocUrl(sectionTitle) {
    return DOC_URLS[sectionTitle.toLowerCase().trim()]
      || 'https://spark.apache.org/docs/latest/api/python/index.html';
  }

  function makeKey(sectionTitle, cardLabel) {
    return sectionTitle.toLowerCase().trim() + '::' + cardLabel.toLowerCase().trim();
  }

  // Read only text nodes of the label (exclude .new-badge span text)
  function labelText(labelEl) {
    if (!labelEl) return '';
    return Array.prototype.filter
      .call(labelEl.childNodes, function (n) { return n.nodeType === 3; })
      .map(function (n) { return n.textContent; })
      .join('').trim();
  }

  function escHtml(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  // Expand compressed code tokens §c§ / §/c§ back to <code>…</code>
  function expandTokens(t) {
    return String(t).replace(/\u00a7c\u00a7/g, '<code>').replace(/\u00a7\/c\u00a7/g, '</code>');
  }

  function renderProse(text) {
    return expandTokens(text).replace(/<code>(.*?)<\/code>/g, function (_, i) { return '<code>' + i + '</code>'; });
  }

  function highlightCode(code) {
    code = expandTokens(code);
    return escHtml(code)
      .replace(/\b(from|import|as|def|return|if|else|elif|for|in|while|with|class|try|except|finally|raise|True|False|None|and|or|not|lambda|yield|pass|break|continue|global|nonlocal|assert|del|is)\b/g,
        '<span class="kw">$1</span>')
      .replace(/(#[^\n]*)/g, '<span class="cm">$1</span>');
  }

  function renderSkeleton() {
    var left = '<div class="detail-heading">Overview</div>'
      + '<div class="skeleton w-full"></div><div class="skeleton w-3-4"></div>'
      + '<div class="skeleton w-full"></div><div class="skeleton w-1-2"></div>'
      + '<div class="detail-heading" style="margin-top:1.1rem">When to use</div>'
      + '<div class="skeleton w-full"></div><div class="skeleton w-3-4"></div>'
      + '<div class="detail-heading" style="margin-top:1.1rem">Watch out for</div>'
      + '<div class="skeleton w-full" style="height:32px;border-radius:6px"></div>';
    var right = '<div class="detail-heading">Example</div><div class="skeleton h-tall"></div>';
    return { left: left, right: right };
  }

  function renderDetail(data, sectionTitle) {
    var docUrl = getDocUrl(sectionTitle);
    var gotchasHtml = (data.gotchas || []).map(function (g) {
      return '<div class="gotcha-tag">⚠ ' + renderProse(g) + '</div>';
    }).join('');

    var left = '<div class="detail-heading">Overview</div>'
      + '<div class="detail-prose">' + renderProse(data.summary || '') + '</div>'
      + '<div class="detail-heading">When to use</div>'
      + '<div class="detail-prose">' + renderProse(data.when_to_use || '') + '</div>'
      + (gotchasHtml ? '<div class="detail-heading">Watch out for</div><div class="gotcha-list">' + gotchasHtml + '</div>' : '')
      + '<a class="doc-link" href="' + escHtml(docUrl) + '" target="_blank" rel="noopener">↗ Official documentation</a>';

    var raw = expandTokens(data.example || '');
    var right = '<div class="detail-heading">Example</div>'
      + '<div class="detail-code-block" data-raw="' + escHtml(raw) + '">'
      + '<button class="copy-btn" onclick="copyCode(this)">Copy</button>'
      + highlightCode(data.example || '') + '</div>';

    return { left: left, right: right };
  }

  function openPanel(card) {
    var labelEl = card.querySelector('.card-label');
    var section = card.closest('.section');
    var sectionTitleEl = section && section.querySelector('.section-title');

    var cardLabel = labelText(labelEl);
    var sectionTitle = sectionTitleEl ? sectionTitleEl.textContent.trim() : '';

    document.getElementById('detail-section-label').textContent = sectionTitle.toUpperCase();
    document.getElementById('detail-card-title').textContent = cardLabel;

    var skel = renderSkeleton();
    document.getElementById('detail-left').innerHTML = skel.left;
    document.getElementById('detail-right').innerHTML = skel.right;

    document.getElementById('detail-panel').classList.add('open');
    document.getElementById('detail-overlay').classList.add('open');
    document.body.style.overflow = 'hidden';

    var key = makeKey(sectionTitle, cardLabel);
    var data = (typeof CARD_DATA !== 'undefined') ? CARD_DATA[key] : null;

    setTimeout(function () {
      if (data) {
        var r = renderDetail(data, sectionTitle);
        document.getElementById('detail-left').innerHTML = r.left;
        document.getElementById('detail-right').innerHTML = r.right;
      } else {
        document.getElementById('detail-left').innerHTML =
          '<div class="detail-heading">Not found</div>'
          + '<p class="detail-prose">No details for <code>'
          + escHtml(sectionTitle) + ' → ' + escHtml(cardLabel) + '</code>.</p>';
        document.getElementById('detail-right').innerHTML = '';
      }
    }, 80);
  }

  function closePanel() {
    document.getElementById('detail-panel').classList.remove('open');
    document.getElementById('detail-overlay').classList.remove('open');
    document.body.style.overflow = '';
  }

  /* ── Copy button ── */
  function copyCode(btn) {
    var raw = btn.parentElement.getAttribute('data-raw') || '';
    var txt = raw.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(txt).then(function () { flash(btn); }, function () { fallback(btn, txt); });
    } else { fallback(btn, txt); }
  }
  function fallback(btn, txt) {
    var ta = document.createElement('textarea');
    ta.value = txt; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); flash(btn); } catch (e) {}
    document.body.removeChild(ta);
  }
  function flash(btn) {
    btn.textContent = 'Copied!'; btn.classList.add('copied');
    setTimeout(function () { btn.textContent = 'Copy'; btn.classList.remove('copied'); }, 2000);
  }

  function init() {
    document.querySelectorAll('.card').forEach(function (card) {
      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', '0');
      var name = labelText(card.querySelector('.card-label'));
      if (name) card.setAttribute('aria-label', name + ' — open details');
      card.addEventListener('click', function () { openPanel(card); });
      card.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openPanel(card); }
      });
    });
    document.getElementById('detail-overlay').addEventListener('click', closePanel);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closePanel(); });
  }

  window.closePanel = closePanel;
  window.copyCode = copyCode;

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
}());
