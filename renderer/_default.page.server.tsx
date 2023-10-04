export { render }
// See https://vite-plugin-ssr.com/data-fetching
export const passToClient = ['pageProps', 'routeParams']

import ReactDOMServer from 'react-dom/server'
import { PageShell } from './PageShell'
import { escapeInject, dangerouslySkipEscape } from 'vite-plugin-ssr/server'
import logoUrl from './logo.svg'
import type { PageContextServer } from './types'
import createEmotionServer from "@emotion/server/create-instance";

import createCache from '@emotion/cache';

const key = 'css'
const cache = createCache({ key })
const { extractCritical } = createEmotionServer(cache)

async function render(pageContext: PageContextServer) {
  const { Page, pageProps } = pageContext

  // This render() hook only supports SSR, see https://vite-plugin-ssr.com/render-modes for how to modify render() to support SPA
  //if (!Page) throw new Error('My render() hook expects pageContext.Page to be defined')
  const pageHtml = ReactDOMServer.renderToString(
    <PageShell pageContext={pageContext}>
      {Page ? <Page {...pageProps} /> : <></>}
    </PageShell>
  )

  const { html, css, ids } = extractCritical(pageHtml);

  // See https://vite-plugin-ssr.com/head
  const { documentProps } = pageContext.exports
  const title = (documentProps && documentProps.title) || 'Econ Tutor ChatBot'
  const desc = (documentProps && documentProps.description) || 'A chatbot for econ students'

  const documentHtml = escapeInject`<!DOCTYPE html>
    <html lang="en">
      <head>
<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-N4J7CH7P');</script>
<!-- End Google Tag Manager -->
        <meta charset="UTF-8" />
        <link rel="icon" href="${logoUrl}" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="description" content="${desc}" />
        <style data-emotion="${key} ${ids.join(' ')}">${dangerouslySkipEscape(css)}</style>
        <title>${title}</title>
      </head>
      <body>
<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-N4J7CH7P"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<!-- End Google Tag Manager (noscript) -->
        <div id="react-root">${dangerouslySkipEscape(html)}</div>
      </body>
    </html>`

  return {
    documentHtml,
    pageContext: {
      // We can add some `pageContext` here, which is useful if we want to do page redirection https://vite-plugin-ssr.com/page-redirection
    }
  }
}
