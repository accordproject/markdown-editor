import React from 'react';
import { Icon } from 'semantic-ui-react';
import styled from 'styled-components';

const StyledIcon = styled(Icon)`
  color: #949CA2 !important;
  position: abosulte;
  width: 24px !important;
  height: 23px !important;
  margin: 6px 0 0 5px !important;
  padding: 3px 0 0 0 !important;
  border-radius: 5px;
  cursor: pointer;
  &:hover {
    background-color: #F0F0F0;
  }
`;

/**
 * A sample plugin that renders a Youtube video using an iframe
 */
function Video() {
  const plugin = 'Video';
  const tags = ['video'];
  const markdownTags = ['video'];
  const schema = {
    blocks: {
      Video: {
        nodes: [],
      },
    },
  };

  /**
     * @param {Event} event
     * @param {Editor} editor
     * @param {Function} next
     */
  function onEnter(event, editor, next) {
    return next();
  }

  /**
     * @param {Event} event
     * @param {Editor} editor
     * @param {Function} next
     */
  function onKeyDown(event, editor, next) {
    switch (event.key) {
      case 'Enter':
        return onEnter(event, editor, next);
      default:
        return next();
    }
  }

  /**
     * @param {Object} props
     * @param {Editor} editor
     * @param {Function} next
     */
  function renderBlock(props, editor, next) {
    const { node, attributes, children } = props;

    switch (node.type) {
      case 'video':
      {
        let { src } = node.data.get('attributes');
        if (!src) {
          src = 'https://www.youtube.com/embed/dQw4w9WgXcQ';
        }

        return (<iframe
        {...attributes}
        src={src}
        frameBorder="0"
        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        title="video"
      >{children}</iframe>);
      }
      default:
        return next();
    }
  }

  /**
     * @param {ToMarkdown} parent
     * @param {Node} value
     * @param {Integer} depth
     */
  function toMarkdown(parent, value, depth) {
    return `<video ${value.data.get('attributeString')}/>\n\n`;
  }

  /**
     * @param {fromMarkdown} parent
     */
  function fromMarkdown(stack, event, tag) {
    const block = {
      object: 'block',
      type: 'video',
      data: Object.assign(tag),
    };

    stack.push(block);
    stack.pop();
    return true;
  }

  /**
     * @param {fromHTML} parent
     */
  function fromHTML(editor, el, next) {
    return {
      object: 'block',
      type: 'video',
      data: {},
      nodes: next(el.childNodes),
    };
  }

  /**
   * When then button is clicked
   *
   * @param {Editor} editor
   * @param {Event} event
   */
  function onClickButton(editor, event) {
    event.preventDefault();
    alert('Video plugin button clicked!');
  }

  /**
   * Render a video toolbar button.
   *
   * @param {Editor} editor
   * @return {Element}
   */
  function renderToolbar(editor) {
    return (<StyledIcon
      key={plugin}
      name='youtube'
      aria-label='youtube'
      onMouseDown={event => onClickButton(editor, event)}
    />);
  }

  return {
    plugin,
    tags,
    markdownTags,
    schema,
    onKeyDown,
    renderBlock,
    toMarkdown,
    fromMarkdown,
    fromHTML,
    renderToolbar,
  };
}

export default Video;
