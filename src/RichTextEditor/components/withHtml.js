import React from 'react';
import { jsx } from 'slate-hyperscript';
import { Transforms } from 'slate';
import * as SCHEMA from '../utilities/schema';

export const deserialize = (el) => {
  if (el.nodeType === 3) {
    return el.textContent;
  } if (el.nodeType !== 1) {
    return null;
  } if (el.nodeName === 'BR') {
    return '\n';
  }

  const { nodeName } = el;
  let parent = el;

  if (
    nodeName === 'PRE'
    && el.childNodes[0]
    && el.childNodes[0].nodeName === 'CODE'
  ) {
    parent = el.childNodes[0];
  }
  const children = Array.from(parent.childNodes)
    .map(deserialize)
    .flat();

  if (el.nodeName === 'BODY') {
    return jsx('fragment', {}, children);
  }

  if (SCHEMA.HTML_TAGS[nodeName]) {
    const attrs = SCHEMA.HTML_TAGS[nodeName](el);
    return jsx('element', attrs, children);
  }

  if (SCHEMA.HTML_TEXT_TAGS[nodeName]) {
    const attrs = SCHEMA.HTML_TEXT_TAGS[nodeName](el);
    return children.map(child => jsx('text', attrs, child));
  }

  return children;
};

export const withHtml = (editor) => {
  const { insertData } = editor;

  editor.insertData = (data) => {
    const html = data.getData('text/html');

    if (html) {
      const parsed = new DOMParser().parseFromString(html, 'text/html');
      const fragment = deserialize(parsed.body);
      Transforms.insertFragment(editor, fragment);
      return;
    }

    insertData(data);
  };

  return editor;
};

export default withHtml;
