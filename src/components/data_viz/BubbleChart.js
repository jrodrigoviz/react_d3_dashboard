import React, {useEffect,useState,Component} from 'react';
import {json} from 'd3-fetch';
import {sum} from 'd3-array';
import {select} from 'd3-selection';
import {scaleQuantize, scaleOrdinal} from 'd3-scale';
import {schemeCategory10} from 'd3-scale-chromatic';
import {forceCollide,forceSimulation,forceX,forceY,forceCenter,forceManyBody} from 'd3-force';
import { set } from 'react-ga';

const BubbleChart = (props) =>{

  // Recreating the data variable from the propogated props field makes the simulation think its new data 
  // since the reference to the new variable is gone.
  // Need to keep a state of the data array after each render to ensure that the data reference stays 

  const data = props.data;
  const initialNodes = props.initialNodes

  const [simData,setSimData] = useState([]);
  const [sim,setSim] = useState ({sim:forceSimulation()});
  const [circleCounts,setCircleCounts] = useState({});
  const [buckets, setBuckets] = useState([]);
  const [scales, setScales] = useState();

  // Simulation runs once on initial load

  useEffect(()=>{

  const simulation = forceSimulation()
    .nodes(simData)    
    .force("y", forceY(500).strength(.01))
    .force('collide', forceCollide().strength(1).radius((d)=>d.r).iterations(5))
    .force("center", forceCenter(250,550).strength(0.01))
    .force('charge', forceManyBody().strength(0))
    .alphaDecay(0)
    //.on('tick',scales.tickedFunc);
  
  setSim({sim:simulation})
  
  },[]);

  useEffect(()=>{
    setSimData([...initialNodes])

  }

  ,[initialNodes])

  // Keeps the state of the data variable

  useEffect(() =>{
    
    if(data.length>0){

      const lastVal = data.slice(data.length-20,data.length)

      setSimData(p=>[...p,...lastVal].filter((d,i)=> typeof d !== "undefined"))
    }else

      setSimData(data);

  },[data])

  //creates the boxes for collection

  useEffect(() =>{

    console.log(props.buckets)

    const plot = select("#bubble-chart")

    const rect = plot.selectAll("rect")

    const rectData = (props.buckets.length >0 ? props.buckets.map(d=>d.series):[0]);

    const xScale = scaleQuantize()
    .domain([0,props.size[0]])
    .range(rectData);  

    const xScaleColor = scaleOrdinal(schemeCategory10);
    
    const ticked = ()=>{
      console.log("a")
      select("#bubble-chart").selectAll("circle").attr("cx",(d)=>d.x)
      select("#bubble-chart").selectAll("circle").attr("cy",(d)=>Math.max(d.r, Math.min(props.size[1] - d.r,d.y)));
      select("#bubble-chart").selectAll("circle.unclassed")
        .attr("class",(d)=> d.y >=400 ?"classed":"unclassed")
        .attr("fill",(d)=> d.y >=400 ? xScaleColor(xScale(d.x)):d.color)
    };
    
    //update the existing simulation with the new scales in the selection function
    sim.sim
      .on('tick',ticked);

    setScales({xScale:xScale,xScaleColor:xScaleColor,tickedFunc:ticked});

    rect
      .data(rectData)
      .exit()
      .remove()

    rect
      .attr("x",d => xScale.invertExtent(d)[0])
      .attr("y",400)
      .attr("width",d => xScale.invertExtent(d)[1] - xScale.invertExtent(d)[0] -5 )
      .attr("height",25)
      .style("stroke","black")
      .style("stroke-width",2)
      .style("opacity",0.5)
      .style("fill",d=> xScaleColor(d))

    rect
      .data(rectData)
      .enter()
      .append("rect")
      .attr("x",d => xScale.invertExtent(d)[0])
      .attr("y",400)
      .attr("width",d => xScale.invertExtent(d)[1] - xScale.invertExtent(d)[0] -5 )
      .attr("height",25)
      .style("stroke","black")
      .style("stroke-width",2)
      .style("opacity",0.5)
      .style("fill",d=> xScaleColor(d))

 
  },[props.buckets])

  // interval function to clean up simulation

  useEffect(()=>{
    
    const interval = setInterval(()=>{

      // removes the nodes that are completed
      const newSimData = simData.filter(d => d.y <=450);
      const finishedSimData = simData.filter(d=> d.y>400 && d.x>0 &&d.x <props.size[0])
      
      if( typeof finishedSimData !=="undefined" && finishedSimData.length>0) {
        finishedSimData.forEach(d => {
          const counterName = scales.xScale(d.x);
            setCircleCounts((prevState) => {
              const copyState = { ...prevState}
              copyState[counterName] = (typeof prevState[counterName] === "undefined" ? 1:prevState[counterName] +1)
              return copyState
        })
      })        
    }

      props.callbackData(Object.keys(circleCounts).length>0 ? circleCounts : [] )
      setSimData(newSimData);
      
    },500);
    return ()  => {
      
      clearInterval(interval)
    };

    
  },[simData,scales])

  sim
    .sim
    .nodes(simData)
    .alpha(1)
    .restart();

  const plot = select("#bubble-chart");

  const circle = plot
    .selectAll("circle")
    .data(simData,d=>d.socket+d.color)  

  circle
    .enter()
    .append("circle")
    .attr("class", (d,i) => i<=20?"initial":"unclassed" )
    .attr("fill",(d) => d.color)
    .attr("r",(d) => d.r)
  
  circle.exit()
    .remove()
  

    return (

    <svg id={'bubble-chart'} width = {props.size[0]} height = {props.size[1]} style={{background:props.bg}} >
    </svg>

    )
  }

export default BubbleChart
