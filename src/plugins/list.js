import React from 'react';
import * as CONST from '../constants';
import { isSelectionInput, currentList } from '../FormattingToolbar/toolbarMethods';

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
  const onEnter = (event, editor, next) => {
    const { value } = editor;
    const { startBlock } = value;
    event.preventDefault();

    // Hitting enter on a blank list item will break out of the enclosing list
    if (isSelectionInput(value, CONST.LIST_ITEM) && startBlock.text.length === 0) {
      editor.withoutNormalizing(() => {
        event.preventDefault();
        editor
          .setBlocks(CONST.PARAGRAPH)
          .unwrapBlock(CONST.LIST_ITEM)
          .unwrapBlock(currentList(value).type);
      });
      return false;
    }

    // Hitting enter on a non-empty list item will add a new list_item
    if (isSelectionInput(value, CONST.LIST_ITEM) && startBlock.text.length !== 0) {
      editor.withoutNormalizing(() => {
        event.preventDefault();
        editor.splitBlock().unwrapBlock(CONST.LIST_ITEM).wrapBlock(CONST.LIST_ITEM);
      });
      return true;
    }

    return next();
  };

  /**
   * @param {Event} event
   * @param {Editor} editor
   * @param {Function} next
   */
  const onTab = (event, editor, next) => {
    const { value } = editor;
    const { startBlock } = value;
    event.preventDefault();

    // // Hitting enter on a blank list item will break out of the enclosing list
    // if (isSelectionInput(value, CONST.LIST_ITEM) && startBlock.text.length === 0) {
    //   editor.withoutNormalizing(() => {
    //     event.preventDefault();
    //     editor
    //       .setBlocks(CONST.PARAGRAPH)
    //       .unwrapBlock(CONST.LIST_ITEM)
    //       .unwrapBlock(currentList(value).type);
    //   });
    //   return false;
    // }

    // Hitting enter on a non-empty list item will add a new list_item
    if (isSelectionInput(value, CONST.LIST_ITEM)) {
      editor.withoutNormalizing(() => {
        event.preventDefault();
        editor
        .unwrapBlock(CONST.LIST_ITEM)
        .wrapBlock({ type: currentList(value).type, data: { tight: true } })
        .wrapBlock(CONST.LIST_ITEM)
      });
      return true;
    }

    return next();
  };

  /**
   * @param {Event} event
   * @param {Editor} editor
   * @param {Function} next
   */
  const onKeyDown = (event, editor, next) => {
    switch (event.key) {
      case 'Enter':
        return onEnter(event, editor, next);
        case 'Tab':
          return onTab(event, editor, next);
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
      case CONST.OL_LIST:
        return <ol {...attributes}>{children}</ol>;
      case CONST.UL_LIST:
        return <ul {...attributes}>{children}</ul>;
      case CONST.LIST_ITEM:
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
