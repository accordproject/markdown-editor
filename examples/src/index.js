import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { MarkdownEditor } from '../../src';
import * as serviceWorker from './serviceWorker';
import 'semantic-ui-css/semantic.min.css';
import List from '../../src/plugins/list';
import Video from '../../src/plugins/video';

const plugins = [List(), Video()];

function storeLocal(editor) {
  localStorage.setItem('markdown-editor', editor.getMarkdown());
}

ReactDOM.render(<MarkdownEditor plugins={plugins} onChange={storeLocal} lockText={true}/>, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
