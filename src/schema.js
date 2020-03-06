const schema = {
  document: {
    nodes: [
      {
        match: [
          { type: 'paragraph' },
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
          { type: 'softbreak' },
          { type: 'linebreak' },
          { type: 'ol_list' },
          { type: 'ul_list' },
          { type: 'image' },
        ],
      },
    ],
  },
  inlines: {
    linebreak: {
      isVoid: true,
    },
    softbreak: {
      isVoid: true,
    },
    html_inline: {
    },
    image: {
      isVoid: true,
    },
  },
  rules: [],
  blocks: {
    paragraph: {
      nodes: [
        {
          match: [
            { object: 'text' },
            { type: 'paragraph' },
            { type: 'softbreak' },
            { type: 'linebreak' },
            { type: 'html_inline' },
            { type: 'link' },
            { type: 'image' }
          ]
        },
      ],
    },
    html_block: {
      next: { type: 'paragraph' },
      previous: { type: 'paragraph' },
      nodes: [
        { match: { type: 'paragraph' } },
      ]
    },
    horizontal_rule: {
      isVoid: false,
    },
    ol_list: {
      data: {
        tight: v => v,
      },
      nodes: [{ match: [{ type: 'list_item' },{ type: 'ol_list' }] }],
    },
    ul_list: {
      data: {
        tight: v => v,
      },
      nodes: [{ match: [{ type: 'list_item' },{ type: 'ul_list' }] }],
    },
    list_item: {
      parent: [{ type: 'ol_list' }, { type: 'ul_list' }],
      nodes: [
        {
          match: [
            { type: 'paragraph' },
            { type: 'block_quote' },
          ]
        }
      ],
      marks: [
        { type: 'bold' },
        { type: 'italic' },
        { type: 'code' }
      ],
    },
    block_quote: {
      nodes: [
        {
          match: [
            { type: 'paragraph' },
            { type: 'block_quote' },
            { type: 'ol_list' },
            { type: 'ul_list' },
            { type: 'list_item' },
          ]
        }
      ],
      marks: [
        { type: 'bold' },
        { type: 'italic' },
        { type: 'code' }
      ],
    },
  },
};

export default schema;
