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
    if (!Page) throw new Error('Client-side render() hook expects pageContext.Page to be defined')

    const content = (
        <PageShell pageContext={pageContext}>
            <Page {...pageProps} />
        </PageShell>
    )

    if (pageContext.isHydration) {
        root = hydrateRoot(getRootEl(), content)
    } else {
        if (!root) {
            root = createRoot(getRootEl())
        }
        root.render(content)
    }
}


export const clientRouting = true
export const hydrationCanBeAborted = true

