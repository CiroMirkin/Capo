import { Separator } from '@/shared/ui/atoms/separator'
import { DescriptionOfCapo } from '@/shared/ui/atoms/DescriptionOfCapo'
import { Header } from '../_components/Header'
import { USER_IS_IN } from '@/shared/ui/organisms/userIsIn'
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from '@/shared/ui/atoms/accordion'
import { Button } from '@/shared/ui/atoms/button'
import { GithubIcon } from '@/shared/ui/atoms/icons'
import { useTranslation } from 'react-i18next'

export function Help() {
	const { t } = useTranslation()
	return (
		<>
			<Header
				title={t('menu.help')}
				whereUserIs={USER_IS_IN.HELP}
				showBoardNavigation={false}
			/>
			<div className='w-full px-6 md:px-11'>
				<section className='mb-4'>
					<h2 className='mb-2 text-2xl'>{t('help.h2')}</h2>
					<DescriptionOfCapo />
				</section>
				<Separator />
				<section className='my-4'>
					<h2 className='text-2xl'>Tablero</h2>
					<Accordion type='single' collapsible>
						<AccordionItem value='item-1'>
							<AccordionTrigger>Visualización</AccordionTrigger>
							<AccordionContent>
								<p>
									Elige cómo ver tu tablero: en vertical u horizontal. ¡Adapta la
									vista a tu gusto para organizar mejor tus ideas!
								</p>
							</AccordionContent>
						</AccordionItem>
						<AccordionItem value='item-2'>
							<AccordionTrigger>Nombre del tablero</AccordionTrigger>
							<AccordionContent>
								<p>
									Personaliza tu tablero con un nombre de hasta 30 caracteres.
									¡Hazlo tuyo!
								</p>
							</AccordionContent>
						</AccordionItem>
					</Accordion>
				</section>
				<section className='my-4'>
					<h2 className='text-2xl'>Tareas</h2>
					<Accordion type='single' collapsible>
						<AccordionItem value='item-1'>
							<AccordionTrigger>Creación de tareas</AccordionTrigger>
							<AccordionContent>
								<p>
									Añade nuevas tareas en la primera columna para empezar a
									organizar tu trabajo. Recuerda que cada tarea necesita una
									descripción (máx. 200 caracteres) y cada columna tiene un límite
									de 10 tareas.
								</p>
							</AccordionContent>
						</AccordionItem>
						<AccordionItem value='item-2'>
							<AccordionTrigger>Posicionamiento de tareas</AccordionTrigger>
							<AccordionContent>
								<p>
									Usa etiquetas para priorizar tus tareas. Las más importantes
									subirán automáticamente a la cima de la columna.
								</p>
							</AccordionContent>
						</AccordionItem>
						<AccordionItem value='item-3'>
							<AccordionTrigger>Eliminación y movimiento</AccordionTrigger>
							<AccordionContent>
								<p>
									Arrastra y suelta tus tareas para moverlas entre columnas y
									mantenlas organizadas. Si ya no necesitas una tarea, ¡elimínala
									con un solo clic!
								</p>
							</AccordionContent>
						</AccordionItem>
					</Accordion>
				</section>
				<section className='my-4'>
					<h2 className='text-2xl'>Recordatorios</h2>
					<Accordion type='single' collapsible>
						<AccordionItem value='item-1'>
							<AccordionTrigger>Creación y visualización</AccordionTrigger>
							<AccordionContent>
								<p>
									Crea recordatorios en columnas específicas para no olvidar nada
									importante. Recibirás un aviso cuando una tarea llegue a esa
									columna.
								</p>
							</AccordionContent>
						</AccordionItem>
					</Accordion>
				</section>
				<section className='my-4'>
					<h2 className='text-2xl'>Etiquetas</h2>
					<Accordion type='single' collapsible>
						<AccordionItem value='item-1'>
							<AccordionTrigger>Uso de etiquetas</AccordionTrigger>
							<AccordionContent>
								<p>
									Organiza y prioriza tus tareas con etiquetas. Puedes crear tus
									propias etiquetas y habilitarlas cuando las necesites. Al
									iniciar sesión, tus etiquetas se guardan en tu cuenta.
								</p>
							</AccordionContent>
						</AccordionItem>
						<AccordionItem value='item-2'>
							<AccordionTrigger>Prioridad</AccordionTrigger>
							<AccordionContent>
								<p>
									Asigna un nivel de prioridad a tus etiquetas (1 es el más alto)
									para que tus tareas más importantes siempre estén a la vista.
								</p>
							</AccordionContent>
						</AccordionItem>
					</Accordion>
				</section>
				<section className='my-4'>
					<h2 className='text-2xl'>Notas</h2>
					<Accordion type='single' collapsible>
						<AccordionItem value='item-1'>
							<AccordionTrigger>Notas del tablero</AccordionTrigger>
							<AccordionContent>
								<p>
									Usa el espacio de notas para apuntar ideas, recordatorios o lo
									que necesites. ¡Tienes hasta 10,000 caracteres! Además, puedes
									archivar tus notas para consultarlas más tarde.
								</p>
							</AccordionContent>
						</AccordionItem>
					</Accordion>
				</section>
				<section className='my-4'>
					<h2 className='text-2xl'>Columnas</h2>
					<Accordion type='single' collapsible>
						<AccordionItem value='item-1'>
							<AccordionTrigger>Gestión de columnas</AccordionTrigger>
							<AccordionContent>
								<p>
									Adapta el tablero a tu flujo de trabajo. Crea, renombra y
									elimina columnas como necesites. Puedes tener entre 2 y 6
									columnas.
								</p>
							</AccordionContent>
						</AccordionItem>
					</Accordion>
				</section>
				<section className='my-4'>
					<h2 className='text-2xl'>Archivo</h2>
					<Accordion type='single' collapsible>
						<AccordionItem value='item-1'>
							<AccordionTrigger>Archivar tareas</AccordionTrigger>
							<AccordionContent>
								<p>
									Limpia tu tablero archivando las tareas de la última columna.
									Puedes archivar tareas individuales o todas a la vez para
									mantener tu espacio de trabajo ordenado.
								</p>
							</AccordionContent>
						</AccordionItem>
						<AccordionItem value='item-2'>
							<AccordionTrigger>Límites del archivo</AccordionTrigger>
							<AccordionContent>
								<p>
									El archivo tiene capacidad para 60 días archivados, con un
									límite de 30 tareas por día. ¡Así siempre tendrás un registro
									de tu progreso!
								</p>
							</AccordionContent>
						</AccordionItem>
						<AccordionItem value='item-3'>
							<AccordionTrigger>Visualización y exportación</AccordionTrigger>
							<AccordionContent>
								<p>
									Consulta tus tareas archivadas cuando quieras y expórtalas en
									formato PDF para tener un registro permanente de tu trabajo.
								</p>
							</AccordionContent>
						</AccordionItem>
					</Accordion>
				</section>
				<section className='my-4'>
					<h2 className='text-2xl'>Cuenta</h2>
					<Accordion type='single' collapsible>
						<AccordionItem value='item-1'>
							<AccordionTrigger>Creación de cuenta</AccordionTrigger>
							<AccordionContent>
								<p>
									Crea una cuenta para guardar tu tablero y acceder a él desde
									cualquier lugar. Si ya tienes un tablero, ¡lo guardaremos por
									ti!
								</p>
							</AccordionContent>
						</AccordionItem>
						<AccordionItem value='item-2'>
							<AccordionTrigger>Inicio de sesión</AccordionTrigger>
							<AccordionContent>
								<p>
									Inicia sesión para sincronizar tu tablero. Al cerrar sesión,
									volverás a tu tablero local.
								</p>
							</AccordionContent>
						</AccordionItem>
					</Accordion>
				</section>
				<section className='my-4'>
					<h2 className='text-2xl'>Otros</h2>
					<Accordion type='single' collapsible>
						<AccordionItem value='item-1'>
							<AccordionTrigger>Bienvenida</AccordionTrigger>
							<AccordionContent>
								<p>
									La primera vez que uses Capo, te daremos una cálida bienvenida
									para que conozcas la aplicación.
								</p>
							</AccordionContent>
						</AccordionItem>
						<AccordionItem value='item-2'>
							<AccordionTrigger>Idiomas</AccordionTrigger>
							<AccordionContent>
								<p>
									Configura Capo en tu idioma preferido: Inglés o Español. La
									aplicación intentará ajustarse automáticamente al idioma de tu
									navegador.
								</p>
							</AccordionContent>
						</AccordionItem>
						<AccordionItem value='item-3'>
							<AccordionTrigger>Temas</AccordionTrigger>
							<AccordionContent>
								<p>
									Personaliza la apariencia de Capo con diferentes temas de color.
									¡Elige el que más te guste!
								</p>
							</AccordionContent>
						</AccordionItem>
					</Accordion>
				</section>
				<section className='mb-4'>
					<h2 className='mb-2 text-2xl'>{t('help.found_a_problem_section')}</h2>
					<a href='https://github.com/CiroMirkin/Capo/issues' target='_blank'>
						<Button variant='link' className='pl-0'>
							<GithubIcon className='mr-2' /> {t('help.report_btn')}
						</Button>
					</a>
				</section>
			</div>
		</>
	)
}
