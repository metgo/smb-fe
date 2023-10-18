/**
 * Return the supplied string if a condition is satisfied, otherwise
 * return an empty string or the orElse parameter.
 *
 * @param {(string|() => string)} str the string to return if ifCondition is true
 * @param {boolean} ifCondition
 * @param {(string|() => string)=} orElse the string to return if ifCondition is not true
 * @returns {string}
 */
export function strIf(
  str,
  ifCondition,
  orElse?,
) {
  const positive = typeof str === 'string' ? () => str : str;
  const negative = (orElse === undefined || typeof orElse === 'string') ? () => (orElse || '') : orElse;

  return ifCondition ? positive() : negative();
}

/**
 * Pluralize noun depending on how many there are
 *
 * @param {(string|() => string)} plural
 * @param {(number|undefined)} count
 * @param {(string|() => string)=} singular
 * @returns {string}
 */
export function pluralize(
  plural,
  count,
  singular,
) {
  const countConst = count || 0;

  return strIf(plural, countConst !== 1, singular);
}

/**
 * @param {(string|undefined)} text
 * @returns
 */
export function toFirstLetterUppercase(text) {
  if (!text) {
    return text;
  }
  return text[0].toUpperCase() + text.slice(1);
}

/**
 * String.length is not unicode-aware. Use this function to get the correct
 * number of unicode characters in a string.
 *
 * @param {string} text
 */
export function unicodeCharCount(text) {
  return [...text].length;
}

/**
 * Convert a lower case string with dashes to capitalized string with spaces
 * @param {string|undefined} text
 * @returns {string|undefined}
 */
export function lowerCaseDashesToUpperCaseSpaces(text) {
  if (!text) {
    return text;
  }

  return text
    .split('-') // Split the string into words at the hyphens
    .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize the first letter of each word
    .join(' '); // Join the words back together with spaces
}

/**
 * Convert a camel case string to a capitalized string with spaces
 * @param {string|undefined} text - A camel case string (possibly with hyphens as well)
 * @returns {string|undefined} - A string that has a space before each
 * uppercase letter (except after a hyphen) and all words are capitalized.
 */
export function camelCaseToUpperCaseSpaces(text) {
  if (!text) {
    return text;
  }

  // Replace camel case with spaces before each uppercase letter (except after special characters)
  const spaced = text.replace(/([a-z0-9])([A-Z])/g, '$1 $2');

  // Capitalize the first letter of each word or the letter following a hyphen
  return spaced.replace(/\b\w|-\w/g, letter => letter.toUpperCase());
}

/**
 * Convert various formats to camel case
 * @param {string|undefined} text - A string that could be in any format
 * @returns {string|undefined} - A string in camel case format (keep hyphens though)
 */
export function convertToCamelCase(text) {
  if (!text) {
    return text;
  }

  // Normalize input to lower case with spaces
  const lowerCaseWithSpaces = text
    .replace(/([A-Z])/g, ' $1') // Insert a space before all uppercase letters
    .replace('- ', '-') // Remove spaces after hyphens
    .toLowerCase() // Convert to lower case
    .trim(); // Trim any leading or trailing spaces

  // Convert normalized input to camel case
  const camelCase = lowerCaseWithSpaces
    .split(' ') // Split the string into words at the spaces
    .map((word, index) => {
      if (index === 0) {
        return word;
      }
      return toFirstLetterUppercase(word);
    }) // Capitalize the first letter of each word, except for the first word
    .join(''); // Join the words back together without spaces

  return camelCase;
}
