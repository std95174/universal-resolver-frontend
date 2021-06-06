import React, { Component } from 'react';
import axios from 'axios';

import { Item, Input, Button, Dropdown } from 'semantic-ui-react';
import { determineHostName } from './utils';

export class ResolverInput extends Component {

	constructor(props) {
		super(props);
		this.state = { input: this.props.did, example: '' };
	}

	resolve() {
		let did;
		const splitDid = encodeURIComponent(this.state.input).split("did:ipdid")
		if(splitDid.length==2){
			did = splitDid[1];
		}else{
			did = encodeURIComponent(this.state.input);
		}
		console.log(`https://universal-resolver-driver-henna.vercel.app/1.0/identifiers/${did}`);
		axios
			.get(`https://universal-resolver-driver-henna.vercel.app/1.0/identifiers/${did}`)
			.then(response => {
				console.log(response);
				const didDocument = response.data.didDocument;
				const didResolutionMetadata = response.data.didResolutionMetadata;
				const didDocumentMetadata = response.data.didDocumentMetadata;
				this.props.onResult(didDocument, didResolutionMetadata, didDocumentMetadata);
			})
			.catch(error => {
				if (error.response && error.response.data) {
					var errorString;
					if (error.response.status === 404)
						errorString = "No result for " + this.state.input;
					else
						errorString = String(error);
					if (typeof error.response.data === 'object') {
						const didDocument = error.response.data.didDocument;
						const didResolutionMetadata = error.response.data.didResolutionMetadata;
						const didDocumentMetadata = error.response.data.didDocumentMetadata;
						this.props.onError(errorString, didDocument, didResolutionMetadata, didDocumentMetadata);
					} else {
						this.props.onError(errorString + ': ' + error.response.data);
					}
				} else if (error.request) {
					this.props.onError(String(error) + ": " + JSON.stringify(error.request));
				} else if (error.message) {
					this.props.onError(error.message);
				} else {
					this.props.onError(String(error));
				}
			});
	}

	componentDidMount() {
		if (this.props.autoResolve) {
			this.props.onLoading();
			this.resolve();
		}
	}

	onClickResolve() {
		this.props.onLoading();
		console.log("resolve button clicked");
		this.resolve();
	}

	onClickClear() {
		this.props.onClear();
	}

	onChangeExample(e, data) {
		this.setState({ input: data.value });
		this.setState({ example: '' });
	}

	onChangeInput(e) {
		this.setState({ input: e.target.value });
	}

	render() {
		const examples = this.props.examples.map((example) => ({ text: example, value: example }));
		return (
			<Item className="resolver-input">
				<Input label='did-url' value={this.state.input} onChange={this.onChangeInput.bind(this)} />
				<Button primary onClick={this.onClickResolve.bind(this)}>Resolve</Button>
				<Button secondary onClick={this.onClickClear.bind(this)}>Clear</Button>
				<Dropdown placeholder='Examples' selection options={examples} value={this.state.example} onChange={this.onChangeExample.bind(this)} />
			</Item>
		);
	}
}

export default ResolverInput;
