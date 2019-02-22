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
   * Returns the first plugin that can handle an HTML tag, or null
   * @param {string} tag - the HTML tag to search for
   * @return {Plugin} - the plugin or null
   */
  findPluginByHtmlTag(tag) {
    for (let n = 0; n < this.plugins.length; n += 1) {
      const plugin = this.plugins[n];
      if (plugin.tags.includes(tag)) {
        return plugin;
      }
    }

    return null;
  }

  /**
   * Returns the first plugin that can handle a Markdown tag, or null
   * @param {string} tag - the Markdown tag to search for
   * @return {Plugin} - the plugin or null
   */
  findPluginByMarkdownTag(tag) {
    for (let n = 0; n < this.plugins.length; n += 1) {
      const plugin = this.plugins[n];
      if (plugin.markdownTags.includes(tag)) {
        return plugin;
      }
    }

    return null;
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
