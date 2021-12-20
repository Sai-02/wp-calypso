/**
 * @jest-environment jsdom
 */
import { shallow } from 'enzyme';
import TourKitFrame from '../tour-kit-frame';
import TourKitPortal from '../tour-kit-portal';

describe( 'TourKitPortal', () => {
	test( 'should render', () => {
		const wrapper = shallow( <TourKitPortal /> );
		expect( wrapper ).toMatchSnapshot();
		expect( wrapper.type() ).toEqual( 'div' );
	} );

	test( 'should have TourKitFrame', () => {
		const wrapper = shallow( <TourKitPortal /> );
		expect( wrapper.childAt( 0 ).childAt( 0 ).type() ).toEqual( TourKitFrame );
	} );
} );
