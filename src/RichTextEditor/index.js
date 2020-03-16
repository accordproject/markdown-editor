import React, { useCallback, useMemo } from 'react';
import isHotkey from 'is-hotkey';
import {
  Editable, withReact, Slate
} from 'slate-react';
import { createEditor } from 'slate';
import { withHistory } from 'slate-history';
import PropTypes from 'prop-types';
import HOTKEYS from './hotkeys';
import withSchema from './schema';
import Element from './renderElement';
import Leaf from './renderLeaf';
import * as ACTIONS from './actions';
import * as IMAGE from './components/image';

import { FormatBar } from './components/toolbar';

const RichTextEditor = (props) => {
  const renderElement = useCallback(props => <Element {...props} />, []);
  const renderLeaf = useCallback(props => <Leaf {...props} />, []);
  const editor = useMemo(() => IMAGE.withImages(withSchema(withHistory(withReact(createEditor())))), []);

  return (
    <Slate editor={editor} value={props.value} onChange={ value => props.onChange(value)}>
      <FormatBar/>
      <Editable
        renderElement={renderElement}
        renderLeaf={renderLeaf}
        placeholder="Enter some rich text…"
        spellCheck
        autoFocus
        onKeyDown={(event) => {
          const hotkeys = Object.keys(HOTKEYS);
          for (let n = 0; n < hotkeys.length; n += 1) {
            const hotkey = hotkeys[n];
            if (isHotkey(hotkey, event)) {
              event.preventDefault();
              const mark = HOTKEYS[hotkey];
              ACTIONS.toggleMark(editor, mark);
            }
          }
        }}
      />
    </Slate>
  );
};

/**
 * The property types for this component
 */
RichTextEditor.propTypes = {
  /**
   * Initial contents for the editor (markdown text)
   */
  value: PropTypes.array.isRequired,

  /**
   * Props for the editor
   */
  editorProps: PropTypes.object.isRequired,

  /**
   * A callback that receives the markdown text
   */
  onChange: PropTypes.func.isRequired,

  /**
   * Boolean to make editor read-only (uneditable) or not (editable)
   */
  readOnly: PropTypes.bool,

  /**
   * Boolean to lock non variable text
   */
  lockText: PropTypes.bool,
};


export default RichTextEditor;
