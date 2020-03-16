export const LIST_ITEM = 'list_item';
export const BLOCK_QUOTE = 'block_quote';
export const OL_LIST = 'ol_list';
export const UL_LIST = 'ul_list';
export const PARAGRAPH = 'paragraph';
export const H1 = 'heading_one';
export const H2 = 'heading_two';
export const H3 = 'heading_three';
export const H4 = 'heading_four';
export const H5 = 'heading_five';
export const H6 = 'heading_six';
export const MARK_BOLD = 'bold';
export const MARK_ITALIC = 'italic';
export const MARK_CODE = 'code';
export const MARK_HTML = 'html';
export const HR = 'horizontal_rule';
export const LINK = 'link';
export const IMAGE = 'image';
export const HTML_BLOCK = 'html_block';
export const CODE_BLOCK = 'code_block';

export const HTML_INLINE = 'html_inline';
export const SOFTBREAK = 'softbreak';
export const LINEBREAK = 'linebreak';


export const LIST_TYPES = [OL_LIST, UL_LIST];

export const INLINES = [LINEBREAK, SOFTBREAK, HTML_INLINE, LINK, IMAGE];
export const VOIDS = [LINEBREAK, SOFTBREAK, IMAGE, HR];
export const HEADINGS = [H1, H2, H3, H4, H5, H6];

export const MARKS = [MARK_BOLD, MARK_ITALIC, MARK_CODE, MARK_HTML];

const withSchema = (editor) => {
  const { isVoid, isInline } = editor;
  editor.isVoid = element => (VOIDS.includes(element.type) ? true : isVoid(editor));
  editor.isInline = element => (INLINES.includes(element.type) ? true : isInline(editor));

  return editor;
};

export default withSchema;
