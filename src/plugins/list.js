import React from 'react';

function List() {
  const plugin = 'list';
  const tags = ['ul', 'ol', 'li'];
  const markdownTags = ['list', 'item'];
  const schema = {
    blocks: {
      list: {
        nodes: [{ match: { type: 'list_item' } }],
      },
      list_item: {
        parent: { type: 'list' },
        nodes: [{ match: [{ object: 'text' }, { type: 'link' }] }],
        marks: [{ type: 'bold' }, { type: 'italic' }],
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
    const listType = node.data.get('list_type', 'ul');
    const listStyleType = node.data.get(
      'list_style_type',
      listType === 'ul' ? '1' : 'disc',
    );

    switch (node.type) {
      case 'list':
        attributes.type = listStyleType;
        if (listType === 'ol') {
          return <ol {...attributes}>{children}</ol>;
        }
        return <ul {...attributes}>{children}</ul>;

      case 'list_item':
        return <li {...attributes}>{children}</li>;
      default:
        return next();
    }
  }

  /**
   * @param {ToMarkdown} parent
   * @param {Node} value
   */
  function toMarkdown(parent, value) {
    let markdown = '';
    const listType = value.data.get('list_type', 'ol');
    const listStyleType = listType === 'ol' ? '1. ' : '* ';

    value.nodes.forEach((li) => {
      const text = parent.recursive(li.nodes);
      markdown += `   ${listStyleType}${text}\n`;
    });

    return markdown;
  }

  function fromMarkdown(stack, event) {
    const listType = event.node.listType === 'bullet' ? 'ul' : 'ol';
    let block = null;

    if (event.entering) {
      if (event.node.type === 'list') {
        block = {
          object: 'block',
          type: 'list',
          data: { list_type: listType },
          nodes: [],
        };
      } else if (event.node.type === 'item') {
        block = {
          object: 'block',
          type: 'list_item',
          data: {},
          nodes: [],
        };
      }
      stack.push(block);
    } else {
      stack.pop();
    }

    return true;
  }

  function fromHTML(el, next) {
    if (['ul', 'ol'].includes(el.tagName.toLowerCase())) {
      return {
        object: 'block',
        type: 'list',
        data: { list_type: el.tagName.toLowerCase() },
        nodes: next(el.childNodes),
      };
    }
    return {
      object: 'block',
      type: 'list_item',
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
    renderBlock,
    toMarkdown,
    fromMarkdown,
    fromHTML,
  };
}

export default List;
