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
  useCallback, 
  createElement
}
  from 'react';
import { Editor, getEventTransfer } from 'slate-react';
import { Value } from 'slate';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import baseSchema from '../schema';
import PluginManager from '../PluginManager';
import { FromHTML } from '../html/fromHTML';
import FormatToolbar from '../FormattingToolbar';

import '../styles.css';

const EditorWrapper = styled.div`
  background: #fff;
  min-height: 750px;
  max-width: ${props => props.width || 'none'};
  min-width: ${props => props.width || 'none'};
  border: 1px solid #979797;
  border-radius: 10px;
  margin: 50px auto;
  padding: 20px;
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
`;

const ToolbarWrapper = styled.div`
  position: sticky;
  z-index: 1;
  top: 0;
  height: 36px;
  background: ${props => props.TOOLBAR_BACKGROUND || '#FFF'};
  box-shadow: ${props => props.TOOLBAR_SHADOW || 'none'};
`;

const Heading = ({ type, children }) =>
  createElement(
    styled(type)`
      font-family: 'serif';
    `,
    {},
    children,
  );

Heading.propTypes = {
  type: PropTypes.oneOf(['h1', 'h2', 'h3', 'h4', 'h5', 'h6']),
};

const Code = ({ customCssObject, children }) => 
  createElement(
    styled("code")({
      ...customCssObject
    }),
    {},
    children,
  );

Code.PropTypes = {
  customCssObject: PropTypes.object // Fix Me
};
/**
 * a utility function to generate a random node id for annotations
 */
function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    // eslint-disable-next-line no-bitwise
    const r = Math.random() * 16 | 0;
    // eslint-disable-next-line no-bitwise, no-mixed-operators
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
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
    onChange, plugins, value, lockText
  } = props;

  const editorProps = props.editorProps || Object.create(null);

  const codeStyle = props.codeStyle || Object.create(null);

  /**
   * A reference to the Slate Editor.
   */
  const editorRef = ref || useRef(null);

  /**
   * Slate Schema augmented by plugins
   */
  const [slateSchema, setSlateSchema] = useState(null);

  /**
   * Returns true if the editor is in lockText mode
   * Note that we have to use an annotation for lockText
   * (synced with props.lockText) because Slate doesn't update
   * the Editor component when callbacks (like onBeforeInput) change.
   */
  const isEditorLockText = useCallback((editor) => {
    const { value } = editor;
    if (!value.annotations) {
      return false;
    }
    const result = value.annotations.filter(ann => (ann.type === 'lockText'));
    return result.size > 0;
  }, []);

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
   * Set a lockText annotation on the editor equal to props.lockText
   */
  useEffect(() => {
    if (editorRef && editorRef.current) {
      const editor = editorRef.current;
      const { annotations, selection } = editor.value;

      editor.withoutSaving(() => {
        annotations.forEach((ann) => {
          if (ann.type === 'lockText') {
            editor.removeAnnotation(ann);
          }
        });

        if (lockText) {
          // it doesn't matter where we put the annotation
          // so we use the current selection
          const annotation = {
            key: `lockText-${uuidv4()}`,
            type: 'lockText',
            anchor: selection.anchor,
            focus: selection.focus,
          };
          editor.addAnnotation(annotation);
        }
      });
    }
  }, [value.document, lockText, editorRef]);

  /**
   * Render a Slate inline.
   */
  // @ts-ignore
  const renderInline = useCallback((props, editor, next) => {
    const { attributes, children, node } = props;

    switch (node.type) {
      case 'link': {
        const { data } = node;
        const href = data.get('href');
        return <a {...attributes} href={href}>{children}</a>;
      }
      case 'html_inline': {
        return <span className='html_inline' {...attributes}>{children}</span>;
      }

      default: {
        return next();
      }
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
        return <Heading type="h1" children={children} {...attributes} />;
      case 'heading_two':
        return <Heading type="h2" children={children} {...attributes} />;
      case 'heading_three':
        return <Heading type="h3" children={children} {...attributes} />;
      case 'heading_four':
        return <Heading type="h4" children={children} {...attributes} />;
      case 'heading_five':
        return <Heading type="h5" children={children} {...attributes} />;
      case 'heading_six':
        return <Heading type="h6" children={children} {...attributes} />;
      case 'horizontal_rule':
        return <hr {...attributes} />;
      case 'block_quote':
        return <blockquote {...attributes}>{children}</blockquote>;
      case 'code_block':
        return <pre {...attributes}>{children}</pre>;
      case 'html_block':
        return <pre {...attributes}>{children}</pre>;
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
      case 'underline':
        return <u {...{ attributes }}>{children}</u>;
      case 'html':
      case 'code':
        return <Code customCssObject={codeStyle} children={children} {...attributes} />;
      case 'error':
        return <span className='error'{...attributes}>{children}</span>;
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
    if (isEditorLockText(editor)) {
      const { value } = editor;
      const pluginManager = new PluginManager(props.plugins);
      return pluginManager.isEditable(value, code);
    }

    return true;
  }, [isEditorLockText, props.plugins]);

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

    if (isEditorLockText(editor)
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

    if (isExpanded) return next();

    const { startBlock } = value;
    if (end.offset !== startBlock.text.length) return next();

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
  const onKeyDown = (event, editor, next) => {
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
    if (isEditable(editor, 'paste')) {
      const transfer = getEventTransfer(event);
      if (transfer.type === 'html') {
        const pluginManager = new PluginManager(props.plugins);
        const fromHtml = new FromHTML(pluginManager);
        // @ts-ignore
        const { document } = fromHtml.convert(editor, transfer.html);
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
    const pluginManager = new PluginManager(props.plugins);

    return (
      <div>
        <FormatToolbar
          editor={editor}
          pluginManager={pluginManager}
          editorProps={editorProps}
        />
        {children}
      </div>
    );
  }, [editorProps]);

  const onChangeHandler = ({ value }) => {
    onChange(value);
  };

  return (
    <div>
      <ToolbarWrapper {...editorProps} id="slate-toolbar-wrapper-id" />
      <EditorWrapper width={editorProps.WIDTH}>
        <Editor
          ref={editorRef}
          className="doc-inner"
          value={Value.fromJSON(value)}
          readOnly={props.readOnly}
          onChange={onChangeHandler}
          schema={slateSchema}
          plugins={props.plugins}
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
    TOOLBAR_BACKGROUND: PropTypes.string,
    TOOLTIP_BACKGROUND: PropTypes.string,
    TOOLTIP: PropTypes.string,
    TOOLBAR_SHADOW: PropTypes.string,
    WIDTH: PropTypes.string,
  }),

  /**
   * Optional styling props for codeblock
   * currently too vague as it will accept a style object
   */
  codeStyle: PropTypes.object 

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
