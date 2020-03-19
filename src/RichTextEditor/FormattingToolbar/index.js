import React from 'react';
import { InsertImageButton } from '../components/withImages';
import ToolbarMenu from './ToolbarMenu';
import FormatButton from './FormatButton';
import StyleDropdown from './StyleDropdown';
import {
  toggleBlock, isBlockActive,
  toggleMark, isMarkActive
} from '../utilities/toolbarHelpers';

import {
  bold, italic, code, quote, olist, ulist
} from '../components/icons';

const mark = { toggleFunc: toggleMark, activeFunc: isMarkActive };
const block = { toggleFunc: toggleBlock, activeFunc: isBlockActive };

const FormattingToolbar = () => (
  <ToolbarMenu>
    <StyleDropdown />
    <FormatButton {...mark} {...bold} />
    <FormatButton {...mark} {...italic} />
    <FormatButton {...mark} {...code} />
    <FormatButton {...block} {...quote} />
    <FormatButton {...block} {...olist} />
    <FormatButton {...block} {...ulist} />
    <InsertImageButton />
  </ToolbarMenu>
);

export default FormattingToolbar;
