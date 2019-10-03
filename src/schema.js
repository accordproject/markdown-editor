const schema = {
  document: {
    nodes: [
      {
        match: [
          { type: 'paragraph' },
          { type: 'quote' },
          { type: 'list' },
          { type: 'link' },
          { type: 'horizontal_rule' },
          { type: 'heading_one' },
          { type: 'heading_two' },
          { type: 'heading_three' },
          { type: 'heading_four' },
          { type: 'heading_five' },
          { type: 'heading_six' },
          { type: 'block_quote' },
          { type: 'code_block' },
          { type: 'html_block' },
          { type: 'html_inline' },
          { type: 'ol_list' },
          { type: 'ul_list' }
        ],
      },
    ],
  },
  inlines: {
  },
  rules: [],
  blocks: {
    paragraph: {
      nodes: [
        { match: [{ object: 'text' }, { type: 'paragraph' }, { type: 'html_inline' }, { type: 'link' }] },
      ],
    },
    html_block: {
      nodes: [
        { match: { type: 'paragraph' } },
      ]
    },
    quote: {
      nodes: [
        { match: { object: 'text' } },
      ],
    },
    horizontal_rule: {
      isVoid: true,
    },
    ol_list: {
      nodes: [{ match: { type: 'list_item' } }],
    },
    ul_list: {
      nodes: [{ match: { type: 'list_item' } }],
    },
    list_item: {
      parent: [{ type: 'ol_list' }, { type: 'ul_list' }],
      nodes: [{ match: [{ object: 'text' }, { type: 'link' }] }],
      marks: [{ type: 'bold' }, { type: 'italic' }, { type: 'code' }],
    },
  },
};

export default schema;
