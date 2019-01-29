/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Value } from 'slate';

/* Libraries */
import commonmark from 'commonmark';

/**
 * This class parses Markdown text using the commonmark parser
 * and then converts the AST to a Slate.js JSON value.
 *
 * Please refer to schema.js for details of the Slate.js nodes.
 */
export default class MarkdownToSlateConverter {
  constructor(options = {}) {
    this.options = options;
  }

  dump() {
    // console.log(JSON.stringify(this.root, null, 4));
  }

  convert(markdownText) {
    this.root = null;
    this.nodeStack = [];

    const reader = new commonmark.Parser();
    const parsed = reader.parse(markdownText);

    const walker = parsed.walker();
    let event;
    event = walker.next();

    while (event) {
      const type = event.node.type;
      // console.log(`Converting: ${type}`);

      if (this[type]) {
        // console.log(event.node);

        this[type](event.node, event.entering);
        this.dump();
      } else {
        console.log(`Unrecognized node: ${type}`);
      }

      event = walker.next();
    }

    if (this.root.document.nodes.length < 1) {
      this.root = {
        document: {
          nodes: [],
        },
      };
    }

    return Value.fromJSON(this.root);
  }

  /* Node methods */

  document(node, entering) {
    if (entering) {
      this.root = {
        document: {
          nodes: [],
        },
      };
    }

    this.push(this.root.document, false);
  }

  text(node, entering) {
    if (entering) {
      if (node.parent) {
        switch (node.parent.type) {
          case 'strong':
            this.addText(node.literal, 'bold');
            break;
          case 'emph':
            this.addText(node.literal, 'italic');
            break;
          case 'link':
            this.addLink(node.parent);
            break;
          default:
            this.addText(node.literal);
        }
      }
    }
  }

  addText(value, markType) {
    const text = {
      object: 'text',
      leaves: [
        {
          object: 'leaf',
          text: value,
          marks: [],
        },
      ],
    };

    if (markType) {
      const mark =
        {
          object: 'mark',
          type: markType,
          data: {},
        };

      text.leaves[0].marks.push(mark);
    }
    this.append(text);
  }

  peek() {
    return this.nodeStack[this.nodeStack.length - 1];
  }

  push(obj, append = true) {
    // console.log('push');
    if (append) {
      this.append(obj);
    }
    this.nodeStack.push(obj);
    // console.log(this.nodeStack);
  }

  append(obj) {
    // console.log('append');

    const top = this.peek();
    if (top && top.nodes) {
      top.nodes.push(obj);
    } else {
      throw new Error(`Cannot append. Invalid stack: ${JSON.stringify(this.nodeStack, null, 4)}`);
    }
    // console.log(this.nodeStack);
  }

  pop() {
    // console.log('pop');
    return this.nodeStack.pop();
    // console.log(this.nodeStack);
  }

  softbreak() {
    this.addText(' \r');
  }

  linebreak() {
    this.addText('\r\n');
  }

  link(node, entering) {
    // handled by text()
  }

  addLink(node) {
    const inline = {
      object: 'inline',
      nodes: [
        {
          object: 'text',
          leaves: [
            {
              text: node.title ? node.title : node.firstChild.literal,
            },
          ],
        },
      ],
      type: 'link',
      data: {
        href: node.destination,
      },
    };
    this.append(inline);
  }

  image(node, entering) {
    if (entering) {
      this.addText(node.destination);
      this.addText(node.title);
    }
  }

  emph(node, entering) {
    // handled by text()
  }

  strong(node, entering) {
    // handled by text()
  }

  paragraph(node, entering) {
    if(!["item", "block_quote"].includes(node.parent.type)) {
      if (entering) {
        const block = {
          object: 'block',
          type: 'paragraph',
          nodes: [],
        };

        this.push(block);
      } else {
        this.pop();
      }
    }
  }


  headingLevelConverter(level) {
    switch (level) {
      case 1:
        return 'one';
      case 2:
        return 'two';
      case 3:
        return 'three';
      case 4:
        return 'four';
      case 5:
        return 'five';
      case 6:
        return 'six';
      default:
        return 'one';
    }
  }

  heading(node, entering) {
    if (entering) {
      const block = {
        object: 'block',
        type: `heading-${this.headingLevelConverter(node.level)}`,
        data: {},
        nodes: [],
      };
      this.push(block);
    } else {
      this.pop();
    }
  }

  code(node) {
    this.addText(node.literal, 'code');
  }

  code_block(node) {
    const block = {
      object: 'block',
      type: 'code-block',
      nodes: [],
    };

    const para = {
      object: 'block',
      type: 'paragraph',
      nodes: [],
    };

    this.push(block);
    this.push(para);
    this.addText(node.literal, 'code');
    this.pop();
    this.pop();
  }

  thematic_break(node) {
    const block = {
      object: 'block',
      isVoid: true,
      type: 'horizontal-rule',
    };
    this.append(block);
  }

  block_quote(node, entering) {
    if (entering) {
      const block = {
        object: 'block',
        type: 'block-quote',
        data: {},
        nodes: [],
      };
      this.push(block);
    } else {
      this.pop();
    }
  }

  list(node, entering) {
    const tagname = node.listType === 'bullet' ? 'ul-list' : 'ol-list';

    if (entering) {
      const block = {
        object: 'block',
        type: tagname,
        data: {},
        nodes: [],
      };

      this.push(block);
    } else {
      this.pop();
    }
  }

  item(node, entering) {
    if (entering) {
      const block = {
        object: 'block',
        type: 'list-item',
        data: {},
        nodes: [],
      };

      this.push(block);
    } else {
      this.pop();
    }
  }

  html_inline(node) {
    // console.log(node);
    this.addText(node.literal, 'html');
  }

  html_block(node) {
    // console.log(node);
    const block = {
      object: 'block',
      type: 'html-block',
      nodes: [],
    };

    const para = {
      object: 'block',
      type: 'paragraph',
      nodes: [],
    };

    this.push(block);
    this.push(para);
    this.addText(node.literal, 'html');
    this.pop();
    this.pop();
  }

  custom_inline(node, entering) {
    this.html_inline(node);
  }

  custom_block(node, entering) {
    this.html_block(node);
  }
}
