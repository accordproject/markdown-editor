import React from 'react';
import { InsertImageButton } from '../components/withImages';
import ToolbarMenu from './ToolbarMenu';
import FormatButton from './FormatButton';
import HistoryButton from './HistoryButton';
import StyleDropdown from './StyleDropdown';
import {
  toggleBlock, isBlockActive,
  toggleMark, isMarkActive,
  toggleHistory
} from '../utilities/toolbarHelpers';
import {
  bold, italic, code,
  quote, olist, ulist,
  image, undo, redo
} from '../components/icons';

const mark = { toggleFunc: toggleMark, activeFunc: isMarkActive };
const block = { toggleFunc: toggleBlock, activeFunc: isBlockActive };
const history = { toggleFunc: toggleHistory };

const FormattingToolbar = () => (
  <ToolbarMenu>
    <StyleDropdown />
    <FormatButton {...mark} {...bold} />
    <FormatButton {...mark} {...italic} />
    <FormatButton {...mark} {...code} />
    <FormatButton {...block} {...quote} />
    <FormatButton {...block} {...olist} />
    <FormatButton {...block} {...ulist} />
    <HistoryButton {...history} {...undo} />
    <HistoryButton {...history} {...redo} />
    <InsertImageButton {...image}/>
  </ToolbarMenu>
);

export default FormattingToolbar;
