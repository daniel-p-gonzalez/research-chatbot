import styled from '@emotion/styled'
import { css, keyframes } from '@emotion/react'


const Icon = styled.div({
    width: '100%',
    cursor: 'pointer',
})

const Label = styled.div({
    margin: 0,
    padding: 0,
    textAlign: 'center',
    background: '#e1e1e1',
    border: '1px solid #949494',
    marginTop: 4,
})

const Animation = styled.svg({
    overflow: 'visible !important',
    width: '100%',
    display: 'flex',
    position: 'relative',
})

const Bar = css`
  animation-delay: 0s;
`;

const moveGreen = keyframes`
  from {
    transform: matrix(1, 0, 0, 1, 0, 0);
  }
  to {
    transform: matrix(0.965926, -0.258819, 0.258819, 0.965926, 0, -8);
  }
`;
const Green = styled.path`
  ${Bar}
  fill: #77AF42;
  transform-origin: center left;
  .staxly-animation:hover  & {
    animation: ${moveGreen} 0.6s cubic-bezier(0.0, 0.0, 0.0, 0.04) 0.5s infinite alternate;
  }
`;

const moveOrange = keyframes`
  from {
    transform: matrix(1, 0, 0, 1, 0, 0);
  }
  to {
    transform: matrix(0.994522, 0.104528, -0.104528, 0.994522, 0, -6);
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
    transform: matrix(0.99863, 0.052336, -0.052336, 0.99863, 0, -6);
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
    transform: matrix(1, 0, 0, 1, 0, -6.6);
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


export const LaunchIcon: React.FC<{ onClick:() => void, isOpen: boolean }> = ({ onClick, isOpen }) => {
    if (isOpen) return null

    return (
        <Icon
            className="staxly-animation"
            role="button"
            onClick={onClick}
        >
            <Animation
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                x="0px"
                y="0px"
                viewBox="0 0 44 27"
            >
                <Green
                    className="green"
                    d="M43.066,5.947c0,0.831 -0.712,1.424 -1.423,1.305l-32.864,-1.542c-0.83,-0 -1.423,-0.712 -1.305,-1.424l0.119,-2.966c-0,-0.83 0.712,-1.424 1.424,-1.305l32.863,1.542c0.83,0 1.424,0.712 1.305,1.424l-0.119,2.966Z"
                />
                <Orange
                    className="orange"
                    d="M37.253,9.625c-0,0.356 -0.475,0.593 -1.187,0.593l-34.88,0c-0.593,0 -1.186,-0.237 -1.186,-0.593l0,-1.424c0,-0.356 0.475,-0.593 1.186,-0.593l34.88,0c0.594,0 1.187,0.237 1.187,0.593l-0,1.424Z"
                />
                <Gray
                    className="gray"
                    d="M32.27,16.625c0,0.474 -0.356,0.83 -0.83,0.83l-26.694,0c-0.475,0 -0.831,-0.356 -0.831,-0.83l0,-4.153c0,-0.474 0.356,-0.83 0.831,-0.83l26.694,-0c0.474,-0 0.83,0.356 0.83,0.83l0,4.153Z"
                />
                <Blue
                    className="blue"
                    d="M36.541,26.116c0,0.474 -0.356,0.83 -0.83,0.83l-28.711,0c-0.475,0 -0.831,-0.356 -0.831,-0.83l0,-1.661c0,-0.475 0.356,-0.831 0.831,-0.831l28.711,0c0.474,0 0.83,0.356 0.83,0.831l0,1.661Z"
                />
                <Yellow
                    className="yellow"
                    d="M40.575,21.133c-0,0.475 -0.356,0.83 -0.831,0.83l-30.134,0.95c-0.475,-0 -0.831,-0.356 -0.831,-0.831l-0.118,-2.491c-0,-0.475 0.356,-0.831 0.83,-0.831l30.135,-0.949c0.474,0 0.83,0.356 0.83,0.831l0.119,2.491Z"
                />

            </Animation>
            <Label>Practice with Staxly</Label>
        </Icon>
    );
}


