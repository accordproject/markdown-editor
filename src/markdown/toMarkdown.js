const NL = '\n';

export class ToMarkdown {
    convert(editor, value) {
        return this.recursive(editor, value.document.nodes);
    }

    recursive(editor, nodes) {
        let markdown = "";

        nodes.forEach(node => {
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
        });

        return markdown;
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
        return `${this.recursive(editor, node.nodes)}${NL}${NL}`;
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
}