import React from 'react';
import PropTypes from 'prop-types';
import { cx, css } from 'emotion';

// eslint-disable-next-line react/display-name
const Icon = React.forwardRef(({ className, ...props }, ref) => (
  <span
    {...props}
    ref={ref}
    className={cx(
      'material-icons',
      className,
      css`
        font-size: 18px;
        vertical-align: text-bottom;
      `
    )}
  />
));

Icon.propTypes = {
  className: PropTypes.string,
};

export default Icon;
