import React from "react";
import fetch from "node-fetch";

const endpoints = {};
export default class TabooMain extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentWord: '',
      tutor: '',
      guesser: ''
    };

    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event) {
    const name = event.target.name;
    this.setState({
      [name]: value
    });
  }

  render() {
    const {
      currentWord,
      tutor,
      guesser
    } = this.state;

    return (
      <>
        <nav>
          <a href="#0" name='currentWord' onClick={this.handleChange}>START</a>
          <a href="#0" name='currentWord' onClick={this.handleChange}>NEW WORD</a>
        </nav>
        <div id="Video Container">
          <p>Here is a video stream</p>
        </div>
      </>
    );
  };
};
