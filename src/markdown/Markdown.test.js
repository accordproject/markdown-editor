import PluginManager from '../PluginManager';
import FromMarkdown from './fromMarkdown';
import ToMarkdown from './toMarkdown';
import List from '../plugins/list';

let fromMarkdown = null;
let toMarkdown = null;

beforeAll(() => {
  const plugins = [List()];
  const pluginManager = new PluginManager(plugins);
  fromMarkdown = new FromMarkdown(pluginManager);
  toMarkdown = new ToMarkdown(pluginManager);
});

/* Roundtrips */

test('can roundtrip basic text', () => {
  const markdownText = 'This is some text.';
  const value = fromMarkdown.convert(markdownText);
  const markdownRound = toMarkdown.convert(value);
  // expect(markdownRound).toMatch(markdownText);
  const valueRound = fromMarkdown.convert(markdownRound);
  expect(valueRound.toJSON()).toMatchSnapshot();
});

test('can roundtrip italic text', () => {
  const markdownText = 'This is *some* text.';
  const value = fromMarkdown.convert(markdownText);
  const markdownRound = toMarkdown.convert(value);
  // expect(markdownRound).toMatch(markdownText);
  const valueRound = fromMarkdown.convert(markdownRound);
  expect(valueRound.toJSON()).toMatchSnapshot();
});

test('can roundtrip bold text', () => {
  const markdownText = 'This is **some** text.';
  const value = fromMarkdown.convert(markdownText);
  const markdownRound = toMarkdown.convert(value);
  // expect(markdownRound).toMatch(markdownText);
  const valueRound = fromMarkdown.convert(markdownRound);
  expect(valueRound.toJSON()).toMatchSnapshot();
});

test('can roundtrip bold italic text', () => {
  const markdownText = 'This is ***some*** text.';
  const value = fromMarkdown.convert(markdownText);
  const markdownRound = toMarkdown.convert(value);
  // expect(markdownRound).toMatch(markdownText);
  const valueRound = fromMarkdown.convert(markdownRound);
  expect(valueRound.toJSON()).toMatchSnapshot();
});

test('can roundtrip h1 to slate', () => {
  const markdownText = '# Heading One';
  const value = fromMarkdown.convert(markdownText);
  const markdownRound = toMarkdown.convert(value);
  // expect(markdownRound).toMatch(markdownText);
  const valueRound = fromMarkdown.convert(markdownRound);
  expect(valueRound.toJSON()).toMatchSnapshot();
});

test('can roundtrip h2', () => {
  const markdownText = '## Heading Two';
  const value = fromMarkdown.convert(markdownText);
  const markdownRound = toMarkdown.convert(value);
  // expect(markdownRound).toMatch(markdownText);
  const valueRound = fromMarkdown.convert(markdownRound);
  expect(valueRound.toJSON()).toMatchSnapshot();
});

test('can roundtrip h3', () => {
  const markdownText = '### Heading Three';
  const value = fromMarkdown.convert(markdownText);
  const markdownRound = toMarkdown.convert(value);
  // expect(markdownRound).toMatch(markdownText);
  const valueRound = fromMarkdown.convert(markdownRound);
  expect(valueRound.toJSON()).toMatchSnapshot();
});

test('can roundtrip h4', () => {
  const markdownText = '#### Heading Four';
  const value = fromMarkdown.convert(markdownText);
  const markdownRound = toMarkdown.convert(value);
  // expect(markdownRound).toMatch(markdownText);
  const valueRound = fromMarkdown.convert(markdownRound);
  expect(valueRound.toJSON()).toMatchSnapshot();
});

test('can roundtrip h5', () => {
  const markdownText = '##### Heading Five';
  const value = fromMarkdown.convert(markdownText);
  const markdownRound = toMarkdown.convert(value);
  // expect(markdownRound).toMatch(markdownText);
  const valueRound = fromMarkdown.convert(markdownRound);
  expect(valueRound.toJSON()).toMatchSnapshot();
});

test('can roundtrip h6', () => {
  const markdownText = '###### Heading Six';
  const value = fromMarkdown.convert(markdownText);
  const markdownRound = toMarkdown.convert(value);
  // expect(markdownRound).toMatch(markdownText);
  const valueRound = fromMarkdown.convert(markdownRound);
  expect(valueRound.toJSON()).toMatchSnapshot();
});

test('can roundtrip paragraphs', () => {
  const markdownText = `This is first paragraph.
  
  This is second paragraph.`;
  const value = fromMarkdown.convert(markdownText);
  const markdownRound = toMarkdown.convert(value);
  // expect(markdownRound).toMatch(markdownText);
  const valueRound = fromMarkdown.convert(markdownRound);
  expect(valueRound.toJSON()).toMatchSnapshot();
});

test('can roundtrip inline code', () => {
  const markdownText = 'This is `inline code`.';
  const value = fromMarkdown.convert(markdownText);
  const markdownRound = toMarkdown.convert(value);
  // expect(markdownRound).toMatch(markdownText);
  const valueRound = fromMarkdown.convert(markdownRound);
  expect(valueRound.toJSON()).toMatchSnapshot();
});

test('can roundtrip a link', () => {
  const markdownText = 'This is [a link](http://clause.io).';
  const value = fromMarkdown.convert(markdownText);
  const markdownRound = toMarkdown.convert(value);
  // expect(markdownRound).toMatch(markdownText);
  const valueRound = fromMarkdown.convert(markdownRound);
  expect(valueRound.toJSON()).toMatchSnapshot();
});

test('can roundtrip a thematic break', () => {
  const markdownText = `This is 
  
  ---
  A footer.`;
  const value = fromMarkdown.convert(markdownText);
  const markdownRound = toMarkdown.convert(value);
  // expect(markdownRound).toMatch(markdownText);
  const valueRound = fromMarkdown.convert(markdownRound);
  expect(valueRound.toJSON()).toMatchSnapshot();
});

test('can roundtrip a blockquote', () => {
  const markdownText = `This is
  > A quote.`;
  const value = fromMarkdown.convert(markdownText);
  const markdownRound = toMarkdown.convert(value);
  // expect(markdownRound).toMatch(markdownText);
  const valueRound = fromMarkdown.convert(markdownRound);
  expect(valueRound.toJSON()).toMatchSnapshot();
});

test('can roundtrip a multiline html block', () => {
  const markdownText = `This is a custom
  
  <custom src="property">
  contents
  </custom>

  block.`;
  const value = fromMarkdown.convert(markdownText);
  const markdownRound = toMarkdown.convert(value);
  // expect(markdownRound).toMatch(markdownText);
  const valueRound = fromMarkdown.convert(markdownRound);
  expect(valueRound.toJSON()).toMatchSnapshot();
});

test('can roundtrip an ordered list', () => {
  const markdownText = `This is an ordered list:
1. one
1. two
1. three

Done.`;
  const value = fromMarkdown.convert(markdownText);
  const markdownRound = toMarkdown.convert(value);
  // expect(markdownRound).toMatch(markdownText);
  const valueRound = fromMarkdown.convert(markdownRound);
  expect(valueRound.toJSON()).toMatchSnapshot();
});

test('can roundtrip an unordered list', () => {
  const markdownText = `This is an unordered list:
* one
* two
* three

Done.`;
  const value = fromMarkdown.convert(markdownText);
  const markdownRound = toMarkdown.convert(value);
  // expect(markdownRound).toMatch(markdownText);
  const valueRound = fromMarkdown.convert(markdownRound);
  expect(valueRound.toJSON()).toMatchSnapshot();
});

test('can roundtrip a single line html block', () => {
  const markdownText = 'This is a <custom src="property"/> property.';
  const value = fromMarkdown.convert(markdownText);
  const markdownRound = toMarkdown.convert(value);
  // expect(markdownRound).toMatch(markdownText);
  const valueRound = fromMarkdown.convert(markdownRound);
  expect(valueRound.toJSON()).toMatchSnapshot();
});

test('can roundtrip a code block', () => {
  const markdownText = `\`\`\`
  this is a multiline
  code
  block.
  \`\`\``;
  const value = fromMarkdown.convert(markdownText);
  const markdownRound = toMarkdown.convert(value);
  // expect(markdownRound).toMatch(markdownText);
  const valueRound = fromMarkdown.convert(markdownRound);
  expect(valueRound.toJSON()).toMatchSnapshot();
});

