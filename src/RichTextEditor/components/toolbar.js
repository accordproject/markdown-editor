import React from 'react';
import { cx, css } from 'emotion';
import {
  useSlate
} from 'slate-react';
import { Button, Icon, Menu } from './components';
import * as ACTIONS from '../actions';
import { InsertImageButton } from './image';

const Toolbar = React.forwardRef(({ className, ...props }, ref) => (
    <Menu
      {...props}
      ref={ref}
      className={cx(
        className,
        css`
          position: relative;
          padding: 1px 18px 17px;
          margin: 0 -20px;
          border-bottom: 2px solid #eee;
          margin-bottom: 20px;
        `
      )}
    />
));


const BlockButton = ({ format, icon }) => {
  const editor = useSlate();
  return (
      <Button
        active={ACTIONS.isBlockActive(editor, format)}
        onMouseDown={(event) => {
          event.preventDefault();
          ACTIONS.toggleBlock(editor, format);
        }}
      >
        <Icon>{icon}</Icon>
      </Button>
  );
};

const MarkButton = ({ format, icon }) => {
  const editor = useSlate();
  return (
      <Button
        active={ACTIONS.isMarkActive(editor, format)}
        onMouseDown={(event) => {
          event.preventDefault();
          ACTIONS.toggleMark(editor, format);
        }}
      >
        <Icon>{icon}</Icon>
      </Button>
  );
};

export const FormatBar = () => (
          <Toolbar>
            <MarkButton format="bold" icon="format_bold" />
            <MarkButton format="italic" icon="format_italic" />
            <MarkButton format="code" icon="code" />
            <BlockButton format="heading_one" icon="looks_one" />
            <BlockButton format="heading_two" icon="looks_two" />
            <BlockButton format="block_quote" icon="format_quote" />
            <BlockButton format="ol_list" icon="format_list_numbered" />
            <BlockButton format="ul_list" icon="format_list_bulleted" />
            <InsertImageButton />
        </Toolbar>
);
