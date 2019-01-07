import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import FormatBold from '@material-ui/icons/FormatBold';
import FormatItalic from '@material-ui/icons/FormatItalic';
import FormatUnderlined from '@material-ui/icons/FormatUnderlined';
import Code from '@material-ui/icons/Code';
import FormatQuote from '@material-ui/icons/FormatQuote';
import InsertLink from '@material-ui/icons/InsertLink';

const styles = {
  root: {
    flexGrow: 1,
  },
};

class FormatToolbar extends React.Component {
  /**
   * When a mark button is clicked, toggle the current mark.
   *
   * @param {Event} event
   * @param {String} type
   */

  onClickMark(event, type) {
    const { editor } = this.props;
    event.preventDefault();
    editor.toggleMark(type);
  }

  /**
   * When a mark button is clicked, toggle the current mark.
   *
   * @param {Event} event
   * @param {String} type
   */

  onClickBlock(event, type) {
    const { editor } = this.props;
    event.preventDefault();

    // Determine whether any of the currently selected blocks are code blocks.
    const isType = editor.value.blocks.some(block => block.type === type);

    // Toggle the block type depending on `isType`.
    editor.setBlocks(isType ? 'paragraph' : type);
  }

  /**
   * Render a mark-toggling toolbar button.
   *
   * @param {String} type
   * @param {String} icon
   * @return {Element}
   */

  renderMarkButton(type, icon) {
    const { editor, classes } = this.props;
    const { value } = editor;
    const isActive = value && value.activeMarks.some(mark => mark.type === type);
    let TheIcon = null;

    switch (type) {
      case 'bold':
        TheIcon = FormatBold;
        break;
      case 'italic':
        TheIcon = FormatItalic;
        break;
      case 'underlined':
        TheIcon = FormatUnderlined;
        break;
      case 'block-quote':
        TheIcon = FormatQuote;
        break;
      case 'link':
        TheIcon = InsertLink;
        break;
      case 'code':
        TheIcon = Code;
        break;

      default:
        TheIcon = null;
    }

    if (TheIcon) {
      return (
        <IconButton
          className={classes.button}
          aria-label={type}
          onMouseDown={event => this.onClickMark(event, type)}
        >
          <TheIcon />
        </IconButton>
      );
    }

    return (
      <IconButton
        className={classes.button}
        aria-label={type}
        onMouseDown={event => this.onClickMark(event, type)}
      >
        {type}
      </IconButton>
    );
  }

  /**
   * Render a block modifying button
   *
   * @param {String} type
   * @param {String} icon
   * @return {Element}
   */

  renderBlockButton(type, icon) {
    const { classes } = this.props;
    let TheIcon = null;

    switch (type) {
      case 'block-quote':
        TheIcon = FormatQuote;
        break;
      case 'link':
        TheIcon = InsertLink;
        break;

      default:
        TheIcon = null;
    }

    if (TheIcon) {
      return (
        <IconButton
          className={classes.button}
          aria-label={type}
          onMouseDown={event => this.onClickBlock(event, type)}
        >
          <TheIcon />
        </IconButton>
      );
    }

    return (
      <IconButton
        className={classes.button}
        aria-label={type}
        onMouseDown={event => this.onClickBlock(event, type)}
      >
        {icon}
      </IconButton>
    );
  }

  render() {
    const { rect } = this.props;

    if (rect) {
      return (
        <div className="format-toolbar" style={{ top: Math.max(10, rect.top - 60), left: Math.max(10, rect.left - 80) }}>
          { this.renderBlockButton('heading-one', 'h1')}
          { this.renderBlockButton('heading-two', 'h2')}
          { this.renderMarkButton('bold', 'format_bold')}
          { this.renderMarkButton('italic', 'format_italic')}
          { this.renderMarkButton('underlined', 'format_underlined')}
          { this.renderMarkButton('code', 'code')}
          { this.renderBlockButton('block-quote', 'format_quote')}
        </div>
      );
    }

    return (<div />);
  }
}

FormatToolbar.propTypes = {
  classes: PropTypes.object.isRequired,
  editor: PropTypes.element.isRequired,
  rect: PropTypes.object.isRequired,
};

export default withStyles(styles)(FormatToolbar);
