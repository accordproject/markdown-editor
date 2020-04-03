import { Transforms } from 'slate';
import { CiceroMarkTransformer } from '@accordproject/markdown-cicero';
import { HtmlTransformer } from '@accordproject/markdown-html';
import { SlateTransformer } from '@accordproject/markdown-slate';

/* eslint no-param-reassign: 0 */
export const withHtml = (editor) => {
  const { insertData } = editor;

  editor.insertData = (data) => {
    const HTML_DOM = data.getData('text/html');
    const PLAIN_DOM = data.getData('text/plain');
    console.log('HTML_DOM???', HTML_DOM);
    console.log('PLAIN_DOM>>>', PLAIN_DOM);
    if (HTML_DOM) {
      console.log('HTML_DOM FIRED');
      try {
        const htmlTransformer = new HtmlTransformer();
        const slateTransformer = new SlateTransformer();
        // const CICERO_MARK_DOM = htmlTransformer.toCiceroMark(HTML_DOM);
        const SLATE_DOM = slateTransformer
          .fromCiceroMark(htmlTransformer.toCiceroMark(HTML_DOM));
        Transforms.insertFragment(editor, SLATE_DOM.document.children);
      } catch (err) {
        console.error(err);
      }
      return;
    }
    if (PLAIN_DOM) {
      console.log('PLAIN_DOM FIRED');
      try {
        // const htmlTransformer = new HtmlTransformer();
        const slateTransformer = new SlateTransformer();
        const ciceroMarkTransformer = new CiceroMarkTransformer();
        const CICERO_MARK_DOM = ciceroMarkTransformer.fromMarkdown(PLAIN_DOM, 'json');
        console.log('CICERO_MARK_DOM FIRED', CICERO_MARK_DOM);
        const SLATE_DOM = slateTransformer.fromCiceroMark(CICERO_MARK_DOM);
        console.log('SLATE_DOM FIRED', SLATE_DOM);
        Transforms.insertFragment(editor, SLATE_DOM.document.children);
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
