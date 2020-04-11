import React, { useState, useCallback } from 'react';
import {
  Divider, Grid, Segment
} from 'semantic-ui-react';

import ReactDOM from 'react-dom';
import { SlateTransformer } from '@accordproject/markdown-slate';

import './index.css';
import MarkdownTextEditor from '../../src/MarkdownTextEditor';
import RichTextEditor from '../../src/RichTextEditor';

import * as serviceWorker from './serviceWorker';
import 'semantic-ui-css/semantic.min.css';

const slateTransformer = new SlateTransformer();

const defaultMarkdown = `# My Heading

This is text. This is *italic* text. This is **bold** text. This is a [link](https://clause.io). This is \`inline code\`.

This is ***bold and italic*** text.

## Breaks
This is a  
hard break.

This is a
softbreak.

---

This ^^^^ is a thematic break

![ap_logo](https://docs.accordproject.org/docs/assets/020/template.png "AP triangle")

> This is a quote.
## Heading Two
This is more text.

Below is a code block:

\`\`\` javascript
this is my great
code
\`\`\`

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

<custom>
This is an html block.
</custom>

And this is <variable>an HTML inline</variable>.

# H1
## H2
### H3
#### H4
#### H5
##### H6

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
  const [slateValue, setSlateValue] = useState(() => {
    const slate = slateTransformer.fromMarkdown(defaultMarkdown);
    console.log(slate);
    return slate.document.children;
  });
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
  const onSlateValueChange = useCallback((slateChildren) => {
    localStorage.setItem('slate-editor-value', JSON.stringify(slateChildren));
    const slateValue = {
      document: {
        children: slateChildren
      }
    };
    const markdown = slateTransformer.toMarkdown(slateValue);
    setSlateValue(slateValue.document.children);
    setMarkdown(markdown);
  }, []);

  return (
    <div>
      <Segment>
        <Grid columns={2}>
          <Grid.Column>
            <MarkdownTextEditor
              readOnly={true}
              markdown={markdown}
              onChange={onMarkdownChange}
            />
          </Grid.Column>

          <Grid.Column className="demo-rich-text-editor">
            <RichTextEditor
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
