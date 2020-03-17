import React from 'react';
import { Transforms } from 'slate';

const { SlateTransformer } = require('@accordproject/markdown-slate');
const { HtmlTransformer } = require('@accordproject/markdown-html');

export const withHtml = (editor) => {
  const { insertData } = editor;

  editor.insertData = (data) => {
    const html = data.getData('text/html');

    if (html) {
      try {
        const htmlTransformer = new HtmlTransformer();
        const slateTransformer = new SlateTransformer();
        const dom = htmlTransformer.toCiceroMark(html);
        const slate = slateTransformer.fromCiceroMark(dom);
        Transforms.insertFragment(editor, slate.document.children);
      } catch (err) {
        console.log(err);
      }
      return;
    }

    insertData(data);
  };

  return editor;
};

export default withHtml;
