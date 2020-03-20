import React from 'react';
import styled from 'styled-components';

const Menu = styled.div`
  position: relative;
  display: flex;
  align-content: space-evenly;
  justify-content: center;
  margin-bottom: 20px;
  & > * {
    display: inline-block;
  }
  & > * + * {
    margin-left: 15px;
  }
`;

// eslint-disable-next-line react/display-name
const ToolbarMenu = React.forwardRef(
  ({ ...props }, ref) => (<Menu {...props} ref={ref} />)
);

export default ToolbarMenu;
