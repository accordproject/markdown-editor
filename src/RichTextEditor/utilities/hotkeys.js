import * as SCHEMA from './schema';

const HOTKEYS = {
  'mod+b': {
    type: 'mark',
    code: SCHEMA.MARK_BOLD,
  },
  'mod+i': {
    type: 'mark',
    code: SCHEMA.MARK_ITALIC,
  },
  'mod+shift+9': {
    type: 'mark',
    code: SCHEMA.MARK_CODE,
  },
  'mod+shift+7': {
    type: 'block',
    code: SCHEMA.OL_LIST,
  },
  'mod+shift+8': {
    type: 'block',
    code: SCHEMA.UL_LIST,
  },
  'mod+shift+.': {
    type: 'block',
    code: SCHEMA.BLOCK_QUOTE,
  },
  'mod+z': {
    type: 'special',
    code: 'undo',
  },
  'mod+shift+z': {
    type: 'special',
    code: 'redo',
  }
};

export const formattingHotKeys = ['mod+b', 'mod+i', 'mod+shift+7', 'mod+shift+8', 'mod+shift+9', 'mod+shift+.'];

export default HOTKEYS;
