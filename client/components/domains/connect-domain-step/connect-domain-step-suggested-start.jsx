import { Button } from '@automattic/components';
import { createElement, createInterpolateElement } from '@wordpress/element';
import { Icon, info } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import PropTypes from 'prop-types';
import CardHeading from 'calypso/components/card-heading';
import {
	modeType,
	stepsHeading,
	stepSlug,
} from 'calypso/components/domains/connect-domain-step/constants';
import FoldableCard from 'calypso/components/foldable-card';
import MaterialIcon from 'calypso/components/material-icon';
import ConnectDomainStepWrapper from './connect-domain-step-wrapper';

import './style.scss';

export default function ConnectDomainStepSuggestedStart( {
	className,
	pageSlug,
	mode,
	onNextStep,
	progressStepList,
	setPage,
} ) {
	const { __ } = useI18n();
	const switchToAdvancedSetup = () => setPage( stepSlug.ADVANCED_START );

	const stepContent = (
		<div className={ className + '__suggested-start' }>
			<p className={ className + '__text' }>
				{ createInterpolateElement(
					__(
						'This is the easiest way to connect your domain, using name servers. If needed you can also use our <a>advanced setup</a>, using root A & CNAME records.'
					),
					{
						a: createElement( 'a', {
							className: 'connect-domain-step__change_mode_link',
							onClick: switchToAdvancedSetup,
						} ),
					}
				) }
			</p>
			<CardHeading tagName="h2" className={ className + '__sub-heading' }>
				<MaterialIcon className={ className + '__sub-heading-icon' } size={ 24 } icon="timer" />
				{ __( 'How long will it take?' ) }
			</CardHeading>
			<p className={ className + '__text' }>
				{ __( 'It takes 5-15 minutes to set up.' ) }
				<br />
				{ __( 'It can take up to 72 hours for the domain to be fully connected.' ) }
			</p>
			<FoldableCard
				clickableHeader
				className={ className + '__connected-services-card' }
				header={
					<div>
						<Icon icon={ info } size={ 24 } />
						Any services connected to this domain?
					</div>
				}
				expanded={ false }
			>
				<p>
					If you have any email or services other than web hosting connected to this domain, we
					recommend you copy over your DNS records before proceeding with this setup to avoid
					distruptions. You can then start the setup again by going back to Upgrades &gt; Domains.
				</p>
				<Button onclick={ null }>Go to DNS records</Button>
				<p>
					Alternatively, you can continue to use your current DNS provider by adding the correct A
					records and CNAME records using our advanced setup.
				</p>
				<Button onclick={ null }>Switch to advance setup</Button>
			</FoldableCard>
			<Button primary onClick={ onNextStep }>
				{ __( 'Start setup' ) }
			</Button>
		</div>
	);

	return (
		<ConnectDomainStepWrapper
			className={ className }
			heading={ stepsHeading.SUGGESTED }
			mode={ mode }
			progressStepList={ progressStepList }
			pageSlug={ pageSlug }
			stepContent={ stepContent }
		/>
	);
}

ConnectDomainStepSuggestedStart.propTypes = {
	className: PropTypes.string.isRequired,
	pageSlug: PropTypes.oneOf( Object.values( stepSlug ) ).isRequired,
	mode: PropTypes.oneOf( Object.values( modeType ) ).isRequired,
	onNextStep: PropTypes.func.isRequired,
	progressStepList: PropTypes.object.isRequired,
	setPage: PropTypes.func.isRequired,
};
