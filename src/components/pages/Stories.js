import React, {Component} from 'react';
import {AppBar,Grid,Card,CardActions, CardMedia,CardContent, Typography} from '@material-ui/core'
import {BrowserRouter, Route, Link as RouterLink} from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';

import coffeePicture from '../static/images/generic-image.jpg'



const stories = ['Story1', 'Story2', 'Story3','Story4', 'Story5', 'Story6','Story7', 'Story8', 'Story9'];


const useStyles = makeStyles(theme => ({

  storyCard:{
    textAlign:'left',
    textJustify:'left',
    padding:'2px',
    backgroundColor:'#F5F5F5',
    '& a':{
      textDecoration:'none',
      fontWeight:'700',
      color:'#90caf9'
    }

  },



  storyCardTitle:{
    fontSize:'20px',
    marginLeft:'5px'

  },
  storyCardSubTitle:{
    fontSize:'15px',
    marginLeft:'5px'
  }


  }));

const StoryHome = () => {

    const classes = useStyles();

    return (


      <div align="center">
      <Grid container direction="row" position='relative'  spacing ={1} style = {{padding:'25px'}} justify="flex-start" >
          {stories.map((d,i)=>(

          <Grid key={d} item >
          <Card className = {classes.storyCard} style = {{minWidth:'200px'}}>
            <CardMedia component="img" height="140" image={coffeePicture}/>
            <Typography className = {classes.storyCardTitle} > Story Title</Typography>
            <CardActions>
              <RouterLink align="right" to="/Stories/Story"> Read</RouterLink>
            </CardActions>
          </Card>
          </Grid >
          ))}
      </Grid>
      </div>
    )
  };


export default StoryHome
