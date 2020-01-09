import React, {Component,useEffect,useState} from 'react';
import {json} from 'd3-fetch';
import {Paper, Typography, Grid} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import LineChart from '../data_viz/LineChart';
import BarChart from '../data_viz/BarChart';
import ScatterPlot from '../data_viz/ScatterPlot';


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

var data = [{key:1,series:"Series A",value:2+1},{key:2,series:"Series A",value:2},{key:10,series:"Series A",value:5},{key:1,series:"Series B",value:4},{key:5,series:"Series B",value:6},{key:1,series:"Series C",value:0},{key:5,series:"Series C",value:3},{key:2,series:"Series C",value:16}]

const QuickViz = (props) =>{

  const classes = useStyles();

  return (

    <Grid container className={classes.lineGraph}>
    <Grid item>
    <LineChart  size ={[475,400]} data={data} padding={50} speed={1000} title="Line Graph" subtitle = "subtitle " xAxisLabel = "xAxisLabel" yAxisLabel = "yAxisLabel" LegendOrientation= "horizontal"/>
    </Grid>
    <Grid item>
    <BarChart size ={[475,400]} data={data} padding={50} speed={1000} title="Bar Graph" subtitle = "subtitle " xAxisLabel = "xAxisLabel" yAxisLabel = "yAxisLabel"/>
    </Grid>
    <Grid item>
    <ScatterPlot size ={[475,400]} padding={50} title="Scatter Plot" subtitle = "with KMeans Clustering" xAxisLabel = "xAxisLabel" yAxisLabel = "yAxisLabel" />
    <div class="button-container"></div>
    </Grid>
    </Grid >

)

}

export default QuickViz
