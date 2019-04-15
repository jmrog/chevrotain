import {
    Rule,
    Terminal,
    NonTerminal,
    Option,
    Repetition,
    RepetitionMandatory,
    Flat,
    Alternation,
    RepetitionWithSeparator,
    RepetitionMandatoryWithSeparator
} from "../gast/gast_public"
import { forEach, keys, map, isString } from "../../../utils/utils"
import { IProduction, IProductionWithDefinition } from "../../../../api"
import { tokenLabel } from "../../../scan/tokens_public"

export interface EbnfWalkerOptions {
    stripTopLevelParens?: boolean
    useLabels?: boolean
    ruleLineSeparator?: string
}

const parenOrWhitespaceMatcher = /[()\s]/
const EMPTY_ALT_LABEL = "EMPTY_ALT"
const CUSTOM_PATTERN_LABEL = "CUSTOM_TOKEN_PATTERN"
const MISSING_PATTERN_LABEL = "MISSING_PATTERN"

function append(
    newText: string,
    existingText: string,
    addSpace = existingText.length > 0
) {
    return `${existingText}${addSpace ? " " : ""}${newText}`
}

function appendWrapperChar(
    char: string,
    existingText: string,
    hasMultiple: boolean
) {
    if (!hasMultiple) {
        return existingText
    }
    return append(char, existingText)
}

function strip(line: string) {
    const trimmed = line.trim()
    const lineLen = line.length
    let numStartParens = 0
    let numEndParens = 0
    let startParenIndices = []
    let endParenIndices = []

    for (
        let i = 0;
        i < lineLen && parenOrWhitespaceMatcher.test(line[i]);
        i++
    ) {
        if (line[i] === "(") {
            numStartParens++
            startParenIndices.push(i)
        }
    }

    if (numStartParens === 0) {
        return trimmed
    }

    for (
        let i = lineLen - 1;
        i > startParenIndices[numStartParens - 1] &&
        parenOrWhitespaceMatcher.test(line[i]);
        i--
    ) {
        if (line[i] === ")") {
            numEndParens++
            endParenIndices.push(i)
        }
    }

    if (numEndParens === 0) {
        return trimmed
    }

    if (numStartParens === numEndParens) {
        return trimmed
            .slice(
                startParenIndices[numStartParens - 1] + 1,
                endParenIndices[numEndParens - 1]
            )
            .trim()
    } else if (numStartParens > numEndParens) {
        return trimmed
            .slice(
                startParenIndices[numEndParens - 1] + 1,
                endParenIndices[numEndParens - 1]
            )
            .trim()
    } else {
        return trimmed
            .slice(
                startParenIndices[numStartParens - 1] + 1,
                endParenIndices[numStartParens - 1]
            )
            .trim()
    }
}

export class EbnfWalker {
    private ebnf: { [productionName: string]: string } = {}
    private currentOptions: EbnfWalkerOptions = {}
    private currentRuleName: string

    toString() {
        const {
            stripTopLevelParens,
            ruleLineSeparator = "\n"
        } = this.currentOptions
        return map(
            keys(this.ebnf),
            key =>
                `${key} ::= ${
                    stripTopLevelParens ? strip(this.ebnf[key]) : this.ebnf[key]
                }`
        ).join(ruleLineSeparator)
    }

    walk(topRules: Rule[] = [], options: EbnfWalkerOptions = {}) {
        this.ebnf = {}
        this.currentOptions = options
        forEach(topRules, rule => (this.ebnf[rule.name] = ""))
        forEach(topRules, rule => this.walkRule(rule))
        return this
    }

    walkRule(node: Rule) {
        this.currentRuleName = node.name
        forEach(node.definition, (prod: IProduction) => this.walkProd(prod))
    }

    walkProd(prod: IProduction) {
        if (prod instanceof Terminal) {
            this.walkTerminal(prod)
        } else if (prod instanceof NonTerminal) {
            this.walkProdRef(prod)
        } else if (prod instanceof Flat) {
            this.walkFlat(prod)
        } else if (prod instanceof Option) {
            this.walkOption(prod)
        } else if (prod instanceof Alternation) {
            this.walkOr(prod)
        } else if (prod instanceof Repetition) {
            this.walkMany(prod)
        } else if (prod instanceof RepetitionMandatory) {
            this.walkAtLeastOne(prod)
        } else if (prod instanceof RepetitionWithSeparator) {
            this.walkManySep(prod)
        } else if (prod instanceof RepetitionMandatoryWithSeparator) {
            this.walkAtLeastOneSep(prod)
        }
    }

    walkProdWithChildren(
        node: IProductionWithDefinition,
        endChar: string,
        separator = ""
    ) {
        const numProds = node.definition.length
        const hasMultiple = numProds > 1

        this.ebnf[this.currentRuleName] = appendWrapperChar(
            "(",
            this.ebnf[this.currentRuleName],
            hasMultiple
        )
        forEach(node.definition, (prod, index) => {
            this.walkProd(prod)
            if (index < numProds - 1) {
                this.ebnf[this.currentRuleName] += separator
            }
        })
        this.ebnf[this.currentRuleName] = `${appendWrapperChar(
            ")",
            this.ebnf[this.currentRuleName],
            hasMultiple
        )}${endChar}`
    }

    walkTerminal(node: Terminal) {
        const { terminalType } = node
        let label = this.currentOptions.useLabels
            ? tokenLabel(terminalType)
            : terminalType.tokenName
        let ebnfText

        if (typeof terminalType.PATTERN === "function") {
            ebnfText = CUSTOM_PATTERN_LABEL
        } else if (typeof terminalType.PATTERN === "undefined") {
            ebnfText = MISSING_PATTERN_LABEL
        } else {
            ebnfText = isString(terminalType.PATTERN)
                ? `'${terminalType.PATTERN}'`
                : terminalType.PATTERN.toString()
        }

        this.ebnf[label] = ebnfText
        this.ebnf[this.currentRuleName] = append(
            label,
            this.ebnf[this.currentRuleName]
        )
    }

    walkProdRef(node: NonTerminal) {
        this.ebnf[this.currentRuleName] = append(
            node.nonTerminalName,
            this.ebnf[this.currentRuleName]
        )
    }

    walkFlat(node: Flat) {
        if (node.definition.length === 0) {
            this.ebnf[this.currentRuleName] = append(
                EMPTY_ALT_LABEL,
                this.ebnf[this.currentRuleName]
            )
            return
        }
        forEach(node.definition, prod => this.walkProd(prod))
    }

    walkOption(node: Option) {
        this.walkProdWithChildren(node, "?")
    }

    walkOr(node: Alternation) {
        this.walkProdWithChildren(node, "", " |")
    }

    walkMany(node: Repetition) {
        this.walkProdWithChildren(node, "*")
    }

    walkAtLeastOne(node: RepetitionMandatory) {
        this.walkProdWithChildren(node, "+")
    }

    walkManySep(node: RepetitionWithSeparator) {
        this.walkProdWithChildren(node, "*", ` ${node.separator}`)
    }

    walkAtLeastOneSep(node: RepetitionMandatoryWithSeparator) {
        this.walkProdWithChildren(node, "+", ` ${node.separator}`)
    }
}
