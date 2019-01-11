import { Editor } from 'slate-react';
import PropTypes from 'prop-types';
import React from 'react';
import styled from 'styled-components';
import { Form, TextArea, Divider, Grid, Segment } from 'semantic-ui-react';

import schema from './schema';

import MarkdownToSlateConverter from './MarkdownToSlateConverter';
import SlateToMarkdownConverter from './SlateToMarkdownConverter';
import HoverMenu from './HoverMenu';

const EditorWrapper = styled.div`
  background: #fff;
  margin: 50px;
  padding: 25px;
`;

const defaultValue =
`# Heading One

This is text. This is *italic* text. This is **bold** text. This is a [link](https://clause.io). This is \`inline code\`.

> This is a quote.

## Heading Two

This is more text.

This is more text.

### Heading Three

\`\`\`
namespace org.accordproject.time

enum TemporalUnit {
  o seconds
  o weeks
}
\`\`\`
#### Lists

Bullet list:
   * this is a list item
   * this a second item

Numbered list:

   1. This is a numbered list item
   1. Another numbered item
--- 
That was a thematic break.
`;


/**
 * Parses, edits and saves markdown text.
 *
 * @type {Component}
 */

class MarkdownEditor extends React.Component {
  constructor(props) {
    super(props);
    this.handleTextChange = null;

    if (props.handleTextChange) {
      this.handleTextChange = props.handleTextChange.bind(this);
    }
    this.editor = null;
    this.markdownToSlateConverter = new MarkdownToSlateConverter();
    this.slateToMarkdownConverter = new SlateToMarkdownConverter();
    this.menu = null;
    this.state = {};
    this.state.value = null;
    this.state.rect = null;
    this.state.markdown = defaultValue;

    try {
      if (this.props.text) {
        this.initialValue = this.markdownToSlateConverter.convert(this.props.text);
      }
    } catch (err) {
      // ignore
    }

    if (!this.initialValue) {
      this.initialValue = this.markdownToSlateConverter.convert(defaultValue);
    }
  }

  /**
   * On update, update the menu.
   */

  componentDidMount() {
    this.updateMenu();
  }

  componentDidUpdate() {
    this.updateMenu();
  }

  /**
   * On space, if it was after an auto-markdown shortcut, convert the current
   * node into the shortcut's corresponding type.
   *
   * @param {Event} event
   * @param {Editor} editor
   * @param {Function} next
   */

  onSpace(event, editor, next) {
    const { value } = editor;
    const { selection } = value;
    if (selection.isExpanded) return next();

    const { startBlock } = value;
    const { start } = selection;
    const chars = startBlock.text.slice(0, start.offset).replace(/\s*/g, '');
    const type = this.getType(chars);
    if (!type) return next();
    if (type === 'list-item' && startBlock.type === 'list-item') return next();
    if (type === 'horizontal-rule') {
      const hr = {
        type: 'horizontal-rule',
      };
      editor.insertBlock(hr);
      // this CRASHES? editor.moveFocusToEndOfNode(hr);
    }

    event.preventDefault();
    editor.setBlocks(type);

    if (type === 'list-item') {
      // TODO (DCS) what about ol?
      editor.wrapBlock('ul-list');
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

  onBackspace(event, editor, next) {
    const { value } = editor;
    const { selection } = value;
    if (selection.isExpanded) return next();
    if (selection.start.offset !== 0) return next();

    const { startBlock } = value;
    if (startBlock.type === 'paragraph') return next();

    event.preventDefault();
    editor.setBlocks('paragraph');

    if (startBlock.type === 'list-item') {
      editor.unwrapBlock('ul-list');
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

  onEnter(event, editor, next) {
    const { value } = editor;
    const { selection } = value;
    const { start, end, isExpanded } = selection;

    if (isExpanded) return next();

    const { startBlock } = value;
    if (start.offset === 0 && startBlock.text.length === 0) {
      return this.onBackspace(event, editor, next);
    }

    if (end.offset !== startBlock.text.length) return next();

    // if you hit enter inside anything that is not a heading
    // we use the default behavior
    if (!startBlock.type.startsWith('heading')) {
      return next();
    }

    // when you hit enter after a heading we insert a paragraph
    event.preventDefault();
    editor.splitBlock().setBlocks('paragraph');
    return next();
  }

  /**
   * On key down, check for our specific key shortcuts.
   *
   * @param {Event} event
   * @param {Editor} editor
   * @param {Function} next
   */

  onKeyDown(event, editor, next) {
    switch (event.key) {
      case ' ':
        return this.onSpace(event, editor, next);
      case 'Backspace':
        return this.onBackspace(event, editor, next);
      case 'Enter':
        return this.onEnter(event, editor, next);
      default:
        return next();
    }
  }

  /**
   * Get the block type for a series of auto-markdown shortcut `chars`.
   *
   * @param {String} chars
   * @return {String} block
   */

  getType(chars) {
    switch (chars) {
      case '*':
      case '-':
      case '+':
        return 'list-item';
      case '>':
        return 'block-quote';
      case '#':
        return 'heading-one';
      case '##':
        return 'heading-two';
      case '###':
        return 'heading-three';
      case '####':
        return 'heading-four';
      case '#####':
        return 'heading-five';
      case '######':
        return 'heading-six';
      case '---':
        return 'horizontal-rule';
      default:
        return null;
    }
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
    const value = this.state.value;
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

  handleOnChange({ value }) {
    this.setState({ value });
    const markdown = this.slateToMarkdownConverter.convert(value.toJSON());

    if (this.handleTextChange) {
      this.handleTextChange(markdown);
    }

    if (this.isMarkdownEditorFocused()) {
      this.setState({ markdown });
    }
  }

  isMarkdownEditorFocused() {
    return document.activeElement.getAttribute('data-slate-editor');
  }

  handleTextAreaOnChange(event) {
    this.setState({
      markdown: event.target.value,
    });

    if (!this.isMarkdownEditorFocused()) {
      const value = this.markdownToSlateConverter.convert(event.target.value);
      // console.log(JSON.stringify(value, null, 4));
      // console.log('****');
      this.editor.setState({ value });
    }
  }

  /**
   * Render a Slate node.
   *
   * @param {Object} props
   * @param {Editor} editor
   * @param {Function} next
   * @return {Element}
   */

  renderNode(props, editor, next) {
    const { attributes, children, node } = props;

    switch (node.type) {
      case 'block-quote':
        return <blockquote {...attributes}>{children}</blockquote>;
      case 'code-block':
        return <pre {...attributes}>{children}</pre>;
      case 'ol-list':
        return <ol {...attributes}>{children}</ol>;
      case 'ul-list':
        return <ul {...attributes}>{children}</ul>;
      case 'heading-one':
        return <h1 {...attributes}>{children}</h1>;
      case 'heading-two':
        return <h2 {...attributes}>{children}</h2>;
      case 'heading-three':
        return <h3 {...attributes}>{children}</h3>;
      case 'heading-four':
        return <h4 {...attributes}>{children}</h4>;
      case 'heading-five':
        return <h5 {...attributes}>{children}</h5>;
      case 'heading-six':
        return <h6 {...attributes}>{children}</h6>;
      case 'list-item':
        return <li {...attributes}>{children}</li>;
      case 'horizontal-rule':
        return <hr {...attributes} />;
      case 'link': {
        const { data } = node;
        const href = data.get('href');
        return (
          <a {...attributes} href={href}>
            {children}
          </a>
        );
      }
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
        />
      </React.Fragment>
    );
  }

  /**
   * Render a Slate mark.
   *
   * @param {Object} props
   * @param {Editor} editor
   * @param {Function} next
   * @return {Element}
   */

  renderMark(props, editor, next) {
    const { children, mark, attributes } = props;

    switch (mark.type) {
      case 'bold':
        return <strong {...attributes}>{children}</strong>;
      case 'code':
        return <code {...attributes}>{children}</code>;
      case 'italic':
        return <em {...attributes}>{children}</em>;
      default:
        return next();
    }
  }

  /**
   *
   * Render the example.
   *
   * @return {Component} component
   */

  render() {
    return (
      <div>
        <Segment>
          <Grid columns={2} relaxed="very">
            <Grid.Column>
              <EditorWrapper>
                <Editor
                  ref={(thisEditor) => { this.editor = thisEditor; }}
                  placeholder="Write some markdown..."
                  defaultValue={this.initialValue}
                  onKeyDown={this.onKeyDown.bind(this)}
                  renderNode={this.renderNode.bind(this)}
                  onChange={this.handleOnChange.bind(this)}
                  schema={schema}
                  renderEditor={this.renderEditor.bind(this)}
                  renderMark={this.renderMark.bind(this)}
                />
              </EditorWrapper>
            </Grid.Column>
            <Grid.Column>
              <Form>
                <TextArea
                  autoHeight
                  placeholder="Write some markdown..."
                  value={this.state.markdown}
                  onChange={this.handleTextAreaOnChange.bind(this)}
                />
              </Form>
            </Grid.Column>
          </Grid>
          <Divider vertical>⇆</Divider>
        </Segment>
      </div>
    );
  }
}

MarkdownEditor.propTypes = {
  handleTextChange: PropTypes.func,
  text: PropTypes.string,
};

export { MarkdownEditor, MarkdownToSlateConverter, SlateToMarkdownConverter };
