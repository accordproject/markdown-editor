import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Dropdown, Popup } from 'semantic-ui-react';

import * as action from './toolbarMethods';
import * as styles from './toolbarStyles';
import * as tips from './toolbarTooltip';

import * as boldIcon from '../icons/bold';
import * as italicIcon from '../icons/italic';
import * as underlineIcon from '../icons/underline';
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
   * Render a link-toggling toolbar button.
   */
  renderLinkButton(type, icon, hi, wi, pa, vBox, classInput) {
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
            aria-label={type}
            background={bgActivity}
            width={wi}
            height={hi}
            padding={pa}
            viewBox={vBox}
            className={classInput}
            onClick={event => action.onClickLink(event, this.props.editor)}>
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

    return ReactDOM.createPortal(
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
        {
          this.renderMarkButton(
            underlineIcon.type(),
            underlineIcon.icon,
            underlineIcon.height(),
            underlineIcon.width(),
            underlineIcon.padding(),
            underlineIcon.vBox(),
            'toolbar-0x3'
          )
        }
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
          this.renderLinkButton(
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
  }),
};
