import React, {Component} from 'react';
import {Paper, Typography} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(theme => ({

  about:{
    textAlign:'left',
    textJustify:'left',

  },
  aboutSubHeader:{
    marginTop:'2px',
    marginBottom:'2px'
  },
  aboutHr:{
    backgroundColor:"#d3d3d3 !important" ,
    color:"#d3d3d3 !important" ,
    height:"1px !important",
    border:"1px #d5d5d5 !important"

  },

  aboutContent:{

  }
  }));

const subheader = " If a picture with worth a thousand words then an effective data viz is worth a million";

const aboutContent = "This site is created to showcase the power of good data visualizations in telling stories. It is a another medium of communication that adds a layer of context and visual understanding that words cannot.";

const aboutContent2 = "The visaulizations created here use the d3 javascript library, a flexible and fully customizable data visualization tool"


const About = () =>{
  const classes = useStyles();

  return (
    <Paper elevation = '0' className = {classes.about} >
    <header >
      <h2 className = {classes.aboutSubHeader}> About </h2>
      <hr className = {classes.aboutHr}/>
    </header>

    <p><i>{subheader}</i></p>

    <p>{aboutContent}</p>

    <p>{aboutContent2}</p>


    </Paper>

  )


}

export default About
