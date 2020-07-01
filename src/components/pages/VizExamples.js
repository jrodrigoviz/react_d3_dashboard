import React, {Component,useEffect,useState} from 'react';
import {json} from 'd3-fetch';
import {Paper, Typography, Grid} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import LineChart from '../data_viz/LineChart';
import BarChart from '../data_viz/BarChart';
import ScatterPlot from '../data_viz/ScatterPlot';
import ClusteredBarChart from '../data_viz/ClusteredBarChart';
import SmallCircleMultiple from '../data_viz/SmallCircleMultiple';


//debounce the resize events to minimize resizing times. Once per 0.1s
function debounce(fn, ms) {
  let timer
  return _ => {
    clearTimeout(timer)
    timer = setTimeout(_ => {
      timer = null
      fn.apply(this, arguments)
    }, ms)
  };
}


const useStyles = makeStyles(theme => ({

  lineChart:{
    "& .line-chart-title":{
    textAlign:'left',
    fontSize:20
    },
    "& .line-chart-subtitle":{
    textAlign:'',
    fontSize:15
    }
  }


}));


function generateData(){
  var dataPoints = Math.floor(Math.random() * (100 - 50 + 1) ) + 50;

  var seriesNameArr = ["A","B","C","D","E"];

  var dataArr =[];

  for(var i=0; i<dataPoints; i++){
     var keyName = Math.floor(Math.random()*6);
     var seriesInd = Math.floor(Math.random()*5);
     var seriesName =  seriesNameArr[seriesInd];
     var keyValue = Math.floor(Math.random()*10);
     var element = {key:keyName,series:seriesName,value:keyValue}

     dataArr.push(element);

  };

  return dataArr;

};

const data = generateData();

const VizExamples = (props) =>{

   const [dimensions, setDimensions] = useState({width:window.innerWidth <= 400 ? 350 : window.innerWidth <= 900 ? 375: Math.min(1024-2*50,window.innerWidth),height:450});

    useEffect(()=>{
      var width = window.innerWidth;

      const debouncedHandleResize  = debounce (function handleResize (){
        if(window.innerWidth != width ){

          setDimensions({
            height:350,
            width: (window.innerWidth <= 400 ? 350 : window.innerWidth <= 900 ? 375: Math.min(1024-2*50,window.innerWidth))
          });

      }}, 100);

      window.addEventListener("resize",debouncedHandleResize)

      return _ => {window.removeEventListener('resize', debouncedHandleResize)}

    });

  const classes = useStyles();

  return (

    <Grid container className={classes.lineGraph} >
      <Grid item>
        <SmallCircleMultiple size ={[1000,500]} padding ={50}> </SmallCircleMultiple>
      </Grid>
    {/*
    <Grid item>
    <LineChart  size ={[dimensions.width,dimensions.height]} data={data} padding={50} speed={1000} title="Line Graph" subtitle = "subtitle " xAxisLabel = "xAxisLabel" yAxisLabel = "yAxisLabel" LegendOrientation= "horizontal"/>
    </Grid>
    <Grid item>
    <BarChart size ={[dimensions.width,dimensions.height]} data={data} padding={50} speed={1000} title="Bar Graph" subtitle = "subtitle " xAxisLabel = "xAxisLabel" yAxisLabel = "yAxisLabel"/>
    </Grid>
    <Grid item>
    <ClusteredBarChart size ={[dimensions.width,dimensions.height]} data={data} padding={50} speed={1000} title="Clustered Bar Graph" subtitle = "subtitle " xAxisLabel = "xAxisLabel" yAxisLabel = "yAxisLabel"/>
    </Grid>
    */
    }
    </Grid >

)

}

export default VizExamples
