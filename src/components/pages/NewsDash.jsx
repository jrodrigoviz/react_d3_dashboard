import React,{useEffect,useState} from 'react';
import {makeStyles} from '@material-ui/core/styles';
import {json} from 'd3-fetch';
import {Grid,Typography} from '@material-ui/core';
import BarChart from '../data_viz/BarChart';
import SquareChart from '../data_viz/SquareChart.jsx';

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

    root:{
        "& .bar-chart-title":{
            textAlign:'left',
            fontSize:14
            },
        "& .square-chart-title":{
            textAlign:'left',
            fontSize:14
            },
        "& .square-chart-tooltip":{
            textAlign:'left',
            fontSize:10,
            overflowWrap:'break-word'
            }
    }
  
  }));

const Dash = (props) =>{

    const [data,setData] = useState({dataMax:0,desCount:[{series:0,value:0}],perCount:[{series:0,value:0}],orgCount:[{series:0,value:0}], all:[]});
    const [windowData, setWindowData] = useState({width:Math.min(window.innerWidth*0.8,1024*0.8),height:600,lastRefresh:''})
    const classes = useStyles();

    useEffect(()=>{
        var width = window.innerWidth;
  
        const debouncedHandleResize  = debounce (function handleResize (){
          if(window.innerWidth != width ){
  
            setWindowData({
              height:600,
              width: Math.min(window.innerWidth*0.8,1024*0.8),
              lastRefresh:windowData.lastRefresh
            });
  
        }}, 100);
  
        window.addEventListener("resize",debouncedHandleResize)
  
        return _ => {window.removeEventListener('resize', debouncedHandleResize)}
  
      });
  

    useEffect(()=>{

        const fetchData = async () => {

            const response = await json("/api/nyt/ts");
            response.dataMax = response.desCount[0].value
            setData(response);
            
            }

        fetchData();
        setWindowData((prevState) => ({...prevState,lastRefresh:new Date().toLocaleTimeString()}))
        
        const interval = setInterval(()=>{
            fetchData()
            setWindowData((prevState) => ({...prevState,lastRefresh:new Date().toLocaleTimeString()}))
        },30000);

        return () => clearInterval(interval)

    },[]);

    return (
        <div className={classes.root}>
        <Typography style={{textAlign:"left", margin:"1em"}} component="h5" variant = "h5"> NYT Dashboard </Typography>
        <Typography style={{textAlign:"left", margin:"1em"}} component="p" variant = "body"> This real-time visual summarizes the top stories on the front page of the New York Times. </Typography>
        <Typography id = 'last-refresh-timer' style={{textAlign:"left", margin:"1em"}} component="p" variant = "body"> Last Refreshed at: {windowData.lastRefresh}  </Typography>

        <Grid container direction = 'row' justify= 'space-evenly' wrap='nowrap'>
            <Grid item>
                <SquareChart data={data.all} size={[windowData.width/1.9,600]} padding={30} title='Last 25 Articles'></SquareChart>
            </Grid>
            <Grid item>
                <Grid container direction='column'>
                <BarChart data={data.desCount.filter((d,i)=>i<=5)} size={[windowData.width/1.9,175]} padding={35} speed={500} xAdjust ={0} dataMax={data.dataMax} xAxisShow={false} title={"Top Ideas"} yAxisLabelLocation={'right'}></BarChart>
                <BarChart data={data.orgCount.filter((d,i)=>i<=5)} size={[windowData.width/1.9,175]} padding={35} speed={500} xAdjust ={0} dataMax={data.dataMax} xAxisShow={false} title={"Top Organizations"} yAxisLabelLocation={'right'}></BarChart>
                <BarChart data={data.perCount.filter((d,i)=>i<=5)} size={[windowData.width/1.9,175]} padding={35} speed={500} xAdjust ={0} dataMax={data.dataMax} xAxisShow={false} title={"Top People"} yAxisLabelLocation={'right'}></BarChart>
                </Grid>
            </Grid>
        </Grid>
        </div>
    
    
    );    
};

export default Dash