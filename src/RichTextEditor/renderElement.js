import React from 'react';
import Heading from './components/heading';
import ImageElement from './components/image';

import * as SCHEMA from './schema';

const Element = (props) => {
  const { attributes, children, element } = props;

  switch (element.type) {
    case SCHEMA.PARAGRAPH:
      return <p {...attributes}>{children}</p>;
    case SCHEMA.H1:
      return <Heading as="h1" {...attributes}>{children}</Heading>;
    case SCHEMA.H2:
      return <Heading as="h2" {...attributes}>{children}</Heading>;
    case SCHEMA.H3:
      return <Heading as="h3" {...attributes}>{children}</Heading>;
    case 'heading_four':
      return <Heading as="h4" {...attributes}>{children}</Heading>;
    case 'heading_five':
      return <Heading as="h5" {...attributes}>{children}</Heading>;
    case 'heading_six':
      return <Heading as="h6" {...attributes}>{children}</Heading>;
    case 'horizontal_rule':
      return <div className="hr" {...attributes}>{children}</div>;
    case 'code_block':
      return <pre {...attributes}>{children}</pre>;
    case 'html_block':
      return <pre className="html_block" {...attributes}>{children}</pre>;
    case 'block_quote':
      return <blockquote {...attributes}>{children}</blockquote>;
    case 'ul_list':
      return <ul {...attributes}>{children}</ul>;
    case 'heading_one':
      return <h1 {...attributes}>{children}</h1>;
    case 'heading_two':
      return <h2 {...attributes}>{children}</h2>;
    case 'list_item':
      return <li {...attributes}>{children}</li>;
    case 'ol_list':
      return <ol {...attributes}>{children}</ol>;
    case 'link':
      return <a {...attributes} href={element.data.href}>{children}</a>;
    case 'image':
      return <ImageElement {...props} />;
    // case 'image':
    //   return <img {...attributes} alt={element.data.title} src={element.data.href}>{children}</img>;
    case 'html_inline':
      return <span className='html_inline' {...attributes}>{element.data.content}{children}</span>;
    case 'softbreak':
      return <span className='softbreak' {...attributes}> {children}</span>;
    case 'linebreak':
      return <br className='linebreak' {...attributes}>{children}</br>;
    default:
      console.log(`Didn't know how to render ${JSON.stringify(element, null, 2)}`);
      return <p {...attributes}>{children}</p>;
  }
};

export default Element;
