import {
	Archive,
	Plus,
	CircleHelp,
	Columns3,
	Github,
	Menu,
	Settings,
	Languages,
	LogIn,
	LogOut,
	Pencil,
	Trash2,
	ArrowRight,
	ArrowLeft,
	Copy,
	CircleCheck,
	MessageSquareText,
	Hourglass,
	Eye,
	EyeOff,
	TriangleAlert,
	Maximize2,
	Minimize2,
	Send,
	Layers,
	Square,
} from 'lucide-react'

const iconSize: string = '20'

interface IconProps {
	className?: string
	size?: string | number
}

export const PlusIcon = ({ className = '' }: IconProps) => (
	<Plus size={iconSize} className={className} />
)
export const ArchiveIcon = ({ className = '' }: IconProps) => (
	<Archive size={iconSize} className={className} />
)
export const CircleHelpIcon = ({ className = '' }: IconProps) => (
	<CircleHelp size={iconSize} className={className} />
)
export const GithubIcon = ({ className = '' }: IconProps) => (
	<Github size={iconSize} className={className} />
)
export const ColumnsIcon = ({ className = '', size = iconSize }: IconProps) => (
	<Columns3 size={size} className={className} />
)
export const MenuIcon = ({ className = '' }: IconProps) => (
	<Menu size={iconSize} className={className} />
)
export const SettingsIcon = ({ className = '' }: IconProps) => (
	<Settings size={iconSize} className={className} />
)
export const LanguagesIcon = ({ className = '' }: IconProps) => (
	<Languages size={iconSize} className={className} />
)
export const LogInIcon = ({ className = '' }: IconProps) => (
	<LogIn size={iconSize} className={className} />
)
export const LogOutIcon = ({ className = '' }: IconProps) => (
	<LogOut size={iconSize} className={className} />
)
export const PencilIcon = ({ className = '' }: IconProps) => (
	<Pencil size={iconSize} className={className} />
)
export const TrashIcon = ({ className = '' }: IconProps) => (
	<Trash2 size={iconSize} className={className} />
)
export const SendIcon = ({ className = '' }: IconProps) => (
	<Send size={iconSize} className={className} />
)
export const ArrowRightIcon = ({ className = '' }: IconProps) => (
	<ArrowRight size={iconSize} className={className} />
)
export const ArrowLeftIcon = ({ className = '' }: IconProps) => (
	<ArrowLeft size={iconSize} className={className} />
)
export const CopyIcon = ({ className = '' }: IconProps) => (
	<Copy size={iconSize} className={className} />
)
export const CheckIcon = ({ className = '' }: IconProps) => (
	<CircleCheck size={iconSize} className={className} />
)
export const MessageSquareTextIcon = ({ className = '' }: IconProps) => (
	<MessageSquareText size={iconSize} className={className} />
)
export const HourglassIcon = ({ className = '' }: IconProps) => (
	<Hourglass size={iconSize} className={className} />
)
export const EyeIcon = ({ className = '' }: IconProps) => (
	<Eye size={iconSize} className={className} />
)
export const EyeOffIcon = ({ className = '' }: IconProps) => (
	<EyeOff size={iconSize} className={className} />
)
export const DangerIcon = ({ className = '' }: IconProps) => (
	<TriangleAlert size={iconSize} className={className} />
)
export const MaximizeIcon = ({ className = '', size = iconSize }: IconProps) => (
	<Maximize2 size={size} className={className} />
)
export const MinimizeIcon = ({ className = '', size = iconSize }: IconProps) => (
	<Minimize2 size={size} className={className} />
)
export const LayerIcon = ({ className = '', size = iconSize }: IconProps) => (
	<Layers size={size} className={className} />
)
export const SquareIcon = ({ className = '', size = iconSize }: IconProps) => (
	<Square size={size} className={className} />
)
// lucide-react 0.358 no exporta SquareText todavía; SVG inline del icono oficial.
export const SquareTextIcon = ({ className = '' }: IconProps) => (
	<svg
		xmlns='http://www.w3.org/2000/svg'
		width={iconSize}
		height={iconSize}
		viewBox='0 0 24 24'
		fill='none'
		stroke='currentColor'
		strokeWidth='2'
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
