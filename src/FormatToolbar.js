import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import styled from 'styled-components';

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

const whiteColor = '#FFFFFF';
const lightGrey = '#F0F0F0';
const mediumGrey = '#949CA2';
const darkGrey = '#414F58';
const linkColor = '#2587DA';

const DEFAULT_NODE = 'paragraph';

const StyledToolbar = styled.div`
  position: relative;
  display: grid
  grid-column-start: 1;
  grid-row-start: 1;
  justify-self: end;
  grid-template-columns:
    auto auto auto auto
    auto auto auto auto
    auto auto auto auto
    auto auto auto auto;
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
`;

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
  renderMarkButton(type, icon, hi, wi, pa, vBox) {
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
        onPointerDown={event => this.onClickMark(event, type)}>
          {icon(fillActivity)}
      </ ToolbarIcon>
    );
  }

  /**
   * Render a block modifying button
   */
  renderBlockButton(type, icon, hi, wi, pa, vBox, props) {
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
        {...props}
        onPointerDown={event => this.onClickBlock(event, type, props)}>
          {icon(fillActivity)}
      </ ToolbarIcon>
    );
  }

  /**
   * Render a link-toggling toolbar button.
   */
  renderLinkButton(type, icon, hi, wi, pa, vBox) {
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
        onPointerDown={event => action.onClickLink(event, this.props.editor)}>
          {icon(fillActivity)}
      </ ToolbarIcon>
    );
  }

  /**
   * Render a history-toggling toolbar button.
   */
  renderHistoryButton(type, icon, hi, wi, pa, vBox, action) {
    return (
      <ToolbarIcon
        aria-label={type}
        background={whiteColor}
        width={wi}
        height={hi}
        padding={pa}
        viewBox={vBox}
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
        {
          this.renderMarkButton(
            bIcon.type(),
            bIcon.icon,
            bIcon.height(),
            bIcon.width(),
            bIcon.padding(),
            bIcon.vBox()
          )
        }
        {
          this.renderMarkButton(
            iIcon.type(),
            iIcon.icon,
            iIcon.height(),
            iIcon.width(),
            iIcon.padding(),
            iIcon.vBox()
          )
        }
        {
          this.renderMarkButton(
            uIcon.type(),
            uIcon.icon,
            uIcon.height(),
            uIcon.width(),
            uIcon.padding(),
            uIcon.vBox()
          )
        }
        <VertDivider />
        {
          this.renderMarkButton(
            cIcon.type(),
            cIcon.icon,
            cIcon.height(),
            cIcon.width(),
            cIcon.padding(),
            cIcon.vBox()
          )
        }
        {
          this.renderBlockButton(
            qIcon.type(),
            qIcon.icon,
            qIcon.height(),
            qIcon.width(),
            qIcon.padding(),
            qIcon.vBox()
          )
        }
        {
          this.renderBlockButton(
            ulIcon.type(),
            ulIcon.icon,
            ulIcon.height(),
            ulIcon.width(),
            ulIcon.padding(),
            ulIcon.vBox()
          )
        }
        {
          this.renderBlockButton(
            olIcon.type(),
            olIcon.icon,
            olIcon.height(),
            olIcon.width(),
            olIcon.padding(),
            olIcon.vBox()
          )
        }
        <VertDivider />
        {
          this.renderMarkButton(
            pIcon.type(),
            pIcon.icon,
            pIcon.height(),
            pIcon.width(),
            pIcon.padding(),
            pIcon.vBox()
          )
        }
        {
          this.renderLinkButton(
            lIcon.type(),
            lIcon.icon,
            lIcon.height(),
            lIcon.width(),
            lIcon.padding(),
            lIcon.vBox()
          )
        }
        <VertDivider />
        {
          this.renderHistoryButton(
            unIcon.type(),
            unIcon.icon,
            unIcon.height(),
            unIcon.width(),
            unIcon.padding(),
            unIcon.vBox(),
            'undo'
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
            'redo'
          )
      }
        { pluginManager.renderToolbar(editor)}
        <VertDivider />
      </StyledToolbar>,
      root,
    );
  }
}

FormatToolbar.propTypes = {
  editor: PropTypes.object.isRequired,
  pluginManager: PropTypes.object,
};
