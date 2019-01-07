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
      this.addPlainText(node.literal);
    }
  }

  addPlainText(value) {
    this.currentNodes.push(
      {
        object: 'text',
        leaves: [
          {
            object: 'leaf',
            text: value,
            marks: [],
          },
        ],
      });
  }

  softbreak() {
    this.addPlainText('\n');
  }

  linebreak() {
    this.addPlainText('\r\n');
  }

  link(node, entering) {
    if (entering) {
      this.addPlainText(node.destination);
      this.addPlainText(node.title);
    }
  }

  image(node, entering) {
    if (entering) {
      this.addPlainText(node.destination);
      this.addPlainText(node.title);
    }
  }

  emph(node, entering) {
  }

  strong(node, entering) {
  }

  paragraph(node, entering) {
    // const grandparent = node.parent.parent;
    // // const attrs = this.attrs(node);
    // if (grandparent !== null &&
    // grandparent.type === 'list') {
    //   if (grandparent.listTight) {
    //     return;
    //   }
    // }
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
    this.addPlainText(node.literal);
  }

  code_block(node) {
    this.addPlainText(node.literal);
  }

  thematic_break(node) {
    this.addPlainText('-----');
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
    if (this.options.safe) {
      // this.lit('<!-- raw HTML omitted -->');
    } else {
      // this.lit(node.literal);
    }
  }

  html_block(node) {
    if (this.options.safe) {
      // this.lit('<!-- raw HTML omitted -->');
    } else {
      // this.lit(node.literal);
    }
    // this.cr();
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
