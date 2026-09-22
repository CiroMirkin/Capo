'use client'
import Link from 'next/link'
import { Trans, useTranslation } from 'react-i18next'
import { Header } from '../_components/Header'
import { USER_IS_IN } from '@/shared/ui/organisms/userIsIn'

export default function PrivacyRoute() {
	const { t } = useTranslation()

	return (
		<>
			<Header
				title={t('privacy.title')}
				whereUserIs={USER_IS_IN.PRIVACY}
				showBoardNavigation={false}
			/>
			<div className='w-full px-6 md:px-11 pb-11 max-w-3xl'>
				<p className='text-sm opacity-60 mb-6'>{t('privacy.last_updated')}</p>

				<p className='text-sm opacity-80 mb-6'>
					<Trans
						i18nKey='privacy.top_link'
						components={{ securityLink: <Link href='/security' className='underline' /> }}
					/>
				</p>

				<p className='mb-6'>{t('privacy.intro')}</p>

				<section className='mb-8'>
					<h2 className='mb-2 text-2xl'>{t('privacy.s1_title')}</h2>
					<div className='overflow-x-auto'>
						<table className='w-full text-sm border-collapse'>
							<thead>
								<tr className='border-b'>
									<th className='text-left py-2 pr-4'>{t('privacy.s1_table_head_data')}</th>
									<th className='text-left py-2 pr-4'>
										{t('privacy.s1_table_head_description')}
									</th>
									<th className='text-left py-2'>{t('privacy.s1_table_head_origin')}</th>
								</tr>
							</thead>
							<tbody>
								<tr className='border-b'>
									<td className='py-2 pr-4 align-top'>{t('privacy.s1_row_account_data')}</td>
									<td className='py-2 pr-4 align-top'>
										{t('privacy.s1_row_account_description')}
									</td>
									<td className='py-2 align-top'>{t('privacy.s1_row_account_origin')}</td>
								</tr>
								<tr className='border-b'>
									<td className='py-2 pr-4 align-top'>{t('privacy.s1_row_password_data')}</td>
									<td className='py-2 pr-4 align-top'>
										{t('privacy.s1_row_password_description')}
									</td>
									<td className='py-2 align-top'>{t('privacy.s1_row_password_origin')}</td>
								</tr>
								<tr className='border-b'>
									<td className='py-2 pr-4 align-top'>
										{t('privacy.s1_row_github_tokens_data')}
									</td>
									<td className='py-2 pr-4 align-top'>
										{t('privacy.s1_row_github_tokens_description')}
									</td>
									<td className='py-2 align-top'>
										{t('privacy.s1_row_github_tokens_origin')}
									</td>
								</tr>
								<tr className='border-b'>
									<td className='py-2 pr-4 align-top'>{t('privacy.s1_row_session_data')}</td>
									<td className='py-2 pr-4 align-top'>
										{t('privacy.s1_row_session_description')}
									</td>
									<td className='py-2 align-top'>{t('privacy.s1_row_session_origin')}</td>
								</tr>
								<tr className='border-b'>
									<td className='py-2 pr-4 align-top'>{t('privacy.s1_row_content_data')}</td>
									<td className='py-2 pr-4 align-top'>
										{t('privacy.s1_row_content_description')}
									</td>
									<td className='py-2 align-top'>{t('privacy.s1_row_content_origin')}</td>
								</tr>
								<tr className='border-b'>
									<td className='py-2 pr-4 align-top'>
										{t('privacy.s1_row_usage_history_data')}
									</td>
									<td className='py-2 pr-4 align-top'>
										{t('privacy.s1_row_usage_history_description')}
									</td>
									<td className='py-2 align-top'>
										{t('privacy.s1_row_usage_history_origin')}
									</td>
								</tr>
								<tr>
									<td className='py-2 pr-4 align-top'>{t('privacy.s1_row_shares_data')}</td>
									<td className='py-2 pr-4 align-top'>
										{t('privacy.s1_row_shares_description')}
									</td>
									<td className='py-2 align-top'>{t('privacy.s1_row_shares_origin')}</td>
								</tr>
							</tbody>
						</table>
					</div>

					<p className='mt-4'>
						<Trans
							i18nKey='privacy.s1_guest_mode'
							components={{ strong: <strong />, code: <code /> }}
						/>
					</p>

					<p className='mt-4'>{t('privacy.s1_no_extra_data')}</p>
				</section>

				<section className='mb-8'>
					<h2 className='mb-2 text-2xl'>{t('privacy.s2_title')}</h2>
					<p className='mb-2'>{t('privacy.s2_intro')}</p>
					<ul className='list-disc pl-5 mb-2 space-y-1'>
						<li>{t('privacy.s2_item_auth')}</li>
						<li>{t('privacy.s2_item_sync')}</li>
						<li>{t('privacy.s2_item_export')}</li>
						<li>{t('privacy.s2_item_history')}</li>
						<li>{t('privacy.s2_item_share')}</li>
					</ul>
					<p>{t('privacy.s2_outro')}</p>
				</section>

				<section className='mb-8'>
					<h2 className='mb-2 text-2xl'>{t('privacy.s3_title')}</h2>
					<p className='mb-2'>
						<Trans i18nKey='privacy.s3_p1' components={{ strong: <strong /> }} />
					</p>
					<p className='mb-2'>{t('privacy.s3_p2')}</p>
					<p>
						<Trans
							i18nKey='privacy.s3_p3'
							components={{
								mail: <a href='mailto:ciromirkin@gmail.com' className='underline' />,
							}}
						/>
					</p>
				</section>

				<section className='mb-8'>
					<h2 className='mb-2 text-2xl'>{t('privacy.s4_title')}</h2>
					<p className='mb-2'>{t('privacy.s4_intro')}</p>
					<ul className='list-disc pl-5 mb-2 space-y-1'>
						<li>
							<Trans i18nKey='privacy.s4_item_db' components={{ strong: <strong /> }} />
						</li>
						<li>
							<Trans i18nKey='privacy.s4_item_hosting' components={{ strong: <strong /> }} />
						</li>
						<li>
							<Trans i18nKey='privacy.s4_item_github' components={{ strong: <strong /> }} />
						</li>
						<li>
							<Trans i18nKey='privacy.s4_item_sentry' components={{ strong: <strong /> }} />
						</li>
						<li>
							<Trans i18nKey='privacy.s4_item_shared_boards' components={{ strong: <strong /> }} />
						</li>
					</ul>
					<p>{t('privacy.s4_outro')}</p>
				</section>

				<section className='mb-8'>
					<h2 className='mb-2 text-2xl'>{t('privacy.s5_title')}</h2>
					<p>
						<Trans
							i18nKey='privacy.s5_p'
							components={{ securityLink: <Link href='/security' className='underline' /> }}
						/>
					</p>
				</section>

				<section className='mb-8'>
					<h2 className='mb-2 text-2xl'>{t('privacy.s6_title')}</h2>
					<p className='mb-2'>{t('privacy.s6_intro')}</p>
					<ul className='list-disc pl-5 mb-2 space-y-1'>
						<li>
							<Trans i18nKey='privacy.s6_item_access' components={{ strong: <strong /> }} />
						</li>
						<li>
							<Trans i18nKey='privacy.s6_item_export' components={{ strong: <strong /> }} />
						</li>
						<li>
							<Trans i18nKey='privacy.s6_item_rectify' components={{ strong: <strong /> }} />
						</li>
						<li>
							<Trans i18nKey='privacy.s6_item_delete' components={{ strong: <strong /> }} />
						</li>
					</ul>
					<p>
						<Trans
							i18nKey='privacy.s6_outro'
							components={{
								mail: <a href='mailto:ciromirkin@gmail.com' className='underline' />,
							}}
						/>
					</p>
				</section>

				<section className='mb-4'>
					<h2 className='mb-2 text-2xl'>{t('privacy.s7_title')}</h2>
					<p className='mb-2'>{t('privacy.s7_p1')}</p>
					<p>
						<Trans
							i18nKey='privacy.s7_p2'
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
