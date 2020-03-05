/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React from 'react';
import { Card } from 'semantic-ui-react';

import TextareaAutosize from 'react-textarea-autosize';
import PropTypes from 'prop-types';

import '../styles.css';

/**
 * A Markdown editor that can convert the markdown contents
 * for a Slate DOM for WYSIWYG preview.
 *
 * @param {*} props the props for the component. See the declared PropTypes
 * for details.
 */
function MarkdownAsInputEditor(props) {
  /**
   * Destructure props for efficiency
   */
  const {
    onChange
  } = props;

  const onChangeHandler = (evt) => {
    onChange(evt.target.value);
  };

  /**
   * Render the component, based on showSlate
   */
  const card = <Card className="ap-markdown-editor" fluid>
    <Card.Content>
    <TextareaAutosize
      className={'textarea'}
      width={'100%'}
      placeholder={props.markdown}
      value={props.markdown}
      // eslint-disable-next-line no-unused-vars
      onChange={onChangeHandler}
      readOnly={props.readOnly}
    />
    </Card.Content>
  </Card>;

  return (
    <div>
      <Card.Group>
        {card}
      </Card.Group>
    </div>
  );
}

/**
 * The property types for this component
 */
MarkdownAsInputEditor.propTypes = {
  /**
   * Initial contents for the editor (markdown text)
   */
  markdown: PropTypes.string,

  /**
   * A callback that receives the markdown text
   */
  onChange: PropTypes.func.isRequired,

  /**
   * Boolean to make editor read-only (uneditable) or not (editable)
   */
  readOnly: PropTypes.bool,
};

/**
 * The default property values for this component
 */
MarkdownAsInputEditor.defaultProps = {
  value: 'Welcome! Edit this text to begin.',
  readOnly: false,
};

export default MarkdownAsInputEditor;
