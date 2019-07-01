import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Dropdown, Popup } from 'semantic-ui-react';

import * as action from './toolbarMethods';

import * as bIcon from './icons/bold';
import * as iIcon from './icons/italic';
import * as uIcon from './icons/underline';
import * as cIcon from './icons/code';
import * as qIcon from './icons/open-quote';
import * as olIcon from './icons/OL';
import * as ulIcon from './icons/UL';
import * as lIcon from './icons/hyperlink';
import * as unIcon from './icons/navigation-left';
import * as reIcon from './icons/navigation-right';

import './toolbar.css';

const linkColor = '#2587DA';
const btnBgInactiveFn = input => input || '#FFFFFF';
const btnBgActiveFn = input => input || '#F0F0F0';
const btnSymbolInactiveFn = input => input || '#949CA2';
const btnSymbolActiveFn = input => input || '#414F58';
const tooltipBg = input => input || '#FFFFFF';
// const styleColor = input => input || '#FFFFFF';

const capitalizeFirst = word => word.toString().charAt(0).toUpperCase();
const sliceWord = word => word.toString().slice(1);

const capitalizeWord = type => capitalizeFirst(type) + sliceWord(type);

const firstTwoLetters = word => word.toString().slice(0, 2);


const identifyBlock = (block) => {
  const typeBeginning = firstTwoLetters(block);
  if (typeBeginning === 'bl') return 'Quote';
  if (typeBeginning === 'ul') return 'Bulleted List';
  if (typeBeginning === 'ol') return 'Numbered List';
  return null;
};

const DEFAULT_NODE = 'paragraph';

const StyledToolbar = styled.div`
  position: relative;
  justify-self: center;
  width: 450px;
  background-color: ${props => props.background || '#FFF'} !important;
`;

// 1E2D53

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
    background-color: ${props => btnBgActiveFn(props.hoverColor)};
  }
`;
// Light: #F0F0F0
// Dark: #141F3C #364C77

const VertDivider = styled.div`
  box-sizing: border-box;
  height: 24px;
  width: 1px;
  border: 1px solid #EFEFEF;
  top: 10px;
  place-self: center;
`;

/**
 * Object constructor for dropdown styling
 * @param {*} input
 * @return {*} a new object
 */
function DropdownStyle(input) {
  this.color = btnSymbolActiveFn(input);
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

export default class FormatToolbar extends React.Component {
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
    const { editor } = this.props;
    event.preventDefault();
    editor.toggleMark(type);
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
   * Render a mark-toggling toolbar button.
   */
  renderMarkButton(type, icon, hi, wi, pa, vBox, classInput) {
    const {
      editor,
      editorProps,
    } = this.props;
    const {
      BUTTON_BACKGROUND_INACTIVE,
      BUTTON_BACKGROUND_ACTIVE,
      BUTTON_SYMBOL_INACTIVE,
      BUTTON_SYMBOL_ACTIVE,
      BUTTON_BACKGROUND_HOVER,
    } = editorProps;

    const isActive = action.hasMark(editor, type);

    const fillActivity = isActive
      ? btnSymbolActiveFn(BUTTON_SYMBOL_ACTIVE)
      : btnSymbolInactiveFn(BUTTON_SYMBOL_INACTIVE);

    const bgActivity = isActive
      ? btnBgActiveFn(BUTTON_BACKGROUND_ACTIVE)
      : btnBgInactiveFn(BUTTON_BACKGROUND_INACTIVE);

    const style = {
      borderRadius: '5px',
      backgroundColor: tooltipBg('#19C6C7'),
      color: '#182444',
      // #19C6C7
    };

    return (
      <Popup
       trigger={
        <ToolbarIcon
          viewBox={vBox}
          aria-label={type}
          background={bgActivity}
          width={wi}
          height={hi}
          padding={pa}
          className={classInput}
          hoverColor={BUTTON_BACKGROUND_HOVER}
          onPointerDown={event => this.onClickMark(event, type)}>
            {icon(fillActivity)}
        </ ToolbarIcon>
      }
      content={capitalizeWord(type)}
      style={style}
      position='bottom center'
      />
    );
  }

  /**
   * Render a block modifying button
   */
  renderBlockButton(type, icon, hi, wi, pa, vBox, classInput, props) {
    const { editor, editorProps } = this.props;
    const {
      BUTTON_BACKGROUND_ACTIVE,
      BUTTON_BACKGROUND_INACTIVE,
      BUTTON_SYMBOL_INACTIVE,
      BUTTON_SYMBOL_ACTIVE
    } = editorProps;

    const isActive = action.hasBlock(editor, type);

    const fillActivity = isActive
      ? btnSymbolActiveFn(BUTTON_SYMBOL_ACTIVE)
      : btnSymbolInactiveFn(BUTTON_SYMBOL_INACTIVE);

    const bgActivity = isActive
      ? btnBgActiveFn(BUTTON_BACKGROUND_ACTIVE)
      : btnBgInactiveFn(BUTTON_BACKGROUND_INACTIVE);

    const style = {
      borderRadius: '5px',
      backgroundColor: tooltipBg('#19C6C7'),
      color: '#182444',
      // #19C6C7
    };

    return (
      <Popup
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
        onPointerDown={event => this.onClickBlock(event, type, props)}>
          {icon(fillActivity)}
      </ ToolbarIcon>
      }
      content={identifyBlock(type)}
      style={style}
      position='bottom center'
      />


    );
  }

  /**
   * Render a link-toggling toolbar button.
   */
  renderLinkButton(type, icon, hi, wi, pa, vBox, classInput) {
    const { editor, editorProps } = this.props;
    const {
      BUTTON_BACKGROUND_ACTIVE,
      BUTTON_BACKGROUND_INACTIVE,
      BUTTON_SYMBOL_INACTIVE
    } = editorProps;

    const isActive = action.hasLinks(editor);

    const fillActivity = isActive
      ? linkColor
      : btnSymbolInactiveFn(BUTTON_SYMBOL_INACTIVE);

    const bgActivity = isActive
      ? btnBgActiveFn(BUTTON_BACKGROUND_ACTIVE)
      : btnBgInactiveFn(BUTTON_BACKGROUND_INACTIVE);

    return (
      <ToolbarIcon
        aria-label={type}
        background={bgActivity}
        width={wi}
        height={hi}
        padding={pa}
        viewBox={vBox}
        className={classInput}
        onPointerDown={event => action.onClickLink(event, this.props.editor)}>
          {icon(fillActivity)}
      </ ToolbarIcon>
    );
  }

  /**
   * Render a history-toggling toolbar button.
   */
  renderHistoryButton(type, icon, hi, wi, pa, vBox, action, classInput) {
    const { editor, editorProps } = this.props;
    const { BUTTON_BACKGROUND_INACTIVE, BUTTON_SYMBOL_INACTIVE } = editorProps;

    return (
      <ToolbarIcon
        aria-label={type}
        background={btnBgInactiveFn(BUTTON_BACKGROUND_INACTIVE)}
        width={wi}
        height={hi}
        padding={pa}
        viewBox={vBox}
        className={classInput}
        onPointerDown={event => this.onClickHistory(event, action, editor)}>
          {icon(btnSymbolInactiveFn(BUTTON_SYMBOL_INACTIVE))}
      </ ToolbarIcon>
    );
  }

  render() {
    const { pluginManager, editor, editorProps } = this.props;
    const { TOOLBAR_BACKGROUND } = editorProps;
    const root = window.document.getElementById('root').querySelector('#toolbarwrapperid');
    if (!root) { return null; }

    return ReactDOM.createPortal(
      <StyledToolbar background={TOOLBAR_BACKGROUND} className="format-toolbar">
        <Dropdown
          text='Style'
          className='toolbar-0x0'
          openOnFocus
          simple
          style={ new DropdownStyle(editorProps.dropdown_color) }
        >
          <Dropdown.Menu>
            <Dropdown.Item
              text='Normal'
              onClick={event => this.onClickBlock(event, 'paragraph')}
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
        <VertDivider className='toolbar-4x0'/>
        {
          this.renderMarkButton(
            bIcon.type(),
            bIcon.icon,
            bIcon.height(),
            bIcon.width(),
            bIcon.padding(),
            bIcon.vBox(),
            'toolbar-0x1'
          )
        }
        {
          this.renderMarkButton(
            iIcon.type(),
            iIcon.icon,
            iIcon.height(),
            iIcon.width(),
            iIcon.padding(),
            iIcon.vBox(),
            'toolbar-0x2'
          )
        }
        {
          this.renderMarkButton(
            uIcon.type(),
            uIcon.icon,
            uIcon.height(),
            uIcon.width(),
            uIcon.padding(),
            uIcon.vBox(),
            'toolbar-0x3'
          )
        }
        <VertDivider className='toolbar-4x1'/>
        {
          this.renderMarkButton(
            cIcon.type(),
            cIcon.icon,
            cIcon.height(),
            cIcon.width(),
            cIcon.padding(),
            cIcon.vBox(),
            'toolbar-1x0'
          )
        }
        {
          this.renderBlockButton(
            qIcon.type(),
            qIcon.icon,
            qIcon.height(),
            qIcon.width(),
            qIcon.padding(),
            qIcon.vBox(),
            'toolbar-1x1'
          )
        }
        {
          this.renderBlockButton(
            ulIcon.type(),
            ulIcon.icon,
            ulIcon.height(),
            ulIcon.width(),
            ulIcon.padding(),
            ulIcon.vBox(),
            'toolbar-1x2'
          )
        }
        {
          this.renderBlockButton(
            olIcon.type(),
            olIcon.icon,
            olIcon.height(),
            olIcon.width(),
            olIcon.padding(),
            olIcon.vBox(),
            'toolbar-1x3'
          )
        }
        <VertDivider className='toolbar-4x2' />
        {
          this.renderLinkButton(
            lIcon.type(),
            lIcon.icon,
            lIcon.height(),
            lIcon.width(),
            lIcon.padding(),
            lIcon.vBox(),
            'toolbar-2x1'
          )
        }
        <VertDivider className='toolbar-4x3' />
        {
          this.renderHistoryButton(
            unIcon.type(),
            unIcon.icon,
            unIcon.height(),
            unIcon.width(),
            unIcon.padding(),
            unIcon.vBox(),
            'undo',
            'toolbar-2x2'
          )
      }
        {
          this.renderHistoryButton(
            reIcon.type(),
            reIcon.icon,
            reIcon.height(),
            reIcon.width(),
            reIcon.padding(),
            reIcon.vBox(),
            'redo',
            'toolbar-2x3'
          )
      }
        { pluginManager.renderToolbar(editor)}
      </StyledToolbar>,
      root,
    );
  }
}

FormatToolbar.propTypes = {
  editor: PropTypes.object.isRequired,
  pluginManager: PropTypes.object,
  editorProps: PropTypes.shape({
    TOOLBAR_BACKGROUND: PropTypes.string,
    BUTTON_BACKGROUND_INACTIVE: PropTypes.string,
    BUTTON_BACKGROUND_ACTIVE: PropTypes.string,
    BUTTON_BACKGROUND_HOVER: PropTypes.string,
    BUTTON_SYMBOL_INACTIVE: PropTypes.string,
    BUTTON_SYMBOL_ACTIVE: PropTypes.string,
    TOOLTIP_BACKGROUND: PropTypes.string,
    TOOLTIP: PropTypes.string,
    DROPDOWN_COLOR: PropTypes.string,
  }),
};
