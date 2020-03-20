import { Editor, Transforms } from 'slate';
import * as SCHEMA from './schema';

export const isBlockActive = (editor, format) => {
  const [match] = Editor.nodes(editor, {
    match: n => n.type === format,
  });

  return !!match;
};

export const isMarkActive = (editor, format) => {
  const marks = Editor.marks(editor);
  return marks ? marks[format] === true : false;
};

export const toggleBlock = (editor, format) => {
  const isActive = isBlockActive(editor, format);
  const isList = SCHEMA.LIST_TYPES.includes(format);

  Transforms.unwrapNodes(editor, {
    match: n => SCHEMA.LIST_TYPES.includes(n.type),
    split: true,
  });

  /* eslint no-nested-ternary: 0 */
  Transforms.setNodes(editor, {
    type: isActive
      ? SCHEMA.PARAGRAPH
      : isList
        ? SCHEMA.LIST_ITEM
        : format,
  });

  if (!isActive && isList) {
    const block = { type: format, children: [], data: { tight: true } };
    Transforms.wrapNodes(editor, block);
  }
};

export const toggleMark = (editor, format) => {
  const isActive = isMarkActive(editor, format);

  if (isActive) {
    Editor.removeMark(editor, format);
  } else {
    Editor.addMark(editor, format, true);
  }
};

export const toggleHistory = (editor, format) => {
  if (format === 'undo') {
    editor.undo();
  } else { editor.redo(); }
};
