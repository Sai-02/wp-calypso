import { Button, FormStatus, useLineItems, useFormStatus } from '@automattic/composite-checkout';
import { PaymentLogo } from '@automattic/wpcom-checkout/src/payment-method-logos';
import { SummaryLine, SummaryDetails } from '@automattic/wpcom-checkout/src/summary-details';
import styled from '@emotion/styled';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import debugFactory from 'debug';
import { useTranslate } from 'i18n-calypso';
import { Fragment, useCallback, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useSelector } from 'react-redux';
import { getPaymentMethodSummary } from 'calypso/lib/checkout/payment-methods';
import wpcom from 'calypso/lib/wp';
import { isEditingStoredCard } from 'calypso/state/stored-cards/selectors';
import PaymentMethodEditButton from './components/payment-method-edit-button';
import PaymentMethodEditDialog from './components/payment-method-edit-dialog';
import RenderEditFormFields from './components/payment-method-edit-form-fields';
import type { PaymentMethod, ProcessPayment, LineItem } from '@automattic/composite-checkout';

const debug = debugFactory( 'wpcom-checkout:existing-card-payment-method' );

// Disabling this to make migration easier
/* eslint-disable @typescript-eslint/no-use-before-define */

async function fetchTaxInfo(
	storedDetailsId: string
): Promise< { tax_postal_code: string; tax_country_code: string; is_tax_info_set: boolean } > {
	return await wpcom.req.get( `/me/payment-methods/${ storedDetailsId }/tax-location` );
}

async function setTaxInfo(
	storedDetailsId: string,
	taxPostalCode: string,
	taxCountryCode: string
): Promise< { tax_postal_code: string; tax_country_code: string } > {
	return await wpcom.req.post( {
		path: `/me/payment-methods/${ storedDetailsId }/tax-location`,
		body: {
			tax_country_code: taxCountryCode,
			tax_postal_code: taxPostalCode,
		},
	} );
}

export function createExistingCardMethod( {
	id,
	cardholderName,
	cardExpiry,
	brand,
	last4,
	storedDetailsId,
	paymentMethodToken,
	paymentPartnerProcessorId,
	activePayButtonText = undefined,
}: {
	id: string;
	cardholderName: string;
	cardExpiry: string;
	brand: string;
	last4: string;
	storedDetailsId: string;
	paymentMethodToken: string;
	paymentPartnerProcessorId: string;
	activePayButtonText: string | undefined;
} ): PaymentMethod {
	debug( 'creating a new existing credit card payment method', {
		id,
		cardholderName,
		cardExpiry,
		brand,
		last4,
	} );

	return {
		id,
		label: (
			<ExistingCardLabel
				last4={ last4 }
				storedDetailsId={ storedDetailsId }
				cardExpiry={ cardExpiry }
				cardholderName={ cardholderName }
				brand={ brand }
				paymentPartnerProcessorId={ paymentPartnerProcessorId }
			/>
		),
		submitButton: (
			<ExistingCardPayButton
				cardholderName={ cardholderName }
				storedDetailsId={ storedDetailsId }
				paymentMethodToken={ paymentMethodToken }
				paymentPartnerProcessorId={ paymentPartnerProcessorId }
				activeButtonText={ activePayButtonText }
			/>
		),
		inactiveContent: (
			<ExistingCardSummary
				cardholderName={ cardholderName }
				cardExpiry={ cardExpiry }
				brand={ brand }
				last4={ last4 }
			/>
		),
		getAriaLabel: () => `${ brand } ${ last4 } ${ cardholderName }`,
	};
}

function formatDate( cardExpiry: string ): string {
	const expiryDate = new Date( cardExpiry );
	const formattedDate = expiryDate.toLocaleDateString( 'en-US', {
		month: '2-digit',
		year: '2-digit',
	} );

	return formattedDate;
}

const CardDetails = styled.span`
	display: inline-block;
	margin-right: 8px;

	.rtl & {
		margin-right: 0;
		margin-left: 8px;
	}
`;

const CardHolderName = styled.span`
	display: block;
`;

function ExistingCardLabel( {
	last4,
	cardExpiry,
	cardholderName,
	brand,
	storedDetailsId,
	paymentPartnerProcessorId,
}: {
	last4: string;
	cardExpiry: string;
	cardholderName: string;
	brand: string;
	storedDetailsId: string;
	paymentPartnerProcessorId: string;
} ): JSX.Element {
	const { __, _x } = useI18n();
	const translate = useTranslate();

	const isEditing = useSelector( ( state ) => isEditingStoredCard( state, storedDetailsId ) );

	const [ isDialogVisible, setIsDialogVisible ] = useState( false );
	const closeDialog = useCallback( () => setIsDialogVisible( false ), [] );
	const queryClient = useQueryClient();

	const { data } = useQuery<
		{ tax_postal_code: string; tax_country_code: string; is_tax_info_set: boolean },
		Error
	>( [ 'tax-info-is-set', storedDetailsId ], () => fetchTaxInfo( storedDetailsId ), {} );

	const mutation = useMutation(
		( mutationInputValues: { tax_postal_code: string; tax_country_code: string } ) =>
			setTaxInfo(
				storedDetailsId,
				mutationInputValues.tax_postal_code,
				mutationInputValues.tax_country_code
			),
		{
			onMutate: ( onMutateInputValues: { tax_postal_code: string; tax_country_code: string } ) => {
				// Optimistically update the toggle
				queryClient.setQueryData( [ 'tax-info-is-set', storedDetailsId ], {
					tax_postal_code: onMutateInputValues.tax_postal_code,
					tax_country_code: onMutateInputValues.tax_country_code,
					is_tax_info_set: true,
				} );
				closeDialog();
			},
			onSuccess: ( onSuccessInputValues: {
				tax_postal_code: string;
				tax_country_code: string;
			} ) => {
				queryClient.setQueryData( [ 'tax-info-is-set', storedDetailsId ], {
					tax_postal_code: onSuccessInputValues.tax_postal_code,
					tax_country_code: onSuccessInputValues.tax_country_code,
					is_tax_info_set: true,
				} );
			},
		}
	);

	const [ inputValues, setInputValues ] = useState( {
		tax_postal_code: data?.tax_postal_code ?? '',
		tax_country_code: data?.tax_country_code ?? '',
	} );

	const postalCodeValue = inputValues.tax_postal_code;
	const countryCodeValue = inputValues.tax_country_code;

	const updateTaxInfo = useCallback( () => {
		mutation.mutate( inputValues );
	}, [ mutation, inputValues ] );

	const onChangeCountryCode = ( e: { target: { value: string } } ) => {
		setInputValues( { ...inputValues, tax_country_code: e.target.value } );
	};

	const onChangePostalCode = ( e: { target: { value: string } } ) => {
		setInputValues( { ...inputValues, tax_postal_code: e.target.value } );
	};

	const renderEditForm = (): JSX.Element => {
		return (
			<form>
				<div className="contact-fields payment-methods__tax-fields">
					<RenderEditFormFields
						postalCodeValue={ postalCodeValue }
						countryCodeValue={ countryCodeValue }
						onChangePostalCode={ onChangePostalCode }
						onChangeCountryCode={ onChangeCountryCode }
					/>
				</div>
			</form>
		);
	};

	const formRender = renderEditForm();
	const showButton = ! data?.is_tax_info_set;

	/* translators: %s is the last 4 digits of the credit card number */
	const maskedCardDetails = sprintf( _x( '**** %s', 'Masked credit card number' ), last4 );

	return (
		<Fragment>
			<div>
				<CardHolderName>{ cardholderName }</CardHolderName>
				<CardDetails>{ maskedCardDetails }</CardDetails>
				<span>{ `${ __( 'Expiry:' ) } ${ formatDate( cardExpiry ) }` }</span>
			</div>
			<div className="existing-credit-card__logo payment-logos">
				<PaymentLogo brand={ brand } isSummary={ true } />
				<br />
				<PaymentMethodEditDialog
					paymentMethodSummary={ getPaymentMethodSummary( {
						translate,
						type: brand || paymentPartnerProcessorId,
						digits: last4,
					} ) }
					isVisible={ isDialogVisible }
					onClose={ closeDialog }
					onConfirm={ updateTaxInfo }
					form={ formRender }
				/>
				<PaymentMethodEditButton
					onClick={ () => setIsDialogVisible( true ) }
					isEditing={ isEditing }
					show={ showButton }
				/>
			</div>
		</Fragment>
	);
}

function ExistingCardPayButton( {
	disabled,
	onClick,
	cardholderName,
	storedDetailsId,
	paymentMethodToken,
	paymentPartnerProcessorId,
	activeButtonText = undefined,
}: {
	disabled?: boolean;
	onClick?: ProcessPayment;
	cardholderName: string;
	storedDetailsId: string;
	paymentMethodToken: string;
	paymentPartnerProcessorId: string;
	activeButtonText: string | undefined;
} ) {
	const [ items, total ] = useLineItems();
	const { formStatus } = useFormStatus();

	// This must be typed as optional because it's injected by cloning the
	// element in CheckoutSubmitButton, but the uncloned element does not have
	// this prop yet.
	if ( ! onClick ) {
		throw new Error(
			'Missing onClick prop; ExistingCardPayButton must be used as a payment button in CheckoutSubmitButton'
		);
	}

	return (
		<Button
			disabled={ disabled }
			onClick={ () => {
				debug( 'submitting existing card payment' );
				onClick( 'existing-card', {
					items,
					name: cardholderName,
					storedDetailsId,
					paymentMethodToken,
					paymentPartnerProcessorId,
				} );
			} }
			buttonType="primary"
			isBusy={ FormStatus.SUBMITTING === formStatus }
			fullWidth
		>
			<ButtonContents
				formStatus={ formStatus }
				total={ total }
				activeButtonText={ activeButtonText }
			/>
		</Button>
	);
}

function ButtonContents( {
	formStatus,
	total,
	activeButtonText = undefined,
}: {
	formStatus: string;
	total: LineItem;
	activeButtonText: string | undefined;
} ): JSX.Element {
	const { __ } = useI18n();
	if ( formStatus === FormStatus.SUBMITTING ) {
		return <>{ __( 'Processing…' ) }</>;
	}
	if ( formStatus === FormStatus.READY ) {
		/* translators: %s is the total to be paid in localized currency */
		return <>{ activeButtonText || sprintf( __( 'Pay %s' ), total.amount.displayValue ) }</>;
	}
	return <>{ __( 'Please wait…' ) }</>;
}

function ExistingCardSummary( {
	cardholderName,
	cardExpiry,
	brand,
	last4,
}: {
	cardholderName: string;
	cardExpiry: string;
	brand: string;
	last4: string;
} ) {
	const { __, _x } = useI18n();

	/* translators: %s is the last 4 digits of the credit card number */
	const maskedCardDetails = sprintf( _x( '**** %s', 'Masked credit card number' ), last4 );

	return (
		<SummaryDetails>
			<SummaryLine>{ cardholderName }</SummaryLine>
			<SummaryLine>
				<PaymentLogo brand={ brand } isSummary={ true } />
				<CardDetails>{ maskedCardDetails }</CardDetails>
				<span>{ `${ __( 'Expiry:' ) } ${ formatDate( cardExpiry ) }` }</span>
			</SummaryLine>
		</SummaryDetails>
	);
}
