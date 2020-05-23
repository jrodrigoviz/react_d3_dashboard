import React, {Component} from 'react';
// Does not contian d3 prefix when importing classes
import {scaleLinear, scaleOrdinal} from 'd3-scale';
import {range,max} from 'd3-array';
import {select} from 'd3-selection';
import {axisBottom, axisLeft} from 'd3-axis'
import {transition} from 'd3-transition'
import {curveLinearClosed, line,curve} from 'd3-shape'

class RadarChart extends Component {
  constructor (props){
    super (props);
    this.createRadarChart = this.createRadarChart.bind(this);
    this.height = this.props.size[1];
    this.width = this.props.size[0];
    this.padding = this.props.padding;
    this.data = this.props.data;
    this.r = this.props.r;
    this.curveInterpolation = curveLinearClosed;
    this.shapeFill = this.props.shapeFill;
    this.startingRadian = Math.PI/2;
    this.speed = this.props.speed;

}

componentDidMount(){
  const node = this.node;

  this.plot  = select(node)
                .append("g")
                .attr("id","shapes")
                .attr("transform", "translate(" + this.props.padding + "," + this.props.padding + ")");

  this.generatePolarScale();
  this.createRadarChart();
  this.createLines();
  this.addCenterCircle();

};

componentDidUpdate(){
  this.data = this.props.data;
  this.generatePolarScale();
  this.createRadarChart();
  this.updateLines();

};



generatePolarScale(){

  this.dataMaxValue = max(this.data, function(d) {
      return d.value ;
    });

  this.dimensionCount = this.data.length;
  this.dimensionRadianSpacing = (2*Math.PI)/this.dimensionCount;

  //normalize the data to the max of the values in the set
  this.yScale = scaleLinear()
      .domain([0,this.dataMaxValue])
      .range([0,this.r]);

  //map the dimensions to [0,dimensionCount] to create spacing 2*PI/dimensionCount in the chart
  this.xScale = scaleOrdinal()
  .domain(this.data.map(function(d){return d.key}))
  .range(range(0,this.dimensionCount,1));

  //using [-r,r] as the domain
  this.polarYScale = scaleLinear()
    .domain([-this.r,this.r])
    .range([this.props.size[1]- 2 * this.padding, 0]);

  this.polarXScale = scaleLinear()
  .domain([-this.r,this.r])
  .range([0, this.props.size[0] - 2 * this.padding]);

  this.yAxis = axisLeft().ticks(3).scale(this.polarYScale);
  this.xAxis = axisBottom().ticks(3).scale(this.polarXScale);

}


createAxis(){

  this.plot.append("g")
    .attr("id", "x-axisGroup")
    .attr("class", "x-axis")
    .attr("transform", "translate(" + "0" + "," + (this.height - 2 * this.padding) + ")");

  this.plot.select(".x-axis")
    .transition()
    .duration(this.speed)
    .call(this.xAxis);

  this.plot.append("g")
    .attr("id", "y-axisGroup")
    .attr("class", "y-axis")
    .attr("transform", "translate(0,0)");

  this.plot.select(".y-axis")
    .transition()
    .duration(this.speed)
    .call(this.yAxis);


}


addCenterCircle(){
  const that = this;

  //create chart reference point at center

  this.plot.append("circle")
  .attr("class",".chartCenter")
  .attr("cx",function(d){
      var r = 0
      return that.polarXScale(r);
  })
  .attr("cy",function(d){
      var r = 0
      return that.polarYScale(r);
  })
  .attr("r",1)
  .attr("fill","#a7a7a7");
};



createRadarChart(){

  const that = this;

  //find the vertices for the shape of the data

  const vertices = this.plot.selectAll(".chartVertex")
      .data(this.data,function(d){return d.key});

  const spokes = this.plot.selectAll(".chartSpokes")
      .data(this.data,function(d){return d.key});

  //remove any elements that don't have data
  vertices.exit().remove();
  spokes.exit().remove();


  //update any elements that have new data

  vertices
      .transition()
      .duration(this.speed)
      .attr("transform",function(d){
          var r = that.yScale(that.dataMaxValue);
          var theta = (that.dimensionRadianSpacing*that.xScale(d.key) + that.startingRadian) % (2*Math.PI);
          return "translate("+that.polarXScale(r*Math.cos(theta))+","+that.polarYScale(r*Math.sin(theta))+")";
      });

  vertices
      .selectAll("text")
      .transition().duration(this.speed)
      .attr("text-anchor",function(d){
          var theta = (that.dimensionRadianSpacing*that.xScale(d.key) + that.startingRadian) % (2*Math.PI);

          if(Math.cos(theta)<0){
              var text_anchor = "end"
          }else{
              var text_anchor = "start"
          };
          return text_anchor;
      })

  spokes
      .transition()
      .duration(this.speed)
      .attr("x2",function(d){
          var r = that.yScale(that.dataMaxValue);
          var theta = (that.dimensionRadianSpacing*that.xScale(d.key) + that.startingRadian) % (2*Math.PI);
          return that.polarXScale(r*Math.cos(theta));
      })
      .attr("y2",function(d){
          var r = that.yScale(that.dataMaxValue);
          var theta = (that.dimensionRadianSpacing*that.xScale(d.key) + that.startingRadian) % (2*Math.PI);
          return that.polarYScale(r*Math.sin(theta));
      });


  //add new elements

  const verticesGroups = vertices.enter()
      .append("g")
      .attr("class","chartVertex")
      .attr("transform",function(d){
          var r = that.yScale(that.dataMaxValue);
          var theta = (that.dimensionRadianSpacing*that.xScale(d.key) + that.startingRadian) % (2*Math.PI);

          return "translate("+that.polarXScale(r*Math.cos(theta))+","+that.polarYScale(r*Math.sin(theta))+")";
      });

  verticesGroups.append("circle")
      .attr("class","chartVertex")
      .attr("r",1)
      .attr("fill","#ababab");

  verticesGroups.append("text")
      .text(function(d){return d.key})
      .attr("text-anchor",function(d){
          var theta = (that.dimensionRadianSpacing*that.xScale(d.key) + that.startingRadian) % (2*Math.PI);

          if(Math.cos(theta)<0){
              var text_anchor = "end"
          }else{
              var text_anchor = "start"
          };
          return text_anchor;
      })
      .attr("font-size",15)

  spokes.enter().append("line")
      .attr("class","chartSpokes")
      .attr("x1",this.polarXScale(0))
      .attr("y1",this.polarYScale(0))
      .attr("x2",function(d){
          var r = that.yScale(that.dataMaxValue);
          var theta = (that.dimensionRadianSpacing*that.xScale(d.key) + that.startingRadian) % (2*Math.PI);
          return that.polarXScale(r*Math.cos(theta));
      })
      .attr("y2",function(d){
          var r = that.yScale(that.dataMaxValue);
          var theta = (that.dimensionRadianSpacing*that.xScale(d.key) + that.startingRadian) % (2*Math.PI);
          return that.polarYScale(r*Math.sin(theta));
      })
      .style("stroke-width",1)
      .style("stroke","#D0D0D0")
      .style("stroke-dasharray", ("1, 1"));

};


createLines(){

      var that = this;

      var outlineHalfFunction = line()
      .x(function(d){
          var r = that.yScale(that.dataMaxValue/2);
          var theta = (that.dimensionRadianSpacing*that.xScale(d.key) + that.startingRadian) % (2*Math.PI);
          return that.polarXScale(r*Math.cos(theta));
      })
      .y(function(d){
          var r = that.yScale(that.dataMaxValue/2);
          var theta = (that.dimensionRadianSpacing*that.xScale(d.key) + that.startingRadian) % (2*Math.PI);
          return that.polarYScale(r*Math.sin(theta));
      })
      .curve(curveLinearClosed)

      var outlineFullFunction = line()
      .x(function(d){
          var r = that.yScale(that.dataMaxValue);
          var theta = (that.dimensionRadianSpacing*that.xScale(d.key) + that.startingRadian) % (2*Math.PI);
          return that.polarXScale(r*Math.cos(theta));
      })
      .y(function(d){
          var r = that.yScale(that.dataMaxValue);
          var theta = (that.dimensionRadianSpacing*that.xScale(d.key) + that.startingRadian) % (2*Math.PI);
          return that.polarYScale(r*Math.sin(theta));
      })
      .curve(curveLinearClosed)

      var lineFunction = line()
      .x(function(d){
          var r = that.yScale(d.value);
          var theta = (that.dimensionRadianSpacing*that.xScale(d.key) + that.startingRadian) % (2*Math.PI);
          return that.polarXScale(r*Math.cos(theta));
      })
      .y(function(d){
          var r = that.yScale(d.value);
          var theta = (that.dimensionRadianSpacing*that.xScale(d.key) + that.startingRadian) % (2*Math.PI);
          return that.polarYScale(r*Math.sin(theta));
      })
      .curve(this.curveInterpolation)

      this.plot.append("path")
          .attr("class","radarPath")
          .attr("d",lineFunction(this.data))
          .attr("fill",this.shapeFill)
          .attr("stroke","#a7a7a7")
          .attr("stroke-width",1);

      this.plot.append("path")
          .attr("class","outlineHalfPath")
          .attr("d",outlineHalfFunction(this.data))
          .attr("fill","none")
          .attr("stroke","#DCDCDC")
          .attr("stroke-width",1)
          .style("stroke-dasharray", ("3, 3"));

          this.plot.append("path")
          .attr("class","outlineFullPath")
          .attr("d",outlineFullFunction(this.data))
          .attr("fill","none")
          .attr("stroke","#DCDCDC")
          .attr("stroke-width",1)
          .style("stroke-dasharray", ("3, 3"));



};


updateLines(){

    var that = this;

    var outlineHalfFunction = line()
    .x(function(d){
        var r = that.yScale(that.dataMaxValue/2);
        var theta = (that.dimensionRadianSpacing*that.xScale(d.key) + that.startingRadian) % (2*Math.PI);
        return that.polarXScale(r*Math.cos(theta));
    })
    .y(function(d){
        var r = that.yScale(that.dataMaxValue/2);
        var theta = (that.dimensionRadianSpacing*that.xScale(d.key) + that.startingRadian) % (2*Math.PI);
        return that.polarYScale(r*Math.sin(theta));
    })
    .curve(curveLinearClosed);

    var outlineFullFunction = line()
    .x(function(d){
        var r = that.yScale(that.dataMaxValue);
        var theta = (that.dimensionRadianSpacing*that.xScale(d.key) + that.startingRadian) % (2*Math.PI);
        return that.polarXScale(r*Math.cos(theta));
    })
    .y(function(d){
        var r = that.yScale(that.dataMaxValue);
        var theta = (that.dimensionRadianSpacing*that.xScale(d.key) + that.startingRadian) % (2*Math.PI);
        return that.polarYScale(r*Math.sin(theta));
    })
    .curve(curveLinearClosed);

    var lineFunction = line()
    .x(function(d){
        var r = that.yScale(d.value);
        var theta = (that.dimensionRadianSpacing*that.xScale(d.key) + that.startingRadian) % (2*Math.PI);
        return that.polarXScale(r*Math.cos(theta));
    })
    .y(function(d){
        var r = that.yScale(d.value);
        var theta = (that.dimensionRadianSpacing*that.xScale(d.key) + that.startingRadian) % (2*Math.PI);
        return that.polarYScale(r*Math.sin(theta));
    })
    .curve(this.curveInterpolation);

    this.plot.select(".radarPath")
        .transition().duration(this.speed)
        .attr("d",lineFunction(this.data));

    this.plot.select(".outlineHalfPath")
        .transition().duration(this.speed)
        .attr("d",outlineHalfFunction(this.data));

    this.plot.select(".outlineFullPath")
        .transition().duration(this.speed)
        .attr("d",outlineFullFunction(this.data));

};









render(){
  return <svg ref={node => this.node  = node}
          width = {this.props.size[0]} height = {this.props.size[1]}>
         </svg>;
  }

}

export default RadarChart;
