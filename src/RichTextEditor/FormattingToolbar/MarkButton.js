import React from 'react';
import PropTypes from 'prop-types';
import { useSlate } from 'slate-react';
import Button from '../components/Button';
import Icon from '../components/Icon';

import {
  toggleMark, isMarkActive
} from '../utilities/toolbarHelpers';

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

export default MarkButton;
