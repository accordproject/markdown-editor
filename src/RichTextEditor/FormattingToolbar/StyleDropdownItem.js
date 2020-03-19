import React from 'react';
import PropTypes from 'prop-types';
import { Dropdown } from 'semantic-ui-react';
import { BLOCK_STYLE } from './StyleConstants';
import { toggleBlock } from '../utilities/toolbarHelpers';

const StyleDropdownItem = ({ editor, type, style }) => (
    <Dropdown.Item
        text={BLOCK_STYLE[type]}
        style={style}
        onMouseDown={(event) => {
          event.preventDefault();
          toggleBlock(editor, type);
        }}
    />
);

StyleDropdownItem.propTypes = {
  editor: PropTypes.obj,
  type: PropTypes.string,
  style: PropTypes.obj,
};

export default StyleDropdownItem;
