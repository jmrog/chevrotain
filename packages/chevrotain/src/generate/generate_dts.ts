import { Rule } from "../../api"
import { defaults } from "../utils/utils"

export function genCstSignatures(options: {
    name: string
    rules: Rule[]
    visitorsInterfaces?: boolean
}) {
    const actualOptions = defaults(options, { visitorsInterfaces: true })
}
