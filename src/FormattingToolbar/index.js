import React, { createRef } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import {
  Button, Dropdown, Form, Input, Popup, Ref
} from 'semantic-ui-react';

import * as action from './toolbarMethods';
import * as styles from './toolbarStyles';
import * as tips from './toolbarTooltip';
import * as CONST from '../constants';
import calculateLinkPopupPosition from './LinkComponent';

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

const PopupLinkWrapper = styled.p`
white-space : nowrap;
overflow : hidden;
text-overflow : ellipsis;
max-width : 250px;
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
};

const DropdownHeader2 = {
  fontSize: '20px',
  lineHeight: '20px',
  fontWeight: 'bold',
  color: '#122330',
};

const DropdownHeader3 = {
  fontSize: '16px',
  lineHeight: '16px',
  fontWeight: 'bold',
  color: '#122330',
};

/* eslint-disable react/no-find-dom-node */

export default class FormatToolbar extends React.Component {
  constructor() {
    super();
    this.state = { openSetLink: false };
    this.linkButtonRef = createRef();
    this.hyperlinkInputRef = createRef();
    this.onMouseDown = this.onMouseDown.bind(this);
    this.submitLinkForm = this.submitLinkForm.bind(this);
    this.removeLinkForm = this.removeLinkForm.bind(this);
    this.closeSetLinkForm = this.closeSetLinkForm.bind(this);
    this.renderLinkSetForm = this.renderLinkSetForm.bind(this);
  }

  componentDidMount() {
    document.addEventListener('mousedown', this.onMouseDown);
  }

  componentDidUpdate(prevProps, prevState) {
    // If the form is just opened, focus the Url input field
    if (!prevState.openSetLink && this.state.openSetLink) {
      this.hyperlinkInputRef.current.focus();
    }

    // If the form is just closed, reset the values
    // We are not using controlled form as it will make things
    // more complex, thats why using DOM api
    if (prevState.openSetLink && !this.state.openSetLink) {
      const formNode = this.setLinkForm;
      if (formNode) formNode.reset();

      // Focus back the editor
      this.props.editor.focus();
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
      const popup = this.setLinkFormPopup;
      if (!popup) return;

      // Make sure the clicked element is not the popup or the
      // child of the popup
      const clickedOutsideLinkPopup = e.target !== popup && !popup.contains(e.target);

      if (clickedOutsideLinkPopup) {
        // Close the link
        this.closeSetLinkForm();
      }
    }
  }

  /**
   * When a mark button is clicked, toggle undo or redo.
   */
  async onClickHistory(event, action) {
    const { editor } = this.props;
    event.preventDefault();
    ((action === 'undo') ? await editor.undo() : await editor.redo());
    if (editor.props.editorProps.onUndoOrRedo) editor.props.editorProps.onUndoOrRedo(editor);
  }

  /**
   * When a mark button is clicked, toggle the current mark.
   */
  onClickMark(event, type) {
    const { editor, pluginManager, lockText } = this.props;

    if (!lockText || pluginManager.isEditable(editor, type)) {
      event.preventDefault();
      editor.toggleMark(type);
    }
  }

  /**
   * When a link button is clicked, if the selection has a link in it, remove the link.
   * Otherwise, show the set link form.
   */
  onClickLinkButton() {
    const { editor, pluginManager, lockText } = this.props;
    if (!lockText || pluginManager.isEditable(editor, 'hyperlink')) {
      const hasLinksBool = action.hasLinks(editor);
      const isOnlyLinkBool = action.isOnlyLink(editor);
      if (hasLinksBool && !isOnlyLinkBool) return;

      if (hasLinksBool && isOnlyLinkBool) {
        editor.unwrapInline('link');
        return;
      }

      this.toggleSetLinkForm();
    }
  }

  /**
   * When a block button is clicked, toggle the block type.
   */
  /* eslint no-unused-expressions: 0 */
  onClickBlock(event, type) {
    const { editor, pluginManager, lockText } = this.props;
    const { value } = editor;

    if (!lockText || pluginManager.isEditable(editor, type)) {
      event.preventDefault();
      if (action.isClickBlockQuote(type)) {
        action.isSelectionList(value)
          ? action.transformListToBlockQuote(editor, type, value)
          : action.transformPtoBQSwap(editor, type);
      } else if (action.isClickHeading(type)) {
        action.hasBlock(editor, type)
          ? editor.setBlocks(CONST.PARAGRAPH)
          : editor.setBlocks(type);
      } else if (action.isSelectionList(value)) {
        action.currentList(value).type === type
          ? action.transformListToParagraph(editor, type)
          : action.transformListSwap(editor, type, value);
      } else if (action.isSelectionInput(value, CONST.BLOCK_QUOTE)) {
        action.transformBlockQuoteToList(editor, type);
      } else {
        action.transformParagraphToList(editor, type);
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
   * Close set link form.
   */
  closeSetLinkForm() {
    this.setState({ openSetLink: false });
  }

  /**
   * Apply the update to link and clear the link form.
   */
  submitLinkForm(event, isLink) {
    action.applyLinkUpdate(event, this.props.editor, isLink);
    this.closeSetLinkForm();
    this.setLinkForm.reset();
    this.props.editor.focus();
  }

  /**
   * Remove the link inline from the text
   */
  removeLinkForm(event) {
    action.removeLink(event, this.props.editor);
  }

  /**
   * Render a mark-toggling toolbar button.
   */
  renderMarkButton(type, label, icon, hi, wi, pa, vBox, classInput) {
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
        content={label}
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
            onMouseDown={e => e.preventDefault()}
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
    const { value } = editor;

    const isActive = action.isSelectionInput(value, type);

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
   * Render form in popup to set the link.
   */
  renderLinkSetForm() {
    const { popupPosition, popupStyle } = calculateLinkPopupPosition(
      this.props.editor,
      this.state.openSetLink,
      this.setLinkFormPopup
    );
    const { value } = this.props.editor;
    const { document, selection } = value;
    const isLinkBool = action.hasLinks(this.props.editor);
    const selectedInlineHref = document.getClosestInline(selection.anchor.path);
    const selectedText = this.props.editor.value.document
      .getFragmentAtRange(this.props.editor.value.selection).text;
    return (
      <Ref
        innerRef={(node) => {
          this.setLinkFormPopup = node;
        }}
      >
        <Popup
          context={this.linkButtonRef}
          content={
            <Ref
              innerRef={(node) => {
                this.setLinkForm = node;
              }}
            >
              <Form onSubmit={event => this.submitLinkForm(event, isLinkBool)}>
                <Form.Field>
                  <label>Link Text</label>
                  <Input
                    placeholder="Text"
                    name="text"
                    defaultValue={
                      isLinkBool && !selectedText
                        ? this.props.editor.value.focusText.text
                        : this.props.editor.value.fragment.text
                    }
                  />
                </Form.Field>
                <Form.Field>
                  <label>Link URL</label>
                  <Input
                    ref={this.hyperlinkInputRef}
                    placeholder={'http://example.com'}
                    defaultValue={
                      isLinkBool
                      && action.isOnlyLink(this.props.editor)
                      && selectedInlineHref
                        ? selectedInlineHref.data.get('href')
                        : ''
                    }
                    name="url"
                  />
                </Form.Field>
                {isLinkBool
                  && action.isOnlyLink(this.props.editor)
                  && selectedInlineHref && (
                    <PopupLinkWrapper>
                   <a href={selectedInlineHref.data.get('href')}
                   target='_blank'
                   >
                      {selectedInlineHref.data.get('href')}
                    </a>
                    </PopupLinkWrapper>
                )}
                <Form.Field>
                  <Button
                    secondary
                    floated="right"
                    disabled={!isLinkBool}
                    onMouseDown={this.removeLinkForm}
                  >
                    Remove
                  </Button>
                  <Button primary floated="right" type="submit">
                    Apply
                  </Button>
                </Form.Field>
              </Form>
            </Ref>
          }
          onClose={this.closeSetLinkForm}
          on="click"
          open // Keep it open always. We toggle only visibility so we can calculate its rect
          position={popupPosition}
          style={popupStyle}
        />
      </Ref>
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
        content='Insert a link'
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
            onClick={(e) => {
              e.preventDefault();
              this.onClickLinkButton();
            }}>
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
    if (!root || this.props.editor.props.readOnly) { return null; }

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
              onClick={event => this.onClickBlock(event, CONST.PARAGRAPH)}
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
            boldIcon.label(),
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
            italicIcon.label(),
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
            boldIcon.label(),
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
            codeIcon.label(),
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
            `Undo (${tips.MOD}+Z)`,
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
            `Redo (${tips.MOD}+Y)`,
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
  lockText: PropTypes.bool.isRequired,
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
