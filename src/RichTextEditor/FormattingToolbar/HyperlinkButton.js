import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import { useSlate } from 'slate-react';
import { Popup } from 'semantic-ui-react';
import { BUTTON_COLORS, POPUP_STYLE } from './StyleConstants';
import Button from '../components/Button';

const HyperlinkButton = ({
  ref,
  toggleFunc,
  activeFunc,
  type,
  label,
  icon,
  ...props
}) => {
  const editor = useSlate();
  const handleMouseDown = (e) => {
    e.preventDefault();
    const url = window.prompt('Enter the URL of the link:');
    if (!url) return;
    toggleFunc(editor, url);
  };
  const isActive = activeFunc(editor, type);
  const iconColor = isActive
    ? BUTTON_COLORS.HYPERLINK_ACTIVE
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
          <Button
              ref={ref}
              aria-label={type}
              onMouseDown={handleMouseDown}
              isActive={isActive}
              background={backgroundColor}
              {...props}
          >
              {icon(iconColor)}
          </ Button>
      }
    />
  );
};

HyperlinkButton.propTypes = {
  toggleFunc: PropTypes.func,
  activeFunc: PropTypes.func,
  icon: PropTypes.func,
  type: PropTypes.string,
  label: PropTypes.string,
  ref: PropTypes.any,
};

export default HyperlinkButton;
