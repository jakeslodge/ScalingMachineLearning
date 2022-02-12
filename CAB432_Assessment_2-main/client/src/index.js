import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import Jumbo from "./components/Jumbo";
import InfoViewer from "./components/InfoViewer";
import History from "./components/History";
import Wheel from "./components/LoadingWheel";


class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      homePage: true,
      pageData: null,
      currentIndex:0,
      historyPage:false,
      loading: false,
    };
  }

  handleCameraSelection(selection) {
    this.setState({currentIndex:selection,historyPage:false, loading: true})
    fetch("/traffic?idx=" + selection)
      .then((res) => res.json())
      .then((res) => this.setState({ pageData: res, homePage: false, loading: false }));
  }

  getCameraHistory()
  {
    //set the history page
    this.setState({historyPage:true})
  }

  render() {
    if (this.state.loading) {
      return (
        <div className="wrapper">
          <Jumbo handleClick={this.handleCameraSelection.bind(this)}></Jumbo>
          <Wheel />
        </div>
      );
    }
    else {
      if (this.state.homePage) {
        return (
          <div className="wrapper">
            <Jumbo handleClick={this.handleCameraSelection.bind(this)}></Jumbo>
          </div>
        );
      } else if(this.state.historyPage === false){
        return (
          <div className="wrapper">
            <Jumbo handleClick={this.handleCameraSelection.bind(this)}></Jumbo>
            <InfoViewer getHistory={this.getCameraHistory.bind(this)} data={this.state.pageData}></InfoViewer>
          </div>
        );
      }
      else if(this.state.historyPage === true)
      {
        return(
        <div className="wrapper">
          <Jumbo handleClick={this.handleCameraSelection.bind(this)}></Jumbo>
          <History index={this.state.currentIndex}></History>
        </div>
        )
      }
    }
  }
}

ReactDOM.render(<App />, document.getElementById("root"));
