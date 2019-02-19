import React from "react";

function List() {
  const plugin = 'list';
  const tags = ['ul', 'ol', 'li'];
  const markdownTags = ['list', 'item'];
  const schema = {
    blocks: {
      list: {
        nodes: [{ match: { type: "list_item" } }]
      },
      "list_item": {
        parent: { type: "list" },
        nodes: [{ match: [{ object: "text" }, { type: "link" }] }],
        marks: [{ type: 'bold' }, { type: 'italic' }]
      }
    }
  };

  /**
   * @param {Event} event
   * @param {Editor} editor
   * @param {Function} next
   */
  function onEnter(event, editor, next) {
    //console.log('onEnter of list plugin');
    // console.log(editor.value.document.getParent(editor.value.startBlock.key));
    return next();
  }

  /**
   * @param {Event} event
   * @param {Editor} editor
   * @param {Function} next
   */
  function onKeyDown(event, editor, next) {
    switch (event.key) {
      case "Enter":
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
    const list_type = node.data.get("list_type", "ul");
    const list_style_type = node.data.get(
      "list_style_type",
      list_type === "ul" ? "1" : "disc"
    );

    switch (node.type) {
      case "list":
        attributes["type"] = list_style_type;
        if (list_type === "ol") {
          return <ol {...attributes}>{children}</ol>;
        } else {
          return <ul {...attributes}>{children}</ul>;
        }
      case "list_item":
        return <li {...attributes}>{children}</li>;
      default:
        return next();
    }
  }

  /**
   * @param {Value} value
   * @param {Editor} editor
   */
  function toMarkdown(editor, value) {
    let markdown = "";
    const list_type = value.data.get("list_type", "ol");
    const list_style_type = list_type === "ol" ? "1. " : "* ";

    value.nodes.forEach(li => {
      let text = editor.helpers.markdown.toMarkdown(editor, li.nodes);
      markdown += `   ${list_style_type}${text}\n`;
    });

    return markdown;
  }

  function fromMarkdown(editor, event) {
    const list_type = event.node.listType === 'bullet' ? 'ul' : 'ol';
    let block = null;

    if (event.entering) {
      if (event.node.type === 'list') {
        block = {
          object: 'block',
          type: 'list',
          data: { list_type },
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

      return { action: 'push', block };
    } else {
      return { action: 'pop' };
    }
  }

  function fromHTML(editor, el, next) {
    if (['ul', 'ol'].includes(el.tagName.toLowerCase())) {
      return {
        object: 'block',
        type: 'list',
        data: { list_type: el.tagName.toLowerCase() },
        nodes: next(el.childNodes),
      };
    } else {
      return {
        object: 'block',
        type: 'list_item',
        data: {},
        nodes: next(el.childNodes),
      };
    }
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
    fromHTML
  };
}

export default List;