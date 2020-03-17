import React from 'react';
import { InsertImageButton } from '../components/withImages';
import ToolbarMenu from './ToolbarMenu';
import BlockButton from './BlockButton';
import MarkButton from './MarkButton';

const FormattingToolbar = () => (
  <ToolbarMenu>
    <MarkButton format="bold" icon="format_bold" />
    <MarkButton format="italic" icon="format_italic" />
    <MarkButton format="code" icon="code" />
    <BlockButton format="heading_one" icon="looks_one" />
    <BlockButton format="heading_two" icon="looks_two" />
    <BlockButton format="block_quote" icon="format_quote" />
    <BlockButton format="ol_list" icon="format_list_numbered" />
    <BlockButton format="ul_list" icon="format_list_bulleted" />
    <InsertImageButton />
  </ToolbarMenu>
);

export default FormattingToolbar;
