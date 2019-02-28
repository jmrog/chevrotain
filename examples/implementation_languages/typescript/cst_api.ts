import { CstNode, ICstVisitor, IToken } from "chevrotain"

export interface NameCstVisitor<IN, OUT> extends ICstVisitor<IN, OUT> {
    prod1(ctx: Prod1Children, param?: IN): OUT
    prod2(ctx: Prod2Children, param?: IN): OUT
}

interface TomlCstVisitorConstructor<IN, OUT> {
    new (): NameCstVisitor<IN, OUT>
}

export interface Prod1CstNode extends CstNode {
    name: "toml"
    children: Prod1Children
}
export type Prod1Children = {
    Prod2: Prod2CstNode[]
    Terminal1: IToken[]
}

export interface Prod2CstNode extends CstNode {
    name: "toml"
    children: Prod2Children
}
export type Prod2Children = {
    Terminal2: IToken[]
    Terminal3: IToken[]
}
