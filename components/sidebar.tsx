import { Box } from 'boxible'
import styled from '@emotion/styled'
import { Link } from './link'

 const Wrapper = styled(Box)({
    padding: '40px 10px',

    borderRight: '1px solid #ccc',
    flexDirection: 'column',
    gridArea: 'sidebar',
    overflow: 'auto',
    flexWrap: 'nowrap',
    width: 300,
    listStyle: 'none',
    a: {
    },
    li: {
        marginBottom: '8px',
    }
})

const SectionId = styled.span({

})

const SectionName = styled.span({

})

const SectionLink = styled(Link)({
    color: 'rgb(66, 66, 66)',
    fontSize: '16px',
    lineHeight: '18px',
    textDecoration: 'none',
    display: 'flex',
    gap: '5px',
    '&.is-active': {
        fontWeight: 'bold',
    }

})

type SectionProps = {
    id: string
    name: string
    slug: string

}


const Section: React.FC<SectionProps> = ({ name, slug, id }) => {
    return (
        <li>
            <SectionLink href={`/section/${slug}`}>
                <SectionId>{id}</SectionId>
                <SectionName>{name}</SectionName>
            </SectionLink>
        </li>
    )

}

export const Sidebar: React.FC = () => {
    return (
        <Wrapper as="ul">

            <Section
                id="1.2"
                slug="1-2-microeconomics-and-macroeconomics"
                name="Microeconomics and Macroeconomics"
            />
            <Section
                id="2.1"
                slug="2-1-how-individuals-make-choices-based-on-their-budget-constraint"
                name="How Individuals Make Choices Based on Their Budget Constraint"
            />
            <Section
                id="9.1"
                slug="9-1-how-monopolies-form-barriers-to-entry"
                name="How Monopolies Form: Barriers to Entry"
            />
            <Section
                id="13.2"
                slug="13-2-how-governments-can-encourage-innovation"
                name="How Governments Can Encourage Innovation"
            />
            <Section
                id="27.1"
                slug="27-1-defining-money-by-its-functions"
                name="Defining Money by Its Functions"
            />

        </Wrapper>
    )

}
