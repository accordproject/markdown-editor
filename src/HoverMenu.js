import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import FormatToolbar from './FormatToolbar';


/**
 * The hovering menu.
 *
 * @type {Component}
 */

export default class HoverMenu extends React.Component {
  /**
   * Render.
   *
   * @return {Element}
   */

  render() {
    const {
      rect, pluginManager, innerRef, editor,
    } = this.props;
    const root = window.document.getElementById('root');

    return ReactDOM.createPortal(
      <FormatToolbar
        editor={editor}
        innerRef={innerRef}
        rect={rect}
        pluginManager={pluginManager}
      />,
      root,
    );
  }
}

HoverMenu.propTypes = {
  editor: PropTypes.object.isRequired,
  innerRef: PropTypes.func.isRequired,
  rect: PropTypes.object,
  pluginManager: PropTypes.object,
};
