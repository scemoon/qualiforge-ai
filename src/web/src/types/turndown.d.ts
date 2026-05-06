declare module 'turndown' {
  class TurndownService {
    constructor(options?: {
      headingStyle?: 'atx' | 'setext'
      codeBlockStyle?: 'fenced' | 'indented'
      bulletListMarker?: '-' | '+' | '*'
      emDelimiter?: '_' | '*'
      strongDelimiter?: '__' | '**'
      linkStyle?: 'inlined' | 'referenced'
      linkReferenceStyle?: 'full' | 'collapsed' | 'shortcut'
    })
    turndown(html: string): string
    addRule(name: string, rule: {
      filter: string | string[] | ((node: HTMLElement) => boolean)
      replacement: (content: string, node: HTMLElement) => string
    }): this
  }
  export = TurndownService
}