// TODO: The following signatures need to be generated
//       auto-magically.
import { CstNode, ICstVisitor, IToken } from "chevrotain"

export interface TomlCstVisitor<IN, OUT> extends ICstVisitor<IN, OUT> {
    toml(ctx: TomlCtx, param?: IN): OUT
    expression(ctx: ExpressionCtx, param?: IN): OUT
}

interface TomlCstVisitorConstructor<IN, OUT> {
    new (): TomlCstVisitor<IN, OUT>
}

interface TomlCstVisitorWithDefaultsConstructor<IN, OUT> {
    new (): TomlCstVisitorWithDefaults<IN, OUT>
}
//www.ebay.com/sch/i.html?_odkw=msi+980ti&_sop=15&_sadis=15&_dmd=1&LH_Complete=1&_osacat=0&_ipg=200&_from=R40&_trksid=m570.l1313&_nkw=msi+980ti+gaming&_sacat=0b34vecd
https: export interface TomlCstNode extends CstNode {
    name: "toml"
    children: TomlCtx
}
export type TomlCtx = {
    expression: ExpressionCstNode[]
    nl: NlCstNode[]
}

export interface ExpressionCstNode extends CstNode {
    name: "expression"
    children: ExpressionCtx
}
export type ExpressionCtx = {
    keyval: KeyvalCstNode[]
    table: TableCstNode[]
    Comment: IToken[]
}

export interface KeyvalCstNode extends CstNode {
    name: "keyval"
    children: KeyvalCtx
}
export type KeyvalCtx = {
    key: KeyCstNode[]
    KeyValSep: IToken[]
    val: ValCstNode[]
}

export interface KeyCstNode extends CstNode {
    name: "key"
    children: KeyCtx
}

export type KeyCtx = {
    IKey: IToken[]
    Dot: IToken[]
}

export interface ValCstNode extends CstNode {
    name: "val"
    children: ValCtx
}

export type ValCtx = {
    IString: IToken[]
    IBoolean: IToken[]
    array: ArrayCstNode[]
    inlineTable: InlineTableCstNode[]
    IDateTime: IToken[]
    IFloat: IToken[]
    IInteger: IToken[]
}

export interface ArrayCstNode extends CstNode {
    name: "array"
    children: ArrayCtx
}
export type ArrayCtx = {
    LSquare: IToken[]
    commentNewline: CommentNewlineCstNode[]
    arrayValues: ArrayValuesCstNode[]
    RSquare: IToken[]
}

export interface ArrayValuesCstNode extends CstNode {
    name: "arrayValues"
    children: ArrayValuesCtx
}
export type ArrayValuesCtx = {
    commentNewline: CommentNewlineCstNode[]
    val: ValCstNode[]
    Comma: IToken[]
}

export interface InlineTableCstNode extends CstNode {
    name: "inlineTable"
    children: InlineTableCtx
}
export type InlineTableCtx = {
    LCurly: IToken[]
    inlineTableKeyVals: InlineTableKeyValsCstNode[]
    RCurly: IToken[]
}

export interface InlineTableKeyValsCstNode extends CstNode {
    name: "inlineTableKeyVals"
    children: InlineTableKeyValsCtx
}
export type InlineTableKeyValsCtx = {
    keyval: KeyvalCstNode[]
    Comma: IToken[]
}

export interface TableCstNode extends CstNode {
    name: "table"
    children: TableCtx
}
export type TableCtx = {
    stdTable?: StdTableCstNode[]
    arrayTable?: ArrayTableCstNode[]
}

export interface StdTableCstNode extends CstNode {
    name: "stdTable"
    children: StdTableCtx
}
export type StdTableCtx = {
    LSquare: IToken[]
    key: KeyCstNode[]
    RSquare: IToken[]
}

export interface ArrayTableCstNode extends CstNode {
    name: "arrayTable"
    children: ArrayTableCtx
}
export type ArrayTableCtx = {
    LSquare: IToken[]
    key: KeyCstNode[]
    RSquare: IToken[]
}

export interface NlCstNode extends CstNode {
    name: "nl"
    children: NlCtx
}
export type NlCtx = {
    Newline: IToken[]
}

export interface CommentNewlineCstNode extends CstNode {
    name: "commentNewline"
    children: CommentNewlineCtx
}
export type CommentNewlineCtx = {
    Comment?: IToken[]
    Newline?: IToken[]
}
