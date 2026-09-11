import type { ReactNode } from 'react'
import { HERO_COUNT } from '../model/heros'

/** Patrones de fondo para la cabecera de una BoardCard. El índice se persiste en
 * `Board.cardCanvas`. Mantener la longitud en sync con `HERO_COUNT`. */
export const heros: readonly ReactNode[] = [
	<div key='0' className='h-full w-full bg-transparent relative text-gray-800'>
		<div
			className='absolute inset-0 z-0 pointer-events-none'
			style={{
				backgroundImage: `
        repeating-linear-gradient(22.5deg, transparent, transparent 2px, rgba(75, 85, 99, 0.06) 2px, rgba(75, 85, 99, 0.06) 3px, transparent 3px, transparent 8px),
        repeating-linear-gradient(67.5deg, transparent, transparent 2px, rgba(107, 114, 128, 0.05) 2px, rgba(107, 114, 128, 0.05) 3px, transparent 3px, transparent 8px),
        repeating-linear-gradient(112.5deg, transparent, transparent 2px, rgba(55, 65, 81, 0.04) 2px, rgba(55, 65, 81, 0.04) 3px, transparent 3px, transparent 8px),
        repeating-linear-gradient(157.5deg, transparent, transparent 2px, rgba(31, 41, 55, 0.03) 2px, rgba(31, 41, 55, 0.03) 3px, transparent 3px, transparent 8px)
      `,
			}}
		/>
	</div>,
	<div key='1' className='h-full w-full bg-transparent relative text-gray-900'>
		<div
			className='absolute inset-0 z-0 pointer-events-none'
			style={{
				backgroundImage: `
          repeating-linear-gradient(45deg, rgba(0, 0, 0, 0.1) 0, rgba(0, 0, 0, 0.1) 1px, transparent 1px, transparent 20px),
        repeating-linear-gradient(-45deg, rgba(0, 0, 0, 0.1) 0, rgba(0, 0, 0, 0.1) 1px, transparent 1px, transparent 20px)
        `,
				backgroundSize: '30px 30px',
			}}
		/>
	</div>,
	<div key='2' className='h-full w-full bg-transparent relative text-gray-900'>
		<div
			className='absolute inset-0 z-0 pointer-events-none'
			style={{
				backgroundImage: `
          repeating-linear-gradient(45deg, rgba(0, 0, 0, 0.1) 0, rgba(0, 0, 0, 0.1) 1px, transparent 1px, transparent 20px),
        repeating-linear-gradient(-45deg, rgba(0, 0, 0, 0.1) 0, rgba(0, 0, 0, 0.1) 1px, transparent 1px, transparent 20px)
        `,
				backgroundSize: '40px 40px',
			}}
		/>
	</div>,
	<div key='3' className='h-full w-full bg-transparent relative text-gray-800'>
		<div
			className='absolute inset-0 z-0 pointer-events-none'
			style={{
				backgroundImage: `
        repeating-linear-gradient(0deg, transparent, transparent 5px, rgba(75, 85, 99, 0.06) 5px, rgba(75, 85, 99, 0.06) 6px, transparent 6px, transparent 15px),
        repeating-linear-gradient(90deg, transparent, transparent 5px, rgba(75, 85, 99, 0.06) 5px, rgba(75, 85, 99, 0.06) 6px, transparent 6px, transparent 15px),
        repeating-linear-gradient(0deg, transparent, transparent 10px, rgba(107, 114, 128, 0.04) 10px, rgba(107, 114, 128, 0.04) 11px, transparent 11px, transparent 30px),
        repeating-linear-gradient(90deg, transparent, transparent 10px, rgba(107, 114, 128, 0.04) 10px, rgba(107, 114, 128, 0.04) 11px, transparent 11px, transparent 30px)
      `,
			}}
		/>
	</div>,
	<div key='4' className='h-full w-full bg-transparent relative text-gray-800'>
		<div
			className='absolute inset-0 z-0 pointer-events-none'
			style={{
				backgroundImage: `radial-gradient(circle, rgba(55, 65, 81, 0.12) 1.2px, transparent 1.2px)`,
				backgroundSize: '14px 14px',
			}}
		/>
	</div>,
	<div key='5' className='h-full w-full bg-transparent relative text-gray-800'>
		<div
			className='absolute inset-0 z-0 pointer-events-none'
			style={{
				backgroundImage: `
        repeating-linear-gradient(60deg, rgba(75, 85, 99, 0.08) 0, rgba(75, 85, 99, 0.08) 3px, transparent 3px, transparent 16px),
        repeating-linear-gradient(-60deg, rgba(75, 85, 99, 0.08) 0, rgba(75, 85, 99, 0.08) 3px, transparent 3px, transparent 16px)
      `,
			}}
		/>
	</div>,
	<div key='6' className='h-full w-full bg-transparent relative text-gray-800'>
		<div
			className='absolute inset-0 z-0 pointer-events-none'
			style={{
				backgroundImage: `repeating-radial-gradient(circle at 50% 50%, transparent 0, transparent 8px, rgba(55, 65, 81, 0.06) 8px, rgba(55, 65, 81, 0.06) 9px)`,
			}}
		/>
	</div>,
	<div key='7' className='h-full w-full bg-transparent relative text-gray-800'>
		<div
			className='absolute inset-0 z-0 pointer-events-none'
			style={{
				backgroundImage: `
        radial-gradient(circle at 100% 200%, transparent 22px, rgba(55, 65, 81, 0.09) 23px, rgba(55, 65, 81, 0.09) 25px, transparent 26px),
        radial-gradient(circle at 0% 200%, transparent 22px, rgba(55, 65, 81, 0.09) 23px, rgba(55, 65, 81, 0.09) 25px, transparent 26px),
        radial-gradient(circle at 50% 100%, transparent 22px, rgba(55, 65, 81, 0.09) 23px, rgba(55, 65, 81, 0.09) 25px, transparent 26px)
      `,
				backgroundSize: '56px 28px',
			}}
		/>
	</div>,
]

if (heros.length !== HERO_COUNT) {
	throw new Error(`heros.length (${heros.length}) debe coincidir con HERO_COUNT (${HERO_COUNT})`)
}
