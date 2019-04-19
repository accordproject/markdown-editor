/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React from 'react';
import { Editor, getEventTransfer } from 'slate-react';
import { Tab, Form, TextArea } from 'semantic-ui-react';
import { Value } from 'slate';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import baseSchema from './schema';
import { FromHTML } from './html/fromHTML';
import FromMarkdown from './markdown/fromMarkdown';
import ToMarkdown from './markdown/toMarkdown';

import PluginManager from './PluginManager';
import HoverMenu from './HoverMenu';

const EditorWrapper = styled.div`
  background: #fff;
  margin: 50px;
  padding: 25px;
  font-family: serif;
  font-style: normal;
  font-variant: ;
  font-weight: normal;
  font-size: medium;
  line-height: 100%;
  word-spacing: normal;
  letter-spacing: normal;
  text-decoration: none;
  text-transform: none;
  text-align: left;
  text-indent: 0ex;
`;

const defaultMarkdown = `# Heading One
This is text. This is *italic* text. This is **bold** text. This is a [link](https://clause.io). This is \`inline code\`.

This is ***bold and italic*** text

This is a sentence that contains {{a variable}} within it. And here is {{another}}.

> This is a quote.
## Heading Two
This is more text.

Ordered lists:

1. one
1. two
1. three

Or:

* apples
* pears
* peaches

### Sub heading

Video:

<video/>

Another video:

<video src="https://www.youtube.com/embed/cmmq-JBMbbQ"/>`;

/**
 * A plugin based rich-text editor that uses Common Mark for serialization.
 * The default markdown to be edited in passed in the 'markdown' property
 * while the plugins are passed in the 'plugins' property.
 *
 * Plugins are responsible for serialization to/from markdown and HTML,
 * rendering and schema definition.
 */
class MarkdownEditor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: Value.fromJSON({ document: { nodes: [] } }),
      markdown: props.markdown ? props.markdown : defaultMarkdown,
    };
    this.editor = React.createRef();
    this.pluginManager = new PluginManager(this.props.plugins);
    this.fromMarkdown = new FromMarkdown(this.pluginManager);
    this.toMarkdown = new ToMarkdown(this.pluginManager);

    this.handleRenderEditor = this.renderEditor.bind(this);
    this.handleOnChange = this.onChange.bind(this);
    this.handleOnPaste = this.onPaste.bind(this);
    this.fromHTML = new FromHTML(this.pluginManager);
    this.menu = null;
    this.state.rect = null;

    this.schema = baseSchema;
    this.props.plugins.forEach((plugin) => {
      plugin.tags.forEach((tag) => {
        this.schema.document.nodes[0].match.push({ type: tag });
      });
    });
  }

  /**
   * Called by React when the component has been mounted into the DOM tree
   */
  componentDidMount() {
    this.onChange({
      value: this.fromMarkdown.convert(this.state.markdown),
    });

    this.updateMenu();
  }

  componentDidUpdate() {
    this.updateMenu();
  }

  /**
   * On Slate editor change, update the app's React state with the new editor value.
   * @param {*} param
   */
  onChange({ value }) {
    this.setState({ value });

    if (MarkdownEditor.isMarkdownEditorFocused()) {
      const markdown = this.toMarkdown.convert(value);
      this.setState({ markdown });
    }

    this.props.onChange(this);
  }

  /**
   * On markdown editor change, update the app's React state with the new editor value
   * @param {*} event
   */
  onMarkdownChange(event) {
    this.setState({ markdown: event.target.value });
    const value = this.fromMarkdown.convert(event.target.value);
    this.setState({ value });
  }

  /**
   * On space, if it was after an auto-markdown shortcut, convert the current
   * node into the shortcut's corresponding type.
   *
   * @param {Event} event
   * @param {Editor} editor
   * @param {Function} next
   */
  static onSpace(event, editor, next) {
    const { value } = editor;
    const { selection } = value;
    if (selection.isExpanded) return next();

    const { startBlock } = value;
    const { start } = selection;
    const chars = startBlock.text.slice(0, start.offset).replace(/\s*/g, '');
    const type = MarkdownEditor.getType(chars);
    if (!type) return next();
    if (type === 'list_item' && startBlock.type === 'list_item') return next();
    if (type === 'horizontal_rule') {
      const hr = {
        type: 'horizontal_rule',
      };
      editor.insertBlock(hr);
      // this CRASHES? editor.moveFocusToEndOfNode(hr);
    }

    event.preventDefault();
    editor.setBlocks(type);

    if (type === 'list_item') {
      // TODO (DCS) what about ol?
      editor.wrapBlock('ul_list');
    }

    editor.moveFocusToStartOfNode(startBlock).delete();
    return undefined;
  }

  /**
   * On backspace, if at the start of a non-paragraph, convert it back into a
   * paragraph node.
   *
   * @param {Event} event
   * @param {Editor} editor
   * @param {Function} next
   */
  static onBackspace(event, editor, next) {
    const { value } = editor;
    const { selection } = value;
    if (selection.isExpanded) return next();
    if (selection.start.offset !== 0) return next();

    const { startBlock } = value;
    if (startBlock.type === 'paragraph') return next();

    event.preventDefault();
    editor.setBlocks('paragraph');

    if (startBlock.type === 'list_item') {
      editor.unwrapBlock('list');
    }

    return undefined;
  }

  /**
   * On return, if at the end of a node type that should not be extended,
   * create a new paragraph below it.
   *
   * @param {Event} event
   * @param {Editor} editor
   * @param {Function} next
   */
  static onEnter(event, editor, next) {
    const { value } = editor;
    const { selection } = value;
    const { start, end, isExpanded } = selection;

    if (isExpanded) return next();

    const { startBlock } = value;
    if (start.offset === 0 && startBlock.text.length === 0) {
      return MarkdownEditor.onBackspace(event, editor, next);
    }

    if (end.offset !== startBlock.text.length) return next();

    // if you hit enter inside anything that is not a heading
    // we use the default behavior
    if (!startBlock.type.startsWith('heading')) {
      return next();
    }

    // when you hit enter after a heading we insert a paragraph
    event.preventDefault();
    editor.splitBlock(0).setBlocks('paragraph');
    return next();
  }

  /**
   * Called upon a keypress
   * @param {*} event
   * @param {*} editor
   * @param {*} next
   */
  static onKeyDown(event, editor, next) {
    switch (event.key) {
      /* case ' ':
        return this.onSpace(event, editor, next);
      case 'Backspace':
        return this.onBackspace(event, editor, next);
      case "Enter":
        return this.onEnter(event, editor, next); */
      default:
        return next();
    }
  }

  /**
   * Called on a paste
   * @param {*} event
   * @param {*} editor
   * @param {*} next
   * @return {*} the react component
   */
  onPaste(event, editor, next) {
    const transfer = getEventTransfer(event);
    if (transfer.type !== 'html') return next();
    const { document } = this.fromHTML.convert(this.editor, transfer.html);
    editor.insertFragment(document);
    return undefined;
  }

  updateRect(oldRect, newRect) {
    const oldString = JSON.stringify(oldRect);
    const newString = JSON.stringify(newRect);

    if (oldString !== newString) {
      this.setState({ rect: newRect });
    }
  }

  /**
   * Update the menu's absolute position.
   */

  updateMenu() {
    const { value } = this.state;
    const oldRect = this.state.rect;

    if (!value) {
      this.updateRect(oldRect, null);
      return;
    }

    const { fragment, selection } = value;

    if (selection.isBlurred || selection.isCollapsed || fragment.text === '') {
      this.updateRect(oldRect, null);
      return;
    }

    const native = window.getSelection();
    const range = native.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    this.updateRect(oldRect, rect);
  }

  /**
   * Returns the contents of the editor as a markdown string
   */
  getMarkdown() {
    return this.state.markdown;
  }

  /**
   * Get the block type for a series of auto-markdown shortcut `chars`.
   *
   * @param {String} chars
   * @return {String} block
   */
  static getType(chars) {
    switch (chars) {
      case '*':
      case '-':
      case '+':
        return 'list_item';
      case '>':
        return 'block_quote';
      case '#':
        return 'heading_one';
      case '##':
        return 'heading_two';
      case '###':
        return 'heading_three';
      case '####':
        return 'heading_four';
      case '#####':
        return 'heading_five';
      case '######':
        return 'heading_six';
      case '---':
        return 'horizontal_rule';
      default:
        return null;
    }
  }

  /**
   * Return true if the markdown editor has focus
   */
  static isMarkdownEditorFocused() {
    return document.activeElement.getAttribute('data-slate-editor');
  }

  /**
   * Renders a default node
   *
   * @param {*} props
   * @param {*} editor
   * @param {*} next
   * @return {*} the react component
   */
  static renderNode(props, editor, next) {
    const { node, attributes, children } = props;

    switch (node.type) {
      case 'paragraph':
        return <p {...attributes}>{children}</p>;
      case 'heading_one':
        return <h1 {...attributes}>{children}</h1>;
      case 'heading_two':
        return <h2 {...attributes}>{children}</h2>;
      case 'heading_three':
        return <h3 {...attributes}>{children}</h3>;
      case 'heading_four':
        return <h4 {...attributes}>{children}</h4>;
      case 'heading_five':
        return <h5 {...attributes}>{children}</h5>;
      case 'heading_six':
        return <h6 {...attributes}>{children}</h6>;
      case 'horizontal_rule':
        return <hr {...attributes} />;
      case 'block_quote':
        return <blockquote {...attributes}>{children}</blockquote>;
      case 'code_block':
        return <pre {...attributes}>{children}</pre>;
      case 'html_block':
        return <pre {...attributes}>{children}</pre>;
      case 'link': {
        const { data } = node;
        const href = data.get('href');
        return <a {...attributes} href={href}>{children}</a>;
      }
      default:
        return next();
    }
  }

  /**
   * Render a Slate mark.
   *
   * @param {*} props
   * @param {*} editor
   * @param {*} next
   * @return {*} the react component
   */
  static renderMark(props, editor, next) {
    const { children, mark, attributes } = props;

    switch (mark.type) {
      case 'bold':
        return <strong {...attributes}>{children}</strong>;
      case 'italic':
        return <em {...attributes}>{children}</em>;
      case 'html':
      case 'code':
        return <code {...attributes}>{children}</code>;
      case 'variable':
        return <mark {...attributes}>{children}</mark>;
      default:
        return next();
    }
  }

  /**
   * Render the editor.
   *
   * @param {Object} props
   * @param {Function} next
   * @return {Element}
   */

  renderEditor(props, ed, next) {
    const { editor } = props;
    const children = next();
    return (
      <React.Fragment>
        {children}
        <HoverMenu
          innerRef={menu => (this.menu = menu)}
          editor={editor}
          rect={this.state.rect}
          pluginManager = {this.pluginManager}
        />
      </React.Fragment>
    );
  }

  /**
   * Render this React component
   * @return {*} the react component
   */
  render() {
    const panes = [
      {
        menuItem: 'Rich Text',
        render: () => (
            <EditorWrapper>
              <Editor
              ref={this.editor}
              className="doc-inner"
              value={this.state.value}
              schema={this.schema}
              plugins={this.props.plugins}
              onChange={this.handleOnChange}
              onKeyDown={MarkdownEditor.onKeyDown}
              onPaste={this.handleOnPaste}
              renderNode={MarkdownEditor.renderNode}
              renderMark={MarkdownEditor.renderMark}
              renderEditor={this.handleRenderEditor}/>
            </EditorWrapper>),
      },
      {
        menuItem: 'Markdown',
        render: () => (<Form>
            <TextArea
              autoHeight
              placeholder="Write some markdown..."
              value={this.state.markdown}
              onChange={event => this.onMarkdownChange(event)}
            />
          </Form>),
      },
    ];

    return (
      <div>
        <Tab menu={{ pointing: true }} panes={panes} />
      </div>
    );
  }
}

/**
 * The property types for this component
 */
MarkdownEditor.propTypes = {
  markdown: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  plugins: PropTypes.arrayOf(PropTypes.shape({
    onEnter: PropTypes.func,
    onKeyDown: PropTypes.func,
    renderNode: PropTypes.func.isRequired,
    toMarkdown: PropTypes.func.isRequired,
    fromMarkdown: PropTypes.func.isRequired,
    fromHTML: PropTypes.func.isRequired,
    plugin: PropTypes.string.isRequired,
    tags: PropTypes.arrayOf(PropTypes.string).isRequired,
    markdownTags: PropTypes.arrayOf(PropTypes.string).isRequired,
    schema: PropTypes.object.isRequired,
  })),
};

export { MarkdownEditor };
