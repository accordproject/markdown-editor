import React, {
  useCallback, useMemo, useState
} from 'react';
import { CiceroMarkTransformer } from '@accordproject/markdown-cicero';
import { HtmlTransformer } from '@accordproject/markdown-html';
import { SlateTransformer } from '@accordproject/markdown-slate';
import isHotkey from 'is-hotkey';
import { Editable, withReact, Slate } from 'slate-react';
import { Node, createEditor, Transforms } from 'slate';
import { withHistory } from 'slate-history';
import PropTypes from 'prop-types';
import HOTKEYS, {
  ENTER, ENTER_BREAKS, formattingHotKeys
} from './utilities/hotkeys';
import withSchema from './utilities/schema';
import Element from './components';
import Leaf from './components/Leaf';
import { toggleMark, toggleBlock } from './utilities/toolbarHelpers';
import { withImages, insertImage } from './plugins/withImages';
import { withLinks, isSelectionLinkBody } from './plugins/withLinks';
import { withHtml } from './plugins/withHtml';
import FormatBar from './FormattingToolbar';

const RichTextEditor = (props) => {
  const [showLinkModal, setShowLinkModal] = useState(false);
  const { augmentEditor } = props;
  const renderLeaf = useCallback(props => <Leaf {...props} />, []);
  const editor = useMemo(() => {
    if (augmentEditor) {
      return augmentEditor(
        withLinks(withHtml(withImages(withSchema(withHistory(withReact(createEditor()))))))
      );
    }
    return withLinks(withHtml(withImages(withSchema(withHistory(withReact(createEditor()))))));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renderElement = useCallback((slateProps) => {
    const elementProps = { ...slateProps, customElements: props.customElements };
    return (<Element {...elementProps} />);
  }, [props.customElements]);

  const hotkeyActions = {
    mark: code => toggleMark(editor, code),
    block: code => toggleBlock(editor, code),
    image: () => {
      const url = window.prompt('Enter the URL of the image:');
      if (url) {
        insertImage(editor, url);
      }
    },
    special: (code) => {
      if (code === 'undo') return editor.undo();
      return editor.redo();
    },
    link: () => {
      setShowLinkModal(true);
    },
  };

  const { isEditable, canBeFormatted } = props;

  const onKeyDown = useCallback((event) => {
    if (isHotkey(ENTER, event)) {
      // eslint-disable-next-line no-restricted-syntax
      for (const [n] of Node.ancestors(editor, editor.selection.focus.path, { reverse: true })) {
        if (ENTER_BREAKS[n.type]) {
          const currNode = Node.get(editor, editor.selection.focus.path);
          if (currNode.object === 'text' && currNode.text === '') {
            Transforms.unwrapNodes(editor, { match: n => ENTER_BREAKS[n.type], split: true });
            return;
          }
        }
      }
    }

    const canFormat = canBeFormatted(editor);
    const isFormatEvent = () => formattingHotKeys.some(hotkey => isHotkey(hotkey, event));
    if (!canFormat && isFormatEvent()) {
      event.preventDefault();
      return;
    }

    const hotkeys = Object.keys(HOTKEYS);
    hotkeys.forEach((hotkey) => {
      if (isHotkey(hotkey, event)) {
        event.preventDefault();
        const { code, type } = HOTKEYS[hotkey];
        hotkeyActions[type](code);
      }
    });
  }, [canBeFormatted, editor, hotkeyActions]);

  const onBeforeInput = useCallback((event) => {
    const canEdit = isEditable(editor, event);
    if (!canEdit) {
      event.preventDefault();
    }
  }, [editor, isEditable]);

  const handleCopyOrCut = useCallback((event) => {
    event.preventDefault();
    const slateTransformer = new SlateTransformer();
    const htmlTransformer = new HtmlTransformer();
    const ciceroMarkTransformer = new CiceroMarkTransformer();

    // The "JSON" from Slate is immutable
    // https://github.com/ianstormtaylor/slate/issues/3577
    // We need to take a functional approach
    // https://github.com/accordproject/markdown-transform/issues/203
    const SLATE_CHILDREN = JSON.parse(JSON.stringify(Node.fragment(editor, editor.selection)));
    const SLATE_DOM = {
      object: 'value',
      document: {
        object: 'document',
        data: {},
        children: SLATE_CHILDREN
      }
    };

    const CICERO_MARK_DOM = slateTransformer.toCiceroMark(SLATE_DOM);
    const HTML_DOM = htmlTransformer.toHtml(CICERO_MARK_DOM);
    const MARKDOWN_TEXT = ciceroMarkTransformer.toMarkdown(CICERO_MARK_DOM);

    event.clipboardData.setData('text/html', HTML_DOM);
    event.clipboardData.setData('text/plain', MARKDOWN_TEXT);
  }, [editor]);

  const onChange = (value) => {
    if (props.readOnly) return;
    props.onChange(value, editor);
    const { selection } = editor;
    if (selection && isSelectionLinkBody(editor)) {
      setShowLinkModal(true);
    }
  };

  return (
    <Slate editor={editor} value={props.value} onChange={onChange}>
      { !props.readOnly
        && <FormatBar
        lockText={props.lockText}
        canBeFormatted={props.canBeFormatted}
        showLinkModal={showLinkModal}
        setShowLinkModal={setShowLinkModal}
        /> }
      <Editable
        className="ap-rich-text-editor"
        readOnly={props.readOnly}
        renderElement={renderElement}
        renderLeaf={renderLeaf}
        placeholder="Enter some rich text…"
        spellCheck
        autoFocus
        onKeyDown={onKeyDown}
        onDOMBeforeInput={onBeforeInput}
        onCopy={event => handleCopyOrCut(event)}
        onCut={event => handleCopyOrCut(event)}
      />
    </Slate>
  );
};

/**
 * The property types for this component
 */
RichTextEditor.propTypes = {
  /* Initial contents for the editor (markdown text) */
  value: PropTypes.array.isRequired,
  /* Props for the editor */
  editorProps: PropTypes.object.isRequired,
  /* A callback that receives the markdown text */
  onChange: PropTypes.func.isRequired,
  /* Boolean to make editor read-only (uneditable) or not (editable) */
  readOnly: PropTypes.bool,
  /* Boolean to lock non variable text */
  lockText: PropTypes.bool,
  /* Higher order function to augment the editor methods */
  augmentEditor: PropTypes.func,
  /* Array of plugins passed in for the editor */
  customElements: PropTypes.object,
  /* A method that determines if current edit should be allowed */
  isEditable: PropTypes.func,
  /* A method that determines if current formatting change should be allowed */
  canBeFormatted: PropTypes.func,
};

RichTextEditor.defaultProps = {
  isEditable: () => true,
  canBeFormatted: () => true,
};


export default RichTextEditor;
