import React, {
  useEffect,
  useState,
  useRef,
  useCallback
}
  from 'react';
import { Editor, getEventTransfer } from 'slate-react';
import { Value } from 'slate';
import { Card } from 'semantic-ui-react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import baseSchema from '../schema';
// import FromMarkdown from '../markdown/fromMarkdown';
import ToMarkdown from '../markdown/toMarkdown';
import PluginManager from '../PluginManager';
import { FromHTML } from '../html/fromHTML';
import FormatToolbar from '../FormatToolbar';

import '../styles.css';

/**
 * Regex used to identify variables
 */
const regex = /{{(.*?)}}/gm;

const EditorWrapper = styled.div`
  background: #fff;
  margin: 50px;
  padding: 25px;
  font-family: serif;
  font-style: normal;
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

const ToolbarWrapper = styled.div`
  display: grid
  grid-template-columns: 60% 40%;
  grid-template-rows: 100%;
  height: 36px;
  border: 1px solid #414F58;
  background: #FFFFFF;
  box-shadow: 0 1px 4px 0 rgba(0,0,0,0.1);
  margin-bottom: 1px;
`;

const defaultValue = Value.fromJSON({
  object: 'value',
  document: {
    object: 'document',
    data: {},
    nodes: [
      {
        object: 'block',
        type: 'heading_one',
        data: {},
        nodes: [
          {
            object: 'text',
            text: 'Supply Agreement',
            marks: []
          }
        ]
      },
      {
        object: 'block',
        type: 'paragraph',
        data: {},
        nodes: [
          {
            object: 'text',
            text: 'This is a supply agreement between Party A and Party B.',
            marks: []
          }
        ]
      },
      {
        object: 'block',
        type: 'heading_one',
        data: {},
        nodes: [
          {
            object: 'text',
            text: 'Payment',
            marks: []
          }
        ]
      },
      {
        object: 'block',
        type: 'clause',
        data: {
          tag: 'clause',
          attributes: {
            src: 'https://templates.accordproject.org/archives/full-payment-upon-signature@0.7.1.cta'
          },
          attributeString: 'src = "https://templates.accordproject.org/archives/full-payment-upon-signature@0.7.1.cta"',
          content: '\n  Upon the signing of this Agreement, "Dan" shall pay the total purchase price to "Steve" in the amount of 0.01 USD.\n  ',
          closed: false
        },
        nodes: [
          {
            object: 'block',
            type: 'paragraph',
            data: {},
            nodes: [
              {
                object: 'text',
                text: '\n  Upon the signing of this Agreement, "Dan" shall pay the total purchase price to "Steve" in the amount of 0.01 USD.\n  ',
                marks: []
              }
            ]
          }
        ]
      },
      {
        object: 'block',
        type: 'heading_two',
        data: {},
        nodes: [
          {
            object: 'text',
            text: 'Late Delivery And Penalty',
            marks: []
          }
        ]
      },
      {
        object: 'block',
        type: 'clause',
        data: {
          tag: 'clause',
          attributes: {
            src: 'https://templates.accordproject.org/archives/latedeliveryandpenalty@0.13.1.cta'
          },
          attributeString: 'src = "https://templates.accordproject.org/archives/latedeliveryandpenalty@0.13.1.cta"',
          content: '\n  Late Delivery and Penalty. In case of delayed delivery except for Force Majeure cases, "Dan" (the Seller) shall pay to "Steve" (the Buyer) for every 2 days of delay penalty amounting to 10.5% of the total value of the Equipment whose delivery has been delayed. Any fractional part of a days is to be considered a full days. The total amount of penalty shall not however, exceed 55% of the total value of the Equipment involved in late delivery. If the delay is more than 15 days, the Buyer is entitled to terminate this Contract.\n  ',
          closed: false
        },
        nodes: [
          {
            object: 'block',
            type: 'paragraph',
            data: {},
            nodes: [
              {
                object: 'text',
                text: '\n  Late Delivery and Penalty. In case of delayed delivery except for Force Majeure cases, "Dan" (the Seller) shall pay to "Steve" (the Buyer) for every 2 days of delay penalty amounting to 10.5% of the total value of the Equipment whose delivery has been delayed. Any fractional part of a days is to be considered a full days. The total amount of penalty shall not however, exceed 55% of the total value of the Equipment involved in late delivery. If the delay is more than 15 days, the Buyer is entitled to terminate this Contract.\n  ',
                marks: []
              }
            ]
          }
        ]
      },
      {
        object: 'block',
        type: 'paragraph',
        data: {},
        nodes: [
          {
            object: 'text',
            text: 'End.',
            marks: []
          }
        ]
      }
    ]
  }
});

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
 * Plugins are responsible for serialization to/from markdown and HTML,
 * rendering and schema definition.
 *
 * The rich text editor is editable and the markdown text is generated from
 * the contents of the Slate editor and both are passed to the props.onChange
 * callback.
 *
 * When props.lockText is true the editor will lock all text against edits
 * except for variables.
 *
 * @param {*} props the props for the component. See the declared PropTypes
 * for details.
 */
function SlateAsInputEditor(props) {
  /**
   * A reference to the Slate Editor.
   */
  const editorRef = useRef(null);

  /**
   * Whether to show the Slate editor
   */
  const [showSlate, setShowSlate] = useState(true);

  /**
   * Current Slate Value, initialized by converting props.markdown
   * to a Slate Value
   */
  const [slateValue, setSlateValue] = useState(props.value || Value.fromJSON(defaultValue));

  /**
   * Slate Schema augmented by plugins
   */
  const [slateSchema, setSlateSchema] = useState(null);

  /**
   * Destructure props for efficiency
   */
  const {
    markdownMode, onChange, plugins, lockText
  } = props;

  /**
   * Returns true if the editor is in lockText mode
   * Note that we have to use an annotation for lockText
   * (synced with props.lockText) because Slate doesn't update
   * the Editor component when callbacks (like onBeforeInput) change.
   */
  const isEditorLockText = useCallback((editor) => {
    const { value } = editor;
    const result = value.annotations.filter(ann => (ann.type === 'lockText'));
    return result.size > 0;
  }, []);

  /**
   * Updates the Slate Schema when the plugins change
   */
  useEffect(() => {
    const schema = JSON.parse(JSON.stringify(baseSchema));
    plugins.forEach((plugin) => {
      plugin.tags.forEach((tag) => {
        schema.document.nodes[0].match.push({ type: tag });
      });
    });
    setSlateSchema(schema);
  }, [plugins]);

  /**
   * - Updates the markdown when the Slate Value or the plugins change
   */
  useEffect(() => {
    const pluginManager = new PluginManager(plugins);
    const toMarkdown = new ToMarkdown(pluginManager);
    const newMarkdown = toMarkdown.convert(slateValue);
    console.log('in useEffect markdown', newMarkdown);
    onChange(slateValue, newMarkdown);
  }, [markdownMode, onChange, plugins, slateValue]);

  /**
   * - Set a lockText annotation on the editor equal to props.lockText
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
  }, [lockText, markdownMode]);

  /**
   * When the Slate Value changes or markdownMode changes
   * we update the variable annotations.
   */
  useEffect(() => {
    if (editorRef && editorRef.current) {
      const editor = editorRef.current;

      if (isEditorLockText(editor)) {
        const { document, annotations } = editor.value;

        // Make the change to annotations without saving it into the undo history,
        // so that there isn't a confusing behavior when undoing.
        editor.withoutSaving(() => {
          annotations.forEach((ann) => {
            if (ann.type === 'variable') {
              editor.removeAnnotation(ann);
            }
          });

          // eslint-disable-next-line no-restricted-syntax
          for (const [node, path] of document.texts()) {
            const { key, text } = node;
            let m = regex.exec(text);

            while (m) {
              // This is necessary to avoid infinite loops with zero-width matches
              if (m.index === regex.lastIndex) {
                regex.lastIndex += 1;
              }

              for (let groupIndex = 0; groupIndex < m.length; groupIndex += 1) {
                const match = m[groupIndex];

                if (groupIndex === 1) {
                  const focus = regex.lastIndex - match.length - 2;
                  const anchor = regex.lastIndex - 2;

                  const annotation = {
                    key: `variable-${uuidv4()}`,
                    type: 'variable',
                    anchor: { path, key, offset: focus - 1 },
                    focus: { path, key, offset: anchor },
                  };
                  editor.addAnnotation(annotation);
                }
              }
              m = regex.exec(text);
            }
          }
        });
      }
    }
  // @ts-ignore
  }, [editorRef, isEditorLockText, lockText, slateValue.document]);

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
        return <code {...attributes}>{children}</code>;
      case 'error':
        return <span className='error'{...attributes}>{children}</span>;
      default:
        return next();
    }
  }, []);

  /**
   * Render Slate annotations.
   */
  // @ts-ignore
  const renderAnnotation = useCallback((props, editor, next) => {
    const { children, annotation, attributes } = props;

    switch (annotation.type) {
      case 'variable':
        return (
          <span {...attributes} className='variable'>
            {children}
          </span>
        );
      default:
        return next();
    }
  }, []);

  /**
  * Returns true if the anchor is inside a variable
  * @param {*} value the Slate editor value
  * @param {*} anchor the anchor point
  */
  const isInVariableEx = useCallback(((value, anchor) => {
    const result = value.annotations.filter(ann => (ann.type === 'variable' && anchor.isInRange(ann)));
    return result.size > 0;
  }), []);

  /**
  * Returns true if the selection is inside a variable
  * @param {*} value the Slate editor value
  */
  const isInVariable = useCallback(value => isInVariableEx(value, value.selection.anchor), [isInVariableEx]);


  /**
  * Returns true if the editor should allow an edit. Edits are allowed for all
  * text unless the lockText parameter is set in the state of the editor, in which
  * case only variables are editable.
  * @param {Editor} editor the Slate Editor
  */
  const isEditable = useCallback((editor) => {
    if (isEditorLockText(editor)) {
      const { value } = editor;
      // prevent removing the variable by protecting the first character
      const newAnchor = value.selection.anchor.moveBackward(1).normalize(value.document);
      return isInVariableEx(value, newAnchor) && isInVariable(value);
    }

    return true;
  }, [isEditorLockText, isInVariable, isInVariableEx]);

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

    // protect characters to prevent removal of variables
    const newAnchor = value.selection.anchor.moveBackward(2).normalize(value.document);

    if (isEditorLockText(editor)
      && !(isInVariableEx(value, newAnchor) && isInVariable(value))) {
      event.preventDefault(); // prevent editing non-editable text
      return undefined;
    }

    if (selection.isExpanded) return next();
    if (selection.start.offset !== 0) return next();

    const { startBlock } = value;
    if (startBlock.type === 'paragraph') return next();

    event.preventDefault();
    editor.setBlocks('paragraph');

    // if (startBlock.type === 'list_item') {
    //   editor.unwrapBlock('list');
    // }

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

    if (!isEditable(editor) || isInVariable(value)) {
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
    if (isEditable(editor)) {
      const transfer = getEventTransfer(event);
      if (transfer.type !== 'html') return next();
      const pluginManager = new PluginManager(props.plugins);
      const fromHtml = new FromHTML(pluginManager);
      // @ts-ignore
      const { document } = fromHtml.convert(editor, transfer.html);
      editor.insertFragment(document);
      return undefined;
    }

    return false;
  };

  /**
   * Toggle whether to show the Slate editor
   * or the Markdown editor
   */
  const toggleShowSlate = () => {
    setShowSlate(!showSlate);
  };

  /**
   * When in lockText mode prevent edits to non-variables
   * @param {*} event
   * @param {*} editor
   * @param {*} next
   */
  const onBeforeInput = ((event, editor, next) => {
    if (isEditable(editor)) {
      return next();
    }

    event.preventDefault();
    return false;
  });
  /**
   * Render the static-editing toolbar.
   */
  const renderEditor = useCallback((props, editor, next) => {
    const children = next();
    const pluginManager = new PluginManager(props.plugins);

    return (
      <div>
        <FormatToolbar
          editor={editor}
          pluginManager={pluginManager}
        />
        {children}
      </div>
    );
  }, []);

  /**
   * Render the component, based on showSlate
   */
  const card = <Card fluid>
  <Card.Content>
  <EditorWrapper>
              <
// @ts-ignore
              Editor
              ref={editorRef}
              className="doc-inner"
              value={slateValue}
              onChange={({ value }) => {
                setSlateValue(value);
              }}
              schema={slateSchema}
              plugins={props.plugins}
              onBeforeInput={onBeforeInput}
              onKeyDown={onKeyDown}
              onPaste={onPaste}
              renderBlock={renderBlock}
              renderInline={renderInline}
              renderMark={renderMark}
              renderAnnotation={renderAnnotation}
              renderEditor={renderEditor}/>
    </EditorWrapper>
  </Card.Content>
</Card>;

  return (
    <div>
      <ToolbarWrapper id="toolbarwrapperid" />
      <Card.Group>
        {card}
      </Card.Group>
    </div>
  );
}

/**
 * The property types for this component
 */
SlateAsInputEditor.propTypes = {
  /**
   * Initial contents for the editor (slate value)
   */
  value: PropTypes.object,

  /**
   * A callback that receives the Slate Value object and
   * the corresponding markdown text
   */
  onChange: PropTypes.func.isRequired,

  /**
   * When set the Slate editor is read-only and updated
   * from markdown state.
   */
  markdownMode: PropTypes.bool,

  /**
   * If true (and iff not in markdownMode) then
   * only variables are editable in the Slate editor.
   */
  lockText: PropTypes.bool.isRequired,

  /**
   * If true then show the edit button.
   */
  showEditButton: PropTypes.bool,

  /**
   * An array of plugins to extend the functionality of the editor
   */
  plugins: PropTypes.arrayOf(PropTypes.shape({
    onEnter: PropTypes.func,
    onKeyDown: PropTypes.func,
    onBeforeInput: PropTypes.func,
    renderBlock: PropTypes.func.isRequired,
    renderInline: PropTypes.func,
    toMarkdown: PropTypes.func.isRequired,
    fromMarkdown: PropTypes.func.isRequired,
    fromHTML: PropTypes.func.isRequired,
    plugin: PropTypes.string.isRequired,
    tags: PropTypes.arrayOf(PropTypes.string).isRequired,
    markdownTags: PropTypes.arrayOf(PropTypes.string).isRequired,
    schema: PropTypes.object.isRequired,
  })),
};
/**
 * The default property values for this component
 */
SlateAsInputEditor.defaultProps = {
  showEditButton: true,
};

export default SlateAsInputEditor;
