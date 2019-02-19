import commonmark from 'commonmark';
import { Value } from 'slate';

export class FromMarkdown {
    constructor() {
        this.markMapping = {
            'strong': 'bold',
            'emph': 'italic'
        };
    }

    convert(editor, markdownText) {
        this.editor = editor;
        this.root = {
            document: {
                nodes: []
            }
        };
        this.stack = [];
        this.marks = ['code', 'strong', 'emph'];

        const reader = new commonmark.Parser();
        const parsed = reader.parse(markdownText);
        const walker = parsed.walker();
        let event;
        event = walker.next();

        while (event) {
            const node = event.node;
            const method = node.type.replace('-', '_');

            if (typeof this[method] === 'function') {
                this[method](node, event);
            } else {
                if (!this.plugin_handle(node, event)) {
                    console.log(`Unrecognized node: ${node.type}`);
                }
            }

            event = walker.next();
        }

        // console.log(JSON.stringify(this.root));
        return Value.fromJSON(this.root);
    }

    plugin_handle(node, event, tag = null) {
        const plugin = this.editor.getPlugin(tag ? tag.tag : node.type, 'markdownTags', true);

        if (plugin && typeof plugin.fromMarkdown === "function") {
            const markdown = plugin.fromMarkdown(this.editor, event, tag);
            // console.log('Output:', markdown);

            if (markdown === undefined) {
                return true;
            }

            if (markdown.constructor === Array) {
                for (const temp of markdown) {
                    this[temp.action](temp.block);
                }
            } else {
                this[markdown.action](markdown.block);
            }
            return true;
        }

        return false;
    }

    /********** Helpers **********/

    peek() {
        return this.stack[this.stack.length - 1];
    }

    push(obj, appendItem = true) {
        if (appendItem) {
            this.append(obj);
        }

        this.stack.push(obj);
    }

    append(obj) {
        const top = this.peek();

        if (top && top.nodes) {
            top.nodes.push(obj);
        } else {
            throw new Error(`Cannot append. Invalid stack: ${JSON.stringify(this.stack, null, 4)}`);
        }
    }

    pop() {
        return this.stack.pop();
    }

    addTextLeaf(leaf) {
        const top = this.peek();
        const lastNode = top.nodes.length > 0 ? top.nodes[top.nodes.length - 1] : null;

        if (lastNode && lastNode.object === 'text') {
            lastNode.leaves.push(leaf);
        } else {
            this.append({ object: 'text', leaves: [leaf] });
        }
    }

    getHTMLTag(string) {
        const match = string.match(/^<([^\s]+)\s(.*?)>\/?/);

        if (!match) {
            return false;
        }

        const tag = {
            tag: match[1],
            has_closing: new RegExp(`</${match[1]}>$`).test(string),
            attributes: this.parseAttributes(match[2]),
            attr_string: match[2],
            content: null
        };

        if (tag['has_closing']) {
            const content_match = string.match(new RegExp(`${match[0]}([\\s\\S]*)</(?:[\\s]+)?${match[1]}(?:[\\s]+)?>`, 'i'));

            if (content_match) {
                tag['content'] = content_match[1];
            }
        }

        return tag;
    }

    parseAttributes(string) {
        return string.trim().split(' ').filter(attr => attr.trim()).map(attr => {
            const parsed = attr.split('=');
            return {
                [parsed[0]]: parsed[1] ? parsed[1].replace(/^"/, '').replace(/"$/, '') : true
            };
        });
    }

    /********** Nodes **********/

    document(node, event) {
        if (event.entering) {
            this.root = {
                document: {
                    nodes: [],
                },
            };
        }

        this.push(this.root.document, false);
    }

    text(node, event) {
        if (node.parent && ['link'].includes(node.parent.type)) {
            return;
        }

        const leaf = {
            object: 'leaf',
            text: node.literal,
            marks: this.getMarks(node)
        };

        this.addTextLeaf(leaf);
    }

    getMarks(node) {
        // console.log('Node Parent:', node.parent ? node.parent.type : null);
        const marks = [];
        let parent = node.parent;

        while (parent) {
            if (!this.marks.includes(parent.type)) {
                break;
            }

            marks.push({
                object: 'mark',
                type: this.markMapping[parent.type] ? this.markMapping[parent.type] : parent.type,
                data: {}
            });

            parent = parent.parent;
        }

        return marks;
    }

    paragraph(node, event) {
        if (!["item", "block_quote"].includes(node.parent.type)) {
            if (event.entering) {
                const block = {
                    object: 'block',
                    type: 'paragraph',
                    data: {},
                    nodes: [],
                };

                this.push(block);
            } else {
                this.pop();
            }
        }
    }

    emph() {
        // handled by text
    }

    strong() {
        // handled by text
    }

    softbreak() {
        this.addTextLeaf({
            object: 'leaf',
            text: ' \r',
            marks: []
        });
    }

    linebreak() {
        this.addTextLeaf({
            object: 'leaf',
            text: '\r\n',
            marks: []
        });
    }

    thematic_break() {
        const block = {
            object: 'block',
            isVoid: true,
            type: 'horizontal_rule',
        };
        this.append(block);
    }

    code(node) {
        const leaf = {
            object: 'leaf',
            text: node.literal,
            marks: [{
                object: 'mark',
                type: 'code',
                data: {}
            }]
        };

        this.addTextLeaf(leaf);
    }

    code_block(node) {
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

        this.push(block);
        this.push(para);
        this.addTextLeaf({
            object: 'leaf',
            text: node.literal,
            marks: []
        });
        this.pop();
        this.pop();
    }

    html_inline(node) {
        const leaf = {
            object: 'leaf',
            text: node.literal,
            marks: [{
                object: 'mark',
                type: 'html',
                data: {}
            }]
        };

        this.addTextLeaf(leaf);
    }

    html_block(node, event) {
        const tag = this.getHTMLTag(node.literal);

        if (tag && this.plugin_handle(node, event, tag)) {
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

            this.push(block);
            this.push(para);
            this.addTextLeaf({
                object: 'leaf',
                text: node.literal,
                marks: [{
                    object: 'mark',
                    type: 'html',
                    data: {}
                }]
            });
            this.pop();
            this.pop();
        }
    }

    headingLevelConverter(level) {
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
                type: `heading_${this.headingLevelConverter(node.level)}`,
                data: {},
                nodes: [],
            };
            this.push(block);
        } else {
            this.pop();
        }
    }

    block_quote(node, event) {
        if (event.entering) {
            const block = {
                object: 'block',
                type: 'block_quote',
                data: {},
                nodes: [],
            };
            this.push(block);
        } else {
            this.pop();
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
                    leaves: [{
                        object: 'leaf',
                        text: node.title ? node.title : node.firstChild.literal,
                        marks: this.getMarks(node)
                    }]
                }]
            };

            this.append(inline);
        }
    }
}