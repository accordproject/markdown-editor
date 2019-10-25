import React, { createRef } from 'react';
import ReactDOM, { findDOMNode, createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import {
  Button, Dropdown, Form, Input, Popup
} from 'semantic-ui-react';

import * as action from './toolbarMethods';
import * as styles from './toolbarStyles';
import * as tips from './toolbarTooltip';

import * as boldIcon from '../icons/bold';
import * as italicIcon from '../icons/italic';
// import * as underlineIcon from '../icons/underline';
import * as codeIcon from '../icons/code';
import * as quoteIcon from '../icons/open-quote';
import * as oListIcon from '../icons/OL';
import * as uListIcon from '../icons/UL';
import * as hyperlinkIcon from '../icons/hyperlink';
import * as undoIcon from '../icons/navigation-left';
import * as redoIcon from '../icons/navigation-right';

import './toolbar.css';

const DEFAULT_NODE = 'paragraph';

const StyledToolbar = styled.div`
  position: relative;
  justify-self: center;
  width: 450px;
  background-color: ${props => props.background || '#FFF'} !important;
`;

const ToolbarIcon = styled.svg`
  width: ${props => props.width};
  height: ${props => props.height};
  place-self: center;
  user-select: none !important;
  cursor: pointer;
  background-color: ${props => props.background};
  padding: ${props => props.padding};
  border-radius: 5px;
  &:hover {
    background-color: ${props => styles.buttonBgActive(props.hoverColor)};
  }
`;

const VertDivider = styled.div`
  box-sizing: border-box;
  height: 24px;
  width: 1px;
  border: 1px solid ${props => props.color || '#EFEFEF'};
  top: 10px;
  place-self: center;
`;

/**
 * Object constructor for dropdown styling
 * @param {*} input
 * @return {*} a new object
 */
function DropdownStyle(input) {
  this.color = styles.buttonSymbolActive(input);
  this.alignSelf = 'center';
}

const DropdownHeader1 = {
  fontSize: '25px',
  lineHeight: '23px',
  fontWeight: 'bold',
  color: '#122330',
  fontFamily: 'serif',
};

const DropdownHeader2 = {
  fontSize: '20px',
  lineHeight: '20px',
  fontWeight: 'bold',
  color: '#122330',
  fontFamily: 'serif',
};

const DropdownHeader3 = {
  fontSize: '16px',
  lineHeight: '16px',
  fontWeight: 'bold',
  color: '#122330',
  fontFamily: 'serif',
};

export default class FormatToolbar extends React.Component {
  constructor() {
    super();
    this.state = { openSetLink: false };
    this.linkButtonRef = createRef();
    this.setLinkFormRef = createRef();
    this.onMouseDown = this.onMouseDown.bind(this);
  }

  componentDidMount() {
    document.addEventListener('mousedown', this.onMouseDown);
  }

  componentDidUpdate() {
    // Save link popup rect as soon as it is avaialble
    // (Reason for saving the element's dimension here is because
    // we cannot use `findDOMNode` in render function)
    if (!this.popupRect) {
      const popupNode = findDOMNode(this.setLinkFormRef.current);
      if (popupNode) {
        this.popupRect = popupNode.getBoundingClientRect();
      }
    }
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', this.onMouseDown);
  }

  /**
   * Hides link popup conditionally
   */
  onMouseDown(e) {
    /*
      We check if the link popup is currently open
      AND the click is occured somewhere other than the link popup,
      then, we close the popup.
      If we do not do that, the link popup remains opened while the user
      drags the mouse to select the text and gets closed once the selection
      finishes (i.e onmouseup) which is quite snappy.
      (Google docs link popup also works this way)
    */

    const isLinkPopupOpened = this.state.openSetLink;
    if (isLinkPopupOpened) {
      // Find the link popup DOM element
      const popup = findDOMNode(this.setLinkFormRef.current);
      const linkFormToggleBtn = findDOMNode(this.linkButtonRef.current);
      if (!popup || !linkFormToggleBtn) return;

      // Make sure the clicked element is not the popup AND
      // the clicked element in not a child of popup
      const clickedOutsideLinkPopup = e.target !== popup && !popup.contains(e.target);
      const clickedOnLinkToggleBtn =
        e.target === linkFormToggleBtn || linkFormToggleBtn.contains(e.target);

      if (clickedOutsideLinkPopup && !clickedOnLinkToggleBtn) {
        // Close the link
        this.setState({ openSetLink: false });
      }
    }
  }

  /**
   * When a mark button is clicked, toggle undo or redo.
   */
  onClickHistory(event, action) {
    const { editor } = this.props;
    event.preventDefault();
    ((action === 'undo') ? editor.undo() : editor.redo());
  }

  /**
   * When a mark button is clicked, toggle the current mark.
   */
  onClickMark(event, type) {
    const { editor, pluginManager, lockText } = this.props;
    const { value } = editor;

    if (!lockText || pluginManager.isEditable(value, type)) {
      event.preventDefault();
      editor.toggleMark(type);
    }
  }

  /**
   * When a link button is clicked, if the selection has a link in it, remove the link.
   * Otherwise, show the set link form.
   */
  onClickLinkButton() {
    const hasLinksBool = action.hasLinks(this.props.editor);

    if (hasLinksBool) {
      this.props.editor.unwrapInline('link');
      return;
    }

    this.toggleSetLinkForm();
  }

  /**
   * When a block button is clicked, toggle the block type.
   */
  onClickBlock(event, type) {
    event.preventDefault();
    const { editor } = this.props;
    const oppType = (type === 'ol_list' ? 'ul_list' : 'ol_list');
    // Handle everything but list buttons, such as quotes.
    if (type !== 'ol_list' && type !== 'ul_list') {
      const isActive = action.hasBlock(editor, type);
      const isList = action.hasBlock(editor, 'list_item');
      // Click quote on a current list.
      if (isList) {
        editor.withoutNormalizing(() => {
          editor
            .setBlocks(isActive ? DEFAULT_NODE : type)
            .unwrapBlock('list');
        });
      // Click quote on a paragraph or quote.
      } else {
        editor.setBlocks(isActive ? DEFAULT_NODE : type);
      }
    // Handle the extra wrapping required for list buttons.
    } else {
      const isList = action.getListBool(editor, type);
      const isType = action.getTypeBool(editor, type);
      // Selection is a list of button type.
      if (isList && isType) {
        editor.withoutNormalizing(() => {
          editor
            .setBlocks(DEFAULT_NODE)
            .unwrapBlock(type);
        });
      // Selection is a list but not of button type.
      } else if (isList) {
        editor.withoutNormalizing(() => {
          editor
            .unwrapBlock(oppType)
            .wrapBlock(type);
        });
      // Selection is not a list.
      } else {
        editor.withoutNormalizing(() => {
          editor.setBlocks('list_item').wrapBlock(type);
        });
      }
    }
  }

  /**
   * Toggle the state of set link form.
   */
  toggleSetLinkForm() {
    this.setState({ openSetLink: !this.state.openSetLink });
  }

  /**
   * Render a mark-toggling toolbar button.
   */
  renderMarkButton(type, icon, hi, wi, pa, vBox, classInput) {
    const { editor, editorProps } = this.props;

    const isActive = action.hasMark(editor, type);

    const fillActivity = isActive
      ? styles.buttonSymbolActive(editorProps.BUTTON_SYMBOL_ACTIVE)
      : styles.buttonSymbolInactive(editorProps.BUTTON_SYMBOL_INACTIVE);

    const bgActivity = isActive
      ? styles.buttonBgActive(editorProps.BUTTON_BACKGROUND_ACTIVE)
      : styles.buttonBgInactiveInactive(editorProps.BUTTON_BACKGROUND_INACTIVE);

    const style = {
      borderRadius: '5px',
      backgroundColor: styles.tooltipBg(editorProps.TOOLTIP_BACKGROUND),
      color: styles.tooltipColor(editorProps.TOOLTIP),
    };

    return (
      <Popup
        content={tips.capitalizeWord(type)}
        style={style}
        position='bottom center'
        trigger={
          <ToolbarIcon
            viewBox={vBox}
            aria-label={type}
            background={bgActivity}
            width={wi}
            height={hi}
            padding={pa}
            className={classInput}
            hoverColor={editorProps.BUTTON_BACKGROUND_HOVER}
            onClick={event => this.onClickMark(event, type)}>
              {icon(fillActivity)}
          </ ToolbarIcon>
        }
      />
    );
  }

  /**
   * Render a block modifying button
   */
  renderBlockButton(type, icon, hi, wi, pa, vBox, classInput, props) {
    const { editor, editorProps } = this.props;

    const isActive = action.hasBlock(editor, type);

    const fillActivity = isActive
      ? styles.buttonSymbolActive(editorProps.BUTTON_SYMBOL_ACTIVE)
      : styles.buttonSymbolInactive(editorProps.BUTTON_SYMBOL_INACTIVE);

    const bgActivity = isActive
      ? styles.buttonBgActive(editorProps.BUTTON_BACKGROUND_ACTIVE)
      : styles.buttonBgInactiveInactive(editorProps.BUTTON_BACKGROUND_INACTIVE);

    const style = {
      borderRadius: '5px',
      backgroundColor: styles.tooltipBg(editorProps.TOOLTIP_BACKGROUND),
      color: styles.tooltipColor(editorProps.TOOLTIP),
    };

    return (
      <Popup
        content={tips.identifyBlock(type)}
        style={style}
        position='bottom center'
        trigger={
          <ToolbarIcon
            viewBox={vBox}
            aria-label={type}
            background={bgActivity}
            width={wi}
            height={hi}
            padding={pa}
            className={classInput}
            {...props}
            onClick={event => this.onClickBlock(event, type, props)}>
              {icon(fillActivity)}
          </ ToolbarIcon>
        }
      />
    );
  }

  /**
   * Calculates the link popup position and styles, if any
   */
  calculateLinkPopupPosition() {
    // Constant values 2 and 20 (px) has been
    // manually observed through devtools and what looked best.

    let top;
    let left;
    let popupPosition = 'bottom center';

    // No need to calculate position of the popup is it is not even opened!
    const isLinkPopupOpened = this.state.openSetLink;
    if (!isLinkPopupOpened) return {
      popupPosition,
      // Hide the popup by setting negative zIndex
      popupStyle: { zIndex: -1 }
    }

    // extracted the class from `SlateAsInputEditor/index.js`
    const EDITOR_CSS_CLASS = 'doc-inner';

    const selection = window.getSelection();
    const selectionMadeInEditor = selection.focusNode &&
      selection.focusNode.parentElement.closest(`.${EDITOR_CSS_CLASS}`);

    // Default position if there is the current selection is not in the editor
    if (!selectionMadeInEditor) return { popupPosition }

    popupPosition = 'bottom left';

    const { body, documentElement } = document
    const pageWidth = Math.max(body.scrollWidth, body.offsetWidth,
      documentElement.clientWidth, documentElement.scrollWidth, documentElement.offsetWidth);

    // Find the selected text position in DOM to place the popup relative to it
    const rect = selection.getRangeAt(0).getBoundingClientRect();

    // distance from top of the document + the height of the element ...
    // ... -2px to account for semantic-ui popup caret position
    const CARET_TOP_OFFSET = 2;
    top = rect.top + rect.height + window.scrollY - CARET_TOP_OFFSET;

    // distance from the left of the document and ...
    // ... subtracting 18px to account for the semantic-ui popup caret position
    const CARET_LEFT_OFFSET = 20;
    left = rect.left - CARET_LEFT_OFFSET;

    const { popupRect } = this;

    // Check if there is enough space on right, otherwise flip the popup horizontally
    if (pageWidth - rect.left < popupRect.width) {
      popupPosition = 'bottom right';
      left = rect.left - popupRect.width + CARET_LEFT_OFFSET;
    }

    return {
      popupStyle: { top, left, transform: 'none' },
      popupPosition,
    }
  }

  /**
   * Render form in popup to set the link.
   */
  renderLinkSetForm() {
    const { popupPosition, popupStyle }  = this.calculateLinkPopupPosition()

    return (
      <Popup
        ref={this.setLinkFormRef}
        context={this.linkButtonRef}
        content={
          <Form onSubmit={(event) => {
            action.applyLinkUpdate(event, this.props.editor);
            this.toggleSetLinkForm();
          }}>
            <Form.Field>
              <label>Link Text</label>
              <Input placeholder='Text' name='text' defaultValue={this.props.editor.value.fragment.text}/>
            </Form.Field>
            <Form.Field>
              <label>Link URL</label>
              <Input placeholder='http://example.com' name='url' />
            </Form.Field>
            <Form.Field>
              <Button primary floated='right' type='submit'>Apply</Button>
            </Form.Field>
          </Form>
        }
        onClose={() => this.setState({ openSetLink: false })}
        on='click'
        open // Keep it open always. We toggle only visibility so we can calculate its rect
        position={popupPosition}
        style={popupStyle}
      />
    );
  }

  /**
   * Render a link-toggling toolbar button.
   */
  renderLinkButtonNew(type, icon, hi, wi, pa, vBox, classInput) {
    const { editor, editorProps } = this.props;

    const isActive = action.hasLinks(editor);

    const fillActivity = isActive
      ? '#2587DA'
      : styles.buttonSymbolInactive(editorProps.BUTTON_SYMBOL_INACTIVE);

    const bgActivity = isActive
      ? styles.buttonBgActive(editorProps.BUTTON_BACKGROUND_ACTIVE)
      : styles.buttonBgInactiveInactive(editorProps.BUTTON_BACKGROUND_INACTIVE);

    const style = {
      borderRadius: '5px',
      backgroundColor: styles.tooltipBg(editorProps.TOOLTIP_BACKGROUND),
      color: styles.tooltipColor(editorProps.TOOLTIP),
    };

    return (
      <Popup
        content={'Hyperlink'}
        style={style}
        position='bottom center'
        trigger={
          <ToolbarIcon
            ref={this.linkButtonRef}
            aria-label={type}
            background={bgActivity}
            width={wi}
            height={hi}
            padding={pa}
            viewBox={vBox}
            className={classInput}
            onClick={() => this.onClickLinkButton()}>
            {icon(fillActivity)}
          </ ToolbarIcon>
        }
      />
    );
  }

  /**
   * Render a history-toggling toolbar button.
   */
  renderHistoryButton(type, icon, hi, wi, pa, vBox, action, classInput) {
    const { editor, editorProps } = this.props;

    const style = {
      borderRadius: '5px',
      backgroundColor: styles.tooltipBg(editorProps.TOOLTIP_BACKGROUND),
      color: styles.tooltipColor(editorProps.TOOLTIP),
    };

    return (
      <Popup
        content={tips.capitalizeWord(action)}
        style={style}
        position='bottom center'
        trigger={
          <ToolbarIcon
            aria-label={type}
            background={styles.buttonBgInactiveInactive(editorProps.BUTTON_BACKGROUND_INACTIVE)}
            width={wi}
            height={hi}
            padding={pa}
            viewBox={vBox}
            className={classInput}
            onClick={event => this.onClickHistory(event, action, editor)}>
              {icon(styles.buttonSymbolInactive(editorProps.BUTTON_SYMBOL_INACTIVE))}
          </ ToolbarIcon>
        }
      />
    );
  }

  render() {
    const { pluginManager, editor, editorProps } = this.props;
    const root = window.document.querySelector('#slate-toolbar-wrapper-id');
    if (!root) { return null; }

    return createPortal(
      <StyledToolbar background={editorProps.TOOLBAR_BACKGROUND} className="format-toolbar">
        <Dropdown
          text='Style'
          className='toolbar-0x0'
          openOnFocus
          simple
          style={ new DropdownStyle(editorProps.DROPDOWN_COLOR) }
        >
          <Dropdown.Menu>
            <Dropdown.Item
              text='Normal'
              onClick={event => this.onClickBlock(event, DEFAULT_NODE)}
            />
            <Dropdown.Item
              text='Header 1'
              style={ DropdownHeader1 }
              onClick={event => this.onClickBlock(event, 'heading_one')}
            />
            <Dropdown.Item
              text='Header 2'
              style={ DropdownHeader2 }
              onClick={event => this.onClickBlock(event, 'heading_two')}
            />
            <Dropdown.Item
              text='Header 3'
              style={ DropdownHeader3 }
              onClick={event => this.onClickBlock(event, 'heading_three')}
            />
          </Dropdown.Menu>
        </Dropdown>
        <VertDivider color={editorProps.DIVIDER} className='toolbar-4x0'/>
        {
          this.renderMarkButton(
            boldIcon.type(),
            boldIcon.icon,
            boldIcon.height(),
            boldIcon.width(),
            boldIcon.padding(),
            boldIcon.vBox(),
            'toolbar-0x1'
          )
        }
        {
          this.renderMarkButton(
            italicIcon.type(),
            italicIcon.icon,
            italicIcon.height(),
            italicIcon.width(),
            italicIcon.padding(),
            italicIcon.vBox(),
            'toolbar-0x2'
          )
        }
        {/* {
          this.renderMarkButton(
            underlineIcon.type(),
            underlineIcon.icon,
            underlineIcon.height(),
            underlineIcon.width(),
            underlineIcon.padding(),
            underlineIcon.vBox(),
            'toolbar-0x3'
          )
        } */}
        <VertDivider color={editorProps.DIVIDER} className='toolbar-4x1'/>
        {
          this.renderMarkButton(
            codeIcon.type(),
            codeIcon.icon,
            codeIcon.height(),
            codeIcon.width(),
            codeIcon.padding(),
            codeIcon.vBox(),
            'toolbar-1x0'
          )
        }
        {
          this.renderBlockButton(
            quoteIcon.type(),
            quoteIcon.icon,
            quoteIcon.height(),
            quoteIcon.width(),
            quoteIcon.padding(),
            quoteIcon.vBox(),
            'toolbar-1x1'
          )
        }
        {
          this.renderBlockButton(
            uListIcon.type(),
            uListIcon.icon,
            uListIcon.height(),
            uListIcon.width(),
            uListIcon.padding(),
            uListIcon.vBox(),
            'toolbar-1x2'
          )
        }
        {
          this.renderBlockButton(
            oListIcon.type(),
            oListIcon.icon,
            oListIcon.height(),
            oListIcon.width(),
            oListIcon.padding(),
            oListIcon.vBox(),
            'toolbar-1x3'
          )
        }
        <VertDivider color={editorProps.DIVIDER} className='toolbar-4x2' />
        {
          this.renderLinkSetForm()
        }
        {
          this.renderLinkButtonNew(
            hyperlinkIcon.type(),
            hyperlinkIcon.icon,
            hyperlinkIcon.height(),
            hyperlinkIcon.width(),
            hyperlinkIcon.padding(),
            hyperlinkIcon.vBox(),
            'toolbar-2x1'
          )
        }
        <VertDivider color={editorProps.DIVIDER} className='toolbar-4x3' />
        {
          this.renderHistoryButton(
            undoIcon.type(),
            undoIcon.icon,
            undoIcon.height(),
            undoIcon.width(),
            undoIcon.padding(),
            undoIcon.vBox(),
            'undo',
            'toolbar-2x2'
          )
      }
        {
          this.renderHistoryButton(
            redoIcon.type(),
            redoIcon.icon,
            redoIcon.height(),
            redoIcon.width(),
            redoIcon.padding(),
            redoIcon.vBox(),
            'redo',
            'toolbar-2x3'
          )
      }
        { pluginManager.renderToolbar(editor) }
      </StyledToolbar>,
      root,
    );
  }
}

FormatToolbar.propTypes = {
  editor: PropTypes.object.isRequired,
  pluginManager: PropTypes.object,
  editorProps: PropTypes.shape({
    BUTTON_BACKGROUND_INACTIVE: PropTypes.string,
    BUTTON_BACKGROUND_ACTIVE: PropTypes.string,
    BUTTON_BACKGROUND_HOVER: PropTypes.string,
    BUTTON_SYMBOL_INACTIVE: PropTypes.string,
    BUTTON_SYMBOL_ACTIVE: PropTypes.string,
    DROPDOWN_COLOR: PropTypes.string,
    TOOLBAR_BACKGROUND: PropTypes.string,
    TOOLTIP_BACKGROUND: PropTypes.string,
    TOOLTIP: PropTypes.string,
    DIVIDER: PropTypes.string,
  }),
};
