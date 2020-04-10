import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import { ReactEditor, useSlate } from 'slate-react';
import { Popup } from 'semantic-ui-react';
import { BUTTON_COLORS, POPUP_STYLE } from '../utilities/constants';
import Button from '../components/Button';

// eslint-disable-next-line react/display-name
// const HyperlinkMenu = React.forwardRef(
//     ({ ...props }, ref) => <HyperlinkWrapper ref={ref} {...props} />
//   );


// eslint-disable-next-line react/display-name
const HyperlinkButton = React.forwardRef(
  ({
    isLinkOpen,
    toggleLink,
    toggleFunc: insertLink,
    activeFunc,
    type,
    label,
    icon,
    ...props
  }, ref) => {
  // this needs to open the modal always
    const editor = useSlate();
    const { selection } = editor;
    const handleMouseDown = (e) => {
      e.preventDefault();
      // if (!selection) return;
      toggleLink(!isLinkOpen);
      ReactEditor.focus(editor);
    // const url = window.prompt('Enter the URL of the link:');
    // if (!url) return;
    // toggleFunc(editor, url);
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
              onMouseDown={(event) => {
                event.preventDefault();
                const url = window.prompt('Enter the URL of the link:');
                if (!url) return;
                insertLink(editor, url);
              }}
              isActive={isActive}
              background={backgroundColor}
              {...props}
          >
              {icon(iconColor)}
          </ Button>
      }
    />
    );
  }
);

HyperlinkButton.propTypes = {
  isLinkOpen: PropTypes.bool,
  toggleLink: PropTypes.func,
  toggleFunc: PropTypes.func,
  activeFunc: PropTypes.func,
  icon: PropTypes.func,
  type: PropTypes.string,
  label: PropTypes.string,
  ref: PropTypes.any,
};

export default HyperlinkButton;
