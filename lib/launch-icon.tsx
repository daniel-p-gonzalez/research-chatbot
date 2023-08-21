import styled from '@emotion/styled'
import { css, keyframes } from '@emotion/react'

const Inner = styled.div({
    flex: 1,
})


const Icon = styled.div({

    width: 200,
    cursor: 'pointer',
    float: 'left',
})

const Label = styled.div({
    margin: 0,
    padding: 0,
    textAlign: 'center',

})

const Animation = styled.svg({
  overflow: 'visible',
  width: '100%',
  display: 'flex',
})


const Bar = css`
  animation-delay: 0s;
`;

const moveGreen = keyframes`
  from {
    transform: matrix(1, 0, 0, 1, 0, 0);
  }
  to {
    transform: matrix(0.965926, -0.258819, 0.258819, 0.965926, 0, -18);
  }
`;
const Green = styled.path`
  ${Bar}
  fill: #77AF42;
  transform-origin: center left;
  .staxly-animation:hover & {
    animation: ${moveGreen} 0.6s cubic-bezier(0.01, 0.011, 0.013, 0.04) 0.5s infinite alternate;
  }
`;

const moveOrange = keyframes`
  from {
    transform: matrix(1, 0, 0, 1, 0, 0);
  }
  to {
    transform: matrix(0.994522, 0.104528, -0.104528, 0.994522, 0, -14);
  }
`;
const Orange = styled.path`
  ${Bar}
  fill: #F47641;
  transform-origin: center right;
  .staxly-animation:hover & {
    animation: ${moveOrange} 0.6s cubic-bezier(0.81, 0.41, 0.13, 0.74) 0.5s infinite alternate;
  }
`;

const moveGray = keyframes`
  from {
    transform: matrix(1, 0, 0, 1, 0, 0);
  } to {
    transform: matrix(0.99863, 0.052336, -0.052336, 0.99863, 0, -8);
  }
`;
const Gray = styled.path`
  ${Bar}
  fill: #5E6062;
  transform-origin: center right;
  .staxly-animation:hover & {
    animation: ${moveGray} 0.6s cubic-bezier(0.81, 0.41, 0.13, 0.74) 0.5s infinite alternate;
  }
`;

const moveYellow = keyframes`
  from {
    transform: matrix(1, 0, 0, 1, 0, 0);
  } to {
    transform: matrix(1, 0, 0, 1, 0, -8);
  }
`;

const Yellow = styled.path`
  ${Bar}
  fill: #F4D019;
  transform-origin: center right;
  .staxly-animation:hover & {
    animation: ${moveYellow} 0.6s cubic-bezier(0.81, 0.41, 0.13, 0.74) 0.6s infinite alternate;
  }
`;

const moveBlue = keyframes`
  from {
    transform: matrix(1, 0, 0, 1, 0, 0);
  } to {
    transform: matrix(0.99863, 0.052336, -0.052336, 0.99863, 0, -4);
  }
`;

const Blue = styled.path`
  ${Bar}
  fill: #00246A;
  transform-origin: center;
  .staxly-animation:hover & {
    animation: ${moveBlue} 0.6s cubic-bezier(0.81, 0.41, 0.13, 0.74) 0.5s infinite alternate;
  }
`;


export function LaunchIcon () {

    return (
        <Icon
            className="staxly-animation"
            role="button"

        >
            <Animation
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                x="0px"
                y="0px"
                viewBox="0 0 58 66"
                enableBackground="new 0 -25 57.6 66"

            >
                <Green
                    className="green"
                    d="M57.422,36.044c-0,1.107 -0.949,1.898 -1.899,1.74l-43.817,-2.057c-1.108,0 -1.898,-0.949 -1.74,-1.898l0.158,-3.955c-0,-1.107 0.949,-1.898 1.898,-1.74l43.818,2.057c1.107,-0 1.898,0.949 1.74,1.898l-0.158,3.955Z"
                />
                <Orange
                    className="orange"
                    d="M49.671,40.947c-0,0.475 -0.633,0.791 -1.582,0.791l-46.507,0c-0.791,0 -1.582,-0.316 -1.582,-0.791l-0,-1.898c-0,-0.474 0.633,-0.791 1.582,-0.791l46.507,0c0.791,0 1.582,0.317 1.582,0.791l-0,1.898Z"
                />
                <Gray
                    className="gray"
                    d="M43.027,50.28c-0,0.633 -0.475,1.108 -1.108,1.108l-35.592,-0c-0.632,-0 -1.107,-0.475 -1.107,-1.108l0,-5.536c0,-0.633 0.475,-1.107 1.107,-1.107l35.592,-0c0.633,-0 1.108,0.474 1.108,1.107l-0,5.536Z"
                />
                <Blue
                    className="blue"
                    d="M48.721,62.935c0,0.633 -0.474,1.108 -1.107,1.108l-38.281,-0c-0.633,-0 -1.107,-0.475 -1.107,-1.108l-0,-2.214c-0,-0.633 0.474,-1.108 1.107,-1.108l38.281,0c0.633,0 1.107,0.475 1.107,1.108l0,2.214Z"
                />
                <Yellow
                    className="yellow"
                    d="M54.1,56.291c-0,0.633 -0.475,1.108 -1.108,1.108l-40.179,1.265c-0.633,0 -1.107,-0.474 -1.107,-1.107l-0.158,-3.322c-0,-0.633 0.474,-1.107 1.107,-1.107l40.179,-1.266c0.633,0 1.108,0.475 1.108,1.108l0.158,3.321Z"
                />

            </Animation>
            <Label>Practice with TutorBot</Label>
        </Icon>
    );
}


