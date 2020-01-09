import React, {Component} from 'react';
// Does not contian d3 prefix when importing classes
import {scaleLinear, scaleBand,scaleOrdinal} from 'd3-scale';
import {range,max} from 'd3-array';
import {keys,values} from 'd3-collection';
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
  this.addTitle();
  this.addSubTitle();
  this.addXAxisLabel();
  this.addYAxisLabel();

}

componentDidUpdate(){
  this.createScales();
  this.updateAxis();
  //this.createBarChart();
}

createScales(){

  this.dataMax = max(this.props.data.map((d)=>d.value))*1.2;

  this.yScale = scaleLinear()
    .domain([0, this.dataMax])
    .range([this.props.size[1] - 2* this.props.padding, 0]);
  this.yAxis = axisLeft().scale(this.yScale);
  this.xScale = scaleBand()
    .domain(this.props.data.map((d)=>d.key))
    .range([0, this.props.size[0] - 2* this.props.padding])
    .paddingInner(0.1);
  this.xAxis = axisBottom().scale(this.xScale);

  this.colorPalette = [
    {
    "key":1,
    "color": "#1f77b4"
    },
    {
      "key":2,
      "color": "#ff7f0e"
    },
    {
      "key":3,
      "color": "#2ca02c"
    },
    {
      "key":4,
      "color": "#9467bd"
    },
    {
      "key":5,
      "color": "#8c564b"
    },
    {
      "key":6,
      "color": "#e377c2"
    },
    {
      "key":7,
      "color": "#7f7f7f"
    },
    {
      "key":8,
      "color": "#bcbd22"
    },
    {
      "key":9,
      "color": "#17becf"
    }
  ];

  this.colorScale = scaleOrdinal()
  .domain(range(1,10))
  .range(this.colorPalette.map(function(d) {
    return d.color;
  }));

};

createAxis(){

  this.plot
    .append('g')
    .attr("id", "x-axisGroup")
    .attr("class", "x-axis")
    .attr("transform", "translate(" + "0" + "," + ( this.props.size[1]- 2 * this.props.padding) + ")");

  this.plot
    .select(".x-axis")
    .transition()
    .duration(this.props.speed)
    .call(this.xAxis)


  this.plot.append("g")
    .attr("id", "y-axisGroup")
    .attr("class", "y-axis")
    .attr("transform", "translate(0,0)");

  this.plot.select(".y-axis")
    .transition()
    .duration(this.props.speed)
    .call(this.yAxis)

}

updateAxis(){

  this.plot
    .select(".x-axis")
    .attr("transform", "translate(" + "0" + "," + ( this.props.size[1]- 2 * this.props.padding) + ")");

  this.plot
    .select(".x-axis")
    .transition()
    .duration(this.props.speed)
    .call(this.xAxis);

  this.plot
    .select(".y-axis")
    .attr("transform", "translate(0,0)");

  this.plot.select(".y-axis")
    .transition()
    .duration(this.props.speed)
    .call(this.yAxis);


}


createBarChart(){

  const rect = this.plot
    .selectAll("rect")
    .data(this.props.data,(d)=>d.key);

 rect
    .exit()
    .transition()
    .duration(900)
    .style("opacity",0)
    .remove();

  rect
    .transition()
    .duration(this.props.speed)
    .attr("x", (d) => this.xScale(d.key)+1)
    .attr("y", d => this.yScale(d.value))
    .attr("height", d => this.props.size[1] - this.yScale(d.value) - 2* this.props.padding)
    .attr("width", this.xScale.bandwidth());

rect
    .enter()
    .append("rect")
    .attr("x",(d) => this.xScale(d.key)+1)
    .attr("y",d => this.props.size[1] - 2* this.props.padding)
    .attr("width", this.xScale.bandwidth())
    .on("mouseover", this.onHover)
    .on("mouseout", this.onHoverOut)
    .style("fill",(d) => "#ababab")
    .transition()
    .duration(this.props.speed)
    .attr("x", (d) => this.xScale(d.key)+1)
    .attr("y", d => this.yScale(d.value))
    .attr("height", d => this.props.size[1] - this.yScale(d.value) - 2* this.props.padding)
    .attr("width", this.xScale.bandwidth())


}

addTitle(){
  this.plot.append("text")
    .text(this.props.title)
    .attr("class","bar-chart-title")
    .attr("x",0)
    .attr("y",-this.props.padding/1.5)

};


addSubTitle(){
  this.plot.append("text")
    .text(this.props.subtitle)
    .attr("class","bar-chart-subtitle")
    .attr("x",0)
    .attr("y",-this.props.padding/1.5)
    .attr("dy","1.2em")

};


addXAxisLabel(){

  this.plot.append("text")
    .text(this.props.xAxisLabel)
    .attr("class","x-axis-label")
    .attr("x",(this.props.size[0] - 2*this.props.padding)/2)
    .attr("y",(this.props.size[1] - 2*this.props.padding) - (this.props.padding/2) + this.props.padding)
    .attr("dy","1em")
    .style("text-anchor","middle")

}

addYAxisLabel(){

  this.plot.append("text")
    .text(this.props.yAxisLabel)
    .attr("class","y-axis-label")
    .attr("x",-(this.props.size[0] - 2*this.props.padding)/2 + this.props.padding)
    .attr("y",-this.props.padding/2)
    .attr("dy","-0.5em")
    .style("text-anchor","middle")
    .style("transform","rotate(270deg)")

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
