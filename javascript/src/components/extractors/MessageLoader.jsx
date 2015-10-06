import React, {Component, PropTypes} from 'react';

import MessagesStore from 'stores/messages/MessagesStore';

class MessageLoader extends Component {
  static propTypes = {
    hidden: PropTypes.bool,
    hideText: PropTypes.bool,
    onMessageLoaded: PropTypes.func,
  };

  static defaultProps = {
    hidden: true,
  };

  constructor(props) {
    super(props);

    this.toggleMessageForm = this.toggleMessageForm.bind(this);
    this._focusMessageLoaderForm = this._focusMessageLoaderForm.bind(this);
    this.loadMessage = this.loadMessage.bind(this);
    this.submit = this.submit.bind(this);

    this.state = {
      hidden: this.props.hidden,
    };
  }

  toggleMessageForm() {
    this.setState({hidden: !this.state.hidden}, this._focusMessageLoaderForm);
  }

  _focusMessageLoaderForm() {
    if (!this.state.hidden) {
      this.refs.messageId.getDOMNode().focus();
    }
  }

  loadMessage(event) {
    const messageId = React.findDOMNode(this.refs.messageId).value;
    const index = React.findDOMNode(this.refs.index).value;
    if (messageId === '' || index === '') {
      return;
    }
    const promise = MessagesStore.loadMessage(index, messageId);
    promise.done((data) => this.props.onMessageLoaded(data));

    event.preventDefault();
  }

  submit(messageId, index) {
    React.findDOMNode(this.refs.messageId).value = messageId;
    React.findDOMNode(this.refs.index).value = index;
    React.findDOMNode(this.refs.submitButton).click();
  }

  render() {
    let explanatoryText;
    if (!this.props.hideText) {
      explanatoryText = (
        <p>
          Wrong example? You can{' '}
          <button className="btn btn-link btn-small btn-text" onClick={this.toggleMessageForm}>load another message</button>.
        </p>
      );
    }
    const loadMessageForm = (
      <div>
        <form className="form-inline message-loader-form" onSubmit={this.loadMessage}>
          <input type="text" ref="messageId" className="form-control" placeholder="Message ID" required/>
          <input type="text" ref="index" className="form-control" placeholder="Index" required/>
          <button ref="submitButton" type="submit" className="btn btn-info">
            Load message
          </button>
        </form>
      </div>
    );
    return (
      <div className="message-loader">
        {explanatoryText}
        {this.state.hidden ? null : loadMessageForm}
      </div>
    );
  }
}

export default MessageLoader;
