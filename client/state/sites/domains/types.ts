export interface SiteDomain {
	autoRenewalDate?: string;
	autoRenewing?: boolean;
	blogId?: number;
	canSetAsPrimary?: boolean;
	currentUserCanAddEmail?: boolean;
	currentUserCanManage?: boolean;
	domain: string;
	expired?: boolean;
	expiry?: string | null;
	expirySoon?: boolean;
	googleAppsSubscription?: { status?: string };
	titanMailSubscription?: { status?: string; appsUrl?: string };
	hasRegistration?: boolean;
	hasWpcomNameservers?: boolean;
	hasZone?: boolean;
	isPendingIcannVerification?: boolean;
	isIcannVerificationSuspended?: boolean;
	isPendingRenewal?: boolean;
	isPremium?: boolean;
	isPrimary?: boolean;
	isSubdomain?: boolean;
	isWPCOMDomain?: boolean;
	manualTransferRequired?: boolean;
	newRegistration?: boolean;
	name?: string;
	owner?: string;
	partnerDomain?: boolean;
	pendingRegistration?: boolean;
	pendingRegistrationTime?: string;
	pointsToWpcom?: boolean;
	registrar?: string;
	registrationDate?: string;
	subscriptionId?: string | null;
	supportsDomainConnect?: boolean;
	supportsGdprConsentManagement: boolean;
	type?: string;
	transferStartDate?: string | null;
	transferEndDate?: string | null;
}
