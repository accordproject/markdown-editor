import React from 'react';
import PropTypes from 'prop-types';
import { Dropdown } from 'semantic-ui-react';
import { BLOCK_STYLE } from './StyleConstants';
import { toggleBlock } from '../utilities/toolbarHelpers';

const StyleDropdownItem = ({
  editor, type, style, isEditable
}) => (
    <Dropdown.Item
        text={BLOCK_STYLE[type]}
        style={style}
        onMouseDown={(event) => {
          event.preventDefault();
          if (isEditable && !isEditable(editor)) return;
          toggleBlock(editor, type);
        }}
    />
);

StyleDropdownItem.propTypes = {
  editor: PropTypes.obj,
  type: PropTypes.string,
  style: PropTypes.obj,
  isEditable: PropTypes.func
};

export default StyleDropdownItem;
