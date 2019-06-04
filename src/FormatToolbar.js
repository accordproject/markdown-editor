import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Dropdown } from 'semantic-ui-react';

import * as action from './toolbarMethods';

import * as bIcon from './icons/bold';
import * as iIcon from './icons/italic';
import * as uIcon from './icons/underline';
import * as cIcon from './icons/code';
import * as qIcon from './icons/open-quote';
import * as olIcon from './icons/OL';
import * as ulIcon from './icons/UL';
import * as pIcon from './icons/param';
import * as lIcon from './icons/hyperlink';
import * as unIcon from './icons/navigation-left';
import * as reIcon from './icons/navigation-right';

import './toolbar.css';

const whiteColor = '#FFFFFF';
const lightGrey = '#F0F0F0';
const mediumGrey = '#949CA2';
const darkGrey = '#414F58';
const linkColor = '#2587DA';

const DEFAULT_NODE = 'paragraph';

const StyledToolbar = styled.div`
  position: relative;
  justify-self: end;
  width: 450px;
  background-color: #FFFFFF !important;
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
    background-color: #F0F0F0;
  }
`;

const VertDivider = styled.div`
  box-sizing: border-box;
  height: 24px;
  width: 1px;
  border: 1px solid #EFEFEF;
  top: 10px;
  place-self: center;
  @media (max-width: 1050px) {
    display: none;
  }
`;

const VertDividerResponsive = styled.div`
  box-sizing: border-box;
  height: 24px;
  width: 1px;
  border: 1px solid #EFEFEF;
  top: 10px;
  place-self: center;
  @media (max-width: 1340px) {
    display: none;
  }
`;

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
    const { editor } = this.props;
    const isActive = action.hasMark(editor, type);
    const fillActivity = isActive ? darkGrey : mediumGrey;
    const bgActivity = isActive ? lightGrey : whiteColor;

    return (
      <ToolbarIcon
        viewBox={vBox}
        aria-label={type}
        background={bgActivity}
        width={wi}
        height={hi}
        padding={pa}
        className={classInput}
        onPointerDown={event => this.onClickMark(event, type)}>
          {icon(fillActivity)}
      </ ToolbarIcon>
    );
  }

  /**
   * Render a block modifying button
   */
  renderBlockButton(type, icon, hi, wi, pa, vBox, classInput, props) {
    const { editor } = this.props;
    const isActive = action.hasBlock(editor, type);
    const fillActivity = isActive ? darkGrey : mediumGrey;
    const bgActivity = isActive ? lightGrey : whiteColor;

    return (
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
    );
  }

  /**
   * Render a link-toggling toolbar button.
   */
  renderLinkButton(type, icon, hi, wi, pa, vBox, classInput) {
    const { editor } = this.props;
    const isActive = action.hasLinks(editor);
    const fillActivity = isActive ? linkColor : mediumGrey;
    const bgActivity = isActive ? lightGrey : whiteColor;

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
    return (
      <ToolbarIcon
        aria-label={type}
        background={whiteColor}
        width={wi}
        height={hi}
        padding={pa}
        viewBox={vBox}
        className={classInput}
        onPointerDown={event => this.onClickHistory(event, action, this.props.editor)}>
          {icon(mediumGrey)}
      </ ToolbarIcon>
    );
  }

  render() {
    const { pluginManager, editor } = this.props;
    const root = window.document.getElementById('root').querySelector('#toolbarwrapperid');
    if (!root) { return null; }

    return ReactDOM.createPortal(
      <StyledToolbar className="format-toolbar">
        <Dropdown
          text='Style'
          className='toolbar-0x1'
          openOnFocus
          simple
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
        <VertDivider className='toolbar-0x2'/>
        {
          this.renderMarkButton(
            bIcon.type(),
            bIcon.icon,
            bIcon.height(),
            bIcon.width(),
            bIcon.padding(),
            bIcon.vBox(),
            'toolbar-1x1'
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
            'toolbar-1x2'
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
            'toolbar-1x3'
          )
        }
        <VertDivider className='toolbar-1x4'/>
        {
          this.renderMarkButton(
            cIcon.type(),
            cIcon.icon,
            cIcon.height(),
            cIcon.width(),
            cIcon.padding(),
            cIcon.vBox(),
            'toolbar-1x5'
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
            'toolbar-1x6'
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
            'toolbar-1x7'
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
            'toolbar-1x8'
          )
        }
        <VertDivider className='toolbar-1x9' />
        {
          this.renderMarkButton(
            pIcon.type(),
            pIcon.icon,
            pIcon.height(),
            pIcon.width(),
            pIcon.padding(),
            pIcon.vBox(),
            'toolbar-1x10'
          )
        }
        {
          this.renderLinkButton(
            lIcon.type(),
            lIcon.icon,
            lIcon.height(),
            lIcon.width(),
            lIcon.padding(),
            lIcon.vBox(),
            'toolbar-1x11'
          )
        }
        <VertDividerResponsive className='toolbar-2x1' />
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
        <VertDivider className='toolbar-2x4'/>
      </StyledToolbar>,
      root,
    );
  }
}

FormatToolbar.propTypes = {
  editor: PropTypes.object.isRequired,
  pluginManager: PropTypes.object,
};
