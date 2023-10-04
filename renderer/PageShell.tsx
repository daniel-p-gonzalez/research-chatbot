import React from 'react'
import { PageContextProvider } from '#lib/page-context'
import type { Layout, PageContext } from './types'
import { ColorSchemeScript, createTheme, MantineProvider } from '@mantine/core';
import { Sidebar } from '#components/sidebar'
import { GridLayout } from '#components/grid-layout';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';

export { PageShell }

const theme = createTheme({

})

function PageShell({ children, pageContext }: { children: React.ReactNode; pageContext: PageContext }) {
    const Layout = pageContext.exports.Layout || LayoutDefault
    const [queryClient] = React.useState(() => new QueryClient())

    return (
        <React.StrictMode>
            <QueryClientProvider client={queryClient}>
                <PageContextProvider pageContext={pageContext}>
                    <ColorSchemeScript defaultColorScheme="light" />
                    <MantineProvider defaultColorScheme='light' theme={theme}>
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
