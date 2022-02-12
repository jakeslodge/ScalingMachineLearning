import React from "react";
import { Button } from "react-bootstrap";
import "./InfoViewer.css";
import Wheel from "./LoadingWheel";


class History extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selection: 0,
      loading: true,
      pageData: null,
      arrayLenth: 0,
      img: null,
      nextDisabled: true,
      prevDisabled: false
    };
    this.plusIndex = this.plusIndex.bind(this);
    this.minusIndex = this.minusIndex.bind(this);
  }

  plusIndex() {
    if (this.state.selection < this.state.arrayLenth - 1) {
        let sel = this.state.selection + 1
        this.setState({ selection: sel, nextDisabled: false, prevDisabled: false })
        if (sel === this.state.arrayLenth - 1) {
            this.setState({ nextDisabled: true })
        } 
    } 
    else {
        this.setState({ nextDisabled: true })
    }
  }

  minusIndex() {
    if (this.state.selection > 0) {
        let sel = this.state.selection - 1
        this.setState({ selection: sel, prevDisabled: false, nextDisabled: false})
        if (sel === 0) {
            this.setState({ prevDisabled: true })
        } 
    } 
    else {
        this.setState({ prevDisabled: true })
    }
  }

  componentDidMount() {
    fetch("/history?idx=" + this.props.index)
      .then((res) => res.json())
      .then((res) => this.setState({ pageData: res }));
    //set the array boundries
  }
  componentDidUpdate(prevProps, prevState) {
    if (this.state.pageData !== prevState.pageData) {
      this.setState({ loading: false });
      this.setState({ arrayLenth: this.state.pageData.dates.length });
      this.setState({ selection: this.state.pageData.dates.length - 1 });
    }
  }

  render() {
    if (this.state.pageData !== null) {
        let temp = this.state.pageData.images[this.state.selection].substring(2);
        let test = "data:image/jpg;base64," + temp.substring(0, temp.length - 1);
        return (
            <div>
                <div className="buttons">
                    <Button variant="primary" onClick={this.minusIndex} disabled={this.state.prevDisabled}>
                        Previous
                    </Button>
                    <Button variant="primary" onClick={this.plusIndex} disabled={this.state.nextDisabled}>
                        Next
                    </Button>
                </div>
                <p>{this.state.pageData.dates[this.state.selection]} - {this.state.pageData.times[this.state.selection]}</p>
                <div className="infowrapper">
                    <img src={test} alt="traffic cam" />
                    <div className="stats">
                    <p>
                        Cars {this.state.pageData.labels[this.state.selection].filter((x) => x === "car").length}
                    </p>
                    <p>
                        Trucks {this.state.pageData.labels[this.state.selection].filter((x) => x === "truck").length}
                    </p>
                    <p>Buses {this.state.pageData.labels[this.state.selection].filter((x) => x === "bus").length}</p>
                    <p>
                        People {this.state.pageData.labels[this.state.selection].filter((x) => x === "person").length}
                    </p>
                    <p>
                        Traffic Lights {this.state.pageData.labels[this.state.selection].filter((x) => x === "traffic light").length}
                    </p>
                    </div>
                </div>
            </div>
        );
    } else {
      return (
        <Wheel />
      );
    }
  }
}
export default History;
