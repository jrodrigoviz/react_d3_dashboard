import React, {Component} from 'react';
// Does not contian d3 prefix when importing classes
import {scaleLinear, scaleOrdinal} from 'd3-scale';
import {range,max} from 'd3-array';
import {select} from 'd3-selection';
import {transition} from 'd3-transition'

class DataTable extends Component {
  constructor (props){
    super (props);
    this.updateDataTable = this.updateDataTable.bind(this);
    this.height = this.props.size[1];
    this.width = this.props.size[0];
    this.padding = this.props.padding;
    this.data = this.props.data;
    this.title = this.props.title;

}

componentDidMount(){
  const node = this.node;

  this.plot  = select(node);

  this.plot.append("th").text("key");
  this.plot.append("th").text("dim");
  this.plot.append("th").text("value");
  this.updateDataTable();
};

componentDidUpdate(){
  this.data = this.props.data;
  this.updateDataTable();

};


updateDataTable(){

  const tableRows = this.plot.selectAll("tr")
    .data(this.data,(d)=>d.key);

  tableRows.exit()
    .remove();

  tableRows.enter()
    .append("tr")
    .style("opacity",0)
    .transition()
    .duration(this.props.speed)
    .style("opacity",1)
    .each(function(d){
      select(this).append("td").attr("class","col1")
        .text(d.key);
      select(this).append("td").attr("class","col2")
        .text(d.dim);
      select(this).append("td").attr("class","col3")
        .text(d.value);
    });



};

render(){
  return <table class={this.props.className} ref={node => this.node  = node}  style= {{display:"inline"}}
          width = {this.props.size[0]} height = {this.props.size[1]}>
          <caption>{this.props.title}</caption>
         </table>;
  }

}

export default DataTable;
