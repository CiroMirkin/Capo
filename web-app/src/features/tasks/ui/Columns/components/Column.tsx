'use client'

import React, { createContext, DragEvent, useContext, useState } from 'react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/shared/ui/molecules/card'
import { useTheme } from '@/shared/hooks/useTheme'
import { ColumnsFooterContext } from '../context/ColumnsFooter/ColumnsFooterContext'
import { ColumnPosition } from '../model/columnPosition'
import { useTranslation } from 'react-i18next'
import { DEFAULT_COLUMN_IDS } from '@/features/tasks/model/taskBoard'
import { cn } from '@/shared/lib/utils'

const ColumnContext = createContext('' as ColumnPosition)

interface ColumnProps {
	columnPosition: ColumnPosition
	columnName: string
	children: React.ReactNode
}

export function Column({ columnName, columnPosition, children }: ColumnProps) {
	const { t } = useTranslation()
	const colorTheme = useTheme()
	const [dragOver, setDragOver] = useState(false)

	const displayName = DEFAULT_COLUMN_IDS.includes(columnName)
		? t(`default_columns.${columnName}`)
		: columnName

	const handleDragOver = (e: DragEvent) => {
		e.preventDefault()
		setDragOver(true)
	}

	return (
		<div
			className='p-0 m-0 h-auto min-w-48 flex-1'
			onDragOver={handleDragOver}
			onDragLeave={() => {
				setDragOver(false)
			}}
			onDrop={() => setDragOver(false)}
		>
			<ColumnContext.Provider value={columnPosition}>
				<Card
					className={cn(
						colorTheme.column,
						dragOver && colorTheme.task,
						'h-auto w-auto px-0 flex flex-col justify-between rounded border-none'
					)}
					aria-label={displayName}
				>
					<CardHeader className='pb-0 pt-2 px-4'>
						<CardTitle
							className={cn('opacity-[.65] text-2xl', colorTheme.columnText || '')}
						>
							{displayName}
						</CardTitle>
					</CardHeader>
					{children}
				</Card>
			</ColumnContext.Provider>
		</div>
	)
}

interface ColumnContentProps {
	children: React.ReactNode
	className?: string
}

function ColumnContent({ children, className }: ColumnContentProps) {
	return <CardContent className={className ? className : ''}>{children}</CardContent>
}
Column.ColumnContent = ColumnContent

function ColumnFooter() {
	const columnPosition = useContext(ColumnContext)
	const { firstColumnFooterContent, lastColumnFooterContent } = useContext(ColumnsFooterContext)

	return (
		<CardFooter className='min-h-16'>
			{columnPosition === 'FIRST' && firstColumnFooterContent}
			{columnPosition === 'LAST' && lastColumnFooterContent}
		</CardFooter>
	)
}
Column.Footer = ColumnFooter
