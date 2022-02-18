import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { FunctionComponent } from 'react';

interface Props {
	onClick: () => void;
	show: boolean;
}

const PaymentMethodEditButton: FunctionComponent< Props > = ( { onClick, show } ) => {
	const translate = useTranslate();
	const buttonText = translate( 'Update Payment Info' );

	if ( show ) {
		return (
			<Button className="payment-method-edit-button" onClick={ onClick }>
				{ buttonText }
			</Button>
		);
	}
	return null;
};

export default PaymentMethodEditButton;
