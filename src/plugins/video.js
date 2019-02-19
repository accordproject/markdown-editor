import React from 'react';

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
  function renderNode(props, editor, next) {
    const { node, attributes, children } = props;

    let src = node.data.get('attributes').src;
    if (!src) {
      src = 'https://www.youtube.com/embed/dQw4w9WgXcQ';
    }
    console.log(src);

    return (<iframe
      {...attributes}
      src={src}
      frameBorder="0"
      allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
      title="video"
    >{children}</iframe>);
  }

  /**
     * @param {Value} value
     * @param {Editor} editor
     */
  function toMarkdown(editor, value) {
    return `<video ${value.data.get('attributeString')}/>\n\n`;
  }

  function fromMarkdown(editor, event, tag) {
    const block = {
      object: 'block',
      type: 'video',
      data: Object.assign(tag),
    };

    return [
      { action: 'push', block },
      { action: 'pop' },
    ];
  }

  function fromHTML(editor, el, next) {
    return {
      object: 'block',
      type: 'video',
      data: {},
      nodes: next(el.childNodes),
    };
  }

  return {
    plugin,
    tags,
    markdownTags,
    schema,
    onKeyDown,
    renderNode,
    toMarkdown,
    fromMarkdown,
    fromHTML,
  };
}

export default Video;
