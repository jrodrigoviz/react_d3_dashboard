import React, {Component,useEffect,useState} from 'react';
import {json,image} from 'd3-fetch';
import {AppBar,Grid,Card,CardActions, CardMedia,CardContent, Typography} from '@material-ui/core'
import {BrowserRouter, Route, Link as RouterLink} from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';

import cardPicture from '../static/images/3768.jpg'


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

  const [stories,setStories] = useState([0]);

    useEffect(()=>{
      const fetchData = async () =>{
        const responseText = await json("/api/stories");
        setStories(responseText);
      };
      fetchData();
    },[]);

    const classes = useStyles();

    return (


      <div align="center">
      <Grid container direction="row" position='relative'  spacing ={1} style = {{padding:'25px'}} justify="flex-start" >
          {stories.map((d,i)=>(
          <Grid key={d.post_id} item >
          <Card className = {classes.storyCard} style = {{minWidth:'140px',maxWidth:'200px'}}>
            <CardMedia component="img" height="140" src={"images/api/images?fileName="+(d.cardPicture===undefined?"generic-image.jpg":d.cardPicture)}/>
            <Typography className = {classes.storyCardTitle} > {d.title}</Typography>
            <CardActions>
              <RouterLink align="right" to={"/Stories/Story/"+d.post_id}  > Read</RouterLink>
            </CardActions>
          </Card>
          </Grid >
          ))}
      </Grid>
      </div>
    )
  };


export default StoryHome
