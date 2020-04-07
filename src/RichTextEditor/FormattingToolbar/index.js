import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';

import { InsertImageButton } from '../components/withImages';
import ToolbarMenu from './ToolbarMenu';
import FormatButton from './FormatButton';
import HistoryButton from './HistoryButton';
import HyperlinkButton from './HyperlinkButton';
import StyleDropdown from './StyleDropdown';
import { LinkForm } from './HyperlinkModal';
import { insertLink, isLinkActive } from '../components/withLinks';
import {
  toggleBlock, isBlockActive,
  toggleMark, isMarkActive,
  toggleHistory
} from '../utilities/toolbarHelpers';
import {
  bold, italic, code,
  quote, olist, ulist,
  image, link, undo, redo,
  Separator
} from '../components/icons';

const mark = { toggleFunc: toggleMark, activeFunc: isMarkActive };
const block = { toggleFunc: toggleBlock, activeFunc: isBlockActive };
const history = { toggleFunc: toggleHistory };
const hyperlinkModal = { toggleFunc: insertLink, activeFunc: isLinkActive };

const FormattingToolbar = ({ canBeFormatted }) => {
  const linkButtonRef = useRef();
  const [linkOpen, setLinkOpen] = useState(false);
  const linkForm = {
    toggleFunc: setLinkOpen,
    activeFunc: isLinkActive,
    isLinkOpen: linkOpen,
    insertLink,
    linkButtonRef
  };

  const hyperlink = {
    toggleFunc: insertLink,
    activeFunc: isLinkActive,
    isLinkOpen: linkOpen,
    toggleLink: setLinkOpen
  };


  return (
    <ToolbarMenu>
      <StyleDropdown canBeFormatted={canBeFormatted}/>
      <Separator />
      <FormatButton {...mark} {...bold} canBeFormatted={canBeFormatted} />
      <FormatButton {...mark} {...italic} canBeFormatted={canBeFormatted} />
      <FormatButton {...mark} {...code} canBeFormatted={canBeFormatted} />
      <Separator />
      <FormatButton {...block} {...quote} canBeFormatted={canBeFormatted} />
      <FormatButton {...block} {...olist} canBeFormatted={canBeFormatted} />
      <FormatButton {...block} {...ulist} canBeFormatted={canBeFormatted} />
      <Separator />
      <HistoryButton {...history} {...undo} />
      <HistoryButton {...history} {...redo} />
      <Separator />
      {/* <HyperlinkButton ref={linkButtonRef} {...hyperlink} {...link}/> */}
      <InsertImageButton {...image} canBeFormatted={canBeFormatted} />
      {/* <LinkForm {...linkForm} /> */}
    </ToolbarMenu>
  );
};

FormattingToolbar.propTypes = {
  canBeFormatted: PropTypes.func,
};


export default FormattingToolbar;
