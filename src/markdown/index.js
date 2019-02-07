import { FromMarkdown } from './fromMarkdown';
import { ToMarkdown } from './toMarkdown';


export class Markdown {
    constructor() {
        this.toMarkdown = new ToMarkdown();
        this.fromMarkdown = new FromMarkdown();
    }
}
