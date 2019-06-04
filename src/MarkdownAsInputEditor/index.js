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
  useState,
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
   * Current Markdown text
   */
  const [markdown, setMarkdown] = useState(props.markdown);

  /**
   * Destructure props for efficiency
   */
  const {
    onChange, plugins
  } = props;

  /**
   * Call onChange with the Slate Value when the markdown or the plugins change
   */
  useEffect(() => {
    const pluginManager = new PluginManager(plugins);
    const fromMarkdown = new FromMarkdown(pluginManager);
    const newSlateValue = fromMarkdown.convert(markdown);
    onChange(newSlateValue, markdown);
  }, [markdown, onChange, plugins]);

  /**
   * Render the component, based on showSlate
   */
  const card = <Card fluid>
  <Card.Content>
  <TextareaAutosize
                className={'textarea'}
                width={'100%'}
                placeholder={props.markdown}
                value={markdown}
                // eslint-disable-next-line no-unused-vars
                onChange={(evt, data) => {
                  setMarkdown(evt.target.value);
                }}
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
    renderBlock: PropTypes.func.isRequired,
    renderInline: PropTypes.func,
    toMarkdown: PropTypes.func.isRequired,
    fromMarkdown: PropTypes.func.isRequired,
    fromHTML: PropTypes.func.isRequired,
    plugin: PropTypes.string.isRequired,
    tags: PropTypes.arrayOf(PropTypes.string).isRequired,
    markdownTags: PropTypes.arrayOf(PropTypes.string).isRequired,
    schema: PropTypes.object.isRequired,
  })),
};

export default MarkdownAsInputEditor;
