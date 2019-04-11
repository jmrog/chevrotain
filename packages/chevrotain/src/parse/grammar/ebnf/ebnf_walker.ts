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

function append(newText: string, existingText: string) {
    const lastExistingChar = existingText.slice(-1)
    const addSpace =
        existingText.length > 0 &&
        !(lastExistingChar === "(" || lastExistingChar === ")")
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

export class EbnfWalker {
    private topRules: Rule[] = []
    private ebnf: { [productionName: string]: string } = {}
    private currentRuleName: string

    constructor(topRules: Rule[]) {
        this.topRules = topRules
    }

    toString() {
        return map(keys(this.ebnf), key => `${key} ::= ${this.ebnf[key]}`).join(
            "\n"
        )
    }

    walk() {
        forEach(this.topRules, rule => (this.ebnf[rule.name] = ""))
        forEach(this.topRules, rule => this.walkRule(rule))
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
        this.ebnf[terminalType.tokenName] = isString(terminalType.PATTERN)
            ? `'${terminalType.PATTERN}'`
            : terminalType.PATTERN.source
        this.ebnf[this.currentRuleName] = append(
            terminalType.tokenName,
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
                "EMPTY_ALT",
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
