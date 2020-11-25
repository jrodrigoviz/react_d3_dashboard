import React, {useEffect,useState,Component} from 'react';
import {json} from 'd3-fetch';
import {sum} from 'd3-array';
import {select} from 'd3-selection';
import {scaleQuantize, scaleOrdinal} from 'd3-scale';
import {schemeCategory10} from 'd3-scale-chromatic';
import {forceCollide,forceSimulation,forceX,forceY,forceCenter,forceManyBody} from 'd3-force';

const BubbleChart = (props) =>{

  // Recreating the data variable from the propogated props field makes the simulation think its new data 
  // since the reference to the new variable is gone.
  // Need to keep a state of the data array after each render to ensure that the data reference stays 

  const data = props.data;
  const buckets = ["A","B","C","D","E"]
  const initialNodes = props.initialNodes//[{fx:200,fy:200,r:10,color:"#33aa44"},{fx:250,fy:250,r:10,color:"#33aa44"},{fx:300,fy:200,r:10,color:"#33aa44"},{fx:300,fy:300,r:10,color:"#33aa44"}]

  const [simData,setSimData] = useState([]);
  const [sim,setSim] = useState ({sim:forceSimulation()});
  const [circleCounts,setCircleCounts] = useState({});


  // Simulation runs once on initial load

  useEffect(()=>{

  const simulation = forceSimulation()
    .nodes(simData)    
    .force("y", forceY(500).strength(.01))
    .force('collide', forceCollide().strength(1).radius((d)=>d.r).iterations(5))
    .force("center", forceCenter(250,550).strength(0.01))
    .force('charge', forceManyBody().strength(-10))
    .alphaDecay(0)
    .on('tick',()=> {
      select("#bubble-chart").selectAll("circle").attr("cx",(d)=>Math.max(d.r, Math.min(props.size[0] - d.r,d.x)));
      select("#bubble-chart").selectAll("circle").attr("cy",(d)=>Math.max(d.r, Math.min(props.size[1] - d.r,d.y)));
      //class circles that are already classified
      //select("#bubble-chart").selectAll("circle").attr("class",(d)=> d.y >=400 ?"classed":"unclassed")
      select("#bubble-chart").selectAll("circle.unclassed")
        .attr("class",(d)=> d.y >=400 ?"classed":"unclassed")
        .attr("fill",(d)=> d.y >=400 ? xScaleColor(buckets.findIndex( a => a == xScale(d.x))):d.color)

    })
  
  setSim({sim:simulation,simData:sim.simdata})
  
  },[]);

  useEffect(()=>{
    setSimData([...initialNodes])

  }

  ,[initialNodes])

  // Keeps the state of the data variable

  useEffect(() =>{

    const lastVal = data.slice(data.length-20,data.length)

    setSimData(p=>[...p,...lastVal].filter((d,i)=> typeof d !== "undefined"))

  },[data])

  //creates the boxes for collection

  useEffect(() =>{

    const plot = select("#bubble-chart")

    const rect = plot.selectAll("rect")

    rect
      .data(buckets)
      .enter()
      .append("rect")
      .attr("x",d => xScale.invertExtent(d)[0])
      .attr("y",400)
      .attr("width",d => xScale.invertExtent(d)[1] - xScale.invertExtent(d)[0] -5 )
      .attr("height",25)
      .style("stroke","black")
      .style("stroke-width",2)
      .style("opacity",0.5)
      .style("fill",d=> xScaleColor(buckets.findIndex( a => a==d)))

  },[])

  // interval function to clean up simulation

  useEffect(()=>{
    
    const interval = setInterval(()=>{

      // removes the nodes that are completed
      const newSimData = simData.filter(d => d.y <=450);
      const finishedSimData = simData.filter(d=> d.y>400)
      
      if( typeof finishedSimData !=="undefined" && finishedSimData.length>0) {
        finishedSimData.forEach(d => {
          const counterName = xScale(d.x);
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

    
  },[simData])


  sim
    .sim
    .nodes(simData)
    .alpha(1)
    .restart();

  const plot = select("#bubble-chart");

  const xScale = scaleQuantize()
    .domain([0,500])
    .range(buckets);  

  const xScaleColor = scaleOrdinal(schemeCategory10);

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
