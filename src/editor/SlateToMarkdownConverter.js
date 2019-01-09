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

/* Libraries */

/**
 * This class converts a Slate.js JSON value object to Markdown text.
 *
 * Please refer to schema.js for details of the Slate.js nodes.
 */
export default class SlateToMarkdownConverter {
  constructor(options = {}) {
    this.options = options;
    this.stack = [];
  }

  convert(value) {
    return this.recurse(value.document.nodes);
  }

  findParentList() {
    for (let n = this.stack.length - 1; n >= 0; n -= 1) {
      const node = this.stack[n];
      if (node.type === 'ol-list' || node.type === 'ul-list') {
        return node;
      }
    }

    return null;
  }

  getParent() {
    if (!this.stack || this.stack.length < 1) {
      return null;
    }

    return this.stack[this.stack.length - 1];
  }

  recurse(nodes) {
    let result = '';

    nodes.forEach((block) => {
      try {
        let type = block.type;
        if (!type) {
          type = block.object;
        }
        this.stack.push(block);
        const method = type.replace('-', '');
        result += this[method](block);
        this.stack.pop();
      } catch (err) {
        console.log(`Failed to convert block ${JSON.stringify(block, null, 4)} : ${err}`);
      }
    });

    return result;
  }

  headingone(block) {
    return `# ${block.nodes[0].leaves[0].text}\r\n\r\n`;
  }

  headingtwo(block) {
    return `## ${block.nodes[0].leaves[0].text}\r\n\r\n`;
  }

  headingthree(block) {
    return `### ${block.nodes[0].leaves[0].text}\r\n\r\n`;
  }

  headingfour(block) {
    return `#### ${block.nodes[0].leaves[0].text}\r\n\r\n`;
  }

  headingfive(block) {
    return `##### ${block.nodes[0].leaves[0].text}\r\n\r\n`;
  }

  headingsix(block) {
    return `###### ${block.nodes[0].leaves[0].text}\r\n\r\n`;
  }

  paragraph(block) {
    return `${this.recurse(block.nodes)}\r\n\r\n`;
  }

  text(block) {
    let result = '';

    const list = this.findParentList();

    let sep = '';

    if (list) {
      if (list.type === 'ol-list') {
        sep = '   1. ';
      } else {
        sep = '   * ';
      }
    }

    block.leaves.forEach((leaf) => {
      const isBold = leaf.marks.some(mark => mark.type === 'bold');
      const isItalic = leaf.marks.some(mark => mark.type === 'italic');
      const isCode = leaf.marks.some(mark => mark.type === 'code');

      let mark = '';
      if (isBold) {
        mark = '**';
      }

      if (isItalic) {
        mark += '*';
      }

      if (isCode) {
        mark += '`';
      }

      result += (sep + mark + leaf.text + mark);
    });
    return result;
  }

  ullist(block) {
    return `${this.recurse(block.nodes)}\r\n`;
  }

  ollist(block) {
    return `${this.recurse(block.nodes)}\r\n`;
  }

  listitem(block) {
    return this.recurse(block.nodes);
  }

  horizontalrule(block) {
    return '--- \n';
  }

  link(block) {
    return `[${block.nodes[0].leaves[0].text}](${block.data.href})`;
  }

  blockquote(block) {
    return `> ${this.recurse(block.nodes)}`;
  }

  codeblock(block) {
    return `\`\`\`\r\n${this.recurse(block.nodes)}\r\n\`\`\``;
  }
}
