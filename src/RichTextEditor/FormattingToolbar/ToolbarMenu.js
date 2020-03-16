import React from 'react';
import PropTypes from 'prop-types';
import { cx, css } from 'emotion';
import Menu from '../components/Menu';

// eslint-disable-next-line react/display-name
const ToolbarMenu = React.forwardRef(({ className, ...props }, ref) => (
  <Menu
    {...props}
    ref={ref}
    className={cx(
      className,
      css`
        position: relative;
        padding: 1px 18px 17px;
        margin: 0 -20px;
        border-bottom: 2px solid #eee;
        margin-bottom: 20px;
      `
    )}
  />
));

ToolbarMenu.propTypes = {
  className: PropTypes.string,
};

export default ToolbarMenu;
