import React from 'react';
import PropTypes from 'prop-types';
import ImageElement from '../plugins/withImages';
import { Code, Html, ListItem, OLList, Quote, ULList } from './Block';
import { Heading, Inline, Link, Paragraph } from './Node';
import { HorizontalRule, Linebreak, Softbreak } from './Span';
import {
  PARAGRAPH, LINK, IMAGE, H1, H2, H3, H4, H5, H6, HR,
  CODE_BLOCK, HTML_BLOCK, BLOCK_QUOTE, UL_LIST, OL_LIST, LIST_ITEM,
  HTML_INLINE, SOFTBREAK, LINEBREAK,
} from '../utilities/schema';

const Element = (props) => {
  const { attributes, children, element, customElements } = props;
  const { type, data } = element;
  const baseElementRenderer = {
    [PARAGRAPH]: () => (<Paragraph {...attributes} children={children} />),
    [H1]: () => (<Heading as="h1" {...attributes}>{children}</Heading>),
    [H2]: () => (<Heading as="h2" {...attributes}>{children}</Heading>),
    [H3]: () => (<Heading as="h3" {...attributes}>{children}</Heading>),
    [H4]: () => (<Heading as="h4" {...attributes}>{children}</Heading>),
    [H5]: () => (<Heading as="h5" {...attributes}>{children}</Heading>),
    [H6]: () => (<Heading as="h6" {...attributes}>{children}</Heading>),
    [SOFTBREAK]: () => (<Softbreak {...attributes} children={children} />),
    [LINEBREAK]: () => (<Linebreak {...attributes} />),
    [LINK]: () => (<Link {...attributes} href={data.href} children={children} />),
    [HTML_BLOCK]: () => (<Html {...attributes} children={children} />),
    [CODE_BLOCK]: () => (<Code {...attributes} children={children} />),
    [BLOCK_QUOTE]: () => (<Quote {...attributes} children={children} />),
    [OL_LIST]: () => (<OLList {...attributes} children={children} />),
    [UL_LIST]: () => (<ULList {...attributes} children={children} />),
    [LIST_ITEM]: () => (<ListItem {...attributes} children={children} />),
    [IMAGE]: () => (<ImageElement {...props} />),
    [HR]: () => (<HorizontalRule {...attributes}>{children}</HorizontalRule>),
    [HTML_INLINE]: () => (<Inline {...attributes} content={data.content} children={children} />),
    default: () => {
      console.log(`Didn't know how to render ${JSON.stringify(element, null, 2)}`);
      return <p {...attributes}>{children}</p>;
    }
  };
  const elementRenderer = customElements
    ? {...baseElementRenderer, ...customElements(attributes, children, element) }
    : baseElementRenderer ;
  return (elementRenderer[type] || elementRenderer.default)();
};

Element.propTypes = {
  children: PropTypes.node,
  element: PropTypes.shape({
    data: PropTypes.object,
    type: PropTypes.string
  }),
  attributes: PropTypes.any
};

export default Element;
