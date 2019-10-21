import React, {Component} from 'react';
import './App.css';
// Does not contian d3 prefix when importing classes
import {scaleLinear, scaleBand} from 'd3-scale';
import {range,max} from 'd3-array';
import {select} from 'd3-selection';
import {axisBottom, axisLeft} from 'd3-axis'
import {transition} from 'd3-transition'

class BarChart extends Component {
  constructor (props){
    super (props);
    this.createBarChart = this.createBarChart.bind(this);
}

componentDidMount(){
  const node = this.node;
  
  this.plot  = select(node)
                .append("g")
                .attr("id","shapes")
                .attr("transform", "translate(" + this.props.padding + "," + this.props.padding + ")");

  this.createScales();
  this.createAxis();
  this.createBarChart();
}

componentDidUpdate(){
  this.createScales();
  this.updateAxis();
  this.createBarChart();
}

createScales(){

  this.dataMax = max(this.props.data);
  this.yScale = scaleLinear()
    .domain([0, this.dataMax])
    .range([this.props.size[1] - 2* this.props.padding, 0]);
  this.yAxis = axisLeft().scale(this.yScale);
  this.xScale = scaleBand()
    .domain(range(0,this.props.data.length,1))
    .range([0, this.props.size[0] - 2* this.props.padding])
    .paddingInner(0.1);
  this.xAxis = axisBottom().scale(this.xScale);

}

createAxis(){

  this.plot
    .append('g')
    .attr("id", "x-axisGroup")
    .attr("class", "x-axis")
    .attr("transform", "translate(" + "0" + "," + ( this.props.size[1]- 2 * this.props.padding) + ")");

  this.plot
    .select(".x-axis")
    .transition()
    .duration(1000)
    .call(this.xAxis)


  this.plot.append("g")
    .attr("id", "y-axisGroup")
    .attr("class", "y-axis")
    .attr("transform", "translate(0,0)");

  this.plot.select(".y-axis")
    .transition()
    .duration(1000)
    .call(this.yAxis)

}

updateAxis(){

  this.plot
    .select(".x-axis")
    .attr("transform", "translate(" + "0" + "," + ( this.props.size[1]- 2 * this.props.padding) + ")");

  this.plot
    .select(".x-axis")
    .transition()
    .duration(1000)
    .call(this.xAxis);

  this.plot
    .select(".y-axis")
    .attr("transform", "translate(0,0)");

  this.plot.select(".y-axis")
    .transition()
    .duration(1000)
    .call(this.yAxis);


}


createBarChart(){

  const rect = this.plot
    .selectAll("rect")
    .data(this.props.data)

 rect
    .exit()
    .remove();

  rect
    .transition()
    .duration(1000)
    .attr("x", (d,i) => this.xScale(i)+1)
    .attr("y", d => this.yScale(d))
    .attr("height", d => this.props.size[1] - this.yScale(d) - 2* this.props.padding)
    .attr("width", this.xScale.bandwidth());

rect
    .enter()
    .append("rect")
    .attr("x",(d,i) => this.xScale(i)+1)
    .attr("y",d => this.props.size[1] - 2* this.props.padding)
    .attr("width", this.xScale.bandwidth())
    .on("mouseover", this.onHover)
    .on("mouseout", this.onHoverOut)
    .style("fill","#ababab")
    .transition()
    .duration(1000)
    .attr("x", (d,i) => this.xScale(i)+1)
    .attr("y", this.props.size[1] - 2*this.props.padding)
    .attr("width", this.xScale.bandwidth())


}

onHover(){
  select(this)
    .style("fill","orange");

}

onHoverOut(){
  select(this)
    .style("fill","#ababab");

}

render(){
  return <svg ref={node => this.node  = node}
          width = {this.props.size[0]} height = {this.props.size[1]}>
         </svg>;
  }

}

export default BarChart;
