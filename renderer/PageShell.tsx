import React from 'react'
import { PageContextProvider } from '#lib/page-context'
import type { PageContext } from './types'
import { MantineProvider } from '@mantine/core';
import { Sidebar } from '#components/sidebar'
import type { Layout } from './types'
import { GridLayout } from '#components/grid-layout';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
export { PageShell }

function PageShell({ children, pageContext }: { children: React.ReactNode; pageContext: PageContext }) {
    const Layout = pageContext.exports.Layout || LayoutDefault
    const [queryClient] = React.useState(() => new QueryClient())

    return (
        <React.StrictMode>
            <QueryClientProvider client={queryClient}>
                <PageContextProvider pageContext={pageContext}>
                    <MantineProvider withGlobalStyles withNormalizeCSS>
                        <Layout>
                            {children}
                        </Layout>
                    </MantineProvider>
                </PageContextProvider>
            </QueryClientProvider>
        </React.StrictMode>
    )
}


const LayoutDefault: Layout = ({ children }) => {
    return (
        <GridLayout>
            <Sidebar />
            {children}
        </GridLayout>
    )
}
