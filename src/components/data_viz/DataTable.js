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
    this.handleClick = this.props.onClick;

}

static defaultProps = {
  ticks:3,
  speed:500,
  columnAlias:{},
  parentCallback:()=>{},
  filters:{}

};

componentDidMount(){
  const node = this.node;
  this.plot  = select(node);
  this.updateDataTable();
};

componentDidUpdate(){

  // if columnOrder is defined then rebuild the dataset accordingly
  this.aliasLength = Object.keys(this.props.columnAlias).length
  this.aliasKeys = Object.keys(this.props.columnAlias)

  this.data = this.props.data

  this.updateDataTable();
  this.updateDataTableFilters();

};

updateDataTable(){

  const tableHeaders = this.plot.selectAll(".headerRow")
     .data([this.data[0]],d=>d.key)

  tableHeaders.exit()
    .remove();

  tableHeaders
    .enter()
    .append("tr")
    .attr("class","headerRow")
    .each((d,i,node) => {
        if(this.aliasLength>0){
          for(var j=0;j<this.aliasLength; j++){
            select(node[i]).append("th").attr("class",d=> "col-"+Object.keys(d)[j])
              .text(this.props.columnAlias[this.aliasKeys[j]]);
          }
        }else{
          for(const key of Object.keys(d)){
            select(node[i]).append("th").attr("class","col-"+key)
              .text(key)
          }
        }
      })
      
  const tableRows = this.plot.selectAll("[class^=tblRow]")
    .data(this.data,d=>d.key);

  tableRows.exit()
    .remove();

  tableRows
      .style("opacity",1)
      .transition('data-table-update')
      .duration(this.props.speed)
      .style("opacity",1)
      .each((d,i,node) => {
        if(this.aliasLength>0){
          for(var j=0;j<this.aliasLength; j++){
            select(node[i]).selectAll("col-"+this.aliasKeys[j])
            .text(d[this.aliasKeys[j]])
          }
        }else{
        for(const key of Object.keys(d)){
          select(node[i]).selectAll("col-"+key)
            .text(d[key])
        }
      }
    });


  tableRows
    .enter()
    .append("tr")
    .attr("class","tblRow")
    .style("opacity",0)
    .transition('data-table-enter')
    .duration(this.props.speed)
    .style("opacity",1)
    .each((d,i,node) => {
      if(this.aliasLength>0){
        for(var j=0;j<this.aliasLength; j++){
          select(node[i]).append("td").attr("class","col-"+this.aliasKeys[j] )
          .on("click",(d,k,node2)=>{
            this.props.parentCallback(d);
          })
          .text(d[this.aliasKeys[j]])
        }
      }else{
      for(const key of Object.keys(d)){
        select(node[i]).append("td").attr("class","col-"+key)
          .text(d[key])
      }
    }
    });
  
    
  // Keep the header the first in the table
  this.plot.selectAll(".headerRow").lower()

};

updateDataTableFilters(){

  const tableRows = this.plot.selectAll("[class^=tblRow]")

  tableRows
    .each((d,i,node)=>{
      if(d.key == this.props.filters){
        select(node[i]).attr("class","tblRow-selected")
      }else{
        select(node[i]).attr("class","tblRow")
      }
    })

  this.plot.selectAll(".headerRow").lower()

}


render(){
  return <table class={this.props.className} ref={node => this.node  = node} 
           height = {this.props.size[1]}>
          <caption style= {{textAlign:"left"}}>{this.props.title}</caption>
         </table>;
  }

}

export default DataTable;
