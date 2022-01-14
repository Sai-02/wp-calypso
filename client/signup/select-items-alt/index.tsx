import { Button } from '@automattic/components';
import { Tooltip } from '@wordpress/components';
import { Icon, info } from '@wordpress/icons';
import classnames from 'classnames';
import { TranslateResult } from 'i18n-calypso';
import React from 'react';
import './style.scss';

export interface SelectAltItem< T > {
	show: boolean;
	key: string;
	description: TranslateResult;
	value: T;
	actionText: TranslateResult;
	disable: boolean;
	disableText: TranslateResult;
}

interface Props< T > {
	className?: string;
	items: SelectAltItem< T >[];
	onSelect: ( value: T ) => void;
}

function SelectItems< T >( { className, items, onSelect }: Props< T > ): React.ReactElement {
	return (
		<div className={ classnames( 'select-items-alt', className ) }>
			{ items.map(
				( { disable, disableText, show, key, description, actionText, value } ) =>
					show && (
						<div key={ key } className="select-items-alt__item">
							<div className="select-items-alt__item-info-wrapper">
								<div className="select-items-alt__item-info">
									<p className="select-items-alt__item-description">{ description }</p>
								</div>
								<Button
									disabled={ disable }
									className="select-items-alt__item-button"
									onClick={ () => onSelect( value ) }
								>
									{ actionText }
								</Button>

								{ disable && (
									<>
										&nbsp;
										<Tooltip text={ disableText } position="bottom center">
											<div className="select-items-alt__item-disabled-info">
												<Icon icon={ info } size={ 20 } />
											</div>
										</Tooltip>
									</>
								) }
							</div>
						</div>
					)
			) }
		</div>
	);
}

export default SelectItems;
