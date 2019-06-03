import React, { useState, useCallback } from 'react';
import {
  Divider, Grid, Segment
} from 'semantic-ui-react';

import ReactDOM from 'react-dom';
import './index.css';
import MarkdownAsInputEditor from '../../src/MarkdownAsInputEditor';
import SlateAsInputEditor from '../../src/SlateAsInputEditor';

import * as serviceWorker from './serviceWorker';
import 'semantic-ui-css/semantic.min.css';
import List from '../../src/plugins/list';
import Video from '../../src/plugins/video';

const plugins = [List(), Video()];

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
   * Current Slate Value
   */
  const [slateValue, setSlateValue] = useState();

  /**
   * Called when the markdown changes
   */
  const onMarkdownChange = useCallback((slateValue, markdown) => {
    localStorage.setItem('markdown-editor', markdown);
    console.log('onMarkdownChange', markdown);
    setSlateValue(slateValue);
  }, []);

  /**
   * Called when the Slate Value changes
   */
  const onSlateValueChange = useCallback((slateValue, markdown) => {
    localStorage.setItem('slate-editor-value', slateValue);
    console.log('onSlateValueChange', markdown);
  }, []);

  return (
    <div>
      <Segment>
    <Grid columns={2}>
      <Grid.Column>
        <MarkdownAsInputEditor plugins={plugins} markdown={defaultMarkdown} onChange={onMarkdownChange}/>
      </Grid.Column>

      <Grid.Column>
        <SlateAsInputEditor readOnly={false} lockText={false} plugins={plugins} value={slateValue} onChange={onSlateValueChange}/>
      </Grid.Column>
    </Grid>
    <Divider vertical>Preview</Divider>
  </Segment>
    </div>
  );
}

ReactDOM.render(<Demo/>, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
