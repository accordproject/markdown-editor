import React from "react";
import Enzyme, { shallow } from "enzyme";
import SlateAsInputEditor from "./index";
import Adapter from "enzyme-adapter-react-16";

import NoEdit from '../../src/plugins/noedit';
import List from '../../src/plugins/list';
import { SlateTransformer } from '@accordproject/markdown-slate';

const plugins = [NoEdit(), List()];

Enzyme.configure({adapter: new Adapter()});

// Default markdown value
let defaultValue = `My Heading
====

This is text. This is *italic* text. This is **bold** text. This is a [link](https://clause.io). This is \`inline code\`.

This is ***bold and italic*** text

> This is a quote.

Heading Two
----

This is more text.

Ordered lists:

1. one
2. two
3. three

Or:

- apples
- pears
- peaches

### Sub heading

This is more text.

Horizontal Rule
====

---

Fin.`;

const slateTransformer = new SlateTransformer();
const propsObj = { width: '600px'};

const onSlateValueChange = () => {
    // A dummy onChange props
  };

describe("SlateAsInputEditor component", () => {
    test("component mount", () => {
        let slateValue = slateTransformer.fromMarkdown(defaultValue);
        const wrapper = shallow(<SlateAsInputEditor readOnly={false} lockText={true} plugins={plugins} value={slateValue} onChange={onSlateValueChange} editorProps={propsObj} />);
        expect(wrapper.find('.doc-inner').length).toBe(1);
    });

    test("successful roundtrip", () => {
        let slateValue = slateTransformer.fromMarkdown(defaultValue);
        const markdown = slateTransformer.toMarkdown(slateValue);
    
        expect(markdown).toEqual(defaultValue);
    });
})