import { Parser, Rule, IParserConfig, TokenVocabulary } from "../../api"
import { genUmdModule, genWrapperFunction } from "./generate"
import { genCstSignatures } from "./generate_dts"

export function generateParserFactory(options: {
    name: string
    rules: Rule[]
    tokenVocabulary: TokenVocabulary
}): (config?: IParserConfig) => Parser {
    const wrapperText = genWrapperFunction({
        name: options.name,
        rules: options.rules
    })

    const constructorWrapper = new Function(
        "tokenVocabulary",
        "config",
        "chevrotain",
        wrapperText
    )

    return function(config) {
        return constructorWrapper(
            options.tokenVocabulary,
            config,
            // TODO: check how the require is transpiled/webpacked
            require("../api")
        )
    }
}

export function generateParserModule(options: {
    name: string
    rules: Rule[]
}): string {
    return genUmdModule({ name: options.name, rules: options.rules })
}

export function generateCstSignatures(options: {
    name: string
    rules: Rule[]
    visitorsInterfaces?: boolean
}): string {
    return genCstSignatures(options)
}
