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

/**
 * Manages a set of plugins
 */
export default class PluginManager {
  constructor(plugins) {
    this.plugins = plugins;
  }

  /**
   * Returns the first plugin that can handle a tag or null
   * @param {string} tagName - the name of the tag
   * @param {*} search - the value to search for
   * @return {Plugin} - the plugin or null
   */
  findPlugin(tagName, search) {
    for (let n = 0; n < this.plugins.length; n += 1) {
      const plugin = this.plugins[n];

      for (let i = 0; i < plugin.tags.length; i += 1) {
        const tag = plugin.tags[i];
        const tagValue = tag[tagName];

        if (tagValue) {
          let result = false;
          if (typeof tagValue === 'function') {
            result = tagValue(search);
          } else {
            result = tagValue === search;
          }
          if (result) {
            return plugin;
          }
        }
      }
    }

    console.log(`Failed to find plugin ${tagName}:${search}`);
    return null;
  }

  /**
   * If any plugin returns isEditable (true) then
   * the content is editable
   *
   * @param {Value} value the Slate value
   * @param {string} code the type of edit requested
   */
  isEditable(value, code) {
    // if no plugins have an `isEditable` method, return true
    if (!this.plugins.filter(plugin => plugin.isEditable).length) return true;

    for (let n = 0; n < this.plugins.length; n += 1) {
      const plugin = this.plugins[n];
      if (plugin.isEditable && plugin.isEditable(value, code)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Render the toolbar buttons for all plugins
   *
   * @param {Editor} editor
   * @return {Element}
   */
  renderToolbar(editor) {
    const buttons = [];
    this.plugins.forEach((plugin) => {
      if (plugin.renderToolbar) {
        const button = plugin.renderToolbar(editor);
        if (button) {
          buttons.push(button);
        }
      }
    });
    if (buttons.length > 0) {
      return (<React.Fragment>{buttons}</React.Fragment>);
    }
    return (<React.Fragment/>);
  }
}
