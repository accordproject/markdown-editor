import isUrl from 'is-url';
import { Transforms, Editor, Range } from 'slate';

export const isLinkActive = (editor) => {
  const [link] = Editor.nodes(editor, { match: n => n.type === 'link' });
  return !!link;
};

const unwrapLink = (editor) => {
  Transforms.unwrapNodes(editor, { match: n => n.type === 'link' });
};

const wrapLink = (editor, url) => {
  if (isLinkActive(editor)) {
    unwrapLink(editor);
  }

  const { selection } = editor;
  const isCollapsed = selection && Range.isCollapsed(selection);
  // const nodeINeed = Node.fragment(editor, editor.selection);
  const link = {
    type: 'link',
    data: {
      href: url
    },
    children: isCollapsed ? [{ text: url }] : [],
  };

  if (isCollapsed) {
    Transforms.insertNodes(editor, link);
  } else {
    Transforms.wrapNodes(editor, link, { split: true });
    Transforms.collapse(editor, { edge: 'end' });
  }
};

export const insertLink = (editor, url) => {
  if (editor.selection) {
    wrapLink(editor, url);
  }
};

export const withLinks = (editor) => {
  const { insertData, insertText, isInline } = editor;

  editor.isInline = element => (element.type === 'link' ? true : isInline(element));

  editor.insertText = (text) => {
    if (text && isUrl(text)) {
      wrapLink(editor, text);
    } else {
      insertText(text);
    }
  };

  editor.insertData = (data) => {
    const text = data.getData('text/plain');

    if (text && isUrl(text)) {
      wrapLink(editor, text);
    } else {
      insertData(data);
    }
  };

  return editor;
};
