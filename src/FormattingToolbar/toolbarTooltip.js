/**
 *************** INTERNAL METHODS ***************
 */

/**
 * Methods for conversion to strings and further manipulation.
 */

const capitalizeFirst = word => word.toString().charAt(0).toUpperCase();

const sliceWord = word => word.toString().slice(1);

const firstTwoLetters = word => word.toString().slice(0, 2);


/**
 * Function to determine OS and MOD command of user
 */

function OS () {
  const {platform} = window.navigator;

  const macosPlatforms = {
    os: {
      "Macintosh": true, 
      "MacIntel": true, 
      "MacPPC": true, 
      "Mac68K": true
    },
    MOD: "⌘"
  };

  const windowsPlatforms = {
    os : {
      "Win32": true, 
      "Win64": true, 
      "Windows": true, 
      "WinCE": true
    },
    MOD: "Ctrl"
  };

  if (macosPlatforms.os[platform]) return macosPlatforms.MOD;
  return windowsPlatforms.MOD;
}

export const MOD = OS();

/**
 *************** EXTERNAL METHODS ***************
 */

/**
 * Converts an input into a string, capitalizes the first letter, and returns string
 */

export const capitalizeWord = word => capitalizeFirst(word) + sliceWord(word);

/**
 * Checks the beginning of a block type to determine the string to return
 */

export const identifyBlock = (block) => {
  const typeBeginning = firstTwoLetters(block);
    if(typeBeginning === 'bl') return 'Quote (' + MOD + '+Q)';
    if(typeBeginning === 'ul') return 'Bulleted List (' + MOD + '+Shift+8)';
    if(typeBeginning === 'ol') return 'Numbered List (' + MOD + '+Shift+7)';
  return null;
};
