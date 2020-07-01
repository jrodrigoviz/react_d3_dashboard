import React, {Component} from 'react';
// Does not contian d3 prefix when importing classes
import {scaleLinear, scalePoint, scaleOrdinal, scaleBand} from 'd3-scale';
import {range,max,group, extent} from 'd3-array';
import {keys,values,nest} from 'd3-collection';
import {select} from 'd3-selection';
import {axisBottom, axisLeft} from 'd3-axis'
import {transition} from 'd3-transition'

class DataViz extends Component {
  constructor (props){
    super (props);
    this.createViz = this.createViz.bind(this);
    this.data = [];
    //Expected Data format [{key:"the label for circles",child:"child",parent:"parent",value:"the size of the cirlces"}]

};

componentDidMount(){
  const node = this.node;

  this.plot  = select(node)
                .append("g")
                .attr("id","plot-container")
                .attr("transform", "translate(" + this.props.padding + "," + this.props.padding + ")");

  this.reshapeData();
  this.createScale();
  this.createViz();
  this.addLegend();

};

componentDidUpdate(){

  this.unpackData();
  this.reshapeData();
  this.createScale();
  this.createViz();

};

unpackData(){
  var d0 = [];
  var d1 = this.props.data.forEach(d=>{
    d0.push({key:"Acidity", child:d.child, parent:d.parent,value:d.acidity_rnk});
    d0.push({key:"Body", child:d.child, parent:d.parent,value:d.body_rnk});
    d0.push({key:"Sweetness", child:d.child, parent:d.parent,value:d.sweet_rnk});
  });

  this.data = d0;

}

reshapeData(){

  this.seriesData = nest()
    .key((d)=>d.child)
    .entries(this.data)
    .filter((d,i)=> i<30);

  this.nodeRelationships = this.data
  .map((d,i,a)=>(d.parent+"_"+d.child))
  .filter((v, i, a) => a.indexOf(v) === i)
  .map((d,i,a)=>({parent:d.split("_")[0],child:d.split("_")[1],level: d.split("_")[1]==d.split("_")[0] ?0:1}));

  this.nodeGroups = group(this.data,d =>d.parent);

  this.maxSeriesLength = max(this.seriesData.map((d)=>d.values.length));
  this.uniqueKeys = this.seriesData.map((d)=>d.values.map(d=>d.key)).flat().filter((v, i, a) => a.indexOf(v) === i);

}

createScale(){

  this.xCatScale = scaleBand()
    .domain([0,1,2])
    .range([0,this.props.size[0]-2* this.props.padding])

  this.xScale = scalePoint()
    .domain(["Acidity","Sweetness","Body"])
    .range([0,100]);

  this.yScale = scalePoint()
    //.domain(this.seriesData.map((d)=>d.key))
    .domain(range(10))
    .range([0,this.props.size[1] -2* this.props.padding - 50]);

  this.rScale = scaleLinear()
      .domain([0,1])
      .range([0,this.props.r]);

  this.colorScale = {
    "Acidity":"#32cd32",
    "Body":"#b5651d",
    "Sweetness":"#f4c2c2"
  }

}

addLegend(){

  this.plot.select(".small-multiple-graph-legend").remove();

  var legend = this.plot.append("g")
    .attr("class","small-multiple-graph-legend");

  var that = this;

  var legendShapeGroups = legend.selectAll("g")
    .data(this.props.legendKeys)
    .enter()
    .append("g");

  legendShapeGroups
    .append("circle")
    .attr("r",5)
    .attr("cx",(d,i)=> i*(300/this.props.legendKeys.length))
    .attr("cy",-5)
    .attr("fill",(d)=> this.colorScale[d])

  legendShapeGroups
    .append("text")
    .text((d)=>d)
    .attr("x",(d,i)=>i*(300/this.props.legendKeys.length) +10)

};

createViz(){

  var circleGroups = this.plot
    .selectAll(".small-multiples-circle-groups")

//remove any old groups
 circleGroups
    .data(this.seriesData, (d)=>d.key)
    .exit()
    .remove();

  // now append the circles with an offset of max(computedTextLengths) for cx
  circleGroups
   .data(this.seriesData, (d)=>d.key)
   .enter()
   .append("g")
   .attr("class","small-multiples-circle-groups");

 var text = this.plot
    .selectAll(".small-multiples-circle-groups")
    .append("text")
    .attr("x",0)
    .attr("y",0)
    .attr("dy","0.4em")
    .text((d)=> d.key);

 // calculate the text sizes first so that the circles are aligned properly based on max text size
 // adjust spacing and render orders
 var computedTextLengths =[];

 var textLength = this.plot
    .selectAll(".small-multiples-circle-groups text")
    .each((d,i,k)=> computedTextLengths.push(select(k[i]).node().getComputedTextLength()));

 this.plot
    .selectAll(".small-multiples-circle-groups text")
    .attr("x",0)

  //reselect the groups as new gs were added
  var circles = this.plot
     .selectAll(".small-multiples-circle-groups")
     .selectAll("circle")
     .data((d)=>d.values,(d)=>d.key)
     .enter()
     .append("circle")
     .attr("cx",(d,i)=> this.xScale(d.key) + max(computedTextLengths) +20)
     .attr("cy",0)
     .attr("r",(d)=>this.rScale(d.value))
     .attr("fill",(d)=>this.colorScale[d.key]);

  var line = this.plot
     .selectAll(".small-multiples-circle-groups")
     .append("line")
     .style("stroke","#000")
     .attr("x1",max(computedTextLengths)+20)
     .attr("x2",max(computedTextLengths)+100+20)
     .attr("y1",0)
     .attr("y2",0)

  //move line to first element to render behind circles
  this.plot.selectAll("line").lower()

  //move groups according to levels
  this.plot
    .selectAll(".small-multiples-circle-groups")
    .style("opacity",0)
    .attr("transform",(d,i)=>"translate("+this.xCatScale(Math.floor(i/10))+",50)")
    .transition()
    .duration(1000)
    .style("opacity",1)
    .attr("transform",(d,i)=>"translate("+this.xCatScale(Math.floor(i/10))+","+(this.yScale(i % 10)+50)+")")

}

render(){
  return(
  <div><p style={{textAlign:"left"}}>{this.props.title}</p>
  <svg ref={node => this.node  = node}
          width = {this.props.size[0]} height = {this.props.size[1]}>
         </svg>;
  </div>
)}

};

export default DataViz;
