import React, {Component,useEffect,useState} from 'react';
import {json} from 'd3-fetch';
import {Paper, Typography, Grid} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import BarChart from '../data_viz/BarChart';
import LineChart from '../data_viz/LineChart';
import DataTable from '../data_viz/DataTable';

const useStyles = makeStyles(theme => ({

  story:{
    textAlign:'left',
    textJustify:'left',

  },
  storySubHeader:{
    marginTop:'2px',
    marginBottom:'2px'
  },
  storyHr:{
    backgroundColor:"#d3d3d3 !important" ,
    color:"#d3d3d3 !important" ,
    height:"1px !important",
    border:"1px #d5d5d5 !important"

  },

  dataTable:{
    color: "red"
  },

  dataTable:{
    "& caption":{
    textAlign:'left'
    }
  },

  lineChart:{
    "& .line-chart-title":{
    textAlign:'left',
    fontSize:20
    },
    "& .line-chart-subtitle":{
    textAlign:'',
    fontSize:15
    },
    "& .y-axis-label":{
    fontSize:12
    }

  },

  storyContent:{

  }
  }));

const Stories = (props) =>{

  const [stories,setStories] = useState({content:'',title:'',storyContent:'', data1:[{}],contentMap:[{type:"text"}]});

    useEffect(()=>{
      const fetchData = async () =>{
        const response = await json("/api/story?post_id="+props.match.params.postID);
        setStories(response[0]);
      };
      fetchData();
    },[]);

  const classes = useStyles();

  // builds the content of the story based on the mapping of contentMap
  const contentBuilder = (d) =>{
    switch(d.type){
      case "rawText":
        return <div><p><div dangerouslySetInnerHTML={{
          __html: d.content
        }}></div></p></div>
        break;
      case "text":
          return <p>{d.content}</p>
          break;
      case "viz":
          return <Grid container> {d.content.map((d,i)=>{
              switch(d.vizType){
                case "barChart":
                  return <Grid item><BarChart data ={d.data} size = {d.size} padding = {50} speed={1000} title={d.title} subtitle={d.subtitle}/></Grid>
                case "lineChart":
                  return <Grid className = {classes.lineChart} item><LineChart data ={d.data} size = {d.size} padding = {50} speed={1000} title={d.title} subtitle={d.subtitle} xAxisLabel= {d.xAxisLabel} yAxisLabel= {d.yAxisLabel}  legendOrientation={d.legendOrientation}/></Grid>
                case "dataTable":
                  return <Grid item><DataTable className = {classes.dataTable} title={"Data Table "} data ={d.data} size = {[100,100]} padding = {50}/></Grid>
                default:
                  return ""
              }
          })}</Grid>
        break;
      default:
        return ""
  }};


  return (
    <Paper elevation = {0} className = {classes.story} >
    <header >
      <h2 className = {classes.storySubHeader}> {stories.title} </h2>
      <h3 className = {classes.storySubHeader}> {stories.content} | {new Date(stories.date).toDateString()} </h3>
      <hr className = {classes.storyHr}/>
    </header>

    {
      stories.contentMap.map((d,i)=>(contentBuilder(d)))
    }

    </Paper>

  )


}

export default Stories
