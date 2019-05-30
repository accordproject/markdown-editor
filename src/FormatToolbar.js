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

const whColor = '#FFFFFF';
const lgColor = '#F0F0F0';
const mgColor = '#949CA2';
const dgColor = '#414F58';
const lkColor = '#2587DA';

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

const SvgTester = styled.svg`
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

/**
 * A change helper to standardize wrapping links.
 */
const wrapLink = (editor, href) => {
  editor.wrapInline({
    type: 'link',
    data: { href },
  });
  editor.moveToEnd();
};

/**
 * A change helper to standardize unwrapping links.
 */
const unwrapLink = (editor) => {
  editor.unwrapInline('link');
};

/**
 * Check if the current selection has a mark with `type` in it.
 */
const hasMark = (editor, type) => {
  const { value } = editor;
  return value.activeMarks.some(mark => mark.type === type);
};

/**
 * Check whether the current selection has a link in it.
 */
const hasLinks = (editor) => {
  const { value } = editor;
  return value.inlines.some(inline => inline.type === 'link');
};

/**
* Check if the any of the currently selected blocks are of `type`.
*/
const hasBlock = (editor, type) => {
  const { value } = editor;
  return value.blocks.some(node => node.type === type);
};

/**
* Return selected block of given type.
*/
const getSelectedBlock = (editor, type) => {
  const { value } = editor;
  return value.blocks.find(node => node.type === type);
};

/**
 * When clicking a link, if the selection has a link in it, remove the link.
 * Otherwise, add a new link with an href and text.
 */
const onClickLink = (event, editor) => {
  event.preventDefault();

  const { value } = editor;
  const hasLinksBool = hasLinks(editor);

  if (hasLinksBool) {
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
  onClickBlock(event, type, blockProps) {
    event.preventDefault();

    const { editor } = this.props;
    const { value } = editor;
    const { document } = value;
    console.log('type: ', type);

    // Handle everything but list buttons.
    if (type !== 'ol_list' && type !== 'ul_list') {
      const isActive = hasBlock(editor, type);
      const isList = hasBlock(editor, 'list_item');
      console.log('a');
      console.log('isList: ', isList);

      if (isList) {
        console.log('YES: ');

        // THIS IS if you make a list item into quote
        // Currently errors by deleting 2 blocks
        editor
          .setBlocks(isActive ? DEFAULT_NODE : type)
          .unwrapBlock('list');
      } else {
        console.log('NO: ');
        editor.setBlocks(isActive ? DEFAULT_NODE : type);
      }
    } else {
      // Handle the extra wrapping required for list buttons.
      const selectedListItem = getSelectedBlock(editor, 'list_item');
      console.log('selectedListItem: ', selectedListItem);

      if (selectedListItem) {
        // if what is selected is ALREADY a list
        const parentBlock = document
          .getClosest(selectedListItem.key, parent => parent.type === type);
        const parentListType = parentBlock.data._root.entries[0][1];

        if (parentListType !== blockProps.list_type) {
          const varIIII = (parentListType === 'ul') ? 'ol' : 'ul';
          editor.withoutSaving(() => {
            editor.setNodeByKey(parentBlock.key, { data: { list_type: varIIII } });
          });
        }
      } else {
        // if what is selected is NOT a list
        console.log('Hope Im here: ', document);
        editor
          .setBlocks('list_item')
          .wrapBlock('ul_list');
        // .withoutSaving((hehrer) => {
        //   editor.setNodeByKey(hehrer.key, { data: { list_type: 'ul' } });
        // });
      }


      console.log('b');
      // console.log('selectedListItem: ', selectedListItem.type);
      // console.log('parentBlock: ', parentBlock.type);

      // include checks for parentBlock (and selectedListItem) aren't null

      // write all diff cases out, map out handling them correctly

      // list item, list, list wrong type, list right type, not a list

      // if (parentBlock.type !== 'list' && selectedListItem.type === type) {
      //   console.log('1: ');
      //   editor
      //     .setBlocks(DEFAULT_NODE)
      //     .unwrapBlock('list');
      // } else if (parentBlock.type !== 'list' && selectedListItem.type !== type) {
      //   console.log('2: ');
      //   editor
      //     .unwrapBlock(selectedListItem.type)
      //     .wrapBlock(type)
      //     .withoutSaving(() => {
      //       editor.setNodeByKey(parentBlock.key, { data: { list_type: 'ul' } });
      //     });
      // } else {
      //   console.log('3: ');
      // editor.withoutSaving(() => {
      //   editor.setNodeByKey(this.key, { data: { list_type: 'ol' } });
      // });
      // }
    }
  }

  /**
   * Render a mark-toggling toolbar button.
   */
  renderMarkButton(type, icon, hi, wi, pa, vBox) {
    const { editor } = this.props;
    const isActive = hasMark(editor, type);
    const fillActivity = isActive ? dgColor : mgColor;
    const bgActivity = isActive ? lgColor : whColor;

    return (
      <SvgTester
        viewBox={vBox}
        aria-label={type}
        background={bgActivity}
        width={wi}
        height={hi}
        padding={pa}
        onPointerDown={event => this.onClickMark(event, type)}>
          {icon(fillActivity)}
      </ SvgTester>
    );
  }

  /**
   * Render a block modifying button
   */
  renderBlockButton(type, icon, hi, wi, pa, vBox, props) {
    const { editor } = this.props;
    const isActive = hasBlock(editor, type);
    const fillActivity = isActive ? dgColor : mgColor;
    const bgActivity = isActive ? lgColor : whColor;

    return (
      <SvgTester
        viewBox={vBox}
        aria-label={type}
        background={bgActivity}
        width={wi}
        height={hi}
        padding={pa}
        {...props}
        onPointerDown={event => this.onClickBlock(event, type, props)}>
          {icon(fillActivity)}
      </ SvgTester>
    );
  }

  /**
   * Render a link-toggling toolbar button.
   */
  renderLinkButton(type, icon, hi, wi, pa, vBox) {
    const { editor } = this.props;
    const isActive = hasLinks(editor);
    const fillActivity = isActive ? lkColor : mgColor;
    const bgActivity = isActive ? lgColor : whColor;

    return (
      <SvgTester
        aria-label={type}
        background={bgActivity}
        width={wi}
        height={hi}
        padding={pa}
        viewBox={vBox}
        onPointerDown={event => onClickLink(event, this.props.editor)}>
          {icon(fillActivity)}
      </ SvgTester>
    );
  }

  /**
   * Render a history-toggling toolbar button.
   */
  renderHistoryButton(type, icon, hi, wi, pa, vBox, action) {
    return (
      <SvgTester
        aria-label={type}
        background={whColor}
        width={wi}
        height={hi}
        padding={pa}
        viewBox={vBox}
        onPointerDown={event => this.onClickHistory(event, action, this.props.editor)}>
          {icon(mgColor)}
      </ SvgTester>
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
            ulIcon.vBox(),
            { list_type: 'ul' }
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
            { list_type: 'ol' }
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
