import React,{Component,useEffect,useState,createContext,useContext} from 'react';
import {json} from 'd3-fetch';
import {arc, pie, symbolTriangle, symbol} from 'd3-shape';
import {piecewise, interpolateRgb} from 'd3-interpolate';
import {select, event} from 'd3-selection';
import {Paper, Typography, Grid, Button, Divider,Link,List, Select, FormControl, MenuItem, InputLabel, ListItem} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import dataArr from './coffee-wheel-data';
import Helmet from 'react-helmet';


const circleDataR1 = dataArr.filter(d=>d.layer=="R1");
const circleDataR2 = dataArr.filter(d=>d.layer=="R2" && d.include == "y" );
const circleDataR3 = dataArr.filter(d=>d.layer=="R3" && d.include == "y" );

class CoffeeWheel extends Component {
  constructor(props) {
    super(props);
    this.createChart = this.createChart.bind(this);
    this.selectedSlice = [];
  }

  componentDidMount() {
    const node = this.node;

    this.plot = select(node)
    .append("g")
    .attr("id", "shapes")
    .attr("transform","translate(175,220)")

    this.nav =  select(node)
    .append("g")
    .attr("id","coffeeNav")

    this.nav
    .append("text")
    .attr("x",10)
    .attr("y",0)
    .attr("dy","1em")
    .text("Selected Notes: ")

    this.createChart();

  }

  createChart(){

    const pieChartAnglesR1 = pie()
      .sort(null)
      .value(d=> d.value)(circleDataR1);

    const pieChartAnglesR2 = pie()
      .sort(null)
      .value(d=> d.value)(circleDataR2); 
      
    const pieChartAnglesR3 = pie()
      .sort(null)
      .value(d=> d.value)(circleDataR3);   
    
    this.pieChartData = pieChartAnglesR1.concat(pieChartAnglesR2).concat(pieChartAnglesR3)
    const pieArc = arc()
    .innerRadius(d=> d.data.layer=='R1'? 5:d.data.layer=='R2'?35: d.data.layer=='R3'? 125:200)
    .outerRadius(d=> d.data.layer=='R1'? 35:d.data.layer=='R2'?125: d.data.layer=='R3'? 135:250);

    const slices = this.plot
      .selectAll("slices")
      .data(this.pieChartData)
      .enter();

    slices
      .append("path")
      .attr("class","pieSlice")
      .attr("d",pieArc)
      .attr("stroke","#fff")
      .attr("fill",d => d.data.layer == "R4" ?"#FFF" : d.data.colour)
      .on("mouseover",(d,i,nodes)=> {
        this.selectedSlice = {"name":d.data.name,"layer":d.data.layer.substr(-1,1)*1,"startAngle":d.startAngle,"endAngle":d.endAngle} ;
        this.handleHoverOver();
      })
      .on("mouseout",(d,i,nodes)=> {
        if(event.relatedTarget.tagName == "svg"){this.selectedSlice = 0};
        this.handleHoverOut();
      });

    slices
      .append("text")
      .each(function(d,i){
        var centroid = pieArc.centroid(d);
        select(this)
          .attr("x", d => d.data.layer != "R3" ? centroid[0] :  d.index < 42 ? centroid[0] + 10 : centroid[0] - 10)
          .attr("y",centroid[1])
          .attr("font-weight",800)
          .attr("font-size",6)
          .attr("fill",d => d.data.layer == "R3" ? d.data.colour : "#FFF")
          .attr("text-anchor", d => d.data.layer != "R3" ? "middle" :  d.index < 42 ? "start" :" end")
          .attr("dy","0.3em")
          .attr("transform",d =>{
            var rotationAngle = 0;
            var sliceMidAngle = (180/Math.PI)*((d.startAngle + d.endAngle)/2)
            if(d.data.layer == "R3" || (d.data.layer == "R2")|| (d.data.layer == "R1")){
              rotationAngle = -90 + sliceMidAngle;
              if(rotationAngle > 90 ) {
                rotationAngle = -270 + sliceMidAngle;
              }
            }
            return "rotate("+rotationAngle + ","+ centroid[0] +" " + centroid[1]  +")" 
          }
          ) 
          .text(d=>d.data.name == "BLANK" ? null:d.data.name)
      });


  };

  handleHoverOver(){

    this.createNav();
    // fade everything but selected slice
    this.plot
      .selectAll(".pieSlice")
      .transition("slice-tx")
      .duration(250)
      .style("opacity",d => ((d.data.name == this.selectedSlice.name && d.data.layer.substr(-1,1) == this.selectedSlice.layer) || (d.data.layer.substr(-1,1) *1< this.selectedSlice.layer && d.startAngle -0.01 <=this.selectedSlice.startAngle && d.endAngle + 0.01 >=this.selectedSlice.endAngle)) ? 1:0.3)

      this.plot
      .selectAll("text")
      .transition("slice-tx")
      .duration(250)
      .style("opacity",d => ((d.data.name == this.selectedSlice.name && d.data.layer.substr(-1,1) == this.selectedSlice.layer) || (d.data.layer.substr(-1,1) *1< this.selectedSlice.layer && d.startAngle -0.01 <=this.selectedSlice.startAngle && d.endAngle + 0.01 >=this.selectedSlice.endAngle)) ? 1:0.3)
  };

  createNav(){

    //calculate parent layers that are within start and end angles of selected slice

    const parentSlices = this.pieChartData.filter(d => (d.data.name + d.startAngle == this.selectedSlice.name + this.selectedSlice.startAngle) || (d.data.layer.substr(-1,1) *1< this.selectedSlice.layer && d.startAngle -0.01 <=this.selectedSlice.startAngle && d.endAngle + 0.01 >=this.selectedSlice.endAngle));//.reverse();

    const triangle = symbol()
      .type(symbolTriangle)

    const navGroups = this.nav
      .selectAll(".navSlice")
      .data(parentSlices,d => d.data.name + d.data.layer + d.startAngle);

    navGroups
      .exit()
      .transition("nav-tx")
      .duration(500)
      .style("opacity",0)
      .remove();

    const navShapes = navGroups
      .enter()
      .append("g")
      .attr("class","navSlice")

    navShapes
      .append("rect")
      .attr("x",(d,i) => (100*(i)))
      .attr("width",0)
      .attr("y",20)
      .transition("nav-tx")
      .duration(200)
      .attr("x",(d,i) => 10+(100*(i)))
      .attr("y",20)
      .attr("width",100)
      .attr("height","1em")
      .attr("fill",d=>d.data.colour)

    navShapes
      .append("path")
      .attr("d",triangle)
      .attr("transform",(d,i) => "translate("+ ((100*(i))+14)+",27) rotate(90)")
      .attr("fill","#000")
      

    navShapes
      .append("text")
      .attr("x",(d,i) => 10+(100*(i)))
      .attr("y",20)
      .attr("dy","1.2em")
      .attr("dx","2em")
      .text(d=>d.data.name )
      .attr("font-size",10)
      .attr("text-anchor","start")
      .attr("font-weight",800)
      .attr("fill","#fff")
      .style("opacity",0)
      .transition("nav-tx")
      .duration(200)
      .style("opacity",1);

  }

  handleHoverOut(){

    if(this.selectedSlice == 0){
      this.nav.
      selectAll(".navSlice")
        .transition("nax-tx")
        .duration(500)
        .style("opacity",0)
        .remove();

    }

    this.plot
      .selectAll(".pieSlice")
      .transition("slice-tx")
      .delay(100)
      .style("opacity",1)

    this.plot
      .selectAll("text")
      .transition("slice-tx")
      .delay(100)
      .style("opacity",1)
  };



  render(){

    return ( 
    <div>
      <Helmet>
        <title>Coffee Wheel</title>
        <meta name="description" content="An interactive coffee wheel to taste coffee better"/>
        <meta property="og:url" content="https://matchstickdata.com/Datasets/coffee-wheel"/>
        <meta property="og:type" content="website"/>
        <meta property="og:title" content="Matchstick Data"/>
        <meta property="og:description" content="An interactive coffee wheel to taste coffee better"/>
        <meta property="og:image" content="https://matchstickdata.com/images/api/images?fileName=coffeeWheel.jpg"/>

      </Helmet>
      <Typography style={{textAlign:"left", margin:"1em"}} component="h5" variant = "h5"> Coffee Taster's Flavor Wheel </Typography>
      <Typography style={{textAlign:"left", margin:"1em"}} component="p" variant = "body"> This visual maps the different flavors found in coffee and helps navigate through the different notes starting from the inner most slices and working out of the rings to get more specific. It was developed by the <a href="https://sca.coffee/research/coffee-tasters-flavor-wheel">Specialty Coffee Association</a>  in 1995 and is the largest piece of collaboration from coffee professionals to develop a new way of describing coffees around the world. </Typography>
      <Typography style={{textAlign:"left", margin:"1em" }} component="p" variant="p">Try using hovering or clicking through through the wheel with your next cup of coffee in hand and see what you can taste!</Typography>
    <svg ref = {node => this.node = node} width = {350} height = {1000} ></svg>
    </div>
    )
  }

}

export default CoffeeWheel
