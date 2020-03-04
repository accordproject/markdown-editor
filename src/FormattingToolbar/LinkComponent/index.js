import { isOnlyLink } from '../toolbarMethods';

/**
 * Calculates the link popup position and styles, if any
 */

const calculateLinkPopupPosition = (editor, openSetLink, setLinkFormPopup) => {
  // Constant values 2 and 20 (px) has been
  // manually observed through devtools and what looked best.

  let top = null;
  let left = null;
  let popupPosition = 'bottom center';

  // No need to calculate position of the popup is it is not even opened!
  // Same for if the current selection is not a link

  const isLinkPopupOpened = openSetLink;
  if (!isLinkPopupOpened && !isOnlyLink(editor)) {
    return {
      popupPosition,
      // Hide the popup by setting negative zIndex
      popupStyle: { zIndex: -1}
    };
  }

  // Get selection node from slate
  const selection = editor.findDOMRange(editor.value.selection);

  popupPosition = 'bottom left';

  const { body, documentElement } = document;
  const pageWidth = Math.max(body.scrollWidth, body.offsetWidth,
    documentElement.clientWidth, documentElement.scrollWidth, documentElement.offsetWidth);

  // Find the selected text position in DOM to place the popup relative to it
  const rect = selection.getBoundingClientRect();

  // distance from top of the document + the height of the element + scroll offet ...
  // ... -2px to account for semantic-ui popup caret position
  const CARET_TOP_OFFSET = 2;
  top = rect.top + rect.height + window.scrollY - CARET_TOP_OFFSET;

  // distance from the left of the document and ...
  // ... subtracting 20px to account for the semantic-ui popup caret position
  const calcMiddleSelection = (selection.endOffset - selection.startOffset) * 2;
  const CARET_LEFT_OFFSET = (20 - calcMiddleSelection);
  left = rect.left - CARET_LEFT_OFFSET;

  const popupRect = setLinkFormPopup.getBoundingClientRect();

  // Check if there is enough space on right, otherwise flip the popup horizontally
  // and adjust the popup position accordingly
  const spaceOnRight = pageWidth - rect.left;
  if (spaceOnRight < popupRect.width) {
    popupPosition = 'bottom right';
    left = rect.left - popupRect.width + CARET_LEFT_OFFSET;
  }
  return {
    // Disable semantic ui popup placement by overriding `transform`
    // and use our computed `top` and `left` values
    popupStyle: { top, left, transform: 'none', width:'400px' },
    popupPosition,
  };
};

export default calculateLinkPopupPosition;
