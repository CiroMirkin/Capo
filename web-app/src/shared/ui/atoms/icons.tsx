import {
	AlignCenter,
	AlignJustify,
	AlignLeft,
	AlignRight,
	Archive,
	ArchiveRestore,
	ArrowLeft,
	ArrowRight,
	Bold,
	Calendar,
	Check,
	CircleCheck,
	Circle,
	CircleHelp,
	Code,
	Columns3,
	Copy,
	EllipsisVertical,
	Eye,
	EyeOff,
	ExternalLink,
	Github,
	Highlighter,
	History,
	Home,
	Hourglass,
	Italic,
	Languages,
	Layout,
	Link,
	List,
	ListChecks,
	ListOrdered,
	LogIn,
	LogOut,
	Maximize2,
	Menu,
	MessageSquareText,
	Minimize2,
	MoreHorizontal,
	Pencil,
	Plus,
	Quote,
	Redo,
	Send,
	Settings,
	Square,
	Tag,
	Trash2,
	TriangleAlert,
	Underline,
	Undo,
	Upload,
	ChevronDown,
	ChevronLeft,
	ChevronRight,
	ChevronUp,
	X,
} from 'lucide-react'
import { icon, sizes, type IconProps } from './icon'

export type { IconProps }

export const PlusIcon = icon(Plus)
export const ArchiveIcon = icon(Archive)
export const ArchiveRestoreIcon = icon(ArchiveRestore)
export const CircleHelpIcon = icon(CircleHelp)
export const GithubIcon = icon(Github)
export const ColumnsIcon = icon(Columns3)
export const MenuIcon = icon(Menu)
export const SettingsIcon = icon(Settings)
export const LanguagesIcon = icon(Languages)
export const LogInIcon = icon(LogIn)
export const LogOutIcon = icon(LogOut)
export const PencilIcon = icon(Pencil)
export const TrashIcon = icon(Trash2)
export const SendIcon = icon(Send)
export const ArrowRightIcon = icon(ArrowRight)
export const ArrowLeftIcon = icon(ArrowLeft)
export const CopyIcon = icon(Copy)
export const CheckIcon = icon(CircleCheck)
export const CheckmarkIcon = icon(Check)
export const MessageSquareTextIcon = icon(MessageSquareText)
export const HourglassIcon = icon(Hourglass)
export const EyeIcon = icon(Eye)
export const EyeOffIcon = icon(EyeOff)
export const DangerIcon = icon(TriangleAlert)
export const MaximizeIcon = icon(Maximize2)
export const MinimizeIcon = icon(Minimize2)
export const UploadIcon = icon(Upload)
export const SquareIcon = icon(Square)
export const HistoryIcon = icon(History)
export const ChevronDownIcon = icon(ChevronDown)
export const ChevronUpIcon = icon(ChevronUp)
export const ChevronLeftIcon = icon(ChevronLeft)
export const ChevronRightIcon = icon(ChevronRight)
export const HomeIcon = icon(Home)
export const CalendarIcon = icon(Calendar)
export const CircleIcon = icon(Circle)
export const CloseIcon = icon(X)
export const LinkIcon = icon(Link)
export const ExternalLinkIcon = icon(ExternalLink)
export const LayoutIcon = icon(Layout)
export const BoldIcon = icon(Bold)
export const ItalicIcon = icon(Italic)
export const UnderlineIcon = icon(Underline)
export const HighlighterIcon = icon(Highlighter)
export const ListIcon = icon(List)
export const ListOrderedIcon = icon(ListOrdered)
export const ListChecksIcon = icon(ListChecks)
export const QuoteIcon = icon(Quote)
export const CodeIcon = icon(Code)
export const AlignLeftIcon = icon(AlignLeft)
export const AlignCenterIcon = icon(AlignCenter)
export const AlignRightIcon = icon(AlignRight)
export const AlignJustifyIcon = icon(AlignJustify)
export const UndoIcon = icon(Undo)
export const RedoIcon = icon(Redo)
export const MoreHorizontalIcon = icon(MoreHorizontal)
export const EllipsisVerticalIcon = icon(EllipsisVertical)
export const TagIcon = icon(Tag)

// lucide-react 0.358 no exporta TagPlus todavía - SVG inline del icono oficial.
export const TagPlusIcon = ({
	className,
	size = 'default',
	customSize,
	strokeWidth = 2,
}: IconProps) => (
	<svg
		xmlns='http://www.w3.org/2000/svg'
		width={customSize ?? sizes[size]}
		height={customSize ?? sizes[size]}
		viewBox='0 0 24 24'
		fill='none'
		stroke='currentColor'
		strokeWidth={strokeWidth}
		strokeLinecap='round'
		strokeLinejoin='round'
		className={className}
	>
		<path d='M16 13h6' />
		<path d='m16.5 6.5-3.914-3.914A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l1.79-1.79' />
		<path d='M19 10v6' />
		<circle cx='7.5' cy='7.5' r='.5' fill='currentColor' />
	</svg>
)

// lucide-react 0.358 no exporta SquareText todavía - SVG inline del icono oficial.
export const SquareTextIcon = ({
	className,
	size = 'default',
	customSize,
	strokeWidth = 2,
}: IconProps) => (
	<svg
		xmlns='http://www.w3.org/2000/svg'
		width={customSize ?? sizes[size]}
		height={customSize ?? sizes[size]}
		viewBox='0 0 24 24'
		fill='none'
		stroke='currentColor'
		strokeWidth={strokeWidth}
		strokeLinecap='round'
		strokeLinejoin='round'
		className={className}
	>
		<rect width='18' height='18' x='3' y='3' rx='2' />
		<path d='M7 8h8' />
		<path d='M7 12h10' />
		<path d='M7 16h6' />
	</svg>
)
