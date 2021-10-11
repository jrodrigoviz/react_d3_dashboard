import React,{useEffect,useState} from 'react';
import {makeStyles} from '@material-ui/core/styles';
import {json} from 'd3-fetch';
import {Grid,Typography} from '@material-ui/core';
import BarChart from '../data_viz/BarChart';
import LineChart from '../data_viz/LineChart';
import SquareChart from '../data_viz/SquareChart.jsx';
import DataTable from '../data_viz/DataTable';

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
        "& .line-chart-title":{
            textAlign:'left',
            fontSize:14
            }, 
        "& .square-chart-tooltip-div":{
            textAlign:'left',
            fontSize:10,
            padding:3,
            overflowWrap:'break-word',
            background:'#f7f7f7',
            border:'1px solid #ababab'
            },
        "& .square-chart-tooltip-div-article":{
            fontSize:12,
            fontWeight:600
            },
        "& .data-table":{
            textAlign:'right',
            borderCollapse:'collapse',
            padding:10,
            overflowY:'hidden',
            display:'block',
            margin:0,
            width:'100%',
            tableLayout:'fixed'
            },
        "& .tblRow > td":{
            padding:5,
            width:'100%',
            fontSize:10,
            whiteSpace: 'nowrap'
            },
        "& .headerRow ":{
            fontSize:12,
            },
        "& .headerRow > th":{
            position: 'sticky',
            top:-10,
            paddingTop:10,
            background:'#fff',
            boxShadow: 'inset 0px -1px #000'
            },
        "& .data-table .col-key ":{
            textAlign:'left',
            paddingLeft:'10px',
            paddingRight:'10px',
            overflow:'hidden',
            maxWidth:'100px'
            },
        "& .tblRow-selected > td":{
            backgroundColor:"#ffae34",
            fontSize:10,
            padding:'5px',
            whiteSpace: 'nowrap'
            }
    }
  
  }));

const Dash = (props) =>{

    const [data,setData] = useState({dataMax:0,squareTitle:'a',desFinal:[{series:0,value:0}],perFinal:[{series:0,value:0}],orgFinal:[{series:0,value:0}], all:[{key:""}], timeline:[{time:["1"]}]});
    const [windowData, setWindowData] = useState({width:Math.min(window.innerWidth,1024),height:600,lastRefresh:''})
    const [squareData,setSquareData]=useState({data:[],filterKey:"",initial:0});
    const classes = useStyles();
   
    useEffect(()=>{
        var width = window.innerWidth;
  
        const debouncedHandleResize  = debounce (function handleResize (){
          if(window.innerWidth != width ){
  
            setWindowData({
              height:600,
              width: Math.min(window.innerWidth,1024),
              lastRefresh:windowData.lastRefresh
            });
  
        }}, 100);
  
        window.addEventListener("resize",debouncedHandleResize)
  
        return _ => {window.removeEventListener('resize', debouncedHandleResize)}
  
      });
  

    useEffect(()=>{

        const fetchData = async () => {

            const response = await json("/api/nyt/ts");
            response.dataMax = response.desFinal[0].count;
            response.timeline = [response.raw[0].timeline[0]];
            response.timeline[0].time.forEach(d=> d.key = new Date(d.key));
            setData(response);
            if(squareData.initial == 0){
              squareData.initial = 1;
              setSquareData({data:response.raw[0].all});
            }
        }
        
        fetchData();

        setWindowData((prevState) => ({...prevState,lastRefresh:new Date().toLocaleTimeString()}))
        
        const interval = setInterval(()=>{
            fetchData()
            setWindowData((prevState) => ({...prevState,lastRefresh:new Date().toLocaleTimeString()}))
        },30000);

        return () => clearInterval(interval)  
      
    },[]);

    function dataTableFilterCallback(d){

      if(d.key == squareData.filterKey){
        setSquareData({data:data.raw[0].all,filterKey:""})
      } else {
      const filteredData = data.raw[0].all.filter((e)=>{
        var a=0;
        var b=0;
        var c=0;
        if(e.des_facet !== null){
          a = e.des_facet.indexOf(d.key)>=0
        };
        if(e.org_facet !== null){
          b = e.org_facet.indexOf(d.key)>=0
        };
        if(e.per_facet !== null){
          c = e.per_facet.indexOf(d.key)>=0
        };
        return a+b+c
      })



      setSquareData({data:filteredData,filterKey:d.key})

    }
    } 


    return (
      <div className={classes.root}>
        <Typography style={{textAlign:"left", margin:"1em"}} component="h5" variant = "h5"> NYT Dashboard </Typography>
        <Typography style={{textAlign:"left", margin:"1em"}} component="p" variant = "body"> This real-time visual summarizes the top stories on the front page of the New York Times. </Typography>
        <Typography id = 'last-refresh-timer' style={{textAlign:"left", margin:"1em"}} component="p" variant = "body"> Last Refreshed at: {windowData.lastRefresh}  </Typography>
        <Grid container direction = 'row' >
          <Grid >
            <LineChart data={data.timeline[0].time} size={[windowData.width,100]} padding={35} showLegend={false} lineAnimate={false}  showYAxis={false} ticks={(windowData.width > 600 ? 10 : 3)} title='Published Timeline'></LineChart>
          </Grid>
          <Grid item>
            <SquareChart data={squareData.data.filter((d,i)=>i<=15)} size={[windowData.width,(windowData.width > 600 ? windowData.width/4 : windowData.width)]} padding={30} title={'Last '+ squareData.data.filter((d,i)=>i<=15).length +' Articles'}></SquareChart>
          </Grid>
          <Grid item> 
              <Typography style={{textAlign:"left"}}  component="p" variant="body">Click on a table row to filter the stories and hover over the squares to see more details of the article</Typography>
            </Grid>
          <Grid container direction ='row' spacing = {2}>
            <Grid item xs>
              <DataTable className='data-table' size={[windowData.width, 150]} data={data.desFinal.filter((d, i) => i <= 10)} columnAlias={{ key: "Top Topics", value: "Articles", value2: "Rel. Score" }} parentCallback={dataTableFilterCallback} filters={squareData.filterKey}></DataTable>
            </Grid>
            <Grid item xs>
              <DataTable className='data-table' size={[windowData.width, 150]} data={data.perFinal.filter((d, i) => i <= 10)} columnAlias={{ key: "Top People", value: "Articles", value2: "Rel. Score" }} parentCallback={dataTableFilterCallback} filters={squareData.filterKey} ></DataTable>
            </Grid>
            <Grid item xs>
              <DataTable className='data-table' size={[windowData.width, 150]} data={data.orgFinal.filter((d, i) => i <= 10)} columnAlias={{ key: "Top Organizations", value: "Articles", value2: "Rel. Score" }} parentCallback={dataTableFilterCallback} filters={squareData.filterKey}></DataTable>
            </Grid>
          
        </Grid>
        </Grid>
        </div>
    
    
    );    
};

export default Dash