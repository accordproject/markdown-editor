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

import React, {
  useEffect,
  useState,
  useRef,
  useCallback
}
  from 'react';
import { HtmlTransformer } from '@accordproject/markdown-html';
import { SlateTransformer } from '@accordproject/markdown-slate';
import { Editor, getEventTransfer } from 'slate-react';
import { Value } from 'slate';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import isHotKey from 'is-hotkey';

import baseSchema from '../schema';
import PluginManager from '../PluginManager';
import FormatToolbar from '../FormattingToolbar';
import ListPlugin from '../plugins/list';
import BlockquotePlugin from '../plugins/blockquote';
import * as action from '../FormattingToolbar/toolbarMethods';

import '../styles.css';

const EditorWrapper = styled.div`
  background: #fff;
  min-height: ${props => props.EDITOR_HEIGHT || '750px'};
  max-width: ${props => props.EDITOR_WIDTH || 'none'};
  min-width: ${props => props.EDITOR_WIDTH || 'none'};
  border-radius: ${props => props.EDITOR_BORDER_RADIUS || ' 10px'};
  border: ${props => props.EDITOR_BORDER || ' 1px solid #979797'};
  box-shadow: ${props => props.EDITOR_SHADOW || ' 1px 2px 4px rgba(0, 0, 0, .5)'};
  margin: ${props => props.EDITOR_MARGIN || '5px auto'};
  font-family: serif;
  font-style: normal;
  font-weight: normal;
  font-size: 0.88em;
  line-height: 100%;
  word-spacing: normal;
  letter-spacing: normal;
  text-decoration: none;
  text-transform: none;
  text-align: left;
  text-indent: 0ex;
  display: flex;

  > div {
    width: 100%;
  }

  .doc-inner {
    width: 100%;
    height: 100%;
    padding: 20px;
  }
`;

const ToolbarWrapper = styled.div`
  position: sticky;
  z-index: 1;
  top: 0;
  height: 36px;
  background: ${props => props.TOOLBAR_BACKGROUND || '#FFF'};
  box-shadow: ${props => props.TOOLBAR_SHADOW || 'none'};
`;

const Heading = styled.div`
  font-family: serif;
`;

Heading.propTypes = {
  type: PropTypes.oneOf(['h1', 'h2', 'h3', 'h4', 'h5', 'h6']),
};

/**
 * A plugin based rich-text editor that uses Common Mark for serialization.
 * The default slate value to be edited is passed in props 'value'
 * while the plugins are passed in the 'plugins' property.
 *
 * The rich text editor is editable is passed to the props.onChange
 * callback.
 *
 * When props.lockText is true the editor will lock all text against edits
 * except for variables.
 *
 * @param {*} props the props for the component. See the declared PropTypes
 * for details.
 */
// eslint-disable-next-line react/display-name
const SlateAsInputEditor = React.forwardRef((props, ref) => {
  /**
   * Destructure props for efficiency
   */
  const {
    onChange, value
  } = props;

  const editorProps = props.editorProps || Object.create(null);

  const plugins = React.useMemo(() => (props.plugins
    ? props.plugins.concat(
      [ListPlugin(), BlockquotePlugin()]
    )
    : [ListPlugin(), BlockquotePlugin()]), [props.plugins]);

  /**
   * A reference to the Slate Editor.
   */
  const editorRef = ref || useRef(null);

  /**
   * Slate Schema augmented by plugins
   */
  const [slateSchema, setSlateSchema] = useState(null);

  /**
   * Updates the Slate Schema when the plugins change
   */
  useEffect(() => {
    let augmentedSchema = baseSchema;

    // sort the plugins by name to get determinism
    plugins.sort((pluginA, pluginB) => pluginA.name.localeCompare(pluginB.name));

    // allow each plugin to contribute to the schema
    plugins.forEach((plugin) => {
      if (plugin.augmentSchema) {
        augmentedSchema = plugin.augmentSchema(augmentedSchema);
      }
    });
    setSlateSchema(augmentedSchema);
  }, [plugins]);

  /**
   * Render a Slate inline.
   */
  // @ts-ignore
  const renderInline = useCallback((props, editor, next) => {
    const { attributes, children, node } = props;

    switch (node.type) {
      case 'link':
        return <a {...attributes} href={node.data.get('href')}>{children}</a>;
      case 'image':
        return <img {...attributes} alt={node.data.get('title')} src={node.data.get('href')}/>;
      case 'html_inline':
        return <span className='html_inline' {...attributes}>{node.data.get('content')}</span>;
      case 'softbreak':
        return <span className='softbreak' {...attributes}> {children}</span>;
      case 'linebreak':
        return <br className='linebreak' {...attributes}/>;
      default:
        return next();
    }
  }, []);

  /**
   * Renders a block
   */
  // @ts-ignore
  const renderBlock = useCallback((props, editor, next) => {
    const { node, attributes, children } = props;

    switch (node.type) {
      case 'paragraph':
        return <p {...attributes}>{children}</p>;
      case 'heading_one':
        return <Heading as="h1" {...attributes}>{children}</Heading>;
      case 'heading_two':
        return <Heading as="h2" {...attributes}>{children}</Heading>;
      case 'heading_three':
        return <Heading as="h3" {...attributes}>{children}</Heading>;
      case 'heading_four':
        return <Heading as="h4" {...attributes}>{children}</Heading>;
      case 'heading_five':
        return <Heading as="h5" {...attributes}>{children}</Heading>;
      case 'heading_six':
        return <Heading as="h6" {...attributes}>{children}</Heading>;
      case 'horizontal_rule':
        return <div className="hr" {...attributes}>{children}</div>;
      case 'code_block':
        return <pre {...attributes}>{children}</pre>;
      case 'html_block':
        return <pre className="html_block" {...attributes}>{children}</pre>;
      default:
        return next();
    }
  }, []);

  /**
   * Render a Slate mark.
   */
  // @ts-ignore
  const renderMark = useCallback((props, editor, next) => {
    const { children, mark, attributes } = props;

    switch (mark.type) {
      case 'bold':
        return <strong {...attributes}>{children}</strong>;
      case 'italic':
        return <em {...attributes}>{children}</em>;
      // case 'underline':
      //   return <u {...{ attributes }}>{children}</u>;
      case 'html':
      case 'code':
        return <code {...attributes}>{children}</code>;
      case 'error':
        return <span className='error' {...attributes}>{children}</span>;
      default:
        return next();
    }
  }, []);

  /**
  * Returns true if the editor should allow an edit. Edits are allowed for all
  * text unless the lockText parameter is set in the state of the editor, in which
  * case the decision is delegated to the PluginManager.
  * @param {Editor} editor the Slate Editor
  * @param {string} code the type of edit requested
  */
  const isEditable = useCallback((editor, code) => {
    if (editor.props.readOnly) { return false; }
    if (editor.props.lockText) {
      const pluginManager = new PluginManager(plugins);
      return pluginManager.isEditable(editor, code);
    }

    return true;
  }, [plugins]);

  /**
  * On backspace, if at the start of a non-paragraph, convert it back into a
  * paragraph node.
  *
  * @param {Event} event
  * @param {Editor} editor
  * @param {Function} next
  */
  const handleBackspace = (event, editor, next) => {
    const { value } = editor;
    const { selection } = value;

    if (editor.props.lockText
      && !(isEditable(editor, 'backspace'))) {
      event.preventDefault(); // prevent editing non-editable text
      return undefined;
    }

    if (selection.isExpanded) return next();
    if (selection.start.offset !== 0) return next();

    const { startBlock } = value;
    if (startBlock.type === 'paragraph') return next();

    event.preventDefault();
    editor.setBlocks('paragraph');

    return undefined;
  };

  /**
   * Check if the current selection has a mark with `code` in it.
   *
   * @param {Object} value
   * @return {Boolean}
   */

  const isCodespan = value => value.activeMarks.some(mark => mark.type === 'code');

  /**
  * On return, if at the end of a node type that should not be extended,
  * create a new paragraph below it.
  *
  * @param {Event} event
  * @param {Editor} editor
  * @param {Function} next
  */
  const handleEnter = (event, editor, next) => {
    const { value } = editor;
    const { selection } = value;
    const { end, isExpanded } = selection;

    if (!isEditable(editor, 'enter')) {
      event.preventDefault(); // prevent adding newlines in variables
      return false;
    }

    if (action.isOnlyLink(editor)) {
      const isLinkBool = action.hasLinks(editor);
      action.applyLinkUpdate(event, editor, isLinkBool);
      return true;
    }

    if (isExpanded) return next();

    const { startBlock } = value;
    if (end.offset !== startBlock.text.length) return next();

    // Hitting enter while in a codespan will break out of the span
    if (isCodespan(value)) {
      event.preventDefault();
      editor.removeMark('code');
      editor.insertBlock('paragraph');
      return false;
    }

    // if you hit enter inside anything that is not a heading
    // we use the default behavior
    if (!startBlock.type.startsWith('heading')) {
      return next();
    }

    // when you hit enter after a heading we insert a paragraph
    event.preventDefault();
    editor.insertBlock('paragraph');
    return next();
  };

  /**
  * Called upon a keypress
  * @param {*} event
  * @param {*} editor
  * @param {*} next
  */
  const onKeyDown = async (event, editor, next) => {
    if (isHotKey('mod+z', event)) {
      if (editor.props.editorProps.onUndoOrRedo) {
        await editor.undo();
        return editor.props.editorProps.onUndoOrRedo(editor);
      }
    }
    if (isHotKey('mod+shift+z', event)) {
      if (editor.props.editorProps.onUndoOrRedo) {
        await editor.redo();
        return editor.props.editorProps.onUndoOrRedo(editor);
      }
    }
    switch (event.key) {
      case 'Enter':
        return handleEnter(event, editor, next);
      case 'Backspace':
        return handleBackspace(event, editor, next);
      default:
        return next(); // allow
    }
  };

  /**
  * Called on a paste
  * @param {*} event
  * @param {*} editor
  * @param {*} next
  * @return {*} the react component
  */
  const onPaste = (event, editor, next) => {
    if (!isEditable(editor, 'paste')) {
      return false;
    }
    if (isEditable(editor, 'paste')) {
      event.preventDefault();
      const transfer = getEventTransfer(event);
      if (transfer.type === 'html') {
        const htmlTransformer = new HtmlTransformer();
        const slateTransformer = new SlateTransformer();
        // @ts-ignore
        const ciceroMark = htmlTransformer.toCiceroMark(transfer.html, 'json');
        const { document } = Value.fromJSON(slateTransformer.fromCiceroMark(ciceroMark));
        editor.insertFragment(document);
        return;
      }
    }
    return next();
  };

  /**
   * When in lockText mode prevent edits to non-variables
   * @param {*} event
   * @param {*} editor
   * @param {*} next
   */
  const onBeforeInput = ((event, editor, next) => {
    if (isEditable(editor, 'input')) {
      return next();
    }

    event.preventDefault();
    return false;
  });

  /**
   * Render the toolbar.
   */
  const renderEditor = useCallback((props, editor, next) => {
    const children = next();
    const pluginManager = new PluginManager(plugins);

    return (
      <div>
        <FormatToolbar
          editor={editor}
          pluginManager={pluginManager}
          editorProps={editorProps}
          lockText={props.lockText}
        />
        {children}
      </div>
    );
  }, [editorProps, plugins]);

  const onChangeHandler = ({ value }) => {
    if (props.readOnly) return;
    onChange(value);
  };

  const onFocusHandler = (_event, editor, _next) => {
    // see https://github.com/accordproject/markdown-editor/issues/162
    setTimeout(editor.focus, 0);
  };

  const onCutHandler = (event, editor, next) => {
    if (!isEditable(editor, 'cut')) {
      event.preventDefault();
      return false;
    }
    return next();
  };

  return (
    <div>
      <ToolbarWrapper {...editorProps} id="slate-toolbar-wrapper-id" />
      <EditorWrapper {...editorProps} >
        <Editor
          {...props}
          ref={editorRef}
          className="doc-inner"
          value={Value.fromJSON(value)}
          readOnly={props.readOnly}
          onChange={onChangeHandler}
          onCut={onCutHandler}
          onFocus={onFocusHandler}
          schema={slateSchema}
          plugins={plugins}
          onBeforeInput={onBeforeInput}
          onKeyDown={onKeyDown}
          onPaste={onPaste}
          renderBlock={renderBlock}
          renderInline={renderInline}
          renderMark={renderMark}
          editorProps={editorProps}
          renderEditor={renderEditor}
        />
      </EditorWrapper>
    </div>
  );
});

/**
 * The property types for this component
 */
SlateAsInputEditor.propTypes = {
  /**
   * Initial contents for the editor (slate value)
   */
  value: PropTypes.object,

  /**
   * Optional styling props for this editor and toolbar
   */
  editorProps: PropTypes.shape({
    BUTTON_BACKGROUND_INACTIVE: PropTypes.string,
    BUTTON_BACKGROUND_ACTIVE: PropTypes.string,
    BUTTON_SYMBOL_INACTIVE: PropTypes.string,
    BUTTON_SYMBOL_ACTIVE: PropTypes.string,
    DROPDOWN_COLOR: PropTypes.string,
    EDITOR_BORDER: PropTypes.string,
    EDITOR_BORDER_RADIUS: PropTypes.string,
    EDITOR_HEIGHT: PropTypes.string,
    EDITOR_MARGIN: PropTypes.string,
    EDITOR_SHADOW: PropTypes.string,
    EDITOR_WIDTH: PropTypes.string,
    TOOLBAR_BACKGROUND: PropTypes.string,
    TOOLTIP_BACKGROUND: PropTypes.string,
    TOOLTIP: PropTypes.string,
    TOOLBAR_SHADOW: PropTypes.string,
  }),

  /**
   * A callback that receives the Slate Value object and
   * the corresponding markdown text
   */
  onChange: PropTypes.func.isRequired,

  /**
   * If true then only variables are editable in the Slate editor.
   */
  lockText: PropTypes.bool.isRequired,

  /**
   * When set to the true the contents of the editor are read-only
   */
  readOnly: PropTypes.bool,

  /**
   * An array of plugins to extend the functionality of the editor
   */
  plugins: PropTypes.arrayOf(PropTypes.shape({
    onEnter: PropTypes.func,
    onKeyDown: PropTypes.func,
    onBeforeInput: PropTypes.func,
    renderBlock: PropTypes.func,
    renderInline: PropTypes.func,
    name: PropTypes.string.isRequired,
  })),
};

/**
 * The default property values for this component
 */
SlateAsInputEditor.defaultProps = {
  value: Value.fromJSON({
    object: 'value',
    document: {
      object: 'document',
      data: {},
      nodes: [{
        object: 'block',
        type: 'paragraph',
        data: {},
        nodes: [{
          object: 'text',
          text: 'Welcome! Edit this text to get started.',
          marks: []
        }],
      }]
    }
  })
};

export default SlateAsInputEditor;
