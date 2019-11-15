import * as CONST from '../constants';

/**
 *************** INTERNAL METHODS ***************
 */

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
 * A Slate helper to get ancestors of the selection.
 */
const ancestors = val => val.document.getAncestors(val.selection.anchor.path);

/**
 * A helper to find boolean of if Slate ancestors includes ol_list.
 */
const isSelectionOLList = val => ancestors(val).find(b => b.type === CONST.OL_LIST);

/**
 * A helper to find boolean of if Slate ancestors includes ul_list.
 */
const isSelectionULList = val => ancestors(val).find(b => b.type === CONST.UL_LIST);

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
 * When clicking apply, update the link with the specified text and href.
 */
export const applyLinkUpdate = (event, editor) => {
  event.preventDefault();
  const { url: { value: href }, text: { value: text } } = event.target;

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
};

/**
 * A helper to find boolean of if Slate ancestors includes list_item.
 */
export const isSelectionList = value => ancestors(value).reverse()
  .some(mark => mark.type === CONST.LIST_ITEM);

/**
 * A helper to find boolean of if input type is a block_quote.
 */
export const isClickBlockQuote = input => input === CONST.BLOCK_QUOTE;

/**
 * A helper to hold the list type of the selection.
 */
export const currentList = value => isSelectionOLList(value) || isSelectionULList(value);

/**
 * A trigger to the Slate editor to make a list_item into a block_quote.
 */
export const transformListToBlockQuote = (editor, type, value) => {
  editor.withoutNormalizing(() => {
    editor
      .setBlocks(type)
      .unwrapBlock(CONST.LIST_ITEM)
      .unwrapBlock(currentList(value).type);
  });
};

/**
 * A trigger to the Slate editor to make a paragraph into a block_quote.
 */
export const transformParagraphToBlockQuote = (editor, type) => {
  editor.setBlocks(hasBlock(editor, type) ? CONST.PARAGRAPH : type);
};

/**
 * A trigger to the Slate editor to make a list_item into a paragraph.
 */
export const transformListToParagraph = (editor, type) => {
  editor.withoutNormalizing(() => {
    editor
      .setBlocks(CONST.PARAGRAPH)
      .unwrapBlock(CONST.LIST_ITEM)
      .unwrapBlock(type);
  });
};

/**
 * A trigger to the Slate editor to swap a ul_list to ol_list or vice versa.
 */
export const transformListSwap = (editor, type, value) => {
  editor.withoutNormalizing(() => {
    editor
      .unwrapBlock(CONST.LIST_ITEM)
      .unwrapBlock(currentList(value).type)
      .wrapBlock({ type, data: { tight: true } })
      .wrapBlock(CONST.LIST_ITEM);
  });
};

/**
 * A trigger to the Slate editor to make a block_quote into a list_item.
 */
export const transformBlockQuoteToList = (editor, type) => {
  editor
    .setBlocks(CONST.PARAGRAPH)
    .wrapBlock(CONST.LIST_ITEM)
    .wrapBlock({ type, data: { tight: true } });
};

/**
 * A trigger to the Slate editor to make a paragraph into a list_item.
 */
export const transformParagraphToList = (editor, type) => {
  editor.withoutNormalizing(() => {
    editor.wrapBlock({ type, data: { tight: true } }).wrapBlock(CONST.LIST_ITEM);
  });
};
