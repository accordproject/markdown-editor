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
        { match: [{ object: 'text' }, { type: 'html_inline' }, { type: 'link' }] },
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
  },
};

export default schema;
