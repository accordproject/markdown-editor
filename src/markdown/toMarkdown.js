const NL = '\n';

export class ToMarkdown {
    constructor() {
        this.stack = [];
    }

    convert(editor, value) {
        return this.recursive(editor, value.document.nodes);
    }

    recursive(editor, nodes) {
        let markdown = "";

        nodes.forEach(node => {
            this.stack.push(node);

            switch (node.object) {
                case 'text':
                    markdown += this.text(editor, node);
                    break;
                case 'block':
                case 'inline':
                    const method = node.type.replace('-', '_');

                    if (typeof this[method] === 'function') {
                        markdown += this[method](editor, node);
                    } else {
                        const plugin = editor.getPlugin(node.type);

                        if (plugin && typeof plugin.toMarkdown === "function") {
                            markdown += plugin.toMarkdown(editor, node);
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

    text(editor, node) {
        let result = "";

        node.leaves.forEach(leaf => {
            const isBold = leaf.marks.some(mark => mark.type === "bold");
            const isItalic = leaf.marks.some(mark => mark.type === "italic");
            const isCode = leaf.marks.some(mark => mark.type === "code");
            let mark = "";

            if (isBold) {
                mark = "**";
            }

            if (isItalic) {
                mark += "*";
            }

            if (isCode) {
                mark += "`";
            }

            result += mark + leaf.text + mark;
        });

        return result;
    }

    paragraph(editor, node) {
        let postfix = `${NL}${NL}`;
        const parent = this.getParent();

        if (parent) {
            if (parent.type === 'code_block' || parent.type === ('list_item')) {
                postfix = NL;
            }
        }

        return `${this.recursive(editor, node.nodes)}${postfix}`;
    }

    link(editor, node) {
        return `[${node.nodes.get(0).leaves.get(0).text}](${node.data.get('href')})`;
    }

    horizontal_rule(editor, node) {
        return `--- \n`;
    }

    block_quote(editor, node) {
        return `> ${this.recursive(editor, node.nodes)}${NL}`;
    }

    heading_one(editor, node) {
        return `# ${node.nodes.get(0).leaves.get(0).text}${NL}`;
    }

    heading_two(editor, node) {
        return `## ${node.nodes.get(0).leaves.get(0).text}${NL}`;
    }

    heading_three(editor, node) {
        return `### ${node.nodes.get(0).leaves.get(0).text}${NL}`;
    }

    heading_four(editor, node) {
        return `#### ${node.nodes.get(0).leaves.get(0).text}${NL}`;
    }

    heading_five(editor, node) {
        return `##### ${node.nodes.get(0).leaves.get(0).text}${NL}`;
    }

    heading_six(editor, node) {
        return `###### ${node.nodes.get(0).leaves.get(0).text}${NL}`;
    }

    html_block(editor, node) {
        return this.recursive(editor, node.nodes);
    }

    code_block(editor, node) {
        const pre = `${NL}\`\`\`${NL}`;
        const post = `\`\`\`${NL}`;
        const md = this.recursive(editor, node.nodes);
        return pre + md.trim() + NL + post;
    }
}