// import 'brace/mode/text';

export class RuneHighlightRules extends window.ace.acequire('ace/mode/text_highlight_rules').TextHighlightRules {
    constructor() {
        super();
        this.$rules = {
            start: [
                {
                    token: 'entity.name.function',
                    regex: /(.{1,2}(=[a-z]+)?:)/,
                },
                {
                    token: 'constant',
                    regex: /#([a-z]+)/,
                },
                {
                    token: 'variable.parameter',
                    regex: /(?!:)([*+/#-\da-z]+?)/,
                },
                {
                    token: 'string.interpolated',
                    regex: /{(.+)}/,
                },
                {
                    token: 'comment',
                    regex: /\/\/.+/,
                },
                {
                    token: 'empty_line',
                    regex: '^$',
                },
                { token: 'text', regex: /,/ },
                {
                    defaultToken: 'text',
                },
            ],
        };
    }
}

export default class RuneScriptMode extends window.ace.acequire('ace/mode/text').Mode {
    constructor() {
        super();
        this.HighlightRules = RuneHighlightRules;
    }
}
