import React, {Component,useEffect,useState} from 'react';
import {json} from 'd3-fetch';
import {Paper, Typography, Grid} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import LineGraph from '../data_viz/LineGraph';

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
  storyContent:{

  }
  }));

var data = [{key:"a",value:2+1},{key:"b",value:2+1}]


const QuickViz = (props) =>{

  return (
    <LineGraph size ={[500,500]} data={data} padding={50}/>
  )


}

export default QuickViz
