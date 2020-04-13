/* eslint-disable no-param-reassign */
import { Transforms, Node } from 'slate';

export const isSelectionLink = editor => Node.parent(editor, editor.selection.focus.path).type === 'link';

export const unwrapLink = (editor) => {
  Transforms.unwrapNodes(editor, { match: n => n.type === 'link' });
};

const wrapLink = (editor, url, text) => {
  const link = {
    type: 'link',
    data: {
      href: url
    },
    children: text ? [{ text }] : [{ text: url }],
  };

  Transforms.removeNodes(editor, { match: n => n.type === 'link' });
  Transforms.insertNodes(editor, link);
};

export const insertLink = (editor, url, text) => {
  if (editor.selection) {
    wrapLink(editor, url, text);
  }
};

export const withLinks = (editor) => {
  const { isInline } = editor;

  editor.isInline = element => (element.type === 'link' ? true : isInline(element));

  return editor;
};
