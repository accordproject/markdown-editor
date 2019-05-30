import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { Checkbox, Segment } from 'semantic-ui-react';
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

const defaultMarkdown2 = 'Foo <variable src="bar">a variable</variable> within it.';

const defaultMarkdown = `# Heading One
This is text. This is *italic* text. This is **bold** text. This is a [link](https://clause.io). This is \`inline code\`.

This is ***bold and italic*** text

<variable src="baz">
this is some content
</variable>

This is a <variable src="foo"/> sentence that ***contains*** <variable src="bar">a variable</variable> within it. And here is {{another}} with some text after.
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


/**
 * Simple demo component that tracks whether to lockText
 * and whether to use markdown mode.
 */
function Demo() {
  /**
   * Whether to lock text
   */
  const [lockText, setLockText] = useState(true);

  /**
   * Whether use markdown mode
   */
  const [markdownMode, setMarkdownMode] = useState(false);

  /**
   * Toggle whether to lock the text
   */
  const toggleLockText = () => {
    setLockText(!lockText);
  };

  /**
   * Toggle whether to use markdown model
   */
  const toggleMarkdownMode = () => {
    setMarkdownMode(!markdownMode);
  };

  return (
    <div>
      <Segment raised>
        <Checkbox toggle label='Lock Text' onChange={toggleLockText} checked={lockText} />
      </Segment>
      <Segment raised>
        <Checkbox toggle label='Markdown Mode' onChange={toggleMarkdownMode} checked={markdownMode} />
      </Segment>
      <MarkdownEditor plugins={plugins} lockText={lockText} markdownMode={markdownMode} markdown={defaultMarkdown} onChange={storeLocal}/>
    </div>
  );
}

ReactDOM.render(<Demo/>, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
