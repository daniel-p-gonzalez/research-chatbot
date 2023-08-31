import React from 'react'
import logo from './logo.svg'
import { PageContextProvider } from '#lib/page-context'
import type { PageContext } from './types'
import { MantineProvider, Text } from '@mantine/core';
import { Box } from 'boxible'
import styled from '@emotion/styled'
import { Sidebar } from '../components/sidebar'


export { PageShell }

function PageShell({ children, pageContext }: { children: React.ReactNode; pageContext: PageContext }) {
    return (
        <React.StrictMode>
            <PageContextProvider pageContext={pageContext}>
                <MantineProvider withGlobalStyles withNormalizeCSS>
                    <Layout>
                        <Sidebar />
                        {children}
                    </Layout>
                </MantineProvider>
            </PageContextProvider>
        </React.StrictMode>
    )
}

// function Layout({ children }: { children: React.ReactNode }) {
//   return (
//     <div>
//       {children}
//     </div>
//   )
// }

// import { Box, styled } from '@common'

export const Layout = styled.div({
    display: 'grid',
    height: '100vh',
    width: '100vw',
    gridTemplateColumns: 'auto 1fr',
    gridTemplateRows: 'auto 1fr auto',
    overflow: 'hidden',
    gridTemplateAreas: `
    "sidebar main"
  `,
});


// export const Main = styled(Box)({
//     flexDirection: 'column',
//     gridArea: 'main',
//     overflow: 'auto',
// })

// function Sidebar({ children }: { children: React.ReactNode }) {
//   return (
//     <div
//       style={{
//         padding: 20,
//         flexShrink: 0,
//         display: 'flex',
//         flexDirection: 'column',
//         alignItems: 'center',
//         lineHeight: '1.8em'
//       }}
//     >
//             sid
//       {children}
//     </div>
//   )
// }

function Content({ children }: { children: React.ReactNode }) {
  return (
    <div>
      {children}
    </div>
  )
}

function Logo() {
  return (
    <div
      style={{
        marginTop: 20,
        marginBottom: 10
      }}
    >
      <a href="/">
        <img src={logo} height={64} width={64} alt="logo" />
      </a>
    </div>
  )
}
