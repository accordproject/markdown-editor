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
  }

  convert(value) {
    return this.recurse(value.document.nodes);
  }

  recurse(nodes, sep = '') {
    let result = '';

    nodes.forEach((block) => {
      // console.log(block);

      try {
        let type = block.type;
        if (!type) {
          type = block.object;
        }
        const method = type.replace('-', '');
        result += `${this[method](block)}${sep}`;
      } catch (err) {
        console.log(`Failed to run method: for block ${JSON.stringify(block, null, 4)}`);
      }
    });

    return result;
  }

  headingone(block) {
    return `# ${block.nodes[0].leaves[0].text}\r\n`;
  }

  headingtwo(block) {
    return `## ${block.nodes[0].leaves[0].text}\r\n`;
  }

  headingthree(block) {
    return `### ${block.nodes[0].leaves[0].text}\r\n`;
  }

  headingfour(block) {
    return `#### ${block.nodes[0].leaves[0].text}\r\n`;
  }

  headingfive(block) {
    return `##### ${block.nodes[0].leaves[0].text}\r\n`;
  }

  headingsix(block) {
    return `###### ${block.nodes[0].leaves[0].text}\r\n`;
  }

  paragraph(block) {
    return `${this.recurse(block.nodes)}\r\n`;
  }

  text(block) {
    return block.leaves[0].text;
  }

  ullist(block) {
    return `${this.recurse(block.nodes)}\r\n`;
  }

  ollist(block) {
    return `${this.recurse(block.nodes)}\r\n`;
  }

  listitem(block) {
    return this.recurse(block.nodes, '   * ');
  }

  horizontalrule(block) {
    return '--- \n';
  }
}
