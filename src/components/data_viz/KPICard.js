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
                .attr("transform", "translate(" + this.props.padding + "," + this.props.padding + ")");

  this.aggregateData();
  this.createKPICard();
};

componentDidUpdate(){
  this.aggregateData();
  this.createKPICard();
};

aggregateData(){
  var summedData = sum(this.props.data.map((d)=>d.value))
  this.data = [{key:"summedData",value:summedData}];

};

createKPICard(){

  const kpiCard = this.plot
    .selectAll("text")
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
      select(this).text(Math.floor(i(t)));
    };
  });

  kpiCard
  .enter()
  .append("text")
  .attr("font-size",40)
  .style("text-align","center")
  .text((d)=>d.value);

}


render(){
  return <svg ref={node => this.node  = node}
          width = {this.props.size[0]} height = {this.props.size[1]}>
         </svg>;
  }

}

export default KPICard;
