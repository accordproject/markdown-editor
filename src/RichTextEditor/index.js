import React, { useCallback, useMemo } from 'react';
import isHotkey from 'is-hotkey';
import {
  Editable, withReact, Slate
} from 'slate-react';
import { createEditor } from 'slate';
import { withHistory } from 'slate-history';
import PropTypes from 'prop-types';
import HOTKEYS from './utilities/hotkeys';
import withSchema from './utilities/schema';
import Element from './components/Element';
import Leaf from './components/Leaf';
import { toggleMark, toggleBlock } from './utilities/toolbarHelpers';
import { withImages } from './components/withImages';
import { withLinks } from './components/withLinks';
import { withHtml } from './components/withHtml';
import FormatBar from './FormattingToolbar';

const RichTextEditor = (props) => {
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

  const hotkeyActions = {
    mark: code => toggleMark(editor, code),
    block: code => toggleBlock(editor, code),
    special: (code) => {
      if (code === 'undo') return editor.undo();
      return editor.redo();
    }
  };

  const { isEditable } = props;

  const onKeyDown = useCallback((event) => {
    const canEdit = isEditable ? isEditable(editor, event) : true;
    if (!canEdit) {
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
  }, [editor, hotkeyActions, isEditable]);


  const renderElement = useCallback((slateProps) => {
    const elementProps = { ...slateProps, customElements: props.customElements };
    return (<Element {...elementProps} />);
  }, [props.customElements]);


  const onChange = (value) => {
    if (props.readOnly) return;
    props.onChange(value, editor);
  };

  return (
    <Slate editor={editor} value={props.value} onChange={onChange}>
      { !props.readOnly && <FormatBar lockText={props.lockText} /> }
      <Editable
        readOnly={props.readOnly}
        renderElement={renderElement}
        renderLeaf={renderLeaf}
        placeholder="Enter some rich text…"
        spellCheck
        autoFocus
        onKeyDown={onKeyDown}
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
};


export default RichTextEditor;
