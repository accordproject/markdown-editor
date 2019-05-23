import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { MarkdownEditor } from '../../src';
import * as serviceWorker from './serviceWorker';
import 'semantic-ui-css/semantic.min.css';
import List from '../../src/plugins/list';
import Video from '../../src/plugins/video';

const plugins = [List(), Video()];

function storeLocal(value, markdown) {
  // console.log(markdown);
  localStorage.setItem('markdown-editor', markdown);
}

const defaultMarkdown = `# Heading One
This is text. This is *italic* text. This is **bold** text. This is a [link](https://clause.io). This is \`inline code\`.

This is ***bold and italic*** text

This is a sentence that ***contains*** {{"a variable"}} within it. And here is {{another}} with some text after.
And here is more {{variables}}% with newlines and {{punctuation}} and text.

> This is a quote.
## Heading Two
This is more text.

Ordered lists:

1. one
1. two
1. three

Or:

* apples
* pears
* peaches

### Sub heading

Video:

<video/>

Another video:

<video src="https://www.youtube.com/embed/cmmq-JBMbbQ"/>`;

ReactDOM.render(<MarkdownEditor plugins={plugins} lockText={true} markdownMode={false} markdown={defaultMarkdown} onChange={storeLocal}/>, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
