/**
 * UI icons via lucide-react (ISC License).
 * License notice: see /THIRD_PARTY_NOTICES.md
 */
import {
  ArrowRight,
  Baseline,
  Bold,
  CheckSquare,
  Circle,
  Diamond,
  Droplets,
  Eraser,
  Feather,
  FileText,
  Heading1,
  Heading2,
  Heading3,
  Hexagon,
  Highlighter,
  IndentDecrease,
  IndentIncrease,
  Italic,
  List,
  ListChecks,
  ListOrdered,
  Minus,
  MousePointer2,
  Paintbrush,
  PenLine,
  PenTool,
  Pencil,
  Plus,
  Quote,
  Shapes,
  Square,
  StickyNote,
  Sigma,
  Trash2,
  Triangle,
  Type,
  X,
  type LucideProps,
} from "lucide-react";

export type IconProps = LucideProps;

const defaults = { size: 18, strokeWidth: 1.75 } as const;

export function IconNote(props: IconProps) {
  return <FileText {...defaults} {...props} aria-hidden />;
}
export function IconBoard(props: IconProps) {
  return <Shapes {...defaults} {...props} aria-hidden />;
}
export function IconTodo(props: IconProps) {
  return <ListChecks {...defaults} {...props} aria-hidden />;
}
export function IconPlus(props: IconProps) {
  return <Plus {...defaults} {...props} aria-hidden />;
}
export function IconClose(props: IconProps) {
  return <X {...defaults} {...props} aria-hidden />;
}
export function IconType(props: IconProps) {
  return <Type {...defaults} {...props} aria-hidden />;
}
export function IconPen(props: IconProps) {
  return <PenTool {...defaults} {...props} aria-hidden />;
}
export function IconEraser(props: IconProps) {
  return <Eraser {...defaults} {...props} aria-hidden />;
}
export function IconBold(props: IconProps) {
  return <Bold {...defaults} {...props} aria-hidden />;
}
export function IconItalic(props: IconProps) {
  return <Italic {...defaults} {...props} aria-hidden />;
}
export function IconList(props: IconProps) {
  return <List {...defaults} {...props} aria-hidden />;
}
export function IconListOrdered(props: IconProps) {
  return <ListOrdered {...defaults} {...props} aria-hidden />;
}
export function IconListCheck(props: IconProps) {
  return <CheckSquare {...defaults} {...props} aria-hidden />;
}
export function IconHeading(props: IconProps) {
  return <Heading2 {...defaults} {...props} aria-hidden />;
}
export function IconH1(props: IconProps) {
  return <Heading1 {...defaults} {...props} aria-hidden />;
}
export function IconH2(props: IconProps) {
  return <Heading2 {...defaults} {...props} aria-hidden />;
}
export function IconH3(props: IconProps) {
  return <Heading3 {...defaults} {...props} aria-hidden />;
}
export function IconIndent(props: IconProps) {
  return <IndentIncrease {...defaults} {...props} aria-hidden />;
}
export function IconOutdent(props: IconProps) {
  return <IndentDecrease {...defaults} {...props} aria-hidden />;
}
export function IconQuote(props: IconProps) {
  return <Quote {...defaults} {...props} aria-hidden />;
}
export function IconPencil(props: IconProps) {
  return <Pencil {...defaults} {...props} aria-hidden />;
}
export function IconBallpoint(props: IconProps) {
  return <PenLine {...defaults} {...props} aria-hidden />;
}
export function IconFountain(props: IconProps) {
  return <Feather {...defaults} {...props} aria-hidden />;
}
export function IconMarker(props: IconProps) {
  return <Droplets {...defaults} {...props} aria-hidden />;
}
export function IconHighlighter(props: IconProps) {
  return <Highlighter {...defaults} {...props} aria-hidden />;
}
export function IconBrush(props: IconProps) {
  return <Paintbrush {...defaults} {...props} aria-hidden />;
}
export function IconTrash(props: IconProps) {
  return <Trash2 {...defaults} {...props} aria-hidden />;
}
export function IconSelect(props: IconProps) {
  return <MousePointer2 {...defaults} {...props} aria-hidden />;
}
export function IconRect(props: IconProps) {
  return <Square {...defaults} {...props} aria-hidden />;
}
export function IconEllipse(props: IconProps) {
  return <Circle {...defaults} {...props} aria-hidden />;
}
export function IconDiamond(props: IconProps) {
  return <Diamond {...defaults} {...props} aria-hidden />;
}
export function IconTriangle(props: IconProps) {
  return <Triangle {...defaults} {...props} aria-hidden />;
}
export function IconHexagon(props: IconProps) {
  return <Hexagon {...defaults} {...props} aria-hidden />;
}
export function IconSticky(props: IconProps) {
  return <StickyNote {...defaults} {...props} aria-hidden />;
}
export function IconShapes(props: IconProps) {
  return <Shapes {...defaults} {...props} aria-hidden />;
}
export function IconArrow(props: IconProps) {
  return <ArrowRight {...defaults} {...props} aria-hidden />;
}
export function IconLine(props: IconProps) {
  return <Minus {...defaults} {...props} aria-hidden />;
}
export function IconMinus(props: IconProps) {
  return <Minus {...defaults} {...props} aria-hidden />;
}
export function IconText(props: IconProps) {
  return <Type {...defaults} {...props} aria-hidden />;
}
export function IconWidth(props: IconProps) {
  return <Baseline {...defaults} {...props} aria-hidden />;
}
export function IconFormula(props: IconProps) {
  return <Sigma {...defaults} {...props} aria-hidden />;
}
