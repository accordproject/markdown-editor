/* eslint-disable class-methods-use-this */
import Markdown from './Markdown';

const NL = '\n';

/**
 * A plugin-based Slate -> Markdown converter.
 */
const text = (node) => {
  let result = '';

  const isBold = node.marks.some(mark => mark.type === 'bold');
  const isItalic = node.marks.some(mark => mark.type === 'italic');
  const isUnderline = node.marks.some(mark => mark.type === 'underline');
  const isCode = node.marks.some(mark => mark.type === 'code');
  const isVariable = node.marks.some(mark => mark.type === 'variable');
  let openMark = '';
  let closeMark = '';

  if (isBold) {
    openMark = '**';
    closeMark = '**';
  }

  if (isItalic) {
    openMark += '*';
    closeMark += '*';
  }

  if (isUnderline) {
    openMark += '__';
    closeMark += '__';
  }

  if (isVariable) {
    openMark += '{{';
    closeMark += '}}';
  }

  if (isCode) {
    openMark += '`';
    closeMark += '`';
  }

  result += openMark + node.text + closeMark;

  return result;
};

export default class ToMarkdown extends Markdown {
  constructor(pluginManager) {
    super(pluginManager);
    this.stack = [];
    this.first = false;
  }

  convert(value) {
    return this.recursive(value.document.nodes);
  }

  recursive(nodes) {
    let markdown = '';

    nodes.forEach((node, index) => {
      this.stack.push(node);
      if (index === 0) {
        this.setFirst(true);
      } else {
        this.setFirst(false);
      }

      switch (node.object) {
        case 'text':
          markdown += text(node);
          break;
        case 'block':
        case 'inline': {
          const method = Markdown.camelCase(node.type);

          if (typeof this[method] === 'function') {
            markdown += this[method](node);
          } else {
            const pluginType = (node.type === 'video') ? 'video' : 'list';
            const plugin = this.pluginManager.findPluginByMarkdownTag(pluginType);

            if (plugin && typeof plugin.toMarkdown === 'function') {
              try {
                markdown += plugin.toMarkdown(this, node, this.stack.length);
              } catch (err) {
                console.log(`Exception from ${plugin.plugin}: ${err.message}`);
              }
            } else {
              throw new Error(`Cannot find a handler for ${method} with ${node}`);
            }
          }
        }
          break;
        default:
      }

      this.stack.pop();
    });

    return markdown;
  }

  getParent() {
    if (!this.stack || this.stack.length < 1) {
      return null;
    }

    return this.stack[this.stack.length - 2];
  }

  setFirst(first) {
    this.first = first;
  }

  isFirst() {
    return this.first;
  }

  paragraph(node) {
    let prefix = `${NL}${NL}`;
    const parent = this.getParent();

    if (parent) {
      if (parent.type === 'code_block' || parent.type === ('list_item')) {
        prefix = NL;
      }
    }

    if (this.isFirst()) {
      prefix = '';
    }

    return `${prefix}${this.recursive(node.nodes)}`;
  }

  static getTextFromNode(node) {
    return node.nodes.get(0).text;
  }

  link(node) {
    return `[${ToMarkdown.getTextFromNode(node)}](${node.data.get('href')})`;
  }

  // eslint-disable-next-line no-unused-vars
  horizontalRule(node) {
    return `${NL}${NL}---`;
  }

  blockQuote(node) {
    return `${NL}> ${this.recursive(node.nodes)}`;
  }

  // blockList(node) {
  //   const md = this.recursive(node.nodes);
  //   const open = '1. ';
  //   return NL + open + md + NL;
  // }

  headingOne(node) {
    return `${NL}${NL}# ${ToMarkdown.getTextFromNode(node)}`;
  }

  headingTwo(node) {
    return `${NL}${NL}## ${ToMarkdown.getTextFromNode(node)}`;
  }

  headingThree(node) {
    return `${NL}${NL}### ${ToMarkdown.getTextFromNode(node)}`;
  }

  headingFour(node) {
    return `${NL}${NL}#### ${ToMarkdown.getTextFromNode(node)}`;
  }

  headingFive(node) {
    return `${NL}${NL}##### ${ToMarkdown.getTextFromNode(node)}`;
  }

  headingSix(node) {
    return `${NL}${NL}###### ${ToMarkdown.getTextFromNode(node)}`;
  }

  htmlBlock(node) {
    return NL + NL + this.recursive(node.nodes);
  }

  htmlInline(node) {
    return this.recursive(node.nodes);
  }

  codeBlock(node) {
    // eslint-disable-next-line no-useless-escape
    const quote = '\`\`\`';
    const md = this.recursive(node.nodes);
    return quote + NL + md + quote;
  }
}
