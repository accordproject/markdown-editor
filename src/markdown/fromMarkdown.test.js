import PluginManager from '../PluginManager';
import FromMarkdown from './fromMarkdown';
import List from '../plugins/list';

let fromMarkdown = null;

beforeAll(() => {
  const plugins = [List()];
  const pluginManager = new PluginManager(plugins);
  fromMarkdown = new FromMarkdown(pluginManager);
});

test('can convert basic text', () => {
  const markdownText = 'This is some text.';
  const value = fromMarkdown.convert(markdownText);
  expect(value.toJSON()).toMatchSnapshot();
});

test('can convert italic text', () => {
  const markdownText = 'This is *some* text.';
  const value = fromMarkdown.convert(markdownText);
  expect(value.toJSON()).toMatchSnapshot();
});

test('can convert bold text', () => {
  const markdownText = 'This is **some** text.';
  const value = fromMarkdown.convert(markdownText);
  expect(value.toJSON()).toMatchSnapshot();
});

test('can convert bold italic text', () => {
  const markdownText = 'This is ***some*** text.';
  const value = fromMarkdown.convert(markdownText);
  expect(value.toJSON()).toMatchSnapshot();
});

test('can convert h1 to slate', () => {
  const markdownText = '# Heading One';
  const value = fromMarkdown.convert(markdownText);
  expect(value.toJSON()).toMatchSnapshot();
});

test('can convert h2', () => {
  const markdownText = '## Heading Two';
  const value = fromMarkdown.convert(markdownText);
  expect(value.toJSON()).toMatchSnapshot();
});

test('can convert h3', () => {
  const markdownText = '### Heading Three';
  const value = fromMarkdown.convert(markdownText);
  expect(value.toJSON()).toMatchSnapshot();
});

test('can convert h4', () => {
  const markdownText = '#### Heading Four';
  const value = fromMarkdown.convert(markdownText);
  expect(value.toJSON()).toMatchSnapshot();
});

test('can convert h5', () => {
  const markdownText = '##### Heading Five';
  const value = fromMarkdown.convert(markdownText);
  expect(value.toJSON()).toMatchSnapshot();
});

test('can convert h6', () => {
  const markdownText = '###### Heading Six';
  const value = fromMarkdown.convert(markdownText);
  expect(value.toJSON()).toMatchSnapshot();
});

test('can convert paragraphs', () => {
  const markdownText = `This is first paragraph.
  
  This is second paragraph.`;
  const value = fromMarkdown.convert(markdownText);
  expect(value.toJSON()).toMatchSnapshot();
});

test('can convert inline code', () => {
  const markdownText = 'This is `inline code`.';
  const value = fromMarkdown.convert(markdownText);
  expect(value.toJSON()).toMatchSnapshot();
});

test('can convert a link', () => {
  const markdownText = 'This is [a link](http://clause.io).';
  const value = fromMarkdown.convert(markdownText);
  expect(value.toJSON()).toMatchSnapshot();
});

test('can convert a thematic break', () => {
  const markdownText = `This is 
  
  ---
  A footer.`;
  const value = fromMarkdown.convert(markdownText);
  expect(value.toJSON()).toMatchSnapshot();
});

test('can convert a blockquote', () => {
  const markdownText = `This is
  > A quote.`;
  const value = fromMarkdown.convert(markdownText);
  expect(value.toJSON()).toMatchSnapshot();
});

test('can convert a multiline html block', () => {
  const markdownText = `This is a custom
  
  <custom src="property">
  contents
  </custom>

  block.`;
  const value = fromMarkdown.convert(markdownText);
  expect(value.toJSON()).toMatchSnapshot();
});

test('can convert an ordered list', () => {
  const markdownText = `This is an ordered list:
1. one
1. two
1. three

Done.`;
  const value = fromMarkdown.convert(markdownText);
  expect(value.toJSON()).toMatchSnapshot();
});

test('can convert an unordered list', () => {
  const markdownText = `This is an unordered list:
* one
* two
* three

Done.`;
  const value = fromMarkdown.convert(markdownText);
  expect(value.toJSON()).toMatchSnapshot();
});

test('can convert a single line html block', () => {
  const markdownText = 'This is a <custom src="property"/> property.';
  const value = fromMarkdown.convert(markdownText);
  expect(value.toJSON()).toMatchSnapshot();
});

test('can convert a code block', () => {
  const markdownText = `\`\`\`
  this is a multiline
  code
  block.
  \`\`\``;
  const value = fromMarkdown.convert(markdownText);
  expect(value.toJSON()).toMatchSnapshot();
});

