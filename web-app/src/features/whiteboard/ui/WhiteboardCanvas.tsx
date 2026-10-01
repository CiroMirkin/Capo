'use client'

import {
	CaptureUpdateAction,
	convertToExcalidrawElements,
	Excalidraw,
	MainMenu,
} from '@excalidraw/excalidraw'
import type { ExcalidrawImperativeAPI } from '@excalidraw/excalidraw/types'
import '@excalidraw/excalidraw/index.css'
import './excalidrawColors.css'
import { useTheme } from 'next-themes'
import { CSSProperties, useLayoutEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { BlendIcon, ImageDownIcon, PersonStandingIcon } from '@/shared/ui/atoms/icons'
import { cn } from '@/shared/lib/utils'
import { useTheme as useBoardTheme } from '@/shared/hooks/useTheme'
import { useSidebarSide } from '@/shared/preferences/sidebar'
import { usePageSurface } from '@/shared/preferences/page-surface'
import { USER_IS_IN } from '@/shared/ui/organisms/userIsIn'
import { useBoardId } from '@/features/auth'
import { toStoredScene, WhiteboardScene } from '../model/whiteboard'
import { stickmanSkeleton } from '../model/stickman'
import { WhiteboardToolbarSlot } from './WhiteboardToolbarSlot'
import styles from './WhiteboardCanvas.module.css'

interface WhiteboardCanvasProps {
	scene: WhiteboardScene
	onSave: (scene: WhiteboardScene) => void
}

export default function WhiteboardCanvas({ scene, onSave }: WhiteboardCanvasProps) {
	const { resolvedTheme } = useTheme()
	const { t, i18n } = useTranslation()
	const [api, setApi] = useState<ExcalidrawImperativeAPI | null>(null)
	const [railSide] = useSidebarSide()
	const { column, columnText } = useBoardTheme()
	const themeProbeRef = useRef<HTMLSpanElement>(null)
	const containerRef = useRef<HTMLDivElement>(null)
	const [themeColors, setThemeColors] = useState<CSSProperties>()
	const boardId = useBoardId((state) => state.board_id)
	const [background, toggleBackground] = usePageSurface({
		boardId,
		whereUserIs: USER_IS_IN.WHITEBOARD,
	})

	useLayoutEffect(() => {
		if (!themeProbeRef.current) return
		const { backgroundColor, color } = getComputedStyle(themeProbeRef.current)
		setThemeColors({
			'--wb-column': backgroundColor,
			'--wb-column-text': color,
		} as CSSProperties)
	}, [column, columnText])

	const addStickman = () => {
		if (!api) return
		const { scrollX, scrollY, width, height, zoom } = api.getAppState()
		const groupId = crypto.randomUUID()
		const stickman = convertToExcalidrawElements(
			stickmanSkeleton(
				-scrollX + width / 2 / zoom.value,
				-scrollY + height / 2 / zoom.value,
				groupId
			)
		)
		api.updateScene({
			elements: [...api.getSceneElements(), ...stickman],
			appState: {
				selectedGroupIds: { [groupId]: true },
				selectedElementIds: Object.fromEntries(
					stickman.map((el) => [el.id, true as const])
				),
			},
			captureUpdate: CaptureUpdateAction.IMMEDIATELY,
		})
	}

	return (
		<div
			ref={containerRef}
			className={cn('h-full', styles.canvas, railSide === 'right' && styles.railRight)}
			style={themeColors}
		>
			<span ref={themeProbeRef} className={cn('hidden', column, columnText)} aria-hidden />

			<Excalidraw
				excalidrawAPI={setApi}
				initialData={
					{
						...scene,
						appState: {
							...scene.appState,
							viewBackgroundColor: 'transparent',
						},
						scrollToContent: true,
					} as never
				}
				onChange={(elements, appState) => onSave(toStoredScene(elements, appState))}
				theme={resolvedTheme === 'dark' ? 'dark' : 'light'}
				langCode={i18n.language === 'en' ? 'en' : 'es-ES'}
				// no se persisten archivos como imágenes (BinaryFiles).
				onPaste={(data) => !data.files || Object.keys(data.files).length === 0}
				UIOptions={{
					tools: { image: false },
					canvasActions: {
						changeViewBackgroundColor: false,
						loadScene: false,
						saveToActiveFile: false,
						toggleTheme: null,
					},
				}}
			>
				{/* Sin esto Excalidraw arma su menú por defecto (abrir/guardar, colaboración, redes...). */}
				<MainMenu>
					<MainMenu.DefaultItems.SaveAsImage />
				</MainMenu>

				<WhiteboardToolbarSlot container={containerRef}>
					{/* Clases de los botones de la barra de Excalidraw para que parezca uno más. */}
					<button
						type='button'
						className='ToolIcon ToolIcon_type_button ToolIcon_size_medium ToolIcon_type_button--show'
						title={t('whiteboard.add_stickman')}
						aria-label={t('whiteboard.add_stickman')}
						onClick={addStickman}
					>
						<div className='ToolIcon__icon' aria-hidden>
							<PersonStandingIcon />
						</div>
					</button>
				</WhiteboardToolbarSlot>

				{/* Dentro de Excalidraw para heredar sus variables: `help-icon` es el estilo del botón "?" de al lado. Solo md+: en mobile la barra inferior de Excalidraw los tapa. */}
				<button
					type='button'
					className='help-icon max-md:!hidden !absolute bottom-4 right-[6.5rem] z-[3]'
					title={t('whiteboard.toggle_background')}
					aria-label={t('whiteboard.toggle_background')}
					aria-pressed={background === 'column'}
					onClick={toggleBackground}
				>
					<BlendIcon />
				</button>
				<button
					type='button'
					className='help-icon max-md:!hidden !absolute bottom-4 right-[3.75rem] z-[3]'
					title={t('whiteboard.export_image')}
					aria-label={t('whiteboard.export_image')}
					onClick={() =>
						api?.updateScene({ appState: { openDialog: { name: 'imageExport' } } })
					}
				>
					<ImageDownIcon />
				</button>
			</Excalidraw>
		</div>
	)
}
