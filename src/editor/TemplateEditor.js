import Editor from "rich-markdown-editor";
import React from 'react';
import commonmark from 'commonmark';

const exampleText = `
# Contract
This is a sample contract template. You can introduce variables, like \`[{variableA}]\` or even have lists:
- add list items
- like this

\`if variableA > 10\`
This is a conditional section.
\`endif\`

Even, loops:

\`foreach var in variableA\`
- This is \`var.name\`

\`endfor\`

## Clause

The document can contain **bold**, ~~strike~~, _italic_ text or even [links](https://clause.io).

Or numbered lists:
1. Item one
1. Item two

### Sub-sub heading

This is some code:

\`define constant PI = 4.0 * atan(1.0)\`

This is a quote:

> Look before you leap!

---
# Page Two

Even page breaks are supported!
`;


/**
 * A draft.js based rich text editor that supports embedded editing of Cicero
 * clauses.
 */
export default class TemplateEditor extends React.Component {

    constructor(props) {
        super(props);
        this.props = props;
        this.editor = null;

        this.setEditorRef = (element) => {
          this.editor = element;
        };
        
        this.state = {
          value:  exampleText
        }    
      }

    handleChange() {
        console.log('Change!');
        console.log(JSON.stringify(this.editor.state.editorValue, null, 4));
      }
    
      handleSave(value) {
        console.log('Save!');
        const md = this.editor.value();

        var reader = new commonmark.Parser();
        var htmlWriter = new commonmark.HtmlRenderer({safe: true});
        var xmlWriter = new commonmark.XmlRenderer({safe: true, sourcepos: true});

        var parsed = reader.parse(md); // parsed is a 'Node' tree

        var xml = xmlWriter.render(parsed); // result is a String
        console.log(xml);

        var html = htmlWriter.render(parsed); // result is a String
        console.log(html);
      }
    

    render() {
      return (<div>
      <Editor
        readOnly={false}
        toc={true}
        defaultValue={this.props.value}
        onChange={this.handleChange.bind(this)}
        onSave={this.handleSave.bind(this)}
        ref={this.setEditorRef}
        />
        </div>)
    }
  }