import React from 'react';
import Enzyme, { mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import FormatToolbar from './index';

Enzyme.configure({ adapter: new Adapter() });

describe('SlateAsInputEditor component', () => {
  test.skip('a11y test', () => {
    const toolbarWrapper = document.createElement('div');
    toolbarWrapper.id = 'slate-toolbar-wrapper-id';
    window.document.querySelector = jest.fn(() => toolbarWrapper);

    const editor = {
      value: {
        activeMarks: [],
        blocks: [],
        fragment: {
          text: ''
        },
        inlines: []
      }
    };
    const pluginManager = {
      renderToolbar: () => null
    };
    const props = { editor, editorProps: {}, pluginManager };
    const wrapper = mount(
            <FormatToolbar {...props} />
    );
    expect(wrapper.find('svg').map(svg => svg.props()['aria-label']))
      .toEqual([
        'bold',
        'italic',
        'code',
        'block_quote',
        'ul_list',
        'ol_list',
        'link',
        'undo',
        'redo',
      ]);
  });
});
