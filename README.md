# Markdown Editor

[![Netlify Status](https://api.netlify.com/api/v1/badges/952fdc5d-a2bb-4895-a375-25ea1c6f30d8/deploy-status)](https://app.netlify.com/sites/accordproject-markdown-editor/deploys) [![npm version](https://badge.fury.io/js/%40accordproject%2Fmarkdown-editor.svg)](https://badge.fury.io/js/%40accordproject%2Fmarkdown-editor)

This repo contains two React-based editors:
1. A WYSIWYG  [Slate](https://docs.slatejs.org/)-based editor that edits rich text and calls an `onChange`
   callback with the modified Slate DOM and the [CommonMark](https://commonmark.org markdown serilization.
2. A TextArea-based markdown editor that edits markdown text and calls an `onChange`
   callback with the equivalent Slate DOM and the modified markdown text.

Using these editors you could allow people to either edit rich formatted text using
markdown (and provide a WYSIWYG preview), or allow them to edit using a WYSIWYG
editor and use markdown for persistence.

The editor is plugin-based and includes a formatting toolbar. Plugins are used to
extend the core editor with support with new formatting functionality and/or new
types of blocks.

This component is Apache-2 licensed Open Source. Contributors welcome!

### [Demo](https://accordproject-markdown-editor.netlify.com/examples/)

### Usage

```
npm install @accordproject/markdown-editor
```

```
import { SlateAsInputEditor } from '@accordproject/markdown-editor';
import List from '@accordproject/markdown-editor/dist/plugins/list';
import Video from '@accordproject/markdown-editor/dist/plugins/video';

const plugins = [List(), Video()];

function storeLocal(slateValue, markdown) {
  // console.log(markdown);
  localStorage.setItem('markdown-editor', markdown);
}

const defaultMarkdown = '# Hello World.';

ReactDOM.render(<SlateAsInputEditor plugins={plugins} lockText={false} onChange={storeLocal}/>
, document.getElementById('root'));
```

### Example

For an example React App see the `./examples/` folder.

A `TextArea` containing [CommonMark](https://commonmark.org) synchronized with a `MarkdownEditor` component, rendered using [Slate](https://docs.slatejs.org/).

The code for the sample `video` plugin used in the demo is here:
https://github.com/accordproject/markdown-editor/blob/master/src/plugins/video.js

![overview image](overview.png)

Run `npm start` and then navigate to: http://localhost:3001/examples

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.<br>
Open [http://localhost:3001/examples](http://localhost:3001/examples) to view it in the browser.

The page will reload if you make edits.<br>

### `npm run build`

Builds the app for production to the `build` folder.<br>
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br>
Your app is ready to be deployed!
