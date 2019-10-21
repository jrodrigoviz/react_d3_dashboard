import React, {Component} from 'react';
import logo from './logo.svg';
import './App.css';
import {csv} from 'd3-fetch';
import data from './data.csv'
import BarChart from './BarChart';
import Button from '@material-ui/core/Button'
import {AppBar,Grid,Card,CardMedia,CardContent, Drawer,List, ListItem, ListItemIcon,ListItemText, Typography} from '@material-ui/core'
import FreeBreakfastIcon from '@material-ui/icons/FreeBreakfast';




class App extends Component {
  constructor(props){
    super(props)
    this.onResize = this.onResize.bind(this);
    this.state = {screenWidth:window.innerWidth, screenHeight: window.innerHeight,data:[], appBar:200};

  };

  async componentDidMount(){
    // async keyword waits until the promise is completed

    const self = this;

    //parse out the integer values of the csv
    const response = await csv(data,(d)=>{return parseInt(d.val)});

    // set the state of the component to give back the resultof the promise
    this.setState({data:response});

    window.addEventListener('resize', this.onResize, false);
    this.onResize()
  };

  onResize(){
    //console.log(window.innerHeight);
    this.setState({screenWidth: window.innerWidth,
      screenHeight: window.innerHeight})
  };

  render() {

    return (
      <div className = "App">
        <AppBar position='relative' style={{marginLeft:this.state.appBar, width:this.state.screenWidth}} >
          <Typography variant="h3" align="left" style={{padding:'10px'}}> React x D3 Dashboard </Typography>
        </AppBar>

        <Drawer
          anchor = "left"
          variant = "permanent">
          <List>
            <ListItem>
              < FreeBreakfastIcon/>
              < ListItemText> DATA x COFFEE </ListItemText>
            </ListItem>
            {['Coffees', 'Dashboards', 'About'].map((text, index) => (
              <ListItem button key={text}>
                <ListItemText primary={text} />
              </ListItem>
            ))}
          </List>

        </Drawer>
        <div style={{marginLeft:this.state.appBar}}>
        <Grid container direction="row" position='relative'  spacing ={1} style = {{padding:'25px'}} justify="flex-start" >
            <Grid item >
            <Card>
              <Typography> Chart1 </Typography>
              <div style = {{display:'inline-block'}} >
                <BarChart data = {this.state.data} size = {[this.state.screenWidth/4 ,this.state.screenHeight/3]} padding = {50} />
              </div>
              </Card>
            </Grid >
          <Grid item >
            <Card>
            <Typography> Chart2 </Typography>
            <div style = {{display:'inline-block'}}  >
              <BarChart data = {this.state.data} size = {[this.state.screenWidth/4 ,this.state.screenHeight/3]} padding = {50} />
            </div >
            </Card>
          </Grid>
          <Grid item>
            <Card>
            <Typography> Chart3 </Typography>
          <div style = {{display:'inline-block'}}  >
          <BarChart data = {this.state.data} size = {[this.state.screenWidth/4 ,this.state.screenHeight/3]} padding = {50} />
          </div >
            </Card>
          </Grid>
        </Grid>
      </div>
      </div>
      )
  }
}

export default App;
