import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import * as bIcon from '../public/icons/bold';
import * as iIcon from '../public/icons/italic';
import * as uIcon from '../public/icons/underline';
import * as cIcon from '../public/icons/code';
import * as qIcon from '../public/icons/open-quote';
import * as olIcon from '../public/icons/OL';
import * as ulIcon from '../public/icons/UL';
import * as pIcon from '../public/icons/param';
import * as lIcon from '../public/icons/hyperlink';
import * as unIcon from '../public/icons/navigation-left';
import * as reIcon from '../public/icons/navigation-right';

const SvgTester = styled.svg`
  width: ${props => props.width};
  height: ${props => props.height};
  place-self: center;
  user-select: none !important;
  cursor: pointer;
  background-color: #FFFFFF;
  padding: ${props => props.padding};
  border-radius: 5px;
  &:hover {
    background-color: #F0F0F0;
  }
`;

const whiteBG = '#000000';
const lightGrayBG = '#F0F0F0';
const medGrayBG = '#949CA2';
const darkGrayBG = '#414F58';

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

const StyledIcon = styled.img`
  place-self: center;
  padding: 5px;
  border-radius: 3px;
  background-color: ${props => props.bggg || '#FFFFFF'} !important;
`;

const VertDivider = styled.div`
  box-sizing: border-box;
  height: 24px;
  width: 1px;
  border: 1px solid #EFEFEF;
  top: 10px;
  place-self: center;
`;

/**
 * A change helper to standardize wrapping links.
 */
function wrapLink(editor, href) {
  editor.wrapInline({
    type: 'link',
    data: { href },
  });

  editor.moveToEnd();
}

/**
 * A change helper to standardize unwrapping links.
 *
 * @param {Editor} editor
 */
function unwrapLink(editor) {
  editor.unwrapInline('link');
}

const DEFAULT_NODE = 'paragraph';

export default class FormatToolbar extends React.Component {
  /**
   * When a mark button is clicked, toggle the current mark.
   *
   * @param {Event} event
   * @param {String} type
   */

  onClickMark(event, type) {
    const { editor } = this.props;
    event.preventDefault();
    editor.toggleMark(type);
  }

  /**
   * When a block button is clicked, toggle the block type.
   *
   * @param {Event} event
   * @param {String} type
   */
  onClickBlock(event, type) {
    event.preventDefault();

    const { editor } = this.props;
    const { value } = editor;
    const { document } = value;

    // Handle everything but list buttons.
    if (type !== 'ul_list' && type !== 'ol_list') {
      const isActive = FormatToolbar.hasBlock(editor, type);
      const isList = FormatToolbar.hasBlock(editor, 'list_item');

      if (isList) {
        editor
          .setBlocks(isActive ? DEFAULT_NODE : type)
          .unwrapBlock('ul_list')
          .unwrapBlock('ol_list');
      } else {
        editor.setBlocks(isActive ? DEFAULT_NODE : type);
      }
    } else {
      // Handle the extra wrapping required for list buttons.
      const isList = FormatToolbar.hasBlock(editor, 'list_item');
      const isType = value.blocks
        .some(block => !!document.getClosest(block.key, parent => parent.type === type));

      if (isList && isType) {
        editor
          .setBlocks(DEFAULT_NODE)
          .unwrapBlock('ul_list')
          .unwrapBlock('ol_list');
      } else if (isList) {
        editor
          .unwrapBlock(
            type === 'ul_list' ? 'ol_list' : 'ul_list',
          )
          .wrapBlock(type);
      } else {
        editor.setBlocks('list_item').wrapBlock(type);
      }
    }
  }

  /**
   * When clicking a link, if the selection has a link in it, remove the link.
   * Otherwise, add a new link with an href and text.
   *
   * @param {Event} event
   */

  onClickLink(event, editor) {
    event.preventDefault();

    const { value } = editor;
    const hasLinks = this.hasLinks(editor);

    if (hasLinks) {
      editor.command(unwrapLink);
    } else if (value.selection.isExpanded) {
      const href = window.prompt('Enter the URL of the link:');

      if (href === null) {
        return;
      }

      editor.command(wrapLink, href);
    } else {
      const href = window.prompt('Enter the URL of the link:');

      if (href === null) {
        return;
      }

      const text = window.prompt('Enter the text for the link:');

      if (text === null) {
        return;
      }

      editor
        .insertText(text)
        .moveFocusBackward(text.length)
        .command(wrapLink, href);
    }
  }

  /**
   * Check whether the current selection has a link in it.
   *
   * @return {Boolean} hasLinks
   */
  hasLinks(editor) {
    const { value } = editor;
    return value.inlines.some(inline => inline.type === 'link');
  }

  /**
   * Check if the current selection has a mark with `type` in it.
   *
   * @param {String} type
   * @return {Boolean}
   */

  hasMark(editor, type) {
    const { value } = editor;
    return value.activeMarks.some(mark => mark.type === type);
  }

  /**
   * Check if the any of the currently selected blocks are of `type`.
   *
   * @param {String} type
   * @return {Boolean}
   */

  static hasBlock(editor, type) {
    const { value } = editor;
    return value.blocks.some(node => node.type === type);
  }

  /**
   * Render a mark-toggling toolbar button.
   *
   * @param {String} type
   * @param {String} icon
   * @return {Element}
   */

  renderMarkButton(type, icon, alt, bGround) {
    const { editor } = this.props;
    const { value } = editor;
    const isActive = value && value.activeMarks.some(mark => mark.type === type);

    return (<StyledIcon
      alt={alt}
      src={icon}
      bggg={bGround}
      aria-label={type}
      onMouseDown={event => this.onClickMark(event, type)}
    />);
  }


  renderTester(type, icon, hi, wi, pa, fill, bgColor, vBox) {
    const { editor } = this.props;
    const { value } = editor;
    const isActive = value && value.activeMarks.some(mark => mark.type === type);

    return (
      <SvgTester
        viewBox={vBox}
        aria-label={type}
        bggg={bgColor}
        width={wi}
        height={hi}
        padding={pa}
        onMouseDown={event => this.onClickMark(event, type)}>
          {icon(fill)}
      </ SvgTester>
    );
  }

  renderBlockTester(type, icon, hi, wi, pa, fill, bgColor, vBox, props) {
    return (
      <SvgTester
        viewBox={vBox}
        aria-label={type}
        bggg={bgColor}
        width={wi}
        height={hi}
        padding={pa}
        {...props}
        onMouseDown={event => this.onClickMark(event, type)}>
          {icon(fill)}
      </ SvgTester>
    );
  }

  /**
   * Render a block modifying button
   *
   * @param {String} type
   * @param {String} icon
   * @return {Element}
   */
  renderBlockButton(type, icon, alt, props) {
    return (<StyledIcon
      alt={alt}
      src={icon}
      aria-label={type}
      {...props}
      onMouseDown={event => this.onClickBlock(event, type)}
    />);
  }

  /**
   * Render a mark-toggling toolbar button.
   *
   * @param {String} type
   * @param {String} icon
   * @return {Element}
   */
  renderLinkButton(type, icon, hi, wi, pa, fill, bgColor, vBox) {
    return (
      <SvgTester
        aria-label={type}
        bggg={bgColor}
        width={wi}
        height={hi}
        padding={pa}
        viewBox={vBox}
        onMouseDown={event => this.onClickLink(event, this.props.editor)}>
          {icon(fill)}
      </ SvgTester>
    );
  }
  // height + 10
  // width + 14

  // type, heightInput, widthInput, paddingInput, vBox, icon
  render() {
    const { pluginManager, editor } = this.props;
    const root = window.document.getElementById('root').querySelector('#toolbarwrapperid');
    if (!root) { return null; }

    return ReactDOM.createPortal(
      <StyledToolbar className="format-toolbar">
        { this.renderTester(
          bIcon.type(),
          bIcon.icon,
          bIcon.height(),
          bIcon.width(),
          bIcon.padding(),
          medGrayBG,
          lightGrayBG,
          bIcon.vBox()
        )}
        { this.renderTester(
          iIcon.type(),
          iIcon.icon,
          iIcon.height(),
          iIcon.width(),
          iIcon.padding(),
          medGrayBG,
          whiteBG,
          iIcon.vBox()
        )}
        { this.renderTester(
          uIcon.type(),
          uIcon.icon,
          uIcon.height(),
          uIcon.width(),
          uIcon.padding(),
          medGrayBG,
          whiteBG,
          uIcon.vBox()
        )}
        <VertDivider />
        { this.renderTester(
          cIcon.type(),
          cIcon.icon,
          cIcon.height(),
          cIcon.width(),
          cIcon.padding(),
          medGrayBG,
          whiteBG,
          cIcon.vBox()
        )}
        { this.renderBlockTester(
          qIcon.type(),
          qIcon.icon,
          qIcon.height(),
          qIcon.width(),
          qIcon.padding(),
          medGrayBG,
          whiteBG,
          qIcon.vBox()
        )}
        { this.renderBlockTester(
          ulIcon.type(),
          ulIcon.icon,
          ulIcon.height(),
          ulIcon.width(),
          ulIcon.padding(),
          medGrayBG,
          whiteBG,
          ulIcon.vBox()
        )}
        { this.renderBlockTester(
          olIcon.type(),
          olIcon.icon,
          olIcon.height(),
          olIcon.width(),
          olIcon.padding(),
          medGrayBG,
          whiteBG,
          olIcon.vBox()
        )}
        <VertDivider />
        { this.renderTester(
          pIcon.type(),
          pIcon.icon,
          pIcon.height(),
          pIcon.width(),
          pIcon.padding(),
          medGrayBG,
          whiteBG,
          pIcon.vBox()
        )}
        { this.renderLinkButton(
          lIcon.type(),
          lIcon.icon,
          lIcon.height(),
          lIcon.width(),
          lIcon.padding(),
          medGrayBG,
          whiteBG,
          lIcon.vBox()
        )}
        <VertDivider />
        { this.renderTester(
          unIcon.type(),
          unIcon.icon,
          unIcon.height(),
          unIcon.width(),
          unIcon.padding(),
          medGrayBG,
          whiteBG,
          unIcon.vBox()
        )}
        { this.renderTester(
          reIcon.type(),
          reIcon.icon,
          reIcon.height(),
          reIcon.width(),
          reIcon.padding(),
          medGrayBG,
          whiteBG,
          reIcon.vBox()
        )}
        {/* { this.renderBlockButton('heading_one', 'text height')} */}
        {/* { this.renderBlockButton('heading_two', 'text height', smallIcon)} */}
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
