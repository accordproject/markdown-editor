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
  var userAgent = window.navigator.userAgent,
      platform = window.navigator.platform,
      macosPlatforms = ['Macintosh', 'MacIntel', 'MacPPC', 'Mac68K'],
      windowsPlatforms = ['Win32', 'Win64', 'Windows', 'WinCE'],
      os = null,
      MOD = null;

  if (macosPlatforms.indexOf(platform) !== -1) {
    os = 'Mac OS';
    MOD = '⌘';
  }  else if (windowsPlatforms.indexOf(platform) !== -1) {
    os = 'Windows';
    MOD = 'Ctrl';
  } else if (!os && /Linux/.test(platform)) {
    os = 'Linux';
    MOD = 'Ctrl';
  }
  return MOD; 
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
    if(typeBeginning === 'bl') return 'Blockquote(' + MOD + '+Q)';
    if(typeBeginning === 'ul') return 'Unordered List(' + MOD + '+Shift+8)';
    if(typeBeginning === 'ol') return 'Ordered List(' + MOD + '+Shift+7)';
  return null;
};
