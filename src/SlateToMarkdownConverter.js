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

const NL = '\n';

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

    return this.stack[this.stack.length - 2];
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
    return `# ${block.nodes[0].leaves[0].text}${NL}`;
  }

  headingtwo(block) {
    return `## ${block.nodes[0].leaves[0].text}${NL}`;
  }

  headingthree(block) {
    return `### ${block.nodes[0].leaves[0].text}${NL}`;
  }

  headingfour(block) {
    return `#### ${block.nodes[0].leaves[0].text}${NL}`;
  }

  headingfive(block) {
    return `##### ${block.nodes[0].leaves[0].text}${NL}`;
  }

  headingsix(block) {
    return `###### ${block.nodes[0].leaves[0].text}${NL}`;
  }

  paragraph(block) {
    let postfix = `${NL}${NL}`;
    const parent = this.getParent();
    if (parent) {
      if (parent.type === 'code-block' || parent.type === ('list-item')) {
        postfix = NL;
      }
    }
    return `${this.recurse(block.nodes)}${postfix}`;
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
    return `${this.recurse(block.nodes)}${NL}`;
  }

  ollist(block) {
    return `${this.recurse(block.nodes)}${NL}`;
  }

  listitem(block) {
    return this.recurse(block.nodes);
  }

  horizontalrule(block) {
    return `--- ${NL}`;
  }

  link(block) {
    return `[${block.nodes[0].leaves[0].text}](${block.data.href})`;
  }

  blockquote(block) {
    return `> ${this.recurse(block.nodes)}`;
  }

  codeblock(block) {
    const pre = `${NL}\`\`\`${NL}`;
    const post = `\`\`\`${NL}`;
    const md = this.recurse(block.nodes);
    return pre + md + post;
  }

  htmlblock(block) {
    return this.recurse(block.nodes);
  }
}
