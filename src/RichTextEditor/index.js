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
  const renderElement = useCallback(props => <Element {...props} />, []);
  const renderLeaf = useCallback(props => <Leaf {...props} />, []);
  const plugins = [
    withHtml, withLinks, withImages,
    withSchema, withHistory, withReact
  ];
  const pluginList = props.plugins
    ? [...plugins, ...props.plugins]
    : [...plugins];
  const pipePlugins = (table, input) => table.reduce((current, f) => f(current), input);
  const editor = useMemo(() => pipePlugins(pluginList, createEditor()), [pluginList]);

  const hotkeyActions = {
    mark: code => toggleMark(editor, code),
    block: code => toggleBlock(editor, code),
    special: (code) => {
      if (code === 'undo') return editor.undo();
      return editor.redo();
    }
  };

  const onKeyDown = (event) => {
    const hotkeys = Object.keys(HOTKEYS);
    hotkeys.forEach((hotkey) => {
      if (isHotkey(hotkey, event)) {
        event.preventDefault();
        const { code, type } = HOTKEYS[hotkey];
        hotkeyActions[type](code);
      }
    });
  };

  return (
    <Slate editor={editor} value={props.value} onChange={value => props.onChange(value)}>
      <FormatBar lockText={props.lockText} />
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
  /* Array of plugins passed in for the editor */
  plugins: PropTypes.func,
};


export default RichTextEditor;
