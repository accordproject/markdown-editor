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
import commonmark from 'commonmark';
import { Value } from 'slate';
import Stack from './Stack';
import Markdown from './Markdown';

/**
 * Converts markdown text to a Slate.js value object.
 * The markdown text is parsed using Common Mark.
 * Custom HTML blocks are dispatched to a plugin.
 */
export default class FromMarkdown extends Markdown {
  constructor(pluginManager) {
    super(pluginManager);

    this.markMapping = {
      strong: 'bold',
      emph: 'italic',
      under: 'underline',
    };
  }

  /**
   * Converts markdown text to a Slate.js Value object.
   * @param {*} markdownText
   * @return {Object} the Slate.js Value object
   */
  convert(markdownText) {
    this.marks = ['code', 'strong', 'emph', 'under'];

    const reader = new commonmark.Parser();
    const parsed = reader.parse(markdownText);
    const walker = parsed.walker();
    let event;
    event = walker.next();

    while (event) {
      const { node } = event;
      const method = Markdown.camelCase(node.type);

      if (typeof this[method] === 'function') {
        this[method](node, event);
      } else if (!this.dispatchToPlugin(node, event)) {
        console.log(`Didn't find a method ${method} to handle the node: ${node.type}`);
      }

      event = walker.next();
    }

    if (!this.root) {
      throw new Error('Failed to parse document.');
    }

    // VariableMarker.markVariables(this.root);
    return Value.fromJSON(this.root);
  }

  /**
   * Any nodes that are not processed by this class are dispatched to the
   * PluginManager.
   *
   * @param {*} node
   * @param {*} event
   * @param {*} tag
   */
  dispatchToPlugin(node, event, tag = null) {
    const plugin = this.pluginManager.findPluginByMarkdownTag(tag ? tag.tag : node.type);

    if (plugin && typeof plugin.fromMarkdown === 'function') {
      return plugin.fromMarkdown(this.stack, event, tag);
    }

    return false;
  }

  /**
   * Parses an HTML block and extracts the attributes, tag name and tag contents.
   * @param {string} string
   * @return {Object} - a tag object that holds the data for the html block
   */
  static parseHtmlBlock(string) {
    try {
      const doc = (new DOMParser()).parseFromString(string, 'text/html');
      const item = doc.body.children.item(0);
      const { attributes } = doc.body.children.item(0);
      const attributeObject = {};
      let attributeString = '';

      for (let i = 0; i < attributes.length; i += 1) {
        attributeString += `${attributes[i].name} = "${attributes[i].value}"`;
        attributeObject[attributes[i].name] = attributes[i].value;
      }

      const tag = {
        tag: item.nodeName.toLowerCase(),
        attributes: attributeObject,
        attributeString,
        content: item.textContent,
      };

      return tag;
    } catch (err) {
      return null;
    }
  }

  /**
   * Handles the markdown document AST node, modifying the
   * Stack.
   * @param {*} node the AST node
   * @param {*} event the parse event
   */
  document(node, event) {
    if (event.entering) {
      this.root = {
        document: {
          nodes: [],
        },
      };

      this.stack = new Stack();
      this.stack.push(this.root.document, false);
    }
  }

  /**
   * Handles the markdown text AST node, modifying the
   * Stack.
   * @param {*} node the AST node
   */
  text(node) {
    if (node.parent && ['link'].includes(node.parent.type)) {
      return;
    }

    const leaf = {
      object: 'leaf',
      text: node.literal,
      marks: this.getMarks(node),
    };

    this.stack.addTextLeaf(leaf);
  }

  /**
   * Converts from commonmark marks to Slate.js marks.
   * @param {*} node the AST node
   * @return {*} an array of Slate.js marks
   */
  getMarks(node) {
    const marks = [];
    let { parent } = node;

    while (parent) {
      if (!this.marks.includes(parent.type)) {
        break;
      }

      marks.push({
        object: 'mark',
        type: this.markMapping[parent.type] ? this.markMapping[parent.type] : parent.type,
        data: {},
      });

      parent = parent.parent;
    }

    return marks;
  }

  /**
   * Handles the paragraph AST node, modifying the
   * Stack.
   * @param {*} node the AST node
   * @param {*} event the parse event
   */
  paragraph(node, event) {
    if (!['item', 'block_quote'].includes(node.parent.type)) {
      if (event.entering) {
        const block = {
          object: 'block',
          type: 'paragraph',
          data: {},
          nodes: [],
        };

        this.stack.push(block);
      } else {
        this.stack.pop();
      }
    }
  }

  /**
   * Handles the emph AST node, modifying the
   * Stack.
   */
  under() {
  // handled by text
  }

  /**
   * Handles the emph AST node, modifying the
   * Stack.
   */
  emph() {
  // handled by text
  }

  /**
   * Handles the strong AST node, modifying the
   * Stack.
   */
  strong() {
  // handled by text
  }

  /**
   * Handles the softbreak AST node, modifying the
   * Stack.
   */
  softbreak() {
    this.stack.addTextLeaf({
      object: 'leaf',
      text: '\n',
      marks: [],
    });
  }

  /**
   * Handles the linebreak AST node, modifying the
   * Stack.
   */
  linebreak() {
    this.stack.addTextLeaf({
      object: 'leaf',
      text: '  \n',
      marks: [],
    });
  }

  /**
   * Handles the thematic-break AST node, modifying the
   * Stack.
   */
  thematicBreak() {
    const block = {
      object: 'block',
      isVoid: true,
      type: 'horizontal_rule',
    };
    this.stack.append(block);
  }

  /**
   * Handles the code AST node, modifying the
   * Stack.
   * @param {*} node the AST node
   */
  code(node) {
    const leaf = {
      object: 'leaf',
      text: node.literal,
      marks: [{
        object: 'mark',
        type: 'code',
        data: {},
      }],
    };

    this.stack.addTextLeaf(leaf);
  }

  /**
   * Handles the code-bloc AST node, modifying the
   * Stack.
   * @param {*} node the AST node
   */
  codeBlock(node) {
    const block = {
      object: 'block',
      type: 'code_block',
      data: {},
      nodes: [],
    };

    const para = {
      object: 'block',
      type: 'paragraph',
      data: {},
      nodes: [],
    };

    this.stack.push(block);
    this.stack.push(para);
    this.stack.addTextLeaf({
      object: 'leaf',
      text: node.literal,
      marks: [],
    });
    this.stack.pop();
    this.stack.pop();
  }

  /**
   * Handles the html-inline AST node, modifying the
   * Stack.
   * @param {*} node the AST node
   */
  htmlInline(node) {
    const leaf = {
      object: 'leaf',
      text: node.literal,
      marks: [{
        object: 'mark',
        type: 'html',
        data: {},
      }],
    };

    this.stack.addTextLeaf(leaf);
  }

  /**
   * Handles the html-block AST node, modifying the
   * Stack.
   */
  htmlBlock(node, event) {
    const tag = FromMarkdown.parseHtmlBlock(node.literal);

    if (tag && this.dispatchToPlugin(node, event, tag)) {
    // console.log('Custom html tag:', tag, "\n", 'Node:', node);
    } else {
      const block = {
        object: 'block',
        type: 'html_block',
        data: {},
        nodes: [],
      };

      const para = {
        object: 'block',
        type: 'paragraph',
        data: {},
        nodes: [],
      };

      this.stack.push(block);
      this.stack.push(para);
      this.stack.addTextLeaf({
        object: 'leaf',
        text: node.literal,
        marks: [{
          object: 'mark',
          type: 'html',
          data: {},
        }],
      });
      this.stack.pop();
      this.stack.pop();
    }
  }

  static headingLevelConverter(level) {
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

  heading(node, event) {
    if (event.entering) {
      const block = {
        object: 'block',
        type: `heading_${FromMarkdown.headingLevelConverter(node.level)}`,
        data: {},
        nodes: [],
      };
      this.stack.push(block);
    } else {
      this.stack.pop();
    }
  }

  blockQuote(node, event) {
    if (event.entering) {
      const block = {
        object: 'block',
        type: 'block_quote',
        data: {},
        nodes: [],
      };
      this.stack.push(block);
    } else {
      this.stack.pop();
    }
  }

  link(node, event) {
    if (event.entering) {
      const inline = {
        object: 'inline',
        type: 'link',
        data: { href: node.destination },
        nodes: [{
          object: 'text',
          text: node.title ? node.title : node.firstChild.literal,
          marks: this.getMarks(node),
        }],
      };

      this.stack.append(inline);
    }
  }
}
