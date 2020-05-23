import React, {Component} from 'react';
// Does not contian d3 prefix when importing classes
import {scaleLinear, scaleBand} from 'd3-scale';
import {range,max,sum} from 'd3-array';
import {keys,values} from 'd3-collection';
import {select} from 'd3-selection';
import {axisBottom, axisLeft} from 'd3-axis';
import {transition} from 'd3-transition';
import {interpolate} from 'd3-interpolate';


class KPICard extends Component {
  constructor (props){
    super (props);
    this.createKPICard = this.createKPICard.bind(this);

};

componentDidMount(){
  const node = this.node;

  this.plot  = select(node)
                .append("g")
                .attr("id","shapes")
                .attr("transform", "translate(" + this.props.padding/2 + "," + this.props.padding*1.5 + ")");

  this.aggregateData();
  this.createKPICard();
  this.addTitle();

};

componentDidUpdate(){
  this.aggregateData();
  this.createKPICard();
};

aggregateData(){
  var summedData = sum(this.props.data.map((d)=>d.value))
  this.data = [{key:"summedData",value:summedData,decimal:this.props.decimal}];

};

createKPICard(){

  const kpiCard = this.plot
    .selectAll(".kpi-text")
    .data(this.data,(d)=>d.key);

  kpiCard
  .exit()
  .remove();

  kpiCard
  .transition()
  .duration(this.props.speed)
  .tween("text",function(d){
    var i = interpolate(parseInt(select(this).text()),d.value);
    return function(t){
      var decimal = select(this).data()[0].decimal;
      select(this).text(i(t).toFixed(decimal));
    };
  });

  kpiCard
  .enter()
  .append("text")
  .attr("class","kpi-text")
  .attr("font-size",40)
  .attr("text-anchor","start")
  .style("text-align","right")
  .text((d)=>d.value);

}

addTitle(){

  var textGroup = select(this.node)
    .append("g")
    .attr("transform","translate(0,"+this.props.padding/2+")");

 textGroup
    .append("text")
    .attr("class","kpi-title")
    .text(this.props.title);



}

render(){
  return <svg ref={node => this.node  = node}
          width = {this.props.size[0]} height = {this.props.size[1]}>
         </svg>;
  }

}

export default KPICard;
