import React from 'react';

/**
 * This is a plugin into the markdown editor to handle lists
 */
function List() {
  const name = 'list';

  /**
   * @param {Event} event
   * @param {Editor} editor
   * @param {Function} next
   */
  const onEnter = (event, editor, next) => next();

  /**
   * @param {Event} event
   * @param {Editor} editor
   * @param {Function} next
   */
  const onKeyDown = (event, editor, next) => {
    switch (event.key) {
      case 'Enter':
        return onEnter(event, editor, next);
      default:
        return next();
    }
  };

  /**
   * @param {Object} props
   * @param {Editor} editor
   * @param {Function} next
   */
  const renderBlock = (props, editor, next) => {
    const { node, attributes, children } = props;

    switch (node.type) {
      case 'ol_list':
        return <ol {...attributes}>{children}</ol>;
      case 'ul_list':
        return <ul {...attributes}>{children}</ul>;
      case 'list_item':
        return <li {...attributes}>{children}</li>;
      default:
        return next();
    }
  };

  return {
    name,
    onKeyDown,
    renderBlock
  };
}

export default List;
