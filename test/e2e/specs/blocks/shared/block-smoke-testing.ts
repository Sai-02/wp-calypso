import {
	DataHelper,
	BlockFlow,
	GutenbergEditorPage,
	EditorContext,
	PublishedPostContext,
	TestAccount,
} from '@automattic/calypso-e2e';
import { Page, Browser } from 'playwright';

declare const browser: Browser;

/**
 * Creates a suite of block smoke tests for a set of block flows.
 *
 * @param specName The parent name of the spec to use in the top-level describe. E.g. "CoBlocks"
 * @param blockFlows A list of block flows to put under test.
 */
export function createBlockTests( specName: string, blockFlows: BlockFlow[] ): void {
	describe( DataHelper.createSuiteTitle( specName ), function () {
		let page: Page;
		let gutenbergEditorPage: GutenbergEditorPage;
		let editorContext: EditorContext;
		let publishedPostContext: PublishedPostContext;

		beforeAll( async () => {
			page = await browser.newPage();
			gutenbergEditorPage = new GutenbergEditorPage( page );
			const testAccount = new TestAccount( 'gutenbergSimpleSiteUser' );
			await testAccount.authenticate( page );
		} );

		it( 'Go to the new post page', async () => {
			await gutenbergEditorPage.visit( 'post' );
		} );

		describe( 'Add and configure blocks in the editor', function () {
			for ( const blockFlow of blockFlows ) {
				it( `${ blockFlow.blockSidebarName }: Add the block from the sidebar`, async function () {
					const blockHandle = await gutenbergEditorPage.addBlock(
						blockFlow.blockSidebarName,
						blockFlow.blockEditorSelector
					);
					editorContext = {
						page: page,
						editorIframe: await gutenbergEditorPage.getEditorFrame(),
						blockHandle: blockHandle,
					};
				} );

				it( `${ blockFlow.blockSidebarName }: Configure the block`, async function () {
					if ( blockFlow.configure ) {
						await blockFlow.configure( editorContext );
					}
				} );

				it( `${ blockFlow.blockSidebarName }: There are no block warnings or errors in the editor`, async function () {
					expect( await gutenbergEditorPage.editorHasBlockWarnings() ).toBe( false );
				} );
			}
		} );

		describe( 'Publishing the post', function () {
			it( 'Publish and visit post', async function () {
				// If the post is not saved as draft, some blocks are not rendered and the
				// post-publish panel may be dismissed.
				await gutenbergEditorPage.saveDraft();
				await gutenbergEditorPage.publish( { visit: true } );
				publishedPostContext = {
					page: page,
				};
			} );
		} );

		describe( 'Validating blocks in published post.', function () {
			for ( const blockFlow of blockFlows ) {
				it( `${ blockFlow.blockSidebarName }: Expected content is in published post`, async function () {
					if ( blockFlow.validateAfterPublish ) {
						await blockFlow.validateAfterPublish( publishedPostContext );
					}
				} );
			}
		} );
	} );
}
