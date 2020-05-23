import React, {Component} from 'react';
import {Link as RouterLink} from 'react-router-dom';
import  {Toolbar,Typography} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';


const sections = ['Home', 'VizExamples','Interactive','Datasets', 'About'];

const useStyles = makeStyles(theme => ({
  toolbarNav: {
    marginTop:'2px',
    marginBottom:'20px',
    backgroundColor: '#0000',
    minHeight:'30px',
    justifyContent: 'space-around',
  },
  toolbarNavLink:{
    textDecoration:'none',
    color:'#000',
    '&:visited': {
      color:'#000'
    }

  }
  }));



const ToolbarNav = () =>{
  const classes = useStyles();

  return <Toolbar component="nav" variant="dense" className = {classes.toolbarNav}>
    {sections.map((d,i) => (
        <RouterLink key={d} className = {classes.toolbarNavLink} to={"/"+ (d=='Home'?'':d)} >{d}</RouterLink>
      ))
    }
  </Toolbar>

}

export default ToolbarNav;
