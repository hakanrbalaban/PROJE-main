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
  Search,
  ChevronUp,
  ChevronDown,
  Image,
  Video,
  Link2,
  LayoutTemplate,
  Paperclip,
  Mic,
  MessageSquare,
  Smile,
  Asterisk,
  Camera,
  Globe,
  Webcam,
  Trash2,
  Triangle,
  Type,
  Cloud,
  Star,
  Spline,
  ChartColumn,
  ChartPie,
  ChartLine,
  Hand,
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  PanelLeftClose,
  PanelLeftOpen,
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
export function IconComment(props: IconProps) {
  return <MessageSquare {...defaults} {...props} aria-hidden />;
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
export function IconSearch(props: IconProps) {
  return <Search {...defaults} {...props} aria-hidden />;
}
export function IconChevronUp(props: IconProps) {
  return <ChevronUp {...defaults} {...props} aria-hidden />;
}
export function IconChevronDown(props: IconProps) {
  return <ChevronDown {...defaults} {...props} aria-hidden />;
}
export function IconImage(props: IconProps) {
  return <Image {...defaults} {...props} aria-hidden />;
}
export function IconVideo(props: IconProps) {
  return <Video {...defaults} {...props} aria-hidden />;
}
export function IconLink(props: IconProps) {
  return <Link2 {...defaults} {...props} aria-hidden />;
}
export function IconFile(props: IconProps) {
  return <Paperclip {...defaults} {...props} aria-hidden />;
}
export function IconMic(props: IconProps) {
  return <Mic {...defaults} {...props} aria-hidden />;
}
export function IconEmoji(props: IconProps) {
  return <Smile {...defaults} {...props} aria-hidden />;
}
export function IconSymbols(props: IconProps) {
  return <Asterisk {...defaults} {...props} aria-hidden />;
}
export function IconCamera(props: IconProps) {
  return <Camera {...defaults} {...props} aria-hidden />;
}
export function IconGlobe(props: IconProps) {
  return <Globe {...defaults} {...props} aria-hidden />;
}
export function IconWebcam(props: IconProps) {
  return <Webcam {...defaults} {...props} aria-hidden />;
}
export function IconYoutube(props: IconProps) {
  const size = props.size ?? defaults.size;
  const strokeWidth = props.strokeWidth ?? defaults.strokeWidth;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      <path d="M2.5 17a24.1 24.1 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.8 49.8 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.1 24.1 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.8 49.8 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
      <path d="m10 15 5-3-5-3z" fill="currentColor" stroke="none" />
    </svg>
  );
}
export function IconTemplate(props: IconProps) {
  return <LayoutTemplate {...defaults} {...props} aria-hidden />;
}
export function IconCloud(props: IconProps) {
  return <Cloud {...defaults} {...props} aria-hidden />;
}
export function IconStar(props: IconProps) {
  return <Star {...defaults} {...props} aria-hidden />;
}
export function IconConnector(props: IconProps) {
  return <Spline {...defaults} {...props} aria-hidden />;
}
export function IconChartBar(props: IconProps) {
  return <ChartColumn {...defaults} {...props} aria-hidden />;
}
export function IconChartPie(props: IconProps) {
  return <ChartPie {...defaults} {...props} aria-hidden />;
}
export function IconChartLine(props: IconProps) {
  return <ChartLine {...defaults} {...props} aria-hidden />;
}
export function IconHand(props: IconProps) {
  return <Hand {...defaults} {...props} aria-hidden />;
}
export function IconUndo(props: IconProps) {
  return <Undo2 {...defaults} {...props} aria-hidden />;
}
export function IconRedo(props: IconProps) {
  return <Redo2 {...defaults} {...props} aria-hidden />;
}
export function IconZoomIn(props: IconProps) {
  return <ZoomIn {...defaults} {...props} aria-hidden />;
}
export function IconZoomOut(props: IconProps) {
  return <ZoomOut {...defaults} {...props} aria-hidden />;
}
export function IconPanelLeft(props: IconProps) {
  return <PanelLeftClose {...defaults} {...props} aria-hidden />;
}
export function IconPanelLeftOpen(props: IconProps) {
  return <PanelLeftOpen {...defaults} {...props} aria-hidden />;
}
export function IconStarFill(props: IconProps) {
  return <Star {...defaults} {...props} fill="currentColor" aria-hidden />;
}
