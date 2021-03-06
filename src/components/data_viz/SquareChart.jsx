import React,{Component,useEffect,useState} from 'react';
import {scaleLinear, scaleBand, scaleOrdinal} from 'd3-scale';
import {select, event as d3event, selectAll} from 'd3-selection';
import {range as d3range} from 'd3-array';

const SquareChart = (props) =>{

    SquareChart.defaultProps = {
        tag: "image",
      };

    const [dims,setDims] = useState({rows:4,columns:4})

    //set up the chart once

    useEffect(()=>{

        select("#square-chart")
            .attr('width',props.size[0])
            .attr('height',props.size[1])
            .append("g")
            .attr("id","square-chart-holder")
            .attr("transform","translate("+props.padding/2+","+props.padding+")");

        select("#square-chart-holder")
            .append("g")
            .attr("transform","translate(0,"+(-1*props.padding/1.5)+")")
            .append("text")
            .attr("class","square-chart-title")
            .text(props.title);

        },[]);
    
    //method for updates when resized

    useEffect(()=>{

        if(props.size[0] >600){
            setDims({rows:8,columns:2})
        }else if(props.size[0] >300) {
            setDims({rows:4,columns:4})
        }

    },[props.size])

    //method for updates when data is updated

    useEffect(()=>{

        select(".square-chart-title")
            .text(props.title);


        select("#square-chart")
            .attr('width',props.size[0])
            .attr('height',props.size[1])

        const xScale = scaleBand()
            .domain(d3range(dims.rows))
            .range([0, props.size[0] - 2*props.padding])
            .paddingInner(0.1);

        const yScale = scaleBand()
            .domain(d3range(dims.columns))
            .range([0, props.size[1]- 2*props.padding])
            .paddingInner(0.1); 

        const squares = select("#square-chart-holder")
            .selectAll(props.tag)
            .data(props.data,(d)=>d.thumbnail)

        // exit remove any unsed squares
            
        squares
            .exit()
            .style("opacity",1)
            .transition('square-chart-exit')
            .duration(1000)
            .style("opacity",0)
            .remove()

        // update any exisitng squares

        squares
            .on("mouseover",(d,i,nodes)=>handleHover(d,i,nodes))
            .on("mouseout",(d,i,nodes)=>handleHoverOut(d,i,nodes))
            .transition('square-chart-update')
            .duration(1000)
            .attr('x',(d,i) => xScale((i) % dims.rows))
            .attr('href',(d) => d.thumbnail)
            .attr('y',(d,i) => yScale(Math.floor(i/dims.rows)))
            .attr('width',xScale.bandwidth())
            .attr('height',yScale.bandwidth())


        // add any new squares

        squares
            .enter()
            .append(props.tag)
            .attr('x',(d,i) => xScale((i) % dims.rows))
            .attr('href',(d)=>d.thumbnail)
            .attr('y',(d,i) => yScale(Math.floor(i/dims.rows)))
            .attr('width',xScale.bandwidth())
            .attr('height',yScale.bandwidth())
            .on("mouseover",(d,i,nodes)=>handleHover(d,i,nodes))
            .on("mouseout",(d,i,nodes)=>handleHoverOut(d,i,nodes))
            .style("opacity",0)
            .transition('square-chart-enter')
            .duration(1000)
            .style("opacity",1)

        // Dependent on the data as well as the size of the screen
        },[props.data,dims]);

    const handleHover = (d,i,nodes)=>{

        // select all the images in the group and filter out the selected index to keep opacity at 1
        selectAll(nodes)
            .filter((j,k) => k!=i)
            .transition('square-chart-select')
            .duration(500)
            .style("opacity","0.25");

        // get the x and y location of the current selection

        const selectX = parseInt(select(nodes[i])
            .attr('x'))
        
        const selectY = parseInt(select(nodes[i])
            .attr('y'))

        const selectHeight = parseInt(select(nodes[i])
            .attr('height'))

        // TODO: the data required for tooltips should be generalized for different data types. Only works for nyt-dash
        const selectTitle = d.title;
        const selectDesTags = (d.des_facet !== null? d.des_facet:[]);
        const selectPerTags = (d.per_facet !== null? d.per_facet:[]);


        select("#square-chart-holder")
            .append("g")
            .attr('class','square-chart-tooltip')
            .append("foreignObject")
            .attr('x', selectX + props.size[0]/1.5 > props.size[0] -props.padding ? props.size[0] -props.padding - props.size[0]/1.5 : selectX)
            .attr('y', selectY +150 > props.size[1] ? selectY - 100 : selectY+selectHeight)
            .attr('width',props.size[0]/1.5)
            .attr('height',100)
            .attr("class",'square-chart-tooltip-fo')

        select('.square-chart-tooltip-fo')
            .append("xhtml:div") // appending an xhtml div to use CSS to format tooltip. Required and cannot be a normal div
            .attr("class",'square-chart-tooltip-div')
            .append("div")
            .attr("class",'square-chart-tooltip-div-article')
            .text(selectTitle.substr(0,100) + (selectTitle.length > 100 ? "...":""))

        select('.square-chart-tooltip-div')
            .append("div") // appending an xhtml div to use CSS to format tooltip. Required and cannot be a normal div
            .attr("class",'square-chart-tooltip-div-pub-date')
            .text("Published: " + new Date(d.pubDate).toLocaleString());
        
        if(selectDesTags.length>0){ 

            select('.square-chart-tooltip-div')
                .append("div") // appending an xhtml div to use CSS to format tooltip. Required and cannot be a normal div
                .attr("class",'square-chart-tooltip-div-topics')
                .text("Topics: " + selectDesTags.slice(0,2))
        }
        
        if(selectPerTags.length>0){

            select('.square-chart-tooltip-div')
                .append("div") // appending an xhtml div to use CSS to format tooltip. Required and cannot be a normal div
                .attr("class",'square-chart-tooltip-div-people')
                .text("People: " + selectPerTags.slice(0,2))
        }
    }

    const handleHoverOut = () => {

        select("#square-chart-holder")
            .selectAll("image")
            .transition('square-chart-select')
            .duration(200)
            .style("opacity","1");

        select(".square-chart-tooltip")
            .remove();

    }

    return (<svg id='square-chart'>
        </svg>
        
        )
}

export default SquareChart;



