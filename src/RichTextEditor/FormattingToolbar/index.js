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

const FormattingToolbar = ({ isEditable }) => {
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
      <StyleDropdown isEditable={isEditable}/>
      <Separator />
      <FormatButton {...mark} {...bold} isEditable={isEditable} />
      <FormatButton {...mark} {...italic} isEditable={isEditable} />
      <FormatButton {...mark} {...code} isEditable={isEditable} />
      <Separator />
      <FormatButton {...block} {...quote} isEditable={isEditable} />
      <FormatButton {...block} {...olist} isEditable={isEditable} />
      <FormatButton {...block} {...ulist} isEditable={isEditable} />
      <Separator />
      <HistoryButton {...history} {...undo} />
      <HistoryButton {...history} {...redo} />
      <Separator />
      {/* <HyperlinkButton ref={linkButtonRef} {...hyperlink} {...link}/> */}
      <InsertImageButton {...image} isEditable={isEditable} />
      {/* <LinkForm {...linkForm} /> */}
    </ToolbarMenu>
  );
};

FormattingToolbar.propTypes = {
  isEditable: PropTypes.func,
};


export default FormattingToolbar;
