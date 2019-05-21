import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Icon } from 'semantic-ui-react';

const StyledToolbar = styled.div`
  background-color: #FFFFFF !important;
  top: -80px;  // ADJUST THIS TO ToolbarWrapper MARGIN
  left: 550px;
  width: 450px;
  position: absolute;
  display: grid
  grid-template-columns: auto auto auto auto auto auto auto auto auto auto auto auto auto auto auto;
`;

const StyledIcon = styled(Icon)`
  color: #949CA2 !important;
  place-self: center;
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

  renderMarkButton(type, icon) {
    const { editor } = this.props;
    const { value } = editor;
    const isActive = value && value.activeMarks.some(mark => mark.type === type);

    return (<StyledIcon
      name={icon}
      aria-label={type}
      onMouseDown={event => this.onClickMark(event, type)}
    />);
  }

  /**
   * Render a block modifying button
   *
   * @param {String} type
   * @param {String} icon
   * @return {Element}
   */

  renderBlockButton(type, icon, props) {
    return (<StyledIcon
      name={icon}
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

  renderLinkButton() {
    return (
      <StyledIcon
        name="linkify"
        aria-label="link"
        onMouseDown={event => this.onClickLink(event, this.props.editor)}
      />
    );
  }

  render() {
    const { pluginManager, editor } = this.props;
    const smallIcon = { size: 'small' };

    return (
        <StyledToolbar className="format-toolbar">
          { this.renderMarkButton('bold', 'bold')}
          { this.renderMarkButton('italic', 'italic')}
          { this.renderMarkButton('underline', 'underline')}
          <VertDivider />
          { this.renderMarkButton('code', 'code')}
          { this.renderBlockButton('block_quote', 'quote left')}
          { this.renderBlockButton('ul_list', 'list ul')}
          { this.renderBlockButton('ol_list', 'list ol')}
          <VertDivider />
          { this.renderLinkButton()}
          <VertDivider />
          { this.renderBlockButton('heading_one', 'text height')}
          { this.renderBlockButton('heading_two', 'text height', smallIcon)}
          { pluginManager.renderToolbar(editor)}
          <VertDivider />
        </StyledToolbar>
    );
  }
}

FormatToolbar.propTypes = {
  editor: PropTypes.object.isRequired,
  pluginManager: PropTypes.object,
};
