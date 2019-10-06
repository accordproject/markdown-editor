/**
 *************** INTERNAL METHODS ***************
 */

/**
   * A change helper to standardize unwrapping links.
   */
const unwrapLink = (editor) => {
  editor.unwrapInline('link');
};

/**
  * Return type of given selected parent.
  */
const getParentBlockType = block => (block ? block.type : block);

/**
  * Return selected block of given type.
  */
const getSelectedBlock = (editor, type) => {
  const { value } = editor;
  return value.blocks.find(node => node.type === type);
};

/**
  * Return parent block of given selection.
  */
const getParentBlock = (editor, type, item) => {
  const { value } = editor;
  const { document } = value;
  return document.getClosest(item.key, parent => parent.type === type);
};

/**
 * A change helper to standardize wrapping links.
 */
const wrapLink = (editor, href) => {
  editor.wrapInline({
    type: 'link',
    data: { href },
  });
  editor.moveToEnd();
};

/**
 *************** EXPORT METHODS ***************
 */

/**
   * Check if the current selection has a mark with `type` in it.
   */
export const hasMark = (editor, type) => {
  const { value } = editor;
  return value.activeMarks.some(mark => mark.type === type);
};

/**
   * Check whether the current selection has a link in it.
   */
export const hasLinks = (editor) => {
  const { value } = editor;
  return value.inlines.some(inline => inline.type === 'link');
};

/**
  * Return selected block of 'list_item' type.
  */
export const getSelectedListBlock = (editor) => {
  const { value } = editor;
  return value.blocks.find(node => node.type === 'list_item');
};

/**
  * Return whether current selection is a given type.
  */
export const getTypeBool = (editor, type) => {
  const { value } = editor;
  const { document } = value;
  return value.blocks
    .some(block => !!document.getClosest(block.key, parent => parent.type === type));
};

/**
  * Return whether current selection is a list.
  */
export const getListBool = (editor, type) => {
  const { value } = editor;
  const selectedBlockHere = getSelectedListBlock(editor);
  return selectedBlockHere
    ? (selectedBlockHere.type === 'list_item')
    : (value.blocks.some(node => node.type === type));
};

/**
  * Check if the any of the currently selected blocks are of `type`.
  */
export const hasBlock = (editor, type) => {
  const { value } = editor;
  const { document } = value;
  const selectListItem = getSelectedBlock(editor, 'list_item');
  // If selection is a list, return the parent type.
  if (selectListItem) {
    const parentBlock = getParentBlock(editor, type, selectListItem);
    const parentBlockType = getParentBlockType(parentBlock);
    return value
      .blocks.some(block => !!document
        .getClosest(block.key, parent => parent.type === parentBlockType));
  }
  // If selection is a not a list, return the type.
  return value.blocks.some(node => node.type === type);
};

/**
   * When clicking a link, if the selection has a link in it, remove the link.
   * Otherwise, add a new link with an href and text.
   */
export const onClickLink = (event, editor, text, href) => {
  event.preventDefault();
  const { value } = editor;
  const hasLinksBool = hasLinks(editor);
  if (hasLinksBool) {
    editor.command(unwrapLink);
  }
  if (value.selection.isExpanded) {
    if (href === null) {
      return;
    }

    editor.command(wrapLink, href);
  } else {
    if (href === null) {
      return;
    }

    if (text === null) {
      return;
    }

    editor
      .insertText(text)
      .moveFocusBackward(text.length)
      .command(wrapLink, href);
  }
};
