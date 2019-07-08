/**
 * A sample plugin that prevents editing text that has a mark (bold, italic, underline)
 */
function NoEdit() {
  const name = 'noedit';

  const tags = [];

  /**
   * Only allows words that don't have marks to be edited
   *
   * @param {Value} value - the Slate value
   */
  const isEditable = ((value, code) => {
    console.log(code);
    return value.marks.size === 0;
  });

  return {
    name,
    isEditable,
    tags
  };
}

export default NoEdit;
