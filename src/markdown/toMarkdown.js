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

    node.leaves.forEach((leaf) => {
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

      result += mark + leaf.text + mark;
    });

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

  link(node) {
    return `[${node.nodes.get(0).leaves.get(0).text}](${node.data.get('href')})`;
  }

  horizontalRule(node) {
    return `--- \n`;
  }

  blockQuote(node) {
    return `> ${this.recursive(node.nodes)}${NL}`;
  }

  headingOne(node) {
    return `# ${node.nodes.get(0).leaves.get(0).text}${NL}`;
  }

  headingTwo(node) {
    return `## ${node.nodes.get(0).leaves.get(0).text}${NL}`;
  }

  headingThree(node) {
    return `### ${node.nodes.get(0).leaves.get(0).text}${NL}`;
  }

  headingFour(node) {
    return `#### ${node.nodes.get(0).leaves.get(0).text}${NL}`;
  }

  headingFive(node) {
    return `##### ${node.nodes.get(0).leaves.get(0).text}${NL}`;
  }

  headingSix(node) {
    return `###### ${node.nodes.get(0).leaves.get(0).text}${NL}`;
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
