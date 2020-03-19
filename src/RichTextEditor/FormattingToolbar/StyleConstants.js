const MISC_CONSTANTS = {
  DROPDOWN_COLOR: '#122330',
  DROPDOWN_WEIGHT: 'bold',
};

export const BUTTON_COLORS = {
  BACKGROUND_INACTIVE: '#FFFFFF',
  BACKGROUND_ACTIVE: '#F0F0F0',
  SYMBOL_INACTIVE: '#949CA2',
  SYMBOL_ACTIVE: '#414F58',
  TOOLTIP_BACKGROUND: '#FFFFFF',
  TOOLTIP: '#000000',
};

export const BLOCK_STYLE = {
  paragraph: 'Normal',
  heading_one: 'Heading 1',
  heading_two: 'Heading 2',
  heading_three: 'Heading 3',
};

export const DROPDOWN_STYLE = {
  color: BUTTON_COLORS.SYMBOL_ACTIVE,
  alignSelf: 'center',
};

export const DROPDOWN_STYLE_H1 = {
  fontSize: '25px',
  lineHeight: '23px',
  fontWeight: MISC_CONSTANTS.DROPDOWN_WEIGHT,
  color: MISC_CONSTANTS.DROPDOWN_COLOR,
};

export const DROPDOWN_STYLE_H2 = {
  fontSize: '20px',
  lineHeight: '20px',
  fontWeight: MISC_CONSTANTS.DROPDOWN_WEIGHT,
  color: MISC_CONSTANTS.DROPDOWN_COLOR,
};

export const DROPDOWN_STYLE_H3 = {
  fontSize: '16px',
  lineHeight: '16px',
  fontWeight: MISC_CONSTANTS.DROPDOWN_WEIGHT,
  color: MISC_CONSTANTS.DROPDOWN_COLOR,
};

export const POPUP_STYLE = {
  borderRadius: '5px',
  backgroundColor: BUTTON_COLORS.TOOLTIP_BACKGROUND,
  color: BUTTON_COLORS.TOOLTIP,
};
