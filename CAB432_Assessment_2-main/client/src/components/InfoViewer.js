import React from "react";
import "./InfoViewer.css";
import { Container,Button} from "react-bootstrap";


class InfoViewer extends React.Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  componentWillReceiveProps(nextProps) {
    let temp = nextProps.data.image.substring(2);
    let test = "data:image/jpg;base64," + temp.substring(0, temp.length - 1);
    this.setState({ img: test });
  }

  componentDidMount() {
    let temp = this.props.data.image.substring(2);
    let test = "data:image/jpg;base64," + temp.substring(0, temp.length - 1);
    this.setState({ img: test });
  }

  render() {
    return (
      <div>
        <Container>
          <div className="carHead">
            <h1>Car Data</h1>
            <Button variant="primary" onClick={()=>{this.props.getHistory()}}>Get History</Button>
          </div>
          <p>{this.props.data.date} - {this.props.data.time}</p>
          <div className="infowrapper">
            <img src={this.state.img} alt="traffic cam" />
            <div className="stats">
              <p>
                Cars {this.props.data.cars.filter((x) => x === "car").length}
              </p>
              <p>
                Trucks {this.props.data.cars.filter((x) => x === "truck").length}
              </p>
              <p>Buses {this.props.data.cars.filter((x) => x === "bus").length}</p>
              <p>
                People {this.props.data.cars.filter((x) => x === "person").length}
              </p>
              <p>
                Traffic Lights {this.props.data.cars.filter((x) => x === "traffic light").length}
              </p>
            </div>
          </div>
        </Container>
      </div>
    );
  }
}

export default InfoViewer;
