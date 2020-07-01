import React,{Component,useEffect,useState,createContext,useContext} from 'react';
import {json} from 'd3-fetch';
import {piecewise, interpolateRgb} from 'd3-interpolate'
import {Paper, Typography, Grid, Button, Divider, Select, FormControl, MenuItem, InputLabel} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import LineChart from '../data_viz/LineChart';
import BarChart from '../data_viz/BarChart';
import DataTable from '../data_viz/DataTable';
import KPICard from '../data_viz/KPICard';
import ScatterPlot from '../data_viz/ScatterPlot';
import RadarChart from '../data_viz/RadarChart';
import ClusteredBarChart from '../data_viz/ClusteredBarChart';
import DataMap from '../data_viz/DataMap';
import SmallCircleMultiple from '../data_viz/SmallCircleMultiple';
import crossfilter from 'crossfilter2';

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

  lineChart:{
    "& .line-chart-title":{
    textAlign:'lefts',
    fontSize:20
    },
    "& .line-chart-subtitle":{
    textAlign:'',
    fontSize:15
    }
  }

}));

function reduceAdd(p, v){
  var element = {
       sum:p.sum + v.TotalCupPoints,
       count:p.count + 1,
       avg:p.count +1> 0 ? (p.sum + v.TotalCupPoints)/(p.count + 1) :0,
       sum_sweetness:p.sum_sweetness + v.Sweetness,
       count_sweetness: p.count_sweetness + 1,
       avg_sweetness:p.count_sweetness +1> 0 ? (p.sum_sweetness + v.Sweetness)/(p.count_sweetness + 1) :0,
       sum_acidity:p.sum_acidity + v.Acidity,
       count_acidity: p.count_acidity + 1,
       avg_acidity:p.count_acidity +1> 0 ? (p.sum_acidity + v.Acidity)/(p.count_acidity + 1) :0,
       sum_body:p.sum_body + v.Body,
       count_body: p.count_body + 1,
       avg_body:p.count_body +1> 0 ? (p.sum_body + v.Body)/(p.count_body + 1) :0
      }

  return element

};

function reduceRemove(p, v){
  var element = {
       sum:p.sum - v.TotalCupPoints,
       count:p.count - 1,
       avg:p.count -1 > 0  ?  (p.sum - v.TotalCupPoints)/(p.count - 1) : 0,
       sum_sweetness:p.sum_sweetness - v.Sweetness,
       count_sweetness: p.count_sweetness -1,
       avg_sweetness:p.count_sweetness -1> 0 ? (p.sum_sweetness - v.Sweetness)/(p.count_sweetness - 1) :0,
       sum_acidity:p.sum_acidity - v.Acidity,
       count_acidity: p.count_acidity -1,
       avg_acidity:p.count_acidity -1> 0 ? (p.sum_acidity - v.Acidity)/(p.count_acidity - 1) :0,
       sum_body:p.sum_body - v.Body,
       count_body: p.count_body- 1,
       avg_body:p.count_body -1> 0 ? (p.sum_body - v.Body)/(p.count_body - 1) :0


      }

  return element

};

function reduceInitial(p, v){
  return {sum:0, count:0, avg:0, sum_sweetness:0, count_sweetness:0, avg_sweetness:0,min_sweetness:0,max_sweetness:0, sum_acidity:0, count_acidity:0, avg_acidity:0, sum_body:0, count_body:0, avg_body:0};
};


const Datasets = (props) =>{

   const [dimensions, setDimensions] = useState({width:window.innerWidth <= 400 ? 350 : window.innerWidth <= 900 ? 375: Math.min(1024-2*50,window.innerWidth),height:450});
   const [data, setData] = useState({data:[{key:0,series:0, value:0}],mapData:[{properties:"",geometry:[]}]});
   const [selectedGroup, setSelectedGroup] = useState("Top 10");

   const continents = {
       "All":[],
       "Africa":["Ethiopia","Kenya","Burundi", "Uganda"],
       "South America":["Colombia","Guatemala","El Salvador","Costa Rica","Nicaragua","Honduras","Peru"],
       "Asia":["China","Thailand","Indonesia","Taiwan","Philippines"]
   }


   const [cfData,setCFData] = useState({
     updateCount:0,
     unfilterCount:0,
     continent:"All",
     dataset:1,
     countries:[],
     countriesSuperFilter:[]

   });

   const [cfDims,setCFDims] = useState({});

   function unfilterCF(){
       cfDims.dims.CountrySuperFilter.filterAll();
       setCFData({updateCount:cfData.updateCount+1,unfilterCount:cfData.unfilterCount+1,dataset:1,continent:"All",countries:cfData.countries, countriesSuperFilter:cfData.countriesSuperFilter});
   };


   function processedGroupedCF(mode){

     if( typeof cfDims.dims === 'undefined' ){
       return [{key:0,series:0,value:0}];
     }else{
       switch(mode){
         // used for bar chart - does not filter itself
         case 1:
          var value = cfDims.dims.CountryFilter.group().reduce(reduceAdd,reduceRemove,reduceInitial).order(d=>d.avg).top(Infinity).filter((d,i,x) => d.value.count > 1).filter((d,i,x) => (cfData.dataset == 1? i<=10: i >=x.length-10)).map(d =>({series:d.key,value:Math.round(d.value.avg*10)/10}));
          var sortedValue = cfDims.dims.CountryFilter.group().reduce(reduceAdd,reduceRemove,reduceInitial).order(d=>d.avg).top(Infinity).filter((d,i,x) => d.value.count > 1).filter((d,i,x) => (cfData.dataset == 1? i<=10: i >=x.length-10)).sort((a,b) =>a.value.avg_sweetness >b.value.avg_sweetness ? 1:-1);
          sortedValue.forEach((d,i)=>d.sweet_rnk=i);
          break;
        // used for data table
        case 2:
          var value = cfDims.dims.Country.group().reduce(reduceAdd,reduceRemove,reduceInitial).order(d=>d.avg).top(Infinity).filter((d,i,x) => d.value.count > 1 && d.value.avg>0).filter((d,i,x) => cfData.dataset == 1? i<=10: i >=x.length-10).map((d,i) =>({series:d.key,value:Math.round(d.value.avg*10)/10}));
          break;
        // used for regions
        case 3:
          if(cfDims.dims.CountryFilter.hasCurrentFilter()==undefined || cfDims.dims.CountryFilter.hasCurrentFilter()==false){
            var value = [{child:"Choose a Country to see subregions",series:"",parent:"Choose a Country to see subregions",value:0}]
          }else{
            var value = cfDims.dims.Region.group().reduce(reduceAdd,reduceRemove,reduceInitial).top(Infinity).filter((d,i,x) => (d.value.count >= 1) && (d.key.split("-")[1] != 'N/A' && d.key.split("-")[1] != 'Test') )
            .map((d)=>{
            var dict = {
              key:"-",
              parent:d.key.split("-")[0],
              child:d.key.split("-")[1].substr(0,20) + (d.key.split("-")[1].length>20 ? "...":""),
              cupScore:d.value.avg,
              sweetness:d.value.avg_sweetness,
              acidity:d.value.avg_acidity,
              body:d.value.avg_body
            }
            return dict
            });

            value.sort((a,b) =>a.sweetness >b.sweetness ? 1:-1).forEach((d,i,k)=>d.sweet_rnk=(i/k.length));
            value.sort((a,b) =>a.acidity >b.acidity ? 1:-1).forEach((d,i,k)=>d.acidity_rnk=(i/k.length));
            value.sort((a,b) =>a.body >b.body ? 1:-1).forEach((d,i,k)=>d.body_rnk=(i/k.length));

            //sort back to alpha order
            value.sort((a,b)=>a.child > b.child ? 1:-1);
          };

          break;
       // used for country list only (datamap)
       case 4:
          var value = {};
          var rawData = cfDims.dims.Country.group().reduce(reduceAdd,reduceRemove,reduceInitial).order(d=>d.avg).top(Infinity).filter((d,i,x) => d.value.count > 1 && d.value.avg>0).filter((d,i,x) => cfData.dataset == 1? i<=50: i >=x.length-50)
          // rank each country with each respective note
          rawData.sort((a,b) =>a.value.avg_sweetness >b.value.avg_sweetness ? 1:-1).forEach((d,i)=>d.sweet_rnk=i);
          rawData.sort((a,b) =>a.value.avg_acidity >b.value.avg_acidity ? 1:-1).forEach((d,i)=>d.acidity_rnk=i);
          rawData.sort((a,b) =>a.value.avg_body >b.value.avg_body ? 1:-1).forEach((d,i)=>d.body_rnk=i);

          rawData.forEach((d,i) => value[d.key]=mapColorMixer(d.key, d.sweet_rnk,d.acidity_rnk,d.body_rnk));

       }

       return value;
   };

   };

   function mapColorMixer(key,sweet,acid,body){
     var noteDataArr = [sweet/27,acid/27,body/27];
     var noteArr =["Sweetness","Acidity","Body"];
     var colorScale = ["#f4c2c2","#32cd32","#b5651d"];
     var primaryNoteInd =  noteDataArr.indexOf(Math.max(...noteDataArr));
     var secondaryNoteInd = noteDataArr.indexOf(Math.min(...noteDataArr));

     return colorScale[primaryNoteInd];
   }

   function processedTotalCF(mode){

     if( typeof cfDims.dims === 'undefined' ){
       return [{key:0,series:0,value:0}];
     }else{
       switch(mode){
         case 1:
           var value = cfDims.dims.Country.groupAll().reduce(reduceAdd,reduceRemove,reduceInitial).value().avg
           var valueDict = [{series:'Total',value:+(value*10/10).toFixed(1)}];
           return valueDict;
         case 2:
           var value = cfDims.dims.Country.groupAll().reduceCount().value();
           var valueDict = [{series:'Total',value:+(value*10/10)}];
           return valueDict;
         case 3:
           var value = cfDims.dims.Country.groupAll().reduce(reduceAdd,reduceRemove,reduceInitial).value().avg_sweetness
           var valueDict = [{series:'Total',value:+(value*10/10)}];
           return valueDict;
         case 4:
           var value = cfDims.dims.Country.groupAll().reduce(reduceAdd,reduceRemove,reduceInitial).value().avg_acidity
           var valueDict = [{series:'Total',value:+(value*10/10)}];
           return valueDict;
         case 5:
           var value = cfDims.dims.Country.groupAll().reduce(reduceAdd,reduceRemove,reduceInitial).value().avg_body
           var valueDict = [{series:'Total',value:+(value*10/10)}];
           return valueDict;
         case 6:
           var value = cfDims.dims.Country.groupAll().reduce(reduceAdd,reduceRemove,reduceInitial).value()
           var valueDict = [
           {key:'Sweetness',value:+(value.avg_sweetness*10/10) },
           {key:'Acidity',value:+(value.avg_acidity*10/10) },
           {key:'Body',value:+(value.avg_body*10/10)}
          ];
           return valueDict;
      }
   };

   };

   function parentCallback(d){

      if(d.length == 0){
        cfDims.dims.CountryFilter.filterAll();
      }else{
      cfDims.dims.CountryFilter.filterFunction((x)=> d.indexOf(x)>-1);
    }

     setCFData({updateCount:cfData.updateCount+1,unfilterCount:cfData.unfilterCount,dataset:cfData.dataset,continent:cfData.continent, countries:d, countriesSuperFilter:cfData.countriesSuperFilter});
  };

  function handleDatasetChange(d){

     setCFData({updateCount:cfData.updateCount+1,unfilterCount:cfData.unfilterCount,dataset:d.target.value,continent:cfData.continent, countries:cfData.countries, countriesSuperFilter:cfData.countriesSuperFilter});

 };

 function handleContinentChange(d){

   cfDims.dims.CountrySuperFilter.filterFunction((x) => continents[d.target.value].length == 0?1:continents[d.target.value].indexOf(x)>-1);
   setCFData({updateCount:cfData.updateCount+1,unfilterCount:cfData.unfilterCount,dataset:cfData.dataset,continent:d.target.value, countries:cfData.countries, countriesSuperFilter: continents[d.target.value]});
};

    useEffect(()=>{

      const fetchData = async () =>{
          const response = await json("/api/data");
          const mapResponse = await json("/api/map");
          setData({data:response, mapData:mapResponse});
          const ndx = crossfilter(response);

          const cfCountryDim = ndx.dimension( (d) => d.Country);
          const cfCountryDimFilter = ndx.dimension( (d) => d.Country);
          const cfCountryDimSuperFilter = ndx.dimension((d)=> d.Country);
          const cfRegionDim = ndx.dimension( (d) => d.Country+"-"+d.Region);
          const cfRegionDimFilter = ndx.dimension( (d) => d.Country+"-"+d.Region);
          const cfRegionDimSuperFilter = ndx.dimension((d)=> d.Country+"-"+d.Region);

          setCFDims(
            {
              data:1,
              dims:{
                Country:cfCountryDim,
                CountryFilter:cfCountryDimFilter,
                CountrySuperFilter:cfCountryDimSuperFilter,
                Region:cfRegionDim,
                RegionFilter:cfRegionDimFilter,
                RegionSuperFilter:cfRegionDimSuperFilter
              }
            }
          );
        };

        fetchData();

      var width = window.innerWidth;

      const debouncedHandleResize  = debounce (function handleResize (){
        if(window.innerWidth != width ){

          setDimensions({
            height:350,
            width: (window.innerWidth <= 400 ? 350 : window.innerWidth <= 900 ? 375: Math.min(1024-2*50,window.innerWidth))
          });

      }}, 1);

      window.addEventListener("resize",debouncedHandleResize);


      return _ => {window.removeEventListener('resize', debouncedHandleResize)};

    },[]);


  const classes = useStyles();

  return (
      <Grid container className={classes.lineGraph} >
        <Grid container id="KPI-row" justify="space-evenly">
          <Grid item >
          <Grid container id = "KPI-ratings" justify="space-around">
          <Grid item>
          <KPICard size ={[125,100]} data={processedTotalCF(1)} padding={50} speed={1000/1.5} title="Average Rating" decimal={1}/>
          </Grid>
          <Grid item>
          <KPICard size ={[125,100]} data={processedTotalCF(2)} padding={50} speed={1000/1.5} title="Ratings Count" decimal={0}/>
          </Grid>
          </Grid>
          </Grid>
          <Grid item >
          <Divider orientation="vertical" style={{marginRight:"10px",height:"80%"}} ></Divider>
          </Grid>
          <Grid item  >
          <Grid container id="KPI-flavor" justify="space-evenly">
          <Grid item>
          <KPICard size ={[125,100]} data={processedTotalCF(3)} padding={50} speed={1000/1.5} title="Sweetness" decimal={1}/>
          </Grid>
          <Grid item>
          <KPICard size ={[125,100]} data={processedTotalCF(4)} padding={50} speed={1000/1.5} title="Acidity" decimal={1}/>
          </Grid>
          <Grid item>
          <KPICard size ={[125,100]} data={processedTotalCF(5)} padding={50} speed={1000/1.5} title="Body" decimal={1}/>
          </Grid>
          </Grid>
          </Grid>
        </Grid>
        <Grid container id ="button-row" justify="space-evenly">
          <Grid item>
          <FormControl style={{minWidth:120}} >
           <InputLabel id="top-n-label">Continent</InputLabel>
            <Select labelId="top-n-label" id = "tn-label" value ={cfData.continent} onChange={handleContinentChange}>
              <MenuItem value={"All"}>All</MenuItem>
              <MenuItem value={"Africa"}>Africa</MenuItem>
              <MenuItem value={"South America"}>South America</MenuItem>
              <MenuItem value={"Asia"}>Asia</MenuItem>
            </Select>
          </FormControl>
          </Grid>
         <Grid item>
        </Grid>
          <Grid item>
            <Button onClick={()=>unfilterCF()}>Reset Filters</Button>
          </Grid>
          {/*
        </Grid>

        <Grid container id="chart-row" style={{marginTop:"20px"}}>
          <Grid item>
            <BarChart parentCallback={parentCallback} size ={[dimensions.width/2,300]} data={processedGroupedCF(1)} unfilter = {cfData.unfilterCount} padding={50} xAdjust={35} speed={1000} keysort={1} selection={1} title={"Top 10 Countries by Coffee Ratings"} subtitle = "Rated By Total Points" xAxisLabel = "xAxisLabel" yAxisLabel = "yAxisLabel" highlightColor="pink"/>
          </Grid>
          <Grid item>
            <RadarChart size ={[dimensions.width/2,300]} data={processedTotalCF(6)} r={3} shapeFill={"#ababab"} padding={100} speed={1000} keysort={-1}  title={"Top 10 Countries by Coffee Ratings"} subtitle = "Rated By Total Points" xAxisLabel = "xAxisLabel" yAxisLabel = "yAxisLabel" />
          </Grid>
          <Grid item>
            <ClusteredBarChart parentCallback={parentCallback} size ={[dimensions.width/2,400]} data={processedGroupedCF(3)} unfilter = {cfData.unfilterCount} padding={100} speed={1000} keysort={1} selection={1} title={"Top 10 Regions by Coffee Ratings"} subtitle = "Rated By Total Points" highlightColor="pink"/>
          </Grid>
          */}
        </Grid>
        <Grid container id="map-box">
          <Grid item>
            <DataMap parentCallback={parentCallback} size ={[1000,350]} data={data.mapData} continentCountries ={cfData.countriesSuperFilter} highlightCountries = {cfData.countries} initialHighlight = {processedGroupedCF(4)} padding={50} speed={1000} keysort={1} selection={1} title={"Top Producing Coffee Countries"} subtitle = "Rated By Total Points" xAxisLabel = "xAxisLabel" yAxisLabel = "yAxisLabel" highlightColor="pink"/>
          </Grid>
        </Grid>
        <Grid container id="subregion-box">
          <Grid item>
            <SmallCircleMultiple size ={[1000,500]} padding ={50/2} r={15} data={processedGroupedCF(3)} title={"Subregions in the Selected Country"} legendKeys={['Acidity','Sweetness','Body']}> </SmallCircleMultiple>
        </Grid>
      </Grid>
        </Grid>
)

}

export default Datasets
