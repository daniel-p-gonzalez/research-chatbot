import styled from '@emotion/styled'

export const GridLayout = styled.div({
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
