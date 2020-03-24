import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import { ReactEditor, useSlate } from 'slate-react';
import {
  Node, Editor, Range, Transforms
} from 'slate';
import styled from 'styled-components';
import {
  Button, Dropdown, Form, Input, Popup, Ref
} from 'semantic-ui-react';

const PopupLinkWrapper = styled.p`
    white-space : nowrap;
    overflow : hidden;
    text-overflow : ellipsis;
    max-width : 250px;
`;

const isOnlyLink = (editor) => {
  const currentInline = editor.value.inlines.find(inline => inline.type === 'link');
  if (!currentInline) return false;
  const linkText = currentInline.text;
  const selectedText = editor.value.document.getFragmentAtRange(editor.value.selection).text;
  return linkText.includes(selectedText);
};

const calculateLinkPopupPosition = (editor, openSetLink, setLinkFormPopup) => {
  // Constant values 2 and 20 (px) has been
  // manually observed through devtools and what looked best.

  let top = null;
  let left = null;
  let popupPosition = 'bottom center';

  // No need to calculate position of the popup is it is not even opened!
  // Same for if the current selection is not a link

  const earlyExit = {
    popupPosition,
    // Hide the popup by setting negative zIndex
    popupStyle: { zIndex: -1 }
  };

  const isLinkPopupOpened = openSetLink;
  if (!isLinkPopupOpened && !isOnlyLink(editor)) return earlyExit;

  // Get selection node from slate
  const selection = editor.findDOMRange(editor.value.selection);
  if (!selection) return earlyExit;

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
    popupStyle: {
      top, left, transform: 'none', width: '400px',
    },
    popupPosition,
  };
};

const hasLinks = (editor) => {
  const { value } = editor;
  return value.inlines.some(inline => inline.type === 'link');
};

export const Portal = ({ children }) => ReactDOM.createPortal(children, document.body);

const HyperlinkWrapper = styled.div`
    position: absolute;
    z-index: 3000;
    top: -10000px;
    left: -10000px;
    margin-top: -6px;
    opacity: 0;
    background-color: #FFFFFF;
    border: 1px solid #d4d4d5;
    border-radius: .3rem;
    transition: opacity 0.75s;

    min-width: min-content;
    line-height: 1.4285em;
    max-width: 250px;
    padding: .833em 1em;
    font-weight: 400;
    font-style: normal;
    color: rgba(0,0,0,.87);
    box-shadow: 0 2px 4px 0 rgba(34,36,38,.12), 0 2px 10px 0 rgba(34,36,38,.15);
    & > * {
        display: inline-block;
    }
    & > * + * {
        margin-left: 15px;
    }
`;
const HyperlinkCaret = styled.div`
    position: absolute;
    z-index: 4000;
    left: calc(50% - 5px);
    top: -10px;
    height: 0;
    width: 0;
    border-left: 5px solid transparent;
    border-right: 5px solid transparent;
    border-bottom: 10px solid #d4d4d5;
    transition: opacity 0.75s;
`;

// eslint-disable-next-line react/display-name
const HyperlinkMenu = React.forwardRef(
  ({ ...props }, ref) => <HyperlinkWrapper ref={ref} {...props} />
);

// eslint-disable-next-line react/display-name
const HyperlinkModalCaret = React.forwardRef(
  ({ ...props }, ref) => <HyperlinkCaret ref={ref} {...props} />
);


export const LinkForm = ({
  linkButtonRef,
  toggleFunc,
  activeFunc,
  insertLink,
  isLinkOpen,
}) => {
  // render if the isLinkOpen is true OR activeFunc
  // close if clicking outside of the box
  // close if clicking submit
  const refHyperlinkMenu = useRef();
  const refHyperlinkTextInput = useRef();
  const editor = useSlate();
  //   const [currentText, setCurrentText] = useState('');
  //   const [currentLink, setCurrentLink] = useState('');
  //   if (editor.selection && editor.selection.focus) {
  //     const textVersionOne = Node.fragment(editor, editor.selection);
  //     console.log('Node.fragment(editor, editor.selection) -----', textVersionOne);
  //     const textVersionTwo = Node.fragment(editor, editor.selection)[0].children[0].text;
  //     console.log('textVersionTwo -----', textVersionTwo);
  //     const textVersionThree = Node.string(Node.fragment(editor, editor.selection)[0]);
  //     console.log('textVersionThree -----', textVersionThree);
  //   }

  const editorSelection = useRef(editor.selection);

  useEffect(() => {
    const handleClick = (e) => {
      if (refHyperlinkMenu.current
            && !refHyperlinkMenu.current.contains(e.target)
            // eslint-disable-next-line react/prop-types
            && !linkButtonRef.current.contains(e.target)) {
        toggleFunc(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => {
      document.removeEventListener('mousedown', handleClick);
    };
  }, [linkButtonRef, toggleFunc]);

  //   useEffect(() => {
  //     setCurrentText(editor.selection
  //       ? Editor.string(editor, editor.selection)
  //       : '');
  //   }, [editor, editor.selection]);

  //   useEffect(() => {
  //     if (activeFunc(editor, 'link')) {
  //       const LINK_HREF = Node.parent(editor, editor.selection.focus.path).data.href;
  //       setCurrentLink(LINK_HREF);
  //     } else {
  //       setCurrentLink('');
  //     }
  //   }, [activeFunc, editor, editor.selection]);


  useEffect(() => {
    const el = refHyperlinkMenu.current;
    const { selection } = editor;
    if (isLinkOpen || activeFunc(editor, 'link')) {
      if (!selection) return;

      const domSelection = window.getSelection();
      const domRange = domSelection.getRangeAt(0);
      const rect = domRange.getBoundingClientRect();
      const CARET_TOP_OFFSET = 15;
      el.style.opacity = 1;
      el.style.top = `${rect.top + rect.height + window.pageYOffset + CARET_TOP_OFFSET}px`;
      el.style.left = `${rect.left
          + window.pageXOffset
          - el.offsetWidth / 2
          + rect.width / 2}px`;

      if (activeFunc(editor, 'link')) {
        Transforms.select(editor, selection.focus.path);
      }
      return;
    }
    el.removeAttribute('style');
  });

  useEffect(() => {
    // If the form is just opened, focus the Url input field
    if (isLinkOpen) {
      editorSelection.current = editor.selection;
      refHyperlinkTextInput.current.focus();
    }
  }, [editor, isLinkOpen]);
  return (
      <Portal>
        <HyperlinkMenu ref={refHyperlinkMenu}>
            <HyperlinkModalCaret />
            <Form onSubmit={(event) => {
            //   event.preventDefault();
              insertLink(editor, event.target.url.value);
            }}>
                <Form.Field>
                    <label>Link Text</label>
                    <Input placeholder="Text" name="text"
                        defaultValue={editor.selection
                          ? Editor.string(editor, editor.selection)
                          : ''}
                    />
                </Form.Field>
                <Form.Field>
                    <label>Link URL</label>
                    <Input
                    ref={refHyperlinkTextInput}
                    placeholder={'http://example.com'}
                    defaultValue={activeFunc(editor, 'link')
                      ? Node.parent(editor, editor.selection.focus.path).data.href
                      : ''}
                    name="url"
                    />
                </Form.Field>
                {/* {isLinkBool
                    && action.isOnlyLink(this.props.editor)
                    && selectedInlineHref && (
                    <PopupLinkWrapper>
                    <a href={selectedInlineHref.data.get('href')}
                    target='_blank'
                    >
                        {selectedInlineHref.data.get('href')}
                    </a>
                    </PopupLinkWrapper>
                )} */}
                <Form.Field>
                    <Button secondary floated="right"
                    // disabled={!isLinkBool}
                    // onMouseDown={this.removeLinkForm}
                    >
                    Remove
                    </Button>
                    <Button primary floated="right" type="submit">
                    Apply
                    </Button>
                </Form.Field>
                </Form>
        </HyperlinkMenu>
        {/* } /> */}
      </Portal>
  );
};
