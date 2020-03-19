import React from 'react';
import PropTypes from 'prop-types';
import { useSlate } from 'slate-react';
import { Popup } from 'semantic-ui-react';
import { BUTTON_COLORS, POPUP_STYLE } from './StyleConstants';
import Button2 from '../components/Button2';
import {
  toggleMark, isMarkActive
} from '../utilities/toolbarHelpers';

const MarkButton = ({
  type,
  label,
  icon,
  ...props
}) => {
  const editor = useSlate();
  const handleMouseDown = (e) => {
    e.preventDefault();
    toggleMark(editor, type);
  };
  const isActive = isMarkActive(editor, type);
  const iconColor = isActive
    ? BUTTON_COLORS.SYMBOL_ACTIVE
    : BUTTON_COLORS.SYMBOL_INACTIVE;
  const backgroundColor = isActive
    ? BUTTON_COLORS.BACKGROUND_ACTIVE
    : BUTTON_COLORS.BACKGROUND_INACTIVE;

  return (
    <Popup
      content={label}
      style={POPUP_STYLE}
      position='bottom center'
      trigger={
          <Button2
              aria-label={type}
              onMouseDown={handleMouseDown}
              isActive={isActive}
              background={backgroundColor}
              {...props}
          >
              {icon(iconColor)}
          </ Button2>
      }
    />
  );
};

MarkButton.propTypes = {
  icon: PropTypes.func,
  type: PropTypes.string,
  label: PropTypes.string,
};

export default MarkButton;
