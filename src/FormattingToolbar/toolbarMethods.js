import * as CONST from '../constants';

/**
 *************** INTERNAL METHODS ***************
 */

/**
 * A change helper to standardize wrapping links.
 */
const wrapLink = (editor, href) => {
  editor
    .wrapInline({
      type: 'link',
      data: { href },
    })
    .moveToEnd()
    .focus();
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

export const isOnlyLink = (editor) => {
  const currentInline = editor.value.inlines.find(inline => inline.type === 'link');
  if (!currentInline) return false;
  const linkText = currentInline.text;
  const selectedText = editor.value.document.getFragmentAtRange(editor.value.selection).text;
  return linkText.includes(selectedText);
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
export const hasBlock = (editor, type) => editor.value.blocks
  .some(node => node.type === type);

/**
 * When clicking remove, update the text by removing the link
 */
export const removeLink = (event, editor) => {
  event.preventDefault();
  editor
    .unwrapInline({ type: 'link' })
    .moveToEnd()
    .focus();
};

/**
 * When clicking apply, update the link with the specified text and href
 */
export const applyLinkUpdate = (event, editor, isLink) => {
  event.preventDefault();
  const href = event.target.url.value;
  const text = event.target.text.value;

  if (!isLink && !href) return;

  if (isLink && (!(event.target && event.target.url && event.target.url.value)) && !href) {
    editor
      .unwrapInline({ type: 'link' })
      .moveToEnd();
    return;
  }

  if (!href || !text) return;

  if (isLink) {
    const linkInlineSelection = editor.value.inlines
      .find(inline => inline.type === 'link');
    editor.withoutNormalizing(() => {
      editor
        .unwrapInline({ type: 'link' })
        .moveToRangeOfNode(linkInlineSelection)
        .delete()
        .insertText(text)
        .moveFocusBackward(text.length)
        .command(wrapLink, href);
    });
    return;
  }

  editor
    .insertText(text)
    .moveFocusBackward(text.length)
    .command(wrapLink, href);
};

/**
 * A helper to find boolean of if Slate ancestors includes input block type.
 */
export const isSelectionInput = (val, input) => ancestors(val).reverse()
  .some(mark => mark.type === input);

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
 * A helper to find boolean of if input type is a heading.
 */
export const isClickHeading = input => input === CONST.H1
  || input === CONST.H2
  || input === CONST.H3
  || input === CONST.PARAGRAPH;

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
      .unwrapBlock(CONST.LIST_ITEM)
      .unwrapBlock(currentList(value).type)
      .wrapBlock({ type, data: { tight: true } });
  });
};

/**
 * A trigger to the Slate editor to make a paragraph into a block_quote.
 */
/* eslint no-unused-expressions: 0 */
export const transformPtoBQSwap = (editor, type) => {
  !isOnlyLink(editor)&&
  (isSelectionInput(editor.value, CONST.BLOCK_QUOTE)
    ? editor.unwrapBlock(CONST.BLOCK_QUOTE)
    : editor.wrapBlock({ type, data: { tight: true } }));
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
  editor.withoutNormalizing(() => {
    editor
      .unwrapBlock(CONST.BLOCK_QUOTE)
      .wrapBlock({ type, data: { tight: true } })
      .wrapBlock(CONST.LIST_ITEM);
  });
};

/**
 * A trigger to the Slate editor to make a paragraph into a list_item.
 */
export const transformParagraphToList = (editor, type) => {
  !isOnlyLink(editor)&&
  editor.withoutNormalizing(() => {
    editor.wrapBlock({ type, data: { tight: true } }).wrapBlock(CONST.LIST_ITEM);
  });
};
