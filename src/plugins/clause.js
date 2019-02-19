import React from "react";

function Clause() {
    const plugin = 'Clause';
    const tags = ['Clause'];
    const markdownTags = ['Clause'];
    const schema = {
        blocks: {
            Clause: {
                nodes: [
                    { match: [{ object: 'text' }] },
                ]
            }
        }
    };

    /**
     * @param {Event} event
     * @param {Editor} editor
     * @param {Function} next
     */
    function onEnter(event, editor, next) {
        //console.log('onEnter of Clause plugin');
        // console.log(editor.value.document.getParent(editor.value.startBlock.key));
        return next();
    }

    /**
     * @param {Event} event
     * @param {Editor} editor
     * @param {Function} next
     */
    function onKeyDown(event, editor, next) {
        switch (event.key) {
            case "Enter":
                return onEnter(event, editor, next);
            default:
                return next();
        }
    }

    /**
     * @param {Object} props
     * @param {Editor} editor
     * @param {Function} next
     */
    function renderNode(props, editor, next) {
        const { attributes, children } = props;
        return <div {...attributes}>{children}</div>;
    }

    /**
     * @param {Value} value
     * @param {Editor} editor
     */
    function toMarkdown(editor, value) {
        return `<Clause ${value.data.get('attr_string')}>${value.text}</Clause>\n\n`;
    }

    function fromMarkdown(editor, event, tag) {
        const block = {
            object: 'block',
            type: 'Clause',
            data: Object.assign(tag),
            nodes: [{
                object: 'text',
                leaves: [{
                    object: 'leaf',
                    text: tag.content,
                    marks: []
                }]
            }],
        };

        return [
            { action: 'push', block },
            { action: 'pop' }
        ];
    }

    function fromHTML(editor, el, next) {
        return {
            object: 'block',
            type: 'Clause',
            data: {},
            nodes: next(el.childNodes),
        };
    }

    return {
        plugin,
        tags,
        markdownTags,
        schema,
        onKeyDown,
        renderNode,
        toMarkdown,
        fromMarkdown,
        fromHTML
    };
}

export default Clause;