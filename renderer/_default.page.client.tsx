export { render }
import type { Root } from 'react-dom/client'
import { hydrateRoot, createRoot } from 'react-dom/client'
import { PageShell } from './PageShell'
import type { PageContextClient } from './types'

let root: Root | undefined

function getRootEl() {
    const el = document.getElementById('react-root')
    if (!el) {
        throw new Error('DOM element #react-root not found')
    }
    return el
}

async function render(pageContext: PageContextClient) {
    const { Page, pageProps } = pageContext
 //   if (!Page) throw new Error('Client-side render() hook expects pageContext.Page to be defined')

    const content = (
        <PageShell pageContext={pageContext}>
            {Page ? <Page {...pageProps} /> : <></>}
        </PageShell>
    )
    const rootEl = getRootEl()

    if (rootEl.innerHTML == '' || !pageContext.isHydration) {
        if (!root || !Page) {
            root = createRoot(rootEl)
        }
        root.render(content)
    } else {
        root = hydrateRoot(rootEl, content)
        rootEl.classList.add('hydrated')
    }
}


export const clientRouting = true
export const hydrationCanBeAborted = true

