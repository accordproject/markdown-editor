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
    this.currentNodes = null;
    this.parent = null;

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
      throw new Error('Invalid data');
    }

    return Value.fromJSON(this.root);
  }

  /* Node methods */

  document(node, entering) {
    if (entering) {
      this.currentNodes = [];
      this.parent = this.root;
      this.root = {
        document: {
          nodes: this.currentNodes,
        },
      };
    }
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

    this.currentNodes.push(text);
  }

  softbreak() {
    this.addText('\n');
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
              text: node.firstChild.literal,
            },
          ],
        },
      ],
      type: 'link',
      data: {
        href: node.destination,
      },
    };
    this.currentNodes.push(inline);
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
    if (entering) {
      this.parent = this.currentNodes;

      const block = {
        object: 'block',
        type: 'paragraph',
        nodes: [],
      };

      this.currentNodes.push(block);
      this.currentNodes = block.nodes;
    } else {
      this.currentNodes = this.parent;
    }
  }


  headingLevelConverter(level) {
    switch (level) {
      case '1':
        return 'one';
      case '2':
        return 'two';
      case '3':
        return 'three';
      case '4':
        return 'four';
      case '5':
        return 'five';
      case '6':
        return 'six';
      default:
        return 'one';
    }
  }

  heading(node, entering) {
    if (entering) {
      this.parent = this.currentNodes;
      const block = {
        object: 'block',
        type: `heading-${this.headingLevelConverter(node.level)}`,
        data: {},
        nodes: [],
      };
      this.currentNodes.push(block);
      this.currentNodes = block.nodes;
    } else {
      this.currentNodes = this.parent;
    }
  }

  code(node) {
    this.addText(node.literal, 'code');
  }

  code_block(node) {
    const block = {
      object: 'block',
      type: 'paragraph',
      nodes: [],
    };

    this.currentNodes.push(block);
    this.parent = this.currentNodes;
    this.currentNodes = block.nodes;
    this.addText(node.literal, 'code');
    this.currentNodes = this.parent;
  }

  thematic_break(node) {
    const block = {
      object: 'block',
      isVoid: true,
      type: 'horizontal-rule',
    };
    this.currentNodes.push(block);
  }

  block_quote(node, entering) {
    if (entering) {
      this.parent = this.currentNodes;
      const block = {
        object: 'block',
        type: 'block-quote',
        data: {},
        nodes: [],
      };

      this.currentNodes.push(block);
      this.currentNodes = block.nodes;
    } else {
      this.currentNodes = this.parent;
    }
  }

  list(node, entering) {
    const tagname = node.listType === 'bullet' ? 'ul-list' : 'ol-list';

    if (entering) {
      this.parent = this.currentNodes;
      const block = {
        object: 'block',
        type: tagname,
        data: {},
        nodes: [],
      };

      this.currentNodes.push(block);
      this.currentNodes = block.nodes;
    } else {
      this.currentNodes = this.parent;
    }
  }

  item(node, entering) {
    if (entering) {
      this.parent = this.currentNodes;
      const block = {
        object: 'block',
        type: 'list-item',
        data: {},
        nodes: [],
      };

      this.currentNodes.push(block);
      this.currentNodes = block.nodes;
    } else {
      this.currentNodes = this.parent;
    }
  }

  html_inline(node) {
    this.addText(node.literal);
  }

  html_block(node) {
    this.addText(node.literal);
  }

  custom_inline(node, entering) {
    if (entering && node.onEnter) {
      // this.lit(node.onEnter);
    } else if (!entering && node.onExit) {
      // this.lit(node.onExit);
    }
  }

  custom_block(node, entering) {
    // this.cr();
    if (entering && node.onEnter) {
      // this.lit(node.onEnter);
    } else if (!entering && node.onExit) {
      // this.lit(node.onExit);
    }
    // this.cr();
  }
}
