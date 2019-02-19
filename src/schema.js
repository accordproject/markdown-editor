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
          { type: 'video' },
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
  },
};

export default schema;
