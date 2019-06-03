const initialValue = {
  object: 'value',
  document: {
    object: 'document',
    data: {},
    nodes: [{
      object: 'block',
      type: 'heading_one',
      data: {},
      nodes: [{
        object: 'text',
        text: 'Heading One',
        marks: []
      }]
    },
    {
      object: 'block',
      type: 'paragraph',
      data: {},
      nodes: [{
        object: 'text',
        text: 'This is text. This is ',
        marks: []
      },
      {
        object: 'text',
        text: 'italic',
        marks: [{
          object: 'mark',
          type: 'italic',
          data: {}
        }]
      },
      {
        object: 'text',
        text: ' text. This is ',
        marks: []
      },
      {
        object: 'text',
        text: 'bold',
        marks: [{
          object: 'mark',
          type: 'bold',
          data: {}
        }]
      },
      {
        object: 'text',
        text: ' text. This is a ',
        marks: []
      },
      {
        object: 'inline',
        type: 'link',
        data: {
          href: 'https://clause.io'
        },
        nodes: [{
          object: 'text',
          text: 'link',
          marks: []
        }]
      },
      {
        object: 'text',
        text: '. This is ',
        marks: []
      },
      {
        object: 'text',
        text: 'inline code',
        marks: [{
          object: 'mark',
          type: 'code',
          data: {}
        }]
      },
      {
        object: 'text',
        text: '.',
        marks: []
      }
      ]
    },
    {
      object: 'block',
      type: 'paragraph',
      data: {},
      nodes: [{
        object: 'text',
        text: 'This is ',
        marks: []
      },
      {
        object: 'text',
        text: 'bold and italic',
        marks: [{
          object: 'mark',
          type: 'bold',
          data: {}
        },
        {
          object: 'mark',
          type: 'italic',
          data: {}
        }
        ]
      },
      {
        object: 'text',
        text: ' text',
        marks: []
      }
      ]
    },
    {
      object: 'block',
      type: 'html_block',
      data: {},
      nodes: [{
        object: 'block',
        type: 'paragraph',
        data: {},
        nodes: [{
          object: 'text',
          text: '<variable src="baz">\nthis is some content\n</variable>',
          marks: [{
            object: 'mark',
            type: 'html',
            data: {}
          }]
        }]
      }]
    },
    {
      object: 'block',
      type: 'paragraph',
      data: {},
      nodes: [{
        object: 'text',
        text: 'This is a ',
        marks: []
      },
      {
        object: 'text',
        text: '<variable src="foo"/>',
        marks: [{
          object: 'mark',
          type: 'html',
          data: {}
        }]
      },
      {
        object: 'text',
        text: ' sentence that ',
        marks: []
      },
      {
        object: 'text',
        text: 'contains',
        marks: [{
          object: 'mark',
          type: 'bold',
          data: {}
        },
        {
          object: 'mark',
          type: 'italic',
          data: {}
        }
        ]
      },
      {
        object: 'text',
        text: ' ',
        marks: []
      },
      {
        object: 'inline',
        type: 'html_inline',
        data: {},
        nodes: [{
          object: 'text',
          text: '<variable src="bar">',
          marks: [{
            object: 'mark',
            type: 'html',
            data: {}
          }]
        },
        {
          object: 'text',
          text: 'a variable',
          marks: []
        },
        {
          object: 'text',
          text: '</variable>',
          marks: [{
            object: 'mark',
            type: 'html',
            data: {}
          }]
        }
        ]
      },
      {
        object: 'text',
        text: ' within it. And here is {{another}} with some text after.',
        marks: []
      },
      {
        object: 'text',
        text: '\n',
        marks: []
      },
      {
        object: 'text',
        text: 'And here is more {{variables}}% with newlines and {{punctuation}} and text.',
        marks: []
      }
      ]
    },
    {
      object: 'block',
      type: 'block_quote',
      data: {},
      nodes: [{
        object: 'text',
        text: 'This is a quote.',
        marks: []
      }]
    },
    {
      object: 'block',
      type: 'heading_two',
      data: {},
      nodes: [{
        object: 'text',
        text: 'Heading Two',
        marks: []
      }]
    },
    {
      object: 'block',
      type: 'paragraph',
      data: {},
      nodes: [{
        object: 'text',
        text: 'This is more text.',
        marks: []
      }]
    },
    {
      object: 'block',
      type: 'paragraph',
      data: {},
      nodes: [{
        object: 'text',
        text: 'Ordered lists:',
        marks: []
      }]
    },
    {
      object: 'block',
      type: 'ol_list',
      data: {},
      nodes: [{
        object: 'block',
        type: 'list_item',
        data: {},
        nodes: [{
          object: 'text',
          text: 'one',
          marks: []
        }]
      },
      {
        object: 'block',
        type: 'list_item',
        data: {},
        nodes: [{
          object: 'text',
          text: 'two',
          marks: []
        }]
      },
      {
        object: 'block',
        type: 'list_item',
        data: {},
        nodes: [{
          object: 'text',
          text: 'three',
          marks: []
        }]
      }
      ]
    },
    {
      object: 'block',
      type: 'paragraph',
      data: {},
      nodes: [{
        object: 'text',
        text: 'Or:',
        marks: []
      }]
    },
    {
      object: 'block',
      type: 'ul_list',
      data: {},
      nodes: [{
        object: 'block',
        type: 'list_item',
        data: {},
        nodes: [{
          object: 'text',
          text: 'apples',
          marks: []
        }]
      },
      {
        object: 'block',
        type: 'list_item',
        data: {},
        nodes: [{
          object: 'text',
          text: 'pears',
          marks: []
        }]
      },
      {
        object: 'block',
        type: 'list_item',
        data: {},
        nodes: [{
          object: 'text',
          text: 'peaches',
          marks: []
        }]
      }
      ]
    },
    {
      object: 'block',
      type: 'heading_three',
      data: {},
      nodes: [{
        object: 'text',
        text: 'Sub heading',
        marks: []
      }]
    },
    {
      object: 'block',
      type: 'paragraph',
      data: {},
      nodes: [{
        object: 'text',
        text: 'Video:',
        marks: []
      }]
    },
    {
      object: 'block',
      type: 'video',
      data: {
        tag: 'video',
        attributes: {},
        attributeString: '',
        content: '',
        closed: true
      },
      nodes: []
    },
    {
      object: 'block',
      type: 'paragraph',
      data: {},
      nodes: [{
        object: 'text',
        text: 'Another video:',
        marks: []
      }]
    },
    {
      object: 'block',
      type: 'video',
      data: {
        tag: 'video',
        attributes: {
          src: 'https://www.youtube.com/embed/cmmq-JBMbbQ'
        },
        attributeString: 'src = "https://www.youtube.com/embed/cmmq-JBMbbQ"',
        content: '',
        closed: true
      },
      nodes: []
    }
    ]
  }
};

export default initialValue;
