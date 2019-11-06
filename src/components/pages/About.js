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

const aboutContent = "This site is create to showcase the power of good data visualizations in telling a stories. It is a another medium of communication that adds more context to the message ";

const aboutContent2 = "The visaulizations generated here use the d3 javascript library, a very flexible and powerful toolset for data visualizations"


const About = () =>{
  const classes = useStyles();

  return (
    <Paper elevation = '0' className = {classes.about} >
    <header >
      <h2 className = {classes.aboutSubHeader}> About </h2>
      <hr className = {classes.aboutHr}/>
    </header>

    <p><i>{}</i></p>

    <p>{}</p>

    <p>{}</p>
    </Paper>

  )


}

export default About
