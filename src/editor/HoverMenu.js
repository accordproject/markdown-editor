import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import FormatToolbar from './FormatToolbar';


/**
 * The hovering menu.
 *
 * @type {Component}
 */

class HoverMenu extends React.Component {
  /**
   * Render.
   *
   * @return {Element}
   */

  render() {
    const { className, rect, innerRef, editor } = this.props;
    const root = window.document.getElementById('root');

    return ReactDOM.createPortal(
      <FormatToolbar
        editor={editor}
        className={className}
        innerRef={innerRef}
        rect={rect}
      />,
      root,
    );
  }
}

HoverMenu.propTypes = {
  className: PropTypes.string,
  editor: PropTypes.element.isRequired,
  innerRef: PropTypes.func.isRequired,
  rect: PropTypes.object,
};
/**
 * Export.
 */

export default HoverMenu;
