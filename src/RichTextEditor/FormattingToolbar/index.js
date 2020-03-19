import React from 'react';
import { InsertImageButton } from '../components/withImages';
import ToolbarMenu from './ToolbarMenu';
import BlockButton from './BlockButton';
import MarkButton from './MarkButton';
import StyleDropdown from './StyleDropdown';

import { bold, italic, code } from '../components/icons';

const FormattingToolbar = () => (
  <ToolbarMenu>
    <StyleDropdown />
    <MarkButton {...bold} />
    <MarkButton {...italic} />
    <MarkButton {...code} />
    <BlockButton format="block_quote" icon="format_quote" />
    <BlockButton format="ol_list" icon="format_list_numbered" />
    <BlockButton format="ul_list" icon="format_list_bulleted" />
    <InsertImageButton />
  </ToolbarMenu>
);

export default FormattingToolbar;
