import React from 'react';
import PropTypes from 'prop-types';
import { useSlate } from 'slate-react';
import Button from '../components/Button';
import Icon from '../components/Icon';

import {
  toggleBlock, isBlockActive
} from '../utilities/toolbarHelpers';

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

export default BlockButton;
