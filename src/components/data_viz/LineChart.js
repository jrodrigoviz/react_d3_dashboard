import React, {Component} from 'react';
import {scaleLinear, scaleTime,scaleOrdinal} from 'd3-scale';
import {range,max,min,extent,group} from 'd3-array';
import {curveBasis,curveLinear,curveCardinal,curveMonotoneX, line as d3Line} from 'd3-shape';
import {keys,values} from 'd3-collection';
import {select,selectAll,local} from 'd3-selection';
import {axisBottom, axisLeft} from 'd3-axis';
import {transition} from 'd3-transition';
import {easeCubic} from 'd3-ease';
import {format} from 'd3-format';

class LineChart extends Component {
  constructor (props){
    super (props);
    this.createLineGraph = this.createLineGraph.bind(this);


}

static defaultProps = {
  orientation: "horizontal",
  yAxisLabelLocation:'left',
  showLegend: true,
  showXAxis: true,
  showXAxis: true,
  ticks:3,

};

componentDidMount(){
  const node = this.node;

  this.plot  = select(node)
                .append("g")
                .attr("id","line")
                .attr("transform", "translate(" + this.props.padding + "," + this.props.padding + ")");

  this.reshapeData();
  this.createScales();
  this.createAxis();
  this.createLineGraph();
  this.addTitle();
  this.addSubTitle();
  this.addXAxisLabel();
  this.addYAxisLabel();
  this.addLegend();
}

componentDidUpdate(){
  
  this.reshapeData();
  this.createScales();
  this.updateAxis();
  this.createLineGraph();
  this.addSubTitle();
  this.addXAxisLabel();
  this.addYAxisLabel();
  this.addLegend();
}

reshapeData(){

  //sort data
  this.props.data.sort((a,b)=> (a.key-b.key));

  this.seriesData  = Array.from(group(this.props.data, (d)=> d.series, (d)=>d.key),([key, innerValue]) =>{

    var value = Array.from(innerValue,([key,v])=>{
      var value = v[0].value;

      return {key,value}
    });
    return {key,value};
  });

  this.seriesData.sort((a,b)=>((a.key > b.key) ? 1 : ((b.key > a.key) ? -1 : 0)));

}


createScales(){

  this.dataYMax = max(this.props.data.map((d)=>d.value)) *1.2;
  this.dataYMin = min(this.props.data.map((d)=>d.value)) *1.2;
  this.dataXMax = max(this.props.data.map((d)=>d.key));

  this.yScale = scaleLinear()
    .domain([0,this.dataYMax])
    .range([this.props.size[1] - 2* this.props.padding, 0]);
  this.yAxis = axisLeft().scale(this.yScale).tickFormat(format(".0s"));

  this.xScale = scaleTime()
    .domain(extent(this.props.data.map((d)=>d.key)))
    .range([0, this.props.size[0] - 2* this.props.padding])

  this.xAxis = axisBottom().scale(this.xScale).ticks(this.props.ticks);

  this.colorPalette = ["#1f77b4",
      "#ff7f0e",
      "#a8a8a8",
      "#9467bd",
      "#8c564b",
      "#e377c2",
      "#7f7f7f",
      "#bcbd22",
      "#17becf"
  ];

  this.colorScale = scaleOrdinal()
  .domain(this.seriesData.map((d)=>d.key))
  .range(this.colorPalette);

};

createAxis(){

if(this.props.showXAxis == true){

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

    };

if(this.props.showYAxis == true){

  this.plot.append("g")
    .attr("id", "y-axisGroup")
    .attr("class", "y-axis")
    .attr("transform", "translate(0,0)");

  this.plot.select(".y-axis")
    .transition()
    .duration(this.props.speed)
    .call(this.yAxis)

    };

}

updateAxis(){

  if(this.props.showXAxis == true){

  this.plot
    .select(".x-axis")
    .attr("transform", "translate(" + "0" + "," + ( this.props.size[1]- 2 * this.props.padding) + ")");

  this.plot
    .select(".x-axis")
    .transition()
    .duration(this.props.speed)
    .call(this.xAxis);

    };

  if(this.props.showYAxis == true){

    this.plot
      .select(".y-axis")
      .attr("transform", "translate(0,0)");

    this.plot.select(".y-axis")
      .transition()
      .duration(this.props.speed)
      .call(this.yAxis);

    }


}


createLineGraph(){

  const eachLine = local();

  //kept in place of needing "this" context for local variables
  var that = this

  var line = this.plot.selectAll("g[id^=series]")
      .data(this.seriesData,(d)=>d.key);

  var lineFunction = d3Line()
      .curve(curveMonotoneX)
      .x((d)=>(this.xScale(d.key)))
      .y((d)=>(this.yScale(d.value)));

  //remove any elements that do not have a match in the selection
  line.exit().remove();

  //update any existing elements with new data
  selectAll("g[id^=series]")
    .selectAll("path")
    .each(function(d){eachLine.set(this,d)})
    .attr("d",function(d){return lineFunction(eachLine.get(this).value)})
    .attr("fill","none")
    .attr("stroke",function(d){return that.colorScale(eachLine.get(this).key)})
    .attr("stroke-width", "2px");

  //for new data insert a group for each series and set each group with the data
  var lineGroups = line.enter()
    .append("g")
    .attr("id",(d) => "series-"+d.key)
    .each(function(d){eachLine.set(this,d)});

 //for each group, get the local variable containing the data and feed it into lineFunction to draw the path
 //TODO: Option for shifting the path to simulate streaming data instead of redrawing
  lineGroups.append("path")
    .attr("id",function(d){return "series-"+eachLine.get(this).key+"-path"})
    .attr("d",function(d){return lineFunction(eachLine.get(this).value)})
    .attr("fill","none")
    .attr("stroke",function(d){return that.colorScale(eachLine.get(this).key)})
    .attr("stroke-width", "2px");

    this.drawLines();

};

addTitle(){
  this.plot.append("text")
    .text(this.props.title)
    .attr("class","line-chart-title")
    .attr("x",0)
    .attr("y",-this.props.padding/1.5)

};

drawLines(){
  //after everything has been rendered animate the lines by adding transitions

  selectAll("path[id$=path]").each(function(d) {
    var pathLength = select(this).node().getTotalLength();

    select(this)
      .attr("stroke-dasharray", pathLength + " " + pathLength)
      .attr("stroke-dashoffset", pathLength)
      .transition()
      .duration(2000)
      .ease(easeCubic)
      .attr("stroke-dashoffset", 0)

    });
};

addSubTitle(){
  this.plot.select(".line-chart-subtitle").remove()

  this.plot.append("text")
    .text(this.props.subtitle)
    .attr("class","line-chart-subtitle")
    .attr("x",0)
    .attr("y",-this.props.padding/1.5)
    .attr("dy","1.2em")

};

addXAxisLabel(){
  this.plot.select(".x-axis-label").remove()

  this.plot.append("text")
    .text(this.props.xAxisLabel)
    .attr("class","x-axis-label")
    .attr("x",(this.props.size[0] - 2*this.props.padding)/2)
    .attr("y",(this.props.size[1] - 2*this.props.padding) - (this.props.padding/2) + this.props.padding)
    .attr("dy","1em")
    .style("text-anchor","middle")

};

addYAxisLabel(){
  this.plot.select(".y-axis-label").remove()

  this.plot.append("text")
    .text(this.props.yAxisLabel)
    .attr("class","y-axis-label")
    .attr("x",-(this.props.size[1] - this.props.padding )/2)
    .attr("y",-this.props.padding /2)
    .attr("dy","-0.5em")
    .style("text-anchor","middle")
    .style("transform","rotate(270deg)")

};

addLegend(){

  if(this.props.showLegend == true){

    this.plot.select(".line-graph-legend").remove();

    var that = this;


    var legend = this.plot.append("g")
      .attr("class","line-graph-legend");

    var legendRectGroups = legend.selectAll("g")
      .data(this.seriesData)
      .enter()
      .append("g");

    //Calculate the widths of text pre-render

    var maxTextWidth = 0;
    var totalTextWidth = 0;

    legendRectGroups.append("text")
      .text((d)=>(d.key))
      .each(function(d,i){
        that.seriesData[i]["textWidth"] = this.getComputedTextLength();
        maxTextWidth = (this.getComputedTextLength()>maxTextWidth ? this.getComputedTextLength(): maxTextWidth  );
        totalTextWidth = totalTextWidth + this.getComputedTextLength()
        this.remove();
      })

      var yOffset = 10;

      legendRectGroups.append("circle")
        .attr("class","legend-box")
        .attr("r",3)
        .attr("cy",5)
        .attr("fill",(d)=>(this.colorScale(d.key)));

      legendRectGroups.append("text")
        .attr("class","legend-box-text")
        .attr("x",15)
        .attr("y",10)
        .text((d)=>d.key)
        .attr("fill",(d)=>(this.colorScale(d.key)));

      legendRectGroups
        .attr("transform",(d,i)=> {
          var translation ="";
          if(this.props.legendOrientation=="vertical"){
          translation = "translate(0,"+(i*yOffset*1.5)+")";
          totalTextWidth = maxTextWidth;
        } else {
          translation = "translate("+ (i==0 ? 0: this.seriesData.slice(0,i).reduce((t,b)=>t+b.textWidth +25,0) ) +",0)";
        }
        return translation
      })

    legend.attr("transform","translate("+(this.props.size[0]- (2*this.props.padding) - (totalTextWidth + (3*25)))+","+(-this.props.padding/2 +20)+ ")")
  }

};


render(){
  return <svg ref={node => this.node  = node}
          width = {this.props.size[0]} height = {this.props.size[1]}>
         </svg>;
  }

}

export default LineChart;
