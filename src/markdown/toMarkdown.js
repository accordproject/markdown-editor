import Markdown from './Markdown';

const NL = '\n';

export default class ToMarkdown extends Markdown {
  constructor(pluginManager) {
    super(pluginManager);
    this.stack = [];
  }

  convert(value) {
    return this.recursive(value.document.nodes);
  }

  recursive(nodes) {
    let markdown = '';

    nodes.forEach((node) => {
      this.stack.push(node);

      switch (node.object) {
        case 'text':
          markdown += this.text(node);
          break;
        case 'block':
        case 'inline': {
          const method = Markdown.camelCase(node.type);

          if (typeof this[method] === 'function') {
            markdown += this[method](node);
          } else {
            const plugin = this.pluginManager.findPluginByMarkdownTag(node.type);

            if (plugin && typeof plugin.toMarkdown === 'function') {
              try {
                markdown += plugin.toMarkdown(this, node);
              } catch (err) {
                console.log(`Exception from ${plugin.plugin}: ${err.message}`);
              }
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

  text(node) {
    let result = '';

    const isBold = node.marks.some(mark => mark.type === 'bold');
    const isItalic = node.marks.some(mark => mark.type === 'italic');
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
  }

  paragraph(node) {
    let postfix = `${NL}${NL}`;
    const parent = this.getParent();

    if (parent) {
      if (parent.type === 'code_block' || parent.type === ('list_item')) {
        postfix = NL;
      }
    }

    return `${this.recursive(node.nodes)}${postfix}`;
  }

  static getTextFromNode(node) {
    return node.nodes.get(0).text;
  }

  link(node) {
    return `[${ToMarkdown.getTextFromNode(node)}](${node.data.get('href')})`;
  }

  horizontalRule(node) {
    return `--- \n`;
  }

  blockQuote(node) {
    return `> ${this.recursive(node.nodes)}${NL}`;
  }

  headingOne(node) {
    return `# ${ToMarkdown.getTextFromNode(node)}${NL}`;
  }

  headingTwo(node) {
    return `## ${ToMarkdown.getTextFromNode(node)}${NL}`;
  }

  headingThree(node) {
    return `### ${ToMarkdown.getTextFromNode(node)}${NL}`;
  }

  headingFour(node) {
    return `#### ${ToMarkdown.getTextFromNode(node)}${NL}`;
  }

  headingFive(node) {
    return `##### ${ToMarkdown.getTextFromNode(node)}${NL}`;
  }

  headingSix(node) {
    return `###### ${ToMarkdown.getTextFromNode(node)}${NL}`;
  }

  htmlBlock(node) {
    return this.recursive(node.nodes);
  }

  codeBlock(node) {
    const pre = `${NL}\`\`\`${NL}`;
    const post = `\`\`\`${NL}`;
    const md = this.recursive(node.nodes);
    return pre + md.trim() + NL + post;
  }
}
