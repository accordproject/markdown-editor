const schema = {
  annotations: {
    variable: {
      isAtomic: true,
    }
  },
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
          // { type: 'list_item' },
          // { type: 'ul_list' },
          // { type: 'ol_list' },
          { type: 'code_block' },
          { type: 'html_block' },
          { type: 'html_inline' },
        ],
      },
    ],
  },
  blocks: {
    paragraph: {
      nodes: [
        { match: [{ object: 'text' }, { type: 'link' }] },
      ],
    },
    quote: {
      nodes: [
        { match: { object: 'text' } },
      ],
    },
    horizontal_rule: {
      isVoid: true,
    },
    // list: {
    //   nodes: [{ match: { type: 'list_item' } }],
    // },
    // list_item: {
    //   parent: { type: 'list' },
    //   nodes: [{ match: [{ object: 'text' }, { type: 'link' }] }],
    //   marks: [{ type: 'bold' }, { type: 'italic' }],
    // },
  },
};

export default schema;
