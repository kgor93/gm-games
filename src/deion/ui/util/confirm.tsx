import PropTypes from "prop-types";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { confirmable, createConfirmation } from "react-confirm";
import Modal from "reactstrap/lib/Modal";
import ModalBody from "reactstrap/lib/ModalBody";
import ModalFooter from "reactstrap/lib/ModalFooter";
const Confirm = confirmable(
	({ show, proceed, confirmation, defaultValue, okText, cancelText }) => {
		okText = okText !== undefined ? okText : "OK";
		cancelText = cancelText !== undefined ? cancelText : "Cancel";
		const [controlledValue, setControlledValue] = useState(defaultValue);
		const ok = useCallback(
			() => proceed(defaultValue === undefined ? true : controlledValue),
			[controlledValue, defaultValue, proceed],
		);
		const cancel = useCallback(
			() => proceed(defaultValue === undefined ? false : null),
			[defaultValue, proceed],
		);
		const inputRef = useRef<HTMLInputElement>(null);
		const okRef = useRef<HTMLButtonElement>(null);
		useEffect(() => {
			// Ugly hack that became necessary when upgrading reactstrap from v6 to v8
			setTimeout(() => {
				if (inputRef.current) {
					inputRef.current.select();
				} else if (okRef.current) {
					okRef.current.focus();
				}
			}, 0);
		}, []);
		return (
			<div>
				<Modal fade={false} isOpen={show} toggle={cancel}>
					<ModalBody>
						{confirmation}
						{defaultValue !== undefined ? (
							<form
								className="mt-3"
								onSubmit={event => {
									event.preventDefault();
									ok();
								}}
							>
								<input
									ref={inputRef}
									type="text"
									className="form-control"
									value={controlledValue}
									onChange={event => {
										setControlledValue(event.target.value);
									}}
								/>
							</form>
						) : null}
					</ModalBody>
					<ModalFooter>
						<button className="btn btn-secondary" onClick={cancel}>
							{cancelText}
						</button>
						<button className="btn btn-primary" onClick={ok} ref={okRef}>
							{okText}
						</button>
					</ModalFooter>
				</Modal>
			</div>
		);
	},
);
Confirm.propTypes = {
	confirmation: PropTypes.string.isRequired,
	defaultValue: PropTypes.string,
};
const confirmFunction = createConfirmation(Confirm); // Pass "defaultValue" and it's used as the default value, like window.prompt. Don't pass "defaultValue" and it's like window.confirm.

const confirm = (
	message: string,
	{
		defaultValue,
		okText,
		cancelText,
	}: {
		defaultValue?: string;
		okText?: string;
		cancelText?: string;
	},
) => {
	return confirmFunction({
		confirmation: message,
		defaultValue,
		okText,
		cancelText,
	});
};

export default confirm;
