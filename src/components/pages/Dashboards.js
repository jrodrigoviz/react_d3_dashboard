import React, {Component} from 'react';
import {json} from 'd3-fetch';
import {sum} from 'd3-array';
import BarChart from '../data_viz/BarChart';
import KPICard from '../data_viz/KPICard';
import RadarChart from '../data_viz/RadarChart';
import DataTable from '../data_viz/DataTable';
import {AppBar,Button,Grid,Card,CardMedia,CardContent, Drawer,List, ListItem, ListItemIcon,ListItemText, Typography} from '@material-ui/core'




class Dashboards extends Component{
  constructor(props){
    super(props)

    this.state = {data:[]
      ,data2:[]
      ,dataSummary:[]
      ,screenWidth:this.props.width
      ,buttonText:"Disconnect Data"

    }

    this._isMounted = false;
    this.dataConnect = true;
    this.intervalID = 0;
    this.speed =1000;

    };

    async componentDidMount(){

      this._isMounted = true;

      this.intervalID = setInterval(()=> this.getData(),this.speed);

    };

    componentWillUnmount(){

     this._isMounted = false;

     clearInterval(this.intervalID);

   };

   async getData (){

     if(this.dataConnect == true){

       const response = await json("/data",(d)=>{console.log(d)});

       if(this._isMounted){
         //clean data for graphs
         const sums = [
           ...response.data.reduce(
             (map, item) => {
               const { dim: key, value } = item;
               const prev = map.get(key);

               if(prev) {
                 prev.value += value
               } else {
                 map.set(key, Object.assign({}, item))
               }

               return map
             },
             new Map()
           ).values()
         ]

         sums.map((d)=>{
           d.key = 'dim'+ d.dim;
           delete d.dim;
         });

         sums.sort((a,b)=> a.key<b.key ? 1:-1)

        // set the state of the component to give back the result of the promise
        this.setState({data:response.data, data2:sums, dataSummary:response.dataSummary});

       };




     };

   };

   handleDataConnect(){
     if(this.dataConnect == true){
       this.dataConnect = false;
       this.setState({buttonText:"Connect Data"});
     }else {
       this.dataConnect = true;
       this.setState({buttonText:"Disconnect Data"});
     };

   };

    render(){

    return (


      <div align="center" style = {{padding:'25px'}}>
      <Button style={{float:'left'}} onClick = {()=>this.handleDataConnect()} > {this.state.buttonText} </Button>

      <Grid container direction="column" spacing ={2} justify="flex-start" >
      <Grid container item direction="row" position='relative'  spacing ={2}  justify="flex-start" alignItems ="flex-start" >
        <Grid item >
        <Card>
          <Typography> KPI </Typography>
          <div style = {{display:'inline-block'}} >
            <KPICard data = {this.state.dataSummary} size = {[200,100]} padding = {50}  speed={this.speed}/>
          </div>
          </Card>
        </Grid >
      <Grid container item direction="row" spacing ={2} justify="flex-start" >
        <Grid item>
          <Card>
            <Typography style={{marginLeft:'25px',marginTop:'10px',textAlign:'left'}}> Chart1 </Typography>
            <div style = {{display:'inline-block'}} >
              <BarChart data = {this.state.data} size = {[Math.max(this.state.screenWidth-1024,1024)/2 -25,300]} padding = {50}  speed={this.speed}/>
            </div>
        </Card>
        </Grid >
      </Grid>
      <Grid container item direction="row" spacing ={2} justify="flex-start" >
        <Grid item>
          <Card>
          <Typography style={{marginLeft:'25px',marginTop:'10px',textAlign:'left'}}> Chart3 </Typography>
        <div style = {{display:'inline-block'}}  >
          <RadarChart data = {this.state.data2} r={5} size = {[Math.min(this.state.screenWidth-1024,300),300]} padding = {50} shapeFill = '#adbce6' speed={this.speed}/>
        </div >
          </Card>
        </Grid>
        <Grid item>
          <Card>
          <Typography style={{marginLeft:'25px',marginTop:'10px',textAlign:'left'}}> Last 10 Sales </Typography>
        <div style = {{display:'inline-block', textAlign:"center"}}   >
          <DataTable data = {this.state.data}  size = {[Math.max(this.state.screenWidth-1024,1024)/2 ,300]} speed={this.speed}/>
        </div >
          </Card>
        </Grid>

      </Grid>
      </Grid>
      </Grid>
      </div>
    )
  }


  }

export default Dashboards
