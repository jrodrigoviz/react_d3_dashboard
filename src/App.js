import React, {Component} from 'react';
import './App.css';
import {BrowserRouter, Route} from 'react-router-dom';
import Story from './components/pages/Story';
import Stories from './components/pages/Stories';
import About from './components/pages/About';
import Dashboards from './components/pages/Dashboards';
import VizExamples from './components/pages/VizExamples';
import Interactive from './components/pages/Interactive';
import CoffeeWorld from './components/pages/CoffeeWorld';
import ToolbarNav from './components/components/Toolbar';
import CoffeeWheel from './components/pages/CoffeeWheel';
import Chooser from './components/pages/Chooser';

class App extends Component {
  constructor(props){
    super(props)
    this.state = {screenWidth:window.innerWidth, screenHeight: window.innerHeight,data:[], appBar:200};

  };

  componentDidMount(){
    // async keyword waits until the promise is completed

    //window.addEventListener('resize', this.onResize);
    //this.onResize()
    
  };

  render() {


    return (
      <div className="App" >
      <BrowserRouter>
      <div className = "App-body" >
        <header>
        <h1 className="App-header" style= {{fontWeight:300}}> Matchstick Data </h1>
        <hr/>
          <ToolbarNav/>
        </header>

          <Route exact path="/" component = {Stories} />
          <Route path="/Stories/Story/:postID" component = {Story} />
          <Route path="/VizExamples" component = {VizExamples} />
          <Route path="/Datasets/world-of-coffee" component = {CoffeeWorld} />
          <Route path="/Datasets/coffee-wheel" component = {CoffeeWheel} />
          <Route path="/Chooser" component = {Chooser} />
          <Route path="/CoffeeWheel" component = {CoffeeWheel} />
          <Route path="/Interactive" component = {Interactive} />
          <Route path="/About" component = {About} />

      </div>
      </BrowserRouter>
      </div>
      )
  }
}

export default App;
