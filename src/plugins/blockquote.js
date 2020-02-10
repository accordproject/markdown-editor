import React from 'react';
import { BLOCK_QUOTE, PARAGRAPH } from '../constants';
import { isSelectionInput } from '../FormattingToolbar/toolbarMethods';

/**
 * This is a plugin into the markdown editor to handle block quotes
 */
function Blockquote() {
  const name = 'blockquote';

  /**
   * @param {Event} event
   * @param {Editor} editor
   * @param {Function} next
   */
  const onEnter = (event, editor, next) => {
    const { value } = editor;
    const { startBlock } = value;
    event.preventDefault();

    // Hitting enter on an empty line will break out of the block quote
    if (isSelectionInput(value, BLOCK_QUOTE) && startBlock.text.length === 0) {
      editor.withoutNormalizing(() => {
        event.preventDefault();
        editor
          .setBlocks(PARAGRAPH)
          .unwrapBlock(BLOCK_QUOTE);
      });
      return;
    }

    next();
  };

  /**
   * @param {Event} event
   * @param {Editor} editor
   * @param {Function} next
   */
  const onBackspace = (event, editor, next) => {
    const { value } = editor;
    const { startBlock } = value;
    event.preventDefault();

    // Hitting backspace on the last item when empty will break out of the block quote
    if (isSelectionInput(value, BLOCK_QUOTE) && startBlock.text.length === 0) {
      const lastItem = !value.document.getAncestors(value.previousBlock.key)
        .some(a => a.type === BLOCK_QUOTE);
      if (lastItem) {
        editor.withoutNormalizing(() => {
          event.preventDefault();
          editor
            .setBlocks(PARAGRAPH)
            .unwrapBlock(BLOCK_QUOTE);
        });
        return;
      }
    }

    next();
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
      case 'Backspace':
        return onBackspace(event, editor, next);
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
      case BLOCK_QUOTE:
        return <blockquote {...attributes}>{children}</blockquote>;
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

export default Blockquote;
