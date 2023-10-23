/* eslint-disable no-plusplus */
import React from 'react';
import PropTypes from 'prop-types';
import { isNil } from 'lodash';

const repeatZeroes = (times) => {
	let result = '';

	for (let i = 0; i < times; i++) {
		result += '0';
	}

	return result;
};

const removeOccurrences = (from, toRemove) => {
	// eslint-disable-next-line no-param-reassign,no-useless-escape
	toRemove = toRemove.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
	const re = new RegExp(toRemove, 'g');
	return from.replace(re, '');
};

class SimpleCurrency extends React.Component {
	constructor(props) {
		super(props);

		this.onInputType = this.onInputType.bind(this);
		this.formattedRawValue = this.formattedRawValue.bind(this);
		this.getRawValue = this.getRawValue.bind(this);

		this.state = {
			rawValue: this.props.value,
			tabIndex: this.props.tabIndex,
			readOnly: this.props.readOnly,
		};
	}

	componentWillMount() {
		this.notifyParentWithRawValue(this.state.rawValue);
	}

	componentWillReceiveProps(nextProps) {
		if (nextProps.value || nextProps.value === 0) {
			this.setState({
				rawValue: nextProps.value,
			});
		}
	}

	onInputType(event) {
		const input = event.target.value;
		let rawValue = this.getRawValue(input);

		if (!this.props.allowEmpty && !rawValue) {
			rawValue = 0;
		}

		this.notifyParentWithRawValue(rawValue);

		this.setState({
			rawValue,
		});
	}

	getRawValue(displayedValue) {
		let result = displayedValue;

		result = removeOccurrences(result, this.props.delimiter);
		result = removeOccurrences(result, this.props.separator);
		result = removeOccurrences(result, this.props.unit);

		if (this.valueIsEmpty(result)) {
			return null;
		}

		return parseInt(result, 10);
	}

	formattedRawValue(rawValue) {
		if (this.valueIsEmpty(rawValue)) {
			return '';
		}

		const minChars = '0'.length + this.props.precision;

		let result = '';
		result = `${rawValue}`;

		if (result.length < minChars) {
			const leftZeroesToAdd = minChars - result.length;
			result = `${repeatZeroes(leftZeroesToAdd)}${result}`;
		}

		let beforeSeparator = result.slice(0, result.length - this.props.precision);
		const afterSeparator = result.slice(result.length - this.props.precision);

		if (beforeSeparator.length > 3) {
			const chars = beforeSeparator.split('').reverse();
			let withDots = '';
			for (let i = chars.length - 1; i >= 0; i--) {
				const char = chars[i];
				const dot = i % 3 === 0 ? this.props.delimiter : '';
				withDots = `${withDots}${char}${dot}`;
			}
			withDots = withDots.substring(0, withDots.length - 1);
			beforeSeparator = withDots;
		}
		result = beforeSeparator + this.props.separator + afterSeparator;

		if (this.props.unit) {
			result = `${this.props.unit} ${result}`;
		}

		return result;
	}

	notifyParentWithRawValue(rawValue) {
		const display = this.formattedRawValue(rawValue);
		this.props.onInputChange(rawValue, display);
	}

	valueIsEmpty(value) {
		return this.props.allowEmpty && (value === '' || isNil(value));
	}

	render() {
		return (<input
			id={this.props.id}
			className={this.props.className}
			onBlur={this.props.onInputBlur}
			onFocus={this.props.onInputFocus}
			onChange={this.onInputType}
			value={this.formattedRawValue(this.state.rawValue)}
			disabled={this.props.disabled}
			autoFocus={this.props.autoFocus}
			tabIndex={this.state.tabIndex}
			readOnly={this.state.readOnly}
			autoComplete={this.props.autoComplete}
			autoCorrect={this.props.autoCorrect}
			name={this.props.name}
			placeholder={this.props.placeholder}
			type={this.props.type}
		/>);
	}
}

SimpleCurrency.propTypes = {
	id: PropTypes.string,
	autoFocus: PropTypes.bool,
	delimiter: PropTypes.string,
	disabled: PropTypes.bool,
	onInputChange: PropTypes.func,
	onInputBlur: PropTypes.func,
	onInputFocus: PropTypes.func,
	precision: PropTypes.number,
	readOnly: PropTypes.bool,
	separator: PropTypes.string,
	tabIndex: PropTypes.number,
	unit: PropTypes.string,
	value: PropTypes.number.isRequired,
	type: PropTypes.string,
	className: PropTypes.string,
	name: PropTypes.string,
	placeholder: PropTypes.string,
	allowEmpty: PropTypes.bool,
	autoComplete: PropTypes.string,
	autoCorrect: PropTypes.string,
};

SimpleCurrency.defaultProps = {
	value: 0,
	precision: 2,
	separator: '.',
	delimiter: ',',
	unit: '',
	disabled: false,
	autoFocus: false,
	readOnly: false,
	tabIndex: -1,
	onInputChange: () => {},
	onInputBlur: () => {},
	onInputFocus: () => {},
	type: 'text',
	className: null,
	name: 'currency',
	id: 'currency',
	placeholder: null,
	allowEmpty: false,
	autoComplete: undefined,
	autoCorrect: undefined,
};

export default SimpleCurrency;
