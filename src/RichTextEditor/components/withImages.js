import React from 'react';
import PropTypes from 'prop-types';
import imageExtensions from 'image-extensions';
import isUrl from 'is-url';
import { Transforms } from 'slate';
import {
  useEditor,
  useSelected,
  useFocused
} from 'slate-react';
import { css } from 'emotion';

import Button from './Button';
import Icon from './Icon';

export const insertImage = (editor, url) => {
  const text = { text: '' };
  const image = { type: 'image', data: { href: url, title: url }, children: [text] };
  Transforms.insertNodes(editor, image);
};

const isImageUrl = (url) => {
  if (!url) return false;
  if (!isUrl(url)) return false;
  const ext = new URL(url).pathname.split('.').pop();
  return imageExtensions.includes(ext);
};

export const withImages = (editor) => {
  const { insertData, isVoid } = editor;

  editor.isVoid = element => (element.type === 'image' ? true : isVoid(element));

  editor.insertData = (data) => {
    const text = data.getData('text/plain');
    const { files } = data;

    if (files && files.length > 0) {
      for (const file of files) {
        const reader = new FileReader();
        const [mime] = file.type.split('/');

        if (mime === 'image') {
          reader.addEventListener('load', () => {
            const url = reader.result;
            insertImage(editor, url);
          });

          reader.readAsDataURL(file);
        }
      }
    } else if (isImageUrl(text)) {
      insertImage(editor, text);
    } else {
      insertData(data);
    }
  };

  return editor;
};

export const InsertImageButton = () => {
  const editor = useEditor();
  return (
    <Button
      onMouseDown={(event) => {
        event.preventDefault();
        const url = window.prompt('Enter the URL of the image:');
        if (!url) return;
        insertImage(editor, url);
      }}
    >
      <Icon>image</Icon>
    </Button>
  );
};

const ImageElement = ({ attributes, children, element }) => {
  const selected = useSelected();
  const focused = useFocused();
  return (
    <div {...attributes}>
      <div contentEditable={false}>
        <img
          src={element.data.href}
          className={css`
            display: block;
            max-width: 100%;
            max-height: 20em;
            box-shadow: ${selected && focused ? '0 0 0 3px #B4D5FF' : 'none'};
          `}
        />
      </div>
      {children}
    </div>
  );
};

ImageElement.propTypes = {
  children: PropTypes.node,
  element: PropTypes.shape({
    data: PropTypes.shape({
      href: PropTypes.string
    })
  }),
  attributes: PropTypes.any
};

export default ImageElement;
