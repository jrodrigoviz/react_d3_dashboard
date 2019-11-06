import React, {Component} from 'react';
import {Paper, Typography} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

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

const loremFill = "    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."



const Stories = () =>{
  const classes = useStyles();

  return (
    <Paper elevation = '0' className = {classes.story} >
    <header >
      <h2 className = {classes.storySubHeader}> This is a Title </h2>
      <h3 className = {classes.storySubHeader}> Stuff that describes the Story | Date </h3>
      <hr className = {classes.storyHr}/>
    </header>

    <p>

    <div >
      <p>{loremFill}</p>
    </div>
    </p>

    <p>
      {loremFill}
    </p>
    </Paper>

  )


}

export default Stories
