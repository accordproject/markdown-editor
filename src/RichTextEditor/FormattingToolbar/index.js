import React, { useState, useRef, useEffect } from 'react';
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

const FormattingToolbar = ({ lockText }) => {
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
      <StyleDropdown />
      <Separator />
      <FormatButton {...mark} {...bold} />
      <FormatButton {...mark} {...italic} />
      <FormatButton {...mark} {...code} />
      <Separator />
      <FormatButton {...block} {...quote} />
      <FormatButton {...block} {...olist} />
      <FormatButton {...block} {...ulist} />
      <Separator />
      <HistoryButton {...history} {...undo} />
      <HistoryButton {...history} {...redo} />
      <Separator />
      {/* <HyperlinkButton ref={linkButtonRef} {...hyperlink} {...link}/> */}
      <InsertImageButton {...image}/>
      {/* <LinkForm {...linkForm} /> */}
    </ToolbarMenu>
  );
};

export default FormattingToolbar;
