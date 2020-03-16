import React from 'react';
import PropTypes from 'prop-types';
import { cx, css } from 'emotion';
import {
  useSlate
} from 'slate-react';
import Button from '../components/Button';
import Icon from '../components/Icon';
import Menu from '../components/Menu';
import { InsertImageButton } from '../components/Image';


import {
  toggleMark, toggleBlock, isBlockActive, isMarkActive
} from '../utilities/toolbarHelpers';

// eslint-disable-next-line react/display-name
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

Toolbar.propTypes = {
  className: PropTypes.string,
};

const BlockButton = ({ format, icon }) => {
  const editor = useSlate();
  return (
      <Button
        active={isBlockActive(editor, format)}
        onMouseDown={(event) => {
          event.preventDefault();
          toggleBlock(editor, format);
        }}
      >
        <Icon>{icon}</Icon>
      </Button>
  );
};

BlockButton.propTypes = {
  format: PropTypes.string,
  icon: PropTypes.string
};

const MarkButton = ({ format, icon }) => {
  const editor = useSlate();
  return (
      <Button
        active={isMarkActive(editor, format)}
        onMouseDown={(event) => {
          event.preventDefault();
          toggleMark(editor, format);
        }}
      >
        <Icon>{icon}</Icon>
      </Button>
  );
};

MarkButton.propTypes = {
  format: PropTypes.string,
  icon: PropTypes.string
};

const FormatBar = () => (
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

export default FormatBar;
