import { Transforms } from 'slate';
import { SlateTransformer } from '@accordproject/markdown-slate';
import { HtmlTransformer } from '@accordproject/markdown-html';

/* eslint no-param-reassign: 0 */
export const withHtml = (editor) => {
  const { insertData } = editor;

  editor.insertData = (data, externalHTML) => {
    const html = externalHTML || data.getData('text/html');

    if (html) {
      try {
        const htmlTransformer = new HtmlTransformer();
        const slateTransformer = new SlateTransformer();
        const dom = htmlTransformer.toCiceroMark(html);
        const slate = slateTransformer.fromCiceroMark(dom);
        Transforms.insertFragment(editor, slate.document.children);
      } catch (err) {
        console.error(err);
      }
      return;
    }

    insertData(data);
  };

  return editor;
};

export default withHtml;
