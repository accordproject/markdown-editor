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
import { toggleMark } from './utilities/toolbarHelpers';
import { withImages } from './components/Image';

import FormatBar from './FormattingToolbar';

const RichTextEditor = (props) => {
  const renderElement = useCallback(props => <Element {...props} />, []);
  const renderLeaf = useCallback(props => <Leaf {...props} />, []);
  const editor = useMemo(() => withImages(withSchema(withHistory(withReact(createEditor())))), []);

  return (
    <Slate editor={editor} value={props.value} onChange={value => props.onChange(value)}>
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
              toggleMark(editor, mark);
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
