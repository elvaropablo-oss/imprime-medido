import { site } from '../../site.config.mjs';

const base = site.basePath;

export function linkButton(path, label, quiet = false) {
  return `<a class="button${quiet ? ' button--quiet' : ''}" href="${base}${path}">${label}</a>`;
}

export function breadcrumbs(items) {
  return `<nav class="breadcrumbs" aria-label="Migas de pan">${items.map((item, index) => index === items.length - 1 ? `<span aria-current="page">${item.label}</span>` : `<a href="${base}${item.path}">${item.label}</a>`).join('<span aria-hidden="true">/</span>')}</nav>`;
}

export function hero(kicker, title, intro, actions = '') {
  return `<section class="hero"><p class="eyebrow">${kicker}</p><h1>${title}</h1><p class="lead">${intro}</p>${actions ? `<div class="actions">${actions}</div>` : ''}</section>`;
}

function navLink(pagePath, path, label) {
  const active = pagePath === path || (path === 'guias/imprimir-tamano-real' && pagePath.startsWith('guias/'));
  return `<a href="${base}${path}/"${active ? ' aria-current="page"' : ''}>${label}</a>`;
}

export function renderPage(page) {
  const canonical = `${site.origin}${base}${page.path ? `${page.path}/` : ''}`;
  const schema = JSON.stringify(page.schema || {
    '@context': 'https://schema.org', '@type': page.tool ? 'WebApplication' : 'WebPage',
    name: page.h1, url: canonical, description: page.description, inLanguage: 'es-ES',
    ...(page.tool ? { applicationCategory: 'UtilitiesApplication', operatingSystem: 'Any', offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' } } : {})
  }).replace(/</g, '\\u003c');
  return `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${page.title}</title>
  <meta name="description" content="${page.description}">
  ${page.noindex ? '<meta name="robots" content="noindex,follow">' : ''}
  <link rel="canonical" href="${canonical}">
  <link rel="icon" href="${base}assets/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="${base}assets/site.css">
  <script type="application/ld+json">${schema}</script>
  <script type="module" src="${base}assets/app.js"></script>
  <script type="module" src="${base}assets/visuals.js"></script>
</head>
<body class="page-${page.path ? page.path.replaceAll('/', '-') : 'home'}">
  <a class="skip-link" href="#contenido">Saltar al contenido</a>
  <header class="site-header"><a class="brand" href="${base}" aria-label="ImprimeMedido, inicio"><svg class="brand-mark" viewBox="0 0 40 40" aria-hidden="true"><rect x="6" y="6" width="28" height="28" fill="#fffefa" stroke="currentColor"/><path d="M2 11V2h9M29 2h9v9M38 29v9h-9M11 38H2v-9" fill="none" stroke="#df1267" stroke-width="2"/><circle cx="20" cy="20" r="4" fill="#00a7c7"/></svg><span>ImprimeMedido</span></a><nav aria-label="Principal">${navLink(page.path, 'herramientas', 'Herramientas')}${navLink(page.path, 'guias/imprimir-tamano-real', 'Guía')}${navLink(page.path, 'metodologia', 'Metodología')}</nav></header>
  <main id="contenido">${page.content}</main>
  <footer><p><strong>ImprimeMedido</strong> prepara medidas en milímetros. Confirma siempre el resultado con una regla física.</p><nav aria-label="Información"><a href="${base}metodologia/">Metodología</a><a href="${base}sobre/">Sobre</a><a href="${base}privacidad/">Privacidad</a></nav></footer>
</body>
</html>`;
}
