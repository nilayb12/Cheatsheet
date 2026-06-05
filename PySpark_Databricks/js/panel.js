/* ================================================================
   PySpark & Databricks Cheatsheet — panel.js
   Centered modal — reads from pre-generated CARD_DATA (cards.js)
   No network calls required; works fully offline.
   ================================================================ */

(function () {
  'use strict';

  const DOC_URLS = {
    'imports':                       'https://spark.apache.org/docs/latest/api/python/reference/pyspark.sql/',
    'sparksession':                  'https://spark.apache.org/docs/latest/api/python/reference/pyspark.sql/api/pyspark.sql.SparkSession.html',
    'creating dataframes':           'https://spark.apache.org/docs/latest/api/python/reference/pyspark.sql/api/pyspark.sql.SparkSession.createDataFrame.html',
    'inspection & basic ops':        'https://spark.apache.org/docs/latest/api/python/reference/pyspark.sql/api/pyspark.sql.DataFrame.html',
    'key functions (f.*)':           'https://spark.apache.org/docs/latest/api/python/reference/pyspark.sql/functions.html',
    'groupby & aggregations':        'https://spark.apache.org/docs/latest/api/python/reference/pyspark.sql/api/pyspark.sql.GroupedData.html',
    'joins, sort & dedup':           'https://spark.apache.org/docs/latest/api/python/reference/pyspark.sql/api/pyspark.sql.DataFrame.join.html',
    'sql interface':                 'https://spark.apache.org/docs/latest/api/python/reference/pyspark.sql/api/pyspark.sql.SparkSession.sql.html',
    'writing data':                  'https://spark.apache.org/docs/latest/api/python/reference/pyspark.sql/api/pyspark.sql.DataFrameWriter.html',
    'performance tips':              'https://spark.apache.org/docs/latest/sql-performance-tuning.html',
    'notebook magic commands':       'https://docs.databricks.com/en/notebooks/notebooks-code.html',
    'display & output':              'https://docs.databricks.com/en/notebooks/visualizations/index.html',
    'dbutils':                       'https://docs.databricks.com/en/dev-tools/databricks-utils.html',
    'delta lake':                    'https://docs.delta.io/latest/delta-intro.html',
    'unity catalog':                 'https://docs.databricks.com/en/data-governance/unity-catalog/index.html',
    'databricks-specific i/o paths': 'https://docs.databricks.com/en/dbfs/index.html',
  };

  function getDocUrl(sectionTitle) {
    return DOC_URLS[sectionTitle.toLowerCase().trim()]
      || 'https://spark.apache.org/docs/latest/api/python/';
  }

  function makeKey(sectionTitle, cardLabel) {
    return `${sectionTitle.toLowerCase().trim()}::${cardLabel.toLowerCase().trim()}`;
  }

  function escHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function highlightCode(code) {
    return escHtml(code)
      .replace(/\b(from|import|as|def|return|if|else|elif|for|in|while|with|class|try|except|raise|True|False|None|and|or|not|lambda|yield|pass|break|continue|global|nonlocal|assert|del|is)\b/g,
        '<span class="kw">$1</span>')
      .replace(/(#[^\n]*)/g, '<span class="cm">$1</span>');
  }

  function renderProse(text) {
    return String(text).replace(/<code>(.*?)<\/code>/g,
      (_, inner) => `<code>${inner}</code>`);
  }

  function renderSkeleton() {
    const left = `
      <div class="detail-heading">Overview</div>
      <div class="skeleton w-full"></div>
      <div class="skeleton w-3-4"></div>
      <div class="skeleton w-full"></div>
      <div class="skeleton w-1-2"></div>
      <div class="detail-heading" style="margin-top:1.1rem">When to use</div>
      <div class="skeleton w-full"></div>
      <div class="skeleton w-3-4"></div>
      <div class="detail-heading" style="margin-top:1.1rem">Watch out for</div>
      <div class="skeleton w-full" style="height:32px;border-radius:6px"></div>
      <div class="skeleton w-full" style="height:32px;border-radius:6px;margin-top:5px"></div>`;
    const right = `
      <div class="detail-heading">Example</div>
      <div class="skeleton h-tall"></div>`;
    return { left, right };
  }

  function renderDetail(data, sectionTitle) {
    const docUrl = getDocUrl(sectionTitle);

    const gotchasHtml = (data.gotchas || []).map(g =>
      `<div class="gotcha-tag">⚠ ${renderProse(g)}</div>`
    ).join('');

    const left = `
      <div class="detail-heading">Overview</div>
      <div class="detail-prose">${renderProse(data.summary || '')}</div>

      <div class="detail-heading">When to use</div>
      <div class="detail-prose">${renderProse(data.when_to_use || '')}</div>

      ${gotchasHtml ? `
      <div class="detail-heading">Watch out for</div>
      <div class="gotcha-list">${gotchasHtml}</div>` : ''}

      <a class="doc-link" href="${escHtml(docUrl)}" target="_blank" rel="noopener">
        ↗ Official documentation
      </a>`;

    const right = `
      <div class="detail-heading">Example</div>
      <div class="detail-code-block">${highlightCode(data.example || '')}</div>`;

    return { left, right };
  }

  function openPanel(card) {
    const labelEl       = card.querySelector('.card-label');
    const section       = card.closest('.section');
    const sectionTitleEl = section && section.querySelector('.section-title');

    const cardLabel    = labelEl?.textContent?.trim()      || '';
    const sectionTitle = sectionTitleEl?.textContent?.trim() || '';

    document.getElementById('detail-section-label').textContent = sectionTitle.toUpperCase();
    document.getElementById('detail-card-title').textContent    = cardLabel;

    // Show skeleton immediately
    const skel = renderSkeleton();
    document.getElementById('detail-left').innerHTML  = skel.left;
    document.getElementById('detail-right').innerHTML = skel.right;

    document.getElementById('detail-panel').classList.add('open');
    document.getElementById('detail-overlay').classList.add('open');

    // Look up data and render after brief delay
    const key  = makeKey(sectionTitle, cardLabel);
    const data = (typeof CARD_DATA !== 'undefined') ? CARD_DATA[key] : null;

    setTimeout(() => {
      if (data) {
        const { left, right } = renderDetail(data, sectionTitle);
        document.getElementById('detail-left').innerHTML  = left;
        document.getElementById('detail-right').innerHTML = right;
      } else {
        document.getElementById('detail-left').innerHTML = `
          <div class="detail-heading">Not found</div>
          <p class="detail-prose">No details for
            <code>${escHtml(sectionTitle)} → ${escHtml(cardLabel)}</code>.
          </p>`;
        document.getElementById('detail-right').innerHTML = '';
      }
    }, 80);
  }

  function closePanel() {
    document.getElementById('detail-panel').classList.remove('open');
    document.getElementById('detail-overlay').classList.remove('open');
  }

  function init() {
    document.querySelectorAll('.card').forEach(card => {
      card.addEventListener('click', () => openPanel(card));
    });

    document.getElementById('detail-overlay').addEventListener('click', closePanel);

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') closePanel();
    });
  }

  window.closePanel = closePanel;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

}());
