import { Button } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import classNames from 'classnames';
import thumbsDown from '../icons/thumbs_down';
import thumbsUp from '../icons/thumbs_up';

interface Props {
	currentStepIndex: number;
}

const TourKitWPGuideTourRating: React.FunctionComponent< Props > = ( { currentStepIndex } ) => {
	const { config } = useTourKitContext();
	let isDisabled = false;
	const tourRating = useSelect( ( select ) =>
		select( 'automattic/wpcom-welcome-guide' ).getTourRating()
	);
	const { setTourRating } = useDispatch( 'automattic/wpcom-welcome-guide' );

	if ( ! isDisabled && tourRating ) {
		isDisabled = true;
	}
	const rateTour = ( isThumbsUp: boolean ) => {
		if ( isDisabled ) {
			return;
		}
		isDisabled = true;
		setTourRating( isThumbsUp ? 'thumbs-up' : 'thumbs-down' );
		config.options?.callbacks?.onTourRate &&
			config.options?.callbacks?.onTourRate( currentStepIndex, isThumbsUp );
	};

	return (
		<>
			<p className="tour-kit-wpguide-tour-rating__end-text">
				{ __( 'Did you find this guide helpful?', 'tour-kit' ) }
			</p>
			<div>
				<Button
					aria-label={ __( 'Rate thumbs up', 'tour-kit' ) }
					className={ classNames( 'tour-kit-wpguide-tour-rating__end-icon', {
						active: tourRating === 'thumbs-up',
					} ) }
					disabled={ isDisabled }
					icon={ thumbsUp }
					onClick={ () => rateTour( true ) }
					iconSize={ 24 }
				/>
				<Button
					aria-label={ __( 'Rate thumbs down', 'tour-kit' ) }
					className={ classNames( 'tour-kit-wpguide-tour-rating__end-icon', {
						active: tourRating === 'thumbs-down',
					} ) }
					disabled={ isDisabled }
					icon={ thumbsDown }
					onClick={ () => rateTour( false ) }
					iconSize={ 24 }
				/>
			</div>
		</>
	);
};

export default TourKitWPGuideTourRating;
