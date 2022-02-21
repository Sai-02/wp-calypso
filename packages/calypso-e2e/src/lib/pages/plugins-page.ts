import assert from 'assert';
import { Page } from 'playwright';
import { getCalypsoURL } from '../../data-helper';

const selectors = {
	sectionHeader: '.plugins-browser-list__header',
	sectionTitle: ( section: string ) => `.plugins-browser-list__title:text("${ section }")`,
	sectionTitles: '.plugins-browser-list__title',
	browseAll: 'a:text("Browse All")',
	breadcrumb: ( section: string ) => `.plugins-browser__header li a:text("${ section }") `,
	monthlyPricingToggle: 'a:text("Monthly")',
	annualPricingToggle: 'a:text("Annually")',
	pricingToggle: '.select-dropdown__container',
	monthlyPricingSelect: 'li a:text("Monthly price")',
	annualPricingSelect: 'li a:text("Annual price")',
	monthlyPricing: '.plugins-browser-item__period:text("monthly")',
	annualPricing: '.plugins-browser-item__period:text("per year")',
};

/**
 * Plugins page https://wordpress.com/plugins/.
 */
export class PluginsPage {
	private page: Page;

	/**
	 * Constructs an instance.
	 */
	constructor( page: Page ) {
		this.page = page;
	}

	/**
	 * Visit /plugins or /plugins/:site
	 */
	async visit( site = '' ): Promise< void > {
		await this.page.goto( getCalypsoURL( `plugins/${ site }` ) );
	}

	/**
	 * Visit /plugins/:page/ or /plugins/:page/:site
	 */
	async visitPage( page: string, site = '' ): Promise< void > {
		await this.page.goto( getCalypsoURL( `plugins/${ page }/${ site }` ) );
	}

	/**
	 * Has Section
	 */
	async hasSection( section: string ): Promise< void > {
		await this.page.waitForSelector( selectors.sectionTitle( section ) );
	}

	/**
	 * Not Has Section
	 */
	async notHasSection( section: string ): Promise< void > {
		const titles = this.page.locator( selectors.sectionTitles );
		const count = await titles.count();
		for ( let i = 0; i < count; i++ ) {
			const title = await titles.nth( i ).innerText();
			assert.notEqual( title, section );
		}
	}

	/**
	 * Click Browse All
	 */
	async clickBrowseAll(): Promise< void > {
		await this.page.click( selectors.browseAll );
		assert.match( this.page.url(), /.*\/plugins\/(featured|paid|new|popular)$/ );
	}

	/**
	 * Click breadcrumb
	 */
	async clickBreadcrumb( text: string ): Promise< void > {
		await this.page.click( selectors.breadcrumb( text ) );
		assert.match( this.page.url(), /.*\/plugins$/ );
	}

	/**
	 * Click Monthly Pricing
	 */
	async clickMonthlyPricing(): Promise< void > {
		await this.page.click( selectors.monthlyPricingToggle );
	}

	/**
	 * Click Annual Pricing
	 */
	async clickAnnualPricing(): Promise< void > {
		await this.page.click( selectors.annualPricingToggle );
	}

	/**
	 * Select monthly
	 */
	async selectMonthlyPricing(): Promise< void > {
		await this.page.click( selectors.pricingToggle );
		await this.page.click( selectors.monthlyPricingSelect );
	}

	/**
	 * Select annual
	 */
	async selectAnnualPricing(): Promise< void > {
		await this.page.click( selectors.pricingToggle );
		await this.page.click( selectors.annualPricingSelect );
	}

	/**
	 * Check Is Monthly Pricing
	 */
	async checkMonthlyPricing(): Promise< void > {
		await this.page.waitForSelector( selectors.monthlyPricing );
	}

	/**
	 * Check Is Annual Pricing
	 */
	async checkAnnualPricing(): Promise< void > {
		await this.page.waitForSelector( selectors.annualPricing );
	}
}
