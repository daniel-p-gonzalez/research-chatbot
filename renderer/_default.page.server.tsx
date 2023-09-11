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
  if (!Page) throw new Error('My render() hook expects pageContext.Page to be defined')
  const pageHtml = ReactDOMServer.renderToString(
    <PageShell pageContext={pageContext}>
      <Page {...pageProps} />
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
        <meta charset="UTF-8" />
        <link rel="icon" href="${logoUrl}" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="description" content="${desc}" />
        <style data-emotion="${key} ${ids.join(' ')}">${dangerouslySkipEscape(css)}</style>
        <title>${title}</title>
      </head>
      <body>
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
