import React from 'react';
import PropTypes from 'prop-types';
import { cx, css } from 'emotion';

// eslint-disable-next-line react/display-name
const Menu = React.forwardRef(({ className, ...props }, ref) => (
  <div
    {...props}
    ref={ref}
    className={cx(
      className,
      css`
        & > * {
          display: inline-block;
        }

        & > * + * {
          margin-left: 15px;
        }
      `
    )}
  />
));

Menu.propTypes = {
  className: PropTypes.string,
};

export default Menu;
