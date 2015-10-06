/* global jsRoutes */

import $ from 'jquery';
import React, {Component, PropTypes} from 'react';
import {SplitButton, Alert, MenuItem}  from 'react-bootstrap';
import Immutable from 'immutable';
import MessagesStore from 'stores/messages/MessagesStore';

class MessageFieldDescription extends Component {
  static propTypes = {
    message: PropTypes.object.isRequired,
    fieldName: PropTypes.string.isRequired,
    fieldValue: PropTypes.any.isRequired,
    possiblyHighlight: PropTypes.func.isRequired,
    disableFieldActions: PropTypes.bool,
  };

  constructor(props) {
    super(props);

    this._loadTerms = this._loadTerms.bind(this);
    this._onTermsLoaded = this._onTermsLoaded.bind(this);
    this._shouldShowTerms = this._shouldShowTerms.bind(this);
    this._getNewExtractorRoute = this._getNewExtractorRoute.bind(this);
    this._addFieldToSearchBar = this._addFieldToSearchBar.bind(this);
    this._getFormattedTerms = this._getFormattedTerms.bind(this);

    this.state = {
      messageTerms: Immutable.List(),
    };
  }

  _loadTerms(field) {
    return () => {
      const promise = MessagesStore.fieldTerms(this.props.message.index, this.props.message.id, field);
      promise.done((terms) => this._onTermsLoaded(terms));
    };
  }

  _onTermsLoaded(terms) {
    this.setState({messageTerms: Immutable.fromJS(terms)});
  }

  _shouldShowTerms() {
    return this.state.messageTerms.size !== 0;
  }

  _getNewExtractorRoute(type) {
    return jsRoutes.controllers.ExtractorsController.newExtractor(
      this.props.message.source_node_id,
      this.props.message.source_input_id,
      type,
      this.props.fieldName,
      this.props.message.index,
      this.props.message.id
    ).url;
  }

  _addFieldToSearchBar(event) {
    event.preventDefault();
    $(document).trigger('add-search-term.graylog.search', {field: this.props.fieldName, value: this.props.fieldValue});
  }

  _getFormattedTerms() {
    const termsMarkup = [];
    this.state.messageTerms.forEach((term) => termsMarkup.push(<span key={term}
                                                                     className="message-terms">{term}</span>));

    return termsMarkup;
  }

  render() {
    const fieldActions = (this.props.disableFieldActions ? null : <div className="message-field-actions pull-right">
      <SplitButton pullRight
                   bsSize="xsmall"
                   title={<i className="fa fa-search-plus"></i>}
                   key={1}
                   onClick={this._addFieldToSearchBar}
                   id={`more-actions-dropdown-field-${this.props.fieldName}`}>
        <li className="dropdown-submenu left-submenu">
          <a href="#">Create extractor for field {this.props.fieldName}</a>
          <ul className="dropdown-menu">
            <li><a href={this._getNewExtractorRoute('regex')}>Regular expression</a>
            </li>
            <li><a href={this._getNewExtractorRoute('substring')}>Substring</a></li>
            <li><a href={this._getNewExtractorRoute('split_and_index')}>Split &amp; Index</a></li>
            <li><a href={this._getNewExtractorRoute('copy_input')}>Copy Input</a></li>
            <li><a href={this._getNewExtractorRoute('grok')}>Grok pattern</a></li>
            <li><a href={this._getNewExtractorRoute('json')}>JSON</a></li>
          </ul>
        </li>
        <MenuItem onSelect={this._loadTerms(this.props.fieldName)}>Show terms of {this.props.fieldName}</MenuItem>
      </SplitButton>
    </div>);

    const className = this.props.fieldName === 'message' || this.props.fieldName === 'full_message' ? 'message-field' : '';

    return (
      <dd className={className} key={this.props.fieldName + 'dd'}>
        {fieldActions}
        <div className="field-value">{this.props.possiblyHighlight(this.props.fieldName)}</div>
        {this._shouldShowTerms() && <Alert bsStyle="info"
                                           onDismiss={() => this.setState({messageTerms: Immutable.Map()})}>Field
          terms: {this._getFormattedTerms()}</Alert>}
      </dd>
    );
  }
}

export default MessageFieldDescription;
