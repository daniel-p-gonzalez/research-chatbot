import { PageContent }  from '#components/page'
import { GridLayout } from '#components/grid-layout'
import { Sidebar } from './sidebar'
import type { PropsWithChildren } from 'react'


export const Layout:React.FC<PropsWithChildren> = ({ children }) => {

    return (
        <GridLayout>
            <Sidebar />
            <PageContent>
                {children}
            </PageContent>
        </GridLayout>
    )

}
