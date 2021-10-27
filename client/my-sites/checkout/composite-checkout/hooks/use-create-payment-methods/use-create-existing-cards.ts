import { useMemo } from 'react';
import { useMemoCompare } from 'calypso/lib/use-memo-compare';
import { createExistingCardMethod } from 'calypso/me/purchases/payment-methods/existing-credit-card';
import type { StoredCard } from '../../types/stored-cards';
import type { StripeLoadingError } from '@automattic/calypso-stripe';
import type { PaymentMethod } from '@automattic/composite-checkout';

export default function useCreateExistingCards( {
	isStripeLoading,
	stripeLoadingError,
	storedCards,
	activePayButtonText = undefined,
}: {
	isStripeLoading: boolean;
	stripeLoadingError: StripeLoadingError;
	storedCards: StoredCard[];
	activePayButtonText?: string;
} ): PaymentMethod[] {
	// The existing card payment methods do not require stripe, but the existing
	// card processor does require it (for 3DS cards), so we wait to create the
	// payment methods until stripe is loaded.
	const shouldLoad = ! isStripeLoading && ! stripeLoadingError;

	// Memoize the cards by comparing their stored_details_id values, in case the
	// objects themselves are recreated on each render.
	const memoizedStoredCards: StoredCard[] | undefined = useMemoCompare(
		storedCards,
		( prev: undefined | StoredCard[], next: undefined | StoredCard[] ) => {
			const prevIds = prev?.map( ( card ) => card.stored_details_id ) ?? [];
			const nextIds = next?.map( ( card ) => card.stored_details_id ) ?? [];
			const prevPostalCodes = prev?.map( ( card ) => card.tax_postal_code ) ?? [];
			const nextPostalCodes = next?.map( ( card ) => card.tax_postal_code ) ?? [];
			const prevCountryCodes = prev?.map( ( card ) => card.tax_country_code ) ?? [];
			const nextCountryCodes = next?.map( ( card ) => card.tax_country_code ) ?? [];
			return (
				prevIds.length === nextIds.length &&
				prevIds.every( ( id, index ) => id === nextIds[ index ] ) &&
				prevPostalCodes.every( ( id, index ) => id === nextPostalCodes[ index ] ) &&
				prevCountryCodes.every( ( id, index ) => id === nextCountryCodes[ index ] )
			);
		}
	);

	const existingCardMethods = useMemo( () => {
		return (
			memoizedStoredCards?.map( ( storedDetails ) =>
				createExistingCardMethod( {
					id: `existingCard-${ storedDetails.stored_details_id }`,
					cardholderName: storedDetails.name,
					cardExpiry: storedDetails.expiry,
					brand: storedDetails.card_type,
					last4: storedDetails.card,
					storedDetailsId: storedDetails.stored_details_id,
					paymentMethodToken: storedDetails.mp_ref,
					paymentPartnerProcessorId: storedDetails.payment_partner,
					activePayButtonText,
				} )
			) ?? []
		);
	}, [ memoizedStoredCards, activePayButtonText ] );

	return shouldLoad ? existingCardMethods : [];
}
