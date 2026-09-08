import { ReactNode } from 'react'
import { TypeOfView } from '../model/typeOfView'
import { useTheme } from '@/shared/hooks/useTheme'

interface CheckViewProps {
	actualTypeOfView: TypeOfView
	handleValueChange: (view: TypeOfView) => void
	label: string
	view: TypeOfView
}

export function CheckView({ actualTypeOfView, handleValueChange, label, view }: CheckViewProps) {
	return (
		<CheckViewContainer
			actualTypeOfView={actualTypeOfView}
			handleValueChange={handleValueChange}
			label={label}
			view={view}
		>
			{view == TypeOfView.BOARD && <BoardViewCheckContent />}
			{view == TypeOfView.LIST && <ListViewCheckContent />}
			{view == TypeOfView.NOTE_LIST && <NoteAndListViewCheckContent />}
		</CheckViewContainer>
	)
}

interface CheckViewContainerProps extends CheckViewProps {
	children: ReactNode
}

function CheckViewContainer({
	actualTypeOfView,
	handleValueChange,
	label,
	view,
	children,
}: CheckViewContainerProps) {
	const { bg } = useTheme()
	return (
		<div className='flex flex-col items-center space-y-4' title={label}>
			<button
				type='button'
				onClick={() => handleValueChange(view)}
				aria-label={label}
				className={`p-4 border-2 rounded-lg cursor-pointer transition-colors duration-200 hover:shadow-md ${bg} ${
					actualTypeOfView == view
						? 'border-black shadow-lg'
						: 'border-transparent opacity-80 hover:border-gray-400'
				}`}
			>
				{children}
			</button>
			<label className='flex items-center space-x-2 cursor-pointer'>
				<input
					type='checkbox'
					checked={actualTypeOfView == view}
					onChange={() => handleValueChange(view)}
					className='w-4 h-4 accent-black bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2'
				/>
				<span className='text-sm text-gray-700 font-medium'>{label}</span>
			</label>
		</div>
	)
}

// ViewCheckContent

function BoardViewCheckContent() {
	const { column } = useTheme()
	return (
		<div className={`grid grid-cols-3 grid-rows-1 gap-1`}>
			<div
				className={`w-8 h-10 border-2 border-black rounded-sm transition-all duration-200 ${column}`}
			/>
			<div
				className={`w-8 h-10 border-2 border-black rounded-sm transition-all duration-200 ${column}`}
			/>
			<div
				className={`w-8 h-10 border-2 border-black rounded-sm transition-all duration-200 ${column}`}
			/>
		</div>
	)
}

function ListViewCheckContent() {
	const { column } = useTheme()
	return (
		<div className={`grid grid-cols-1 grid-rows-1 gap-1`}>
			<div
				className={`w-8 h-10 border-2 border-black rounded-sm transition-all duration-200 ${column}`}
			/>
		</div>
	)
}

function NoteAndListViewCheckContent() {
	const { column } = useTheme()
	return (
		<div className={`grid grid-cols-2 grid-rows-1 gap-1`}>
			<div
				className={`w-8 h-10 border-2 border-black rounded-sm transition-all duration-200 ${column}`}
			/>
			<div
				className={`w-8 h-10 border-2 border-black rounded-sm transition-all duration-200 ${column}`}
			/>
		</div>
	)
}
