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
                  { type: 'heading-one' },
                  { type: 'heading-two' },
                  { type: 'heading-three' },
                  { type: 'heading-four' },
                  { type: 'heading-five' },
                  { type: 'heading-six' },
                  { type: 'block_quote' },
                  
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
      'horizontal-rule': {
          isVoid: true,
      },
  }
}

export default schema;
