import React from "react";
import {
  Dropdown,
  DropdownButton,
  Jumbotron,
  Form
} from "react-bootstrap";
import "./Jumbo.css";
import Wheel from "./LoadingWheel";

class Jumbo extends React.Component {
  constructor(props) {
    super(props);

    this.state = { cameras: null, gotCameras: false, formvalue: "" };
    this.mySelectHandler = this.mySelectHandler.bind(this);
  }

  componentDidMount() {
    // this.setState({cameras:{"locations":[ "Archerfield - Ipswich Mwy - North", "Bundall - Bundall Rd & Ashmore Rd - South", "Toowoomba - Down the Range - East"]}})
    fetch("/locations")
      .then((res) => res.json())
      .then((res) => this.setState({ cameras: res }))
      .then(this.setState({ gotCameras: true }))
      .catch(() => null);
  }

  mySelectHandler(i) {
    this.props.handleClick(i);
  }

  render() {
    if (this.state.cameras) {
      return (
        <div className="jumboWrapper">
          <Jumbotron fluid>
          <h1>Traffic Viewer</h1>
              <p>Select a camera from the list to view traffic in that area.</p>
            <div className="jumboContainer">


              <DropdownButton
                id="dropdown-basic-button"
                title="Camera Names"
                key={1}
              >
                {this.state.cameras.locations.filter((element) => {
                  if (this.state.val !== undefined) {
                    return element.toLowerCase().startsWith(this.state.val.toLowerCase())
                  }
                  else {
                    return element.startsWith("")
                  }
                  
                }).map((element, i) => {
                  return (
                    <Dropdown.Item key={i} onSelect={() => this.mySelectHandler(i)}>
                      {element}
                    </Dropdown.Item>
                  );
                })}
              </DropdownButton>
              <Form.Control type="text" placeholder="filter" value={this.state.val} onChange={e => this.setState({ val: e.target.value })}/>
            </div>
          </Jumbotron>
        </div>
      );
    } else {
      return (
        <Wheel />
      );
    }
  }
}
export default Jumbo;
