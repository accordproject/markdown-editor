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

import React, {
  useEffect,
}
  from 'react';
import { Card } from 'semantic-ui-react';
import TextareaAutosize from 'react-textarea-autosize';
import PropTypes from 'prop-types';
import FromMarkdown from '../markdown/fromMarkdown';
import PluginManager from '../PluginManager';

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
    onChange, plugins
  } = props;

  const onChangeHandler = (evt) => {
    const pluginManager = new PluginManager(plugins);
    const fromMarkdown = new FromMarkdown(pluginManager);
    const newSlateValue = fromMarkdown.convert(evt.target.value);
    onChange(newSlateValue, evt.target.value);
  };

  /**
   * Render the component, based on showSlate
   */
  const card = <Card fluid>
  <Card.Content>
  <TextareaAutosize
    className={'textarea'}
    width={'100%'}
    placeholder={props.markdown}
    value={props.markdown}
    // eslint-disable-next-line no-unused-vars
    onChange={onChangeHandler}
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
   * A callback that receives the Slate Value object and
   * the corresponding markdown text
   */
  onChange: PropTypes.func.isRequired,

  /**
   * An array of plugins to extend the functionality of the editor
   */
  plugins: PropTypes.arrayOf(PropTypes.shape({
    onEnter: PropTypes.func,
    onKeyDown: PropTypes.func,
    onBeforeInput: PropTypes.func,
    toMarkdown: PropTypes.func.isRequired,
    fromMarkdown: PropTypes.func.isRequired,
    fromHTML: PropTypes.func.isRequired,
    name: PropTypes.string.isRequired,
    tags: PropTypes.arrayOf(PropTypes.object).isRequired,
  })),
};

/**
 * The default property values for this component
 */
MarkdownAsInputEditor.defaultProps = {
  value: 'Welcome! Edit this text to begin.'
};

export default MarkdownAsInputEditor;
