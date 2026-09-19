'use client'

import { Trans, useTranslation } from 'react-i18next'
import { Header } from '../_components/Header'
import { USER_IS_IN } from '@/shared/ui/organisms/userIsIn'

export default function SecurityRoute() {
	const { t } = useTranslation()

	return (
		<>
			<Header
				title={t('security.title')}
				whereUserIs={USER_IS_IN.PRIVACY}
				showBoardNavigation={false}
			/>
			<div className='w-full px-6 md:px-11 pb-11 max-w-3xl'>
				<p className='text-sm opacity-60 mb-6'>{t('security.last_updated')}</p>

				<p className='text-sm opacity-80 mb-6'>
					<Trans
						i18nKey='security.top_link'
						components={{ privacyLink: <a href='/privacy' className='underline' /> }}
					/>
				</p>

				<p className='mb-6'>{t('security.intro')}</p>

				<section className='mb-8'>
					<h2 className='mb-2 text-2xl'>{t('security.s1_title')}</h2>
					<ul className='list-disc pl-5 space-y-1'>
						<li>
							<Trans i18nKey='security.s1_item_login' components={{ strong: <strong /> }} />
						</li>
						<li>{t('security.s1_item_passwords')}</li>
						<li>
							<Trans i18nKey='security.s1_item_rate_limit' components={{ strong: <strong /> }} />
						</li>
						<li>{t('security.s1_item_sessions')}</li>
						<li>
							<Trans
								i18nKey='security.s1_item_server_actions'
								components={{ strong: <strong />, code: <code /> }}
							/>
						</li>
					</ul>
				</section>

				<section className='mb-8'>
					<h2 className='mb-2 text-2xl'>{t('security.s2_title')}</h2>
					<p>
						<Trans i18nKey='security.s2_p' components={{ code: <code /> }} />
					</p>
				</section>

				<section className='mb-8'>
					<h2 className='mb-2 text-2xl'>{t('security.s3_title')}</h2>
					<p>
						<Trans
							i18nKey='security.s3_p'
							components={{ strong: <strong />, code: <code /> }}
						/>
					</p>
				</section>

				<section className='mb-8'>
					<h2 className='mb-2 text-2xl'>{t('security.s4_title')}</h2>
					<p>
						<Trans i18nKey='security.s4_p' components={{ strong: <strong /> }} />
					</p>
				</section>

				<section className='mb-8'>
					<h2 className='mb-2 text-2xl'>{t('security.s5_title')}</h2>
					<p className='mb-2'>
						<Trans
							i18nKey='security.s5_intro'
							components={{
								githubRepoLink: (
									<a
										href='https://github.com/CiroMirkin/Capo'
										target='_blank'
										rel='noopener noreferrer'
										className='underline'
									/>
								),
							}}
						/>
					</p>
					<ul className='list-disc pl-5 space-y-1'>
						<li>
							<Trans
								i18nKey='security.s5_item_report'
								components={{
									mail: <a href='mailto:ciromirkin@gmail.com' className='underline' />,
								}}
							/>
						</li>
						<li>{t('security.s5_item_steps')}</li>
						<li>{t('security.s5_item_response')}</li>
					</ul>
				</section>

				<section className='mb-8'>
					<h2 className='mb-2 text-2xl'>{t('security.s6_title')}</h2>
					<p className='mb-2'>{t('security.s6_p1')}</p>
					<p className='text-sm opacity-80'>
						<Trans i18nKey='security.s6_p2' components={{ strong: <strong /> }} />
					</p>
				</section>

				<section className='mb-4'>
					<h2 className='mb-2 text-2xl'>{t('security.s7_title')}</h2>
					<p>
						<Trans
							i18nKey='security.s7_p'
							components={{
								mail: <a href='mailto:ciromirkin@gmail.com' className='underline' />,
								githubLink: (
									<a
										href='https://github.com/CiroMirkin/Capo/issues'
										target='_blank'
										rel='noopener noreferrer'
										className='underline'
									/>
								),
							}}
						/>
					</p>
				</section>
			</div>
		</>
	)
}
