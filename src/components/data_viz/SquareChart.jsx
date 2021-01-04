import React,{Component,useEffect,useState} from 'react';
import {scaleLinear, scaleBand, scaleOrdinal} from 'd3-scale';
import {select, event as d3event, selectAll} from 'd3-selection';
import {range as d3range} from 'd3-array';

const SquareChart = (props) =>{

    SquareChart.defaultProps = {
        tag: "image",
      };

    const [dims,setDims] = useState({rows:3,columns:10})

    //set up the chart once

    useEffect(()=>{

        select("#square-chart")
            .attr('width',props.size[0])
            .attr('height',props.size[1])
            .append("g")
            .attr("id","square-chart-holder")
            .attr("transform","translate(0,"+props.padding+")");

        select("#square-chart-holder")
            .append("g")
            .attr("transform","translate(0,"+(-1*props.padding/1.5)+")")
            .append("text")
            .attr("class","square-chart-title")
            .text(props.title);
        },[]);
    
    //method for updates as new data or rhelloesized

    useEffect(()=>{

        if(props.size[0] >300){
            setDims({rows:5,columns:7})
        }else if(props.size[0] >200) {
            setDims({rows:4,columns:8})   
        }else{
            setDims({rows:3,columns:10})
        }

        select("#square-chart")
            .attr('width',props.size[0])
            .attr('height',props.size[1])

        const xScale = scaleBand()
            .domain(d3range(dims.rows))
            .range([0, props.size[0]])
            .paddingInner(0.1);

        const yScale = scaleBand()
            .domain(d3range(dims.columns))
            .range([0, props.size[1]])
            .paddingInner(0); 

        const squares = select("#square-chart-holder")
            .selectAll(props.tag)
            .data(props.data.filter((d,i)=>i <=30),(d)=>d.thumbnail)

        // exit remove any unsed squares
            
        squares
            .exit()
            .style("opacity",1)
            .transition()
            .duration(1000)
            .style("opacity",0)
            .remove()

        // update any exisitng squares

        squares
            .transition()
            .duration(1000)
            .attr('x',(d,i) => xScale((i) % dims.rows))
            .attr('href',(d)=>d.thumbnail)
            .attr('y',(d,i) => yScale(Math.floor(i/dims.rows)))
            .attr('width',xScale.bandwidth())
            .attr('height',yScale.bandwidth())

        // add any new squares

        squares
            .enter()
            //.append("a")
            //.attr("href",(d)=>d.url)
            .append(props.tag)
            .attr('x',(d,i) => xScale((i) % dims.rows))
            .attr('href',(d)=>d.thumbnail)
            .attr('y',(d,i) => yScale(Math.floor(i/dims.rows)))
            .attr('width',xScale.bandwidth())
            .attr('height',xScale.bandwidth())
            .on("mouseover",(d,i,nodes)=>handleHover(d,i,nodes))
            .on("mouseout",(d,i,nodes)=>handleHoverOut(d,i,nodes))
            .style("opacity",0)
            .transition()
            .duration(1000)
            .style("opacity",1)


        },[props.data, props.size]);

    const handleHover = (d,i,nodes)=>{

        // select all the images in the group and filter out the selected index to keep opacity at 1
        selectAll(nodes)
            .filter((j,k) => k!=i)
            .transition('square-chart-select-fadeout')
            .duration(500)
            .style("opacity","0.5");

        // get the x and y location of the current selection

        const selectX = parseInt(select(nodes[i])
            .attr('x'))

        
        const selectY = parseInt(select(nodes[i])
            .attr('y'))

        const selectTitle = d.title

        console.log(parseInt(selectX), props.size[0],parseInt(selectY));
        console.log("translate("+(selectX+ (selectX+100 > props.size[0]?-75:75))+","+(selectY+75));

        select("#square-chart-holder")
            .append("g")
            .attr('class','square-chart-tooltip')
            .attr("transform","translate("+(selectX+ (selectX+250 > props.size[0]?-200:75))+","+(selectY+75)+")")
            .append('rect')
            .attr('x',0)
            .attr('y',0)
            .attr('width',200)
            .attr('height',50)
            .style('stroke-width',1)
            .style('stroke',"#000")
            .style('fill','#f7f7f7')

        select(".square-chart-tooltip")
            .append("text")
            .text(d.title.substr(0,50))
            .attr("dx",'1em')
            .attr("dy",'1.5em')
        
        select(".square-chart-tooltip")
            .append("text")
            .text(d.des_facet !== null ? [...d.des_facet].join(','):'')
            .attr("dx",'1em')
            .attr("dy",'3em')
        
    }

    const handleHoverOut = () => {

        select("#square-chart-holder")
            .selectAll("image")
            .transition()
            .duration(500)
            .style("opacity","1");

        select(".square-chart-tooltip")
            .remove();

    }

    return (<svg id='square-chart'>
        </svg>
        
        )
}

export default SquareChart;



