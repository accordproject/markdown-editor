import React from 'react';
import PropTypes from 'prop-types';
import { cx, css } from 'emotion';

/* eslint no-nested-ternary: 0 */
// eslint-disable-next-line react/display-name
const Button = React.forwardRef(
  ({
    className, active, reversed, ...props
  }, ref) => (
    <span
      {...props}
      ref={ref}
      className={cx(
        className,
        css`
          cursor: pointer;
          color: ${reversed
          ? active
            ? 'white'
            : '#aaa'
          : active
            ? 'black'
            : '#ccc'};
        `
      )}
    />
  )
);

Button.propTypes = {
  className: PropTypes.string,
  active: PropTypes.bool,
  reversed: PropTypes.bool,
};

export default Button;
