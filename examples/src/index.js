import React, { useState, useCallback } from 'react';
import {
  Divider, Grid, Segment
} from 'semantic-ui-react';

import ReactDOM from 'react-dom';
import { SlateTransformer } from '@accordproject/markdown-slate';

import './index.css';
import MarkdownAsInputEditor from '../../src/MarkdownAsInputEditor';
import SlateAsInputEditor from '../../src/SlateAsInputEditor';

import * as serviceWorker from './serviceWorker';
import 'semantic-ui-css/semantic.min.css';

const slateTransformer = new SlateTransformer();

const defaultMarkdown = `# My Heading

This is text. This is *italic* text. This is **bold** text. This is a [link](https://clause.io). This is \`inline code\`.

This is ***bold and italic*** text.

This is a
softbreak.

This is a  
linebreak.

![ap_logo](https://docs.accordproject.org/docs/assets/020/template.png "AP triangle")

> This is a quote.
## Heading Two
This is more text.

Before a thematic break.

---

After a thematic break.

Ordered lists:

1. one
1. two
1. three

Or:

* apples
* pears
* peaches

### Sub heading

This is more text.

Fin.
`;

const propsObj = {
  WIDTH: '600px',
};


/**
 * Simple demo component that tracks whether to lockText
 * and whether to use markdown mode.
 */
function Demo() {
  /**
   * Current Slate Value
   */
  const [slateValue, setSlateValue] = useState(slateTransformer.fromMarkdown(defaultMarkdown));
  const [markdown, setMarkdown] = useState(defaultMarkdown);

  /**
   * Called when the markdown changes
   */
  const onMarkdownChange = useCallback((markdown) => {
    localStorage.setItem('markdown-editor', markdown);
  }, []);

  /**
   * Called when the Slate Value changes
   */
  const onSlateValueChange = useCallback((slateValue) => {
    localStorage.setItem('slate-editor-value', JSON.stringify(slateValue.toJSON()));
    const markdown = slateTransformer.toMarkdown(slateValue);
    setSlateValue(slateValue);
    setMarkdown(markdown);
  }, []);

  return (
    <div>
      <Segment>
        <Grid columns={2}>
          <Grid.Column>
            <MarkdownAsInputEditor
              readOnly={true}
              markdown={markdown}
              onChange={onMarkdownChange}
            />
          </Grid.Column>

          <Grid.Column>
            <SlateAsInputEditor
              readOnly={false}
              lockText={true}
              value={slateValue}
              onChange={onSlateValueChange}
              editorProps={propsObj}
            />
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
