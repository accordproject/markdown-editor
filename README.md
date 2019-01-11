This is a React component for a rich text editor that can read and write [CommonMark](https://commonmark.org) Markdown text. The editor uses [Slate.js](https://slatejs.org).

The editor includes keyboard shortcuts for Markdown formatting and a pop-up formatting toolbar.

This component is Apache-2 licensed Open Source. Contributors welcome!

### Usage

```
npm install @accordproject/markdown-editor
```

```
import { MarkdownEditor } from '@accordproject/markdown-editor';

ReactDOM.render(<MarkdownEditor />, document.getElementById('root'));
```

### Example

For an example React App see the ./examples/ folder.

A `TextArea` containing CommonMark synchronized with a `MarkdownEditor` component, rendered using Slate.js.

![overview image](overview.png)

Run `npm start` and then navigate to: http://localhost:3001/examples

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.<br>
Open [http://localhost:3001](http://localhost:30001 to view it in the browser.

The page will reload if you make edits.<br>

### `npm run build`

Builds the app for production to the `build` folder.<br>
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br>
Your app is ready to be deployed!