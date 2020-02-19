import React, {Component} from 'react';
// Does not contian d3 prefix when importing classes
import {scaleLinear, scaleBand,scaleOrdinal} from 'd3-scale';
import {range,max,group} from 'd3-array';
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

  this.reshapeData();
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


reshapeData(){
  // group data by series
  this.seriesData  = Array.from(group(this.props.data, (d)=> d.series, (d)=>d.key),([key, innerValue]) =>{
    var value = Array.from(innerValue,([key,value])=>{
      var value = value[0].value;

      return {key,value}
    });
    return {key,value};
  });

  console.log(this.seriesData);

}


createScales(){

  this.dataMax = max(this.seriesData.map((d)=>(d.value.map((d)=>(d.value)))).flat().filter((v,i,a) => a.indexOf(v)===i))*1.2;

  this.seriesMax = max(this.seriesData.map((d)=>d.value.length));

  this.yScale = scaleLinear()
    .domain([0, this.dataMax])
    .range([this.props.size[1] - 2* this.props.padding, 0]);
  this.yAxis = axisLeft().scale(this.yScale);

  this.xScale = scaleBand()
    .domain(this.seriesData.map((d)=>d.key).sort((a,b)=>a-b))
    .range([0, this.props.size[0] - 2* this.props.padding])
    .paddingInner(0.5)
    .paddingOuter(0.1);

  this.xAxis = axisBottom().scale(this.xScale);

  this.uniqueKeysArr = this.seriesData.map((d)=>(d.value.map((d)=>(d.key))))
    .flat()
    .filter((v,i,a) => a.indexOf(v)===i)
    .sort((a,b)=>a-b);

  this.xInnerScale = scaleBand()
    .domain(this.uniqueKeysArr)
    .range([0, this.xScale.bandwidth()])
    .paddingInner(0.05);

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
      "color": "#a8a8a8"
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

  const rectSeries = this.plot
    .selectAll(".series")
    .data(this.seriesData,(d)=>d.key)
    .enter()
    .append("g")
    .attr("transform",(d) => {
      var xTranslate = this.xScale(d.key);
      return "translate("+xTranslate+",0)"
    })

 const rect = rectSeries.selectAll("rect")
    .data((d)=>d.value)

 rect
    .exit()
    .transition()
    .duration(900)
    .style("opacity",0)
    .remove();

  rect
    .transition()
    .duration(this.props.speed)
    .attr("x", (d) => this.xInnerScale(d.value.map((d)=> d.key)))
    .attr("y", d => this.yScale(d.value))
    .attr("height", d => this.props.size[1] - this.yScale(d.value) - 2* this.props.padding)
    .attr("width", this.xScale.bandwidth());

rect
    .enter()
    .append("rect")
    .attr("x",(d) => this.xInnerScale(d.key))
    .attr("y",(d) => this.props.size[1] - 2* this.props.padding)
    .attr("width", this.xInnerScale.bandwidth())
    .on("mouseover", this.onHover)
    .on("mouseout", (d, i ,nodes) => this.onHoverOut(i, nodes[i]))
    .style("fill",(d,i) => this.colorScale(i+1))
    .transition()
    .duration(this.props.speed)
    .attr("y", d => this.yScale(d.value))
    .attr("height", (d,i) => this.props.size[1] - this.yScale(d.value) - 2* this.props.padding)
    .attr("width", this.xInnerScale.bandwidth())


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

onHoverOut(i, node){

  select(node)
  .transition()
  .duration(500)
  .style("fill",this.colorScale(i+1));

}

render(){
  return <svg ref={node => this.node  = node}
          width = {this.props.size[0]} height = {this.props.size[1]}>
         </svg>;
  }

}

export default BarChart;
