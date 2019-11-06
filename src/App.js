import React, {Component} from 'react';
import './App.css';
import {BrowserRouter, Route} from 'react-router-dom';
import Story from './components/pages/Story';
import Stories from './components/pages/Stories';
import About from './components/pages/About';
import Dashboards from './components/pages/Dashboards';
import ToolbarNav from './components/components/Toolbar';


class App extends Component {
  constructor(props){
    super(props)
    this.onResize = this.onResize.bind(this);
    this.state = {screenWidth:window.innerWidth, screenHeight: window.innerHeight,data:[], appBar:200};

  };

  componentDidMount(){
    // async keyword waits until the promise is completed

    window.addEventListener('resize', this.onResize);
    this.onResize()
  };

  onResize(){
    //console.log(window.innerHeight);
    this.setState({screenWidth: window.innerWidth,
      screenHeight: window.innerHeight})
  };


  render() {


    return (
      <div className="App" >
      <BrowserRouter>
      <div className = "App-body" >
        <header>
        <h1 className="App-header" > Data Dashboards </h1>
        <hr/>
          <ToolbarNav/>
        </header>

          <Route exact path="/Home" component ={Stories}/>
          <Route path="/Stories/Story" component ={Story}/>
          <Route path="/Dashboards" component ={() => <Dashboards width = {this.state.screenWidth}/> }/>
          <Route path="/About" component ={About}/>

      </div>
      </BrowserRouter>
      </div>
      )
  }
}

export default App;
