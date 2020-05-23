import React, {Component} from 'react';
// Does not contian d3 prefix when importing classes
import {scaleLinear, scaleBand, scaleOrdinal} from 'd3-scale';
import {range, max, group, sum, rollups} from 'd3-array';
import {keys, values} from 'd3-collection';
import {select,filter,  event as d3event} from 'd3-selection';
import {axisBottom, axisLeft} from 'd3-axis';
import {transition, interrupt} from 'd3-transition';
import {geoPath, geoEquirectangular, geoMercator} from 'd3-geo';
import {zoom} from 'd3-zoom';

class DataMap extends Component {
  constructor(props) {
    super(props);
    this.drawMapOutline = this.drawMapOutline.bind(this);
  }

  static defaultProps = {
    orientation: "horizontal"
  };


  componentDidMount() {
    const node = this.node;
    this.mapData = this.props.data;

    this.plot = select(node)
      //.attr("viewBox","0 0 500 500")
      /*
      .append("svg")
      .attr('width', this.props.size[0])
      .attr('height', this.props.size[1])
      .attr('padding', this.props.padding)
      */
      .append("g")
      .attr("class", "datamap")
      .attr('transform', "translate(" + 0+ "," + 0 + ")");



    this.drawMapOutline();
    //this.reshapeData();
    //this.createDataMap();
    //his.addTitle();
    //this.addSubTitle();
    // options for map
    this.centerXOffset =1;
    this.centerYOffset = 1;
    this.scale = 200;
    this.t = {
      x:10,
      y:10,
      k:1

    };

    this.selectedKeys = [];
    this.multiselectMode = 0;
    this.unfilterCount = this.props.unfilter;

  }

  componentDidUpdate() {
    this.drawMapOutline();
    this.moveToCountry();
    //this.reshapeData();
    //this.createScales();
    //this.updateAxis();
    //this.createDataMap();
    //this.updateSelectedBars();
  }

  reshapeData() {

    //sort data

    this.props.data.sort((a, b) => (a.key - b.key));

    this.seriesDataRollup = Array.from(rollups(this.props.data, v => sum(v, d => d.value), (d) => d.series), ([key, value]) => ({
      key,
      value
    }));

    if (this.props.keysort != 0) {
      this.seriesDataRollup.sort((a, b) => ((a.value > b.value) ? this.props.keysort : ((b.value > a.value) ? this.props.keysort * -1 : 0)));
    } else {
      this.seriesDataRollup.sort((a, b) => ((a.key > b.key) ? this.props.keysort : ((b.key > a.key) ? this.props.keysort * -1 : 0)));
    }

  }


  drawMapOutline(){

    var that = this;


    function zoomed(){

      that.t = d3event
          .transform;

      that.plot.selectAll(".mapBaseLayer")
          .selectAll("path")
          .attr("transform","translate("+[that.t.x,that.t.y]+")scale("+that.t.k+")");

    }


    this.zoom = zoom()
      .on("zoom",zoomed)


    this.projection = geoEquirectangular()
       .clipAngle(180) // important for shading interior of polygon!
       .center([this.centerXOffset, this.centerYOffset])
       .scale(this.scale)
       .translate([this.props.size[0]/2,this.props.size[1]/2]);

     this.mapPathProjection = geoPath()
       .projection(this.projection);

    this.plot
      .selectAll(".mapBaseLayer")
       .data(this.props.data,function(d){return d.properties.ADMIN})
       .exit()
       .remove()

   this.plot
      .selectAll(".mapBaseLayer")
      .attr("fill",(d)=> this.props.highlightCountries.indexOf(d.properties.ADMIN)>-1?"#ff7f0e":"#ababab")

    this.plot
       .selectAll(".mapBaseLayer")
       .filter((d)=>this.props.highlightCountries.indexOf(d.properties.ADMIN)>-1)
       .attr("fill","#ababab")
       .transition()
       .duration(1000)
       .attr("fill",(d)=> this.props.highlightCountries.indexOf(d.properties.ADMIN)>-1?"#ff7f0e":"#ababab")


     var countryGroups = this.plot
       .selectAll(".mapBaseLayer")
       .data(this.props.data,function(d){return d.properties.ADMIN})
       .enter()
       .append("g")
       .attr("class","mapBaseLayer")
       .attr("id",(d) => d.properties.ADMIN + "-mapBaseLayer")
       .call(this.zoom);


     var countries = countryGroups
       .append("path")
       .attr("d",d => this.mapPathProjection(d.geometry))

  };

  moveToCountry(){

  var selectedCountryPath = this.props.data.filter(d=>this.props.highlightCountries.indexOf(d.properties.ADMIN)>-1);
  var selectedContinentPath = this.props.data.filter(d=>this.props.continentCountries.indexOf(d.properties.ADMIN)>-1)
  var centeredCountryPath = this.props.data.filter(d=>d.properties.ADMIN=="Kenya");

  /*
  if(selectedContinentPath.length >0 ){
    var selCentroid = this.mapPathProjection.centroid(selectedContinentPath[0].geometry);
    var centeredCentroid =this.mapPathProjection.centroid(centeredCountryPath[0].geometry);
    var xDist1 = selCentroid[0]-centeredCentroid[0];
    var yDist1 = selCentroid[1]-centeredCentroid[1];
    //location of the country relative to the current projection
    var countryBounds = this.mapPathProjection.bounds(selectedCountryPath[0].geometry);

  }
  */

  if(selectedCountryPath.length >0 ){
    var selCentroid = this.mapPathProjection.centroid(selectedCountryPath[0].geometry);
    var centeredCentroid =this.mapPathProjection.centroid(centeredCountryPath[0].geometry);
    var xDist = selCentroid[0]-centeredCentroid[0];
    var yDist = selCentroid[1]-centeredCentroid[1];
    //location of the country relative to the current projection

    var countryBounds = this.mapPathProjection.bounds(selectedCountryPath[0].geometry);

    var s = 0.9/ Math.max(
      (countryBounds[1][0] - countryBounds[0][0])/this.props.size[0],
      (countryBounds[1][1] - countryBounds[0][1])/this.props.size[1]
    );

    console.log(countryBounds);
    console.log(selCentroid);
    console.log(this.mapPathProjection(s));
  }


  this.plot.selectAll(".mapBaseLayer")
    .selectAll("path")
    .transition("map-zoom")
    .duration(1000)
    .attr("transform","translate("+-xDist+","+-yDist+") scale("+1+")")


    //.filter((d)=>this.props.highlightCountries.indexOf(d.properties.ADMIN)>-1)


  //console.log(bounds);




  }

  addTitle() {
    this.plot.append("text")
      .text(this.props.title)
      .attr("class", "bar-chart-title")
      .attr("x", 0)
      .attr("y", -this.props.padding / 1.5)

  };


  addSubTitle() {
    this.plot.append("text")
      .text(this.props.subtitle)
      .attr("class", "bar-chart-subtitle")
      .attr("x", 0)
      .attr("y", -this.props.padding / 1.5)
      .attr("dy", "1.2em")

  };


  addXAxisLabel() {

    this.plot.append("text")
      .text(this.props.xAxisLabel)
      .attr("class", "x-axis-label")
      .attr("x", (this.props.size[0] - 2 * this.props.padding) / 2)
      .attr("y", (this.props.size[1] - 2 * this.props.padding) - (this.props.padding / 2) + this.props.padding)
      .attr("dy", "1em")
      .style("text-anchor", "middle")

  }

  addYAxisLabel() {

    this.plot.append("text")
      .text(this.props.yAxisLabel)
      .attr("class", "y-axis-label")
      .attr("x", -(this.props.size[0] - 2 * this.props.padding) / 2 + this.props.padding)
      .attr("y", -this.props.padding / 2)
      .attr("dy", "-0.5em")
      .style("text-anchor", "middle")
      .style("transform", "rotate(270deg)")

  }


  sendClicked(props, d) {

    // start the multi-select mode when ctrl is selected
    if (d3event.ctrlKey && this.multiselectMode == 0) {
      this.multiselectMode = 1;
      this.selectedKeys.push(d.key);
      props.parentCallback(this.selectedKeys);

      // continute multiselect mode as long as cntrl is selected
    } else if (d3event.ctrlKey && this.multiselectMode == 1) {
      var keyPos = this.selectedKeys.indexOf(d.key);
      // remove key if already in list
      if (keyPos > -1) {
        this.selectedKeys.splice(keyPos, 1);
      } else {
        this.selectedKeys.push(d.key);
      }
      props.parentCallback(this.selectedKeys);

      // end multiselect mode when cntrl is deselected
    } else if (this.multiselectMode == 1) {
      this.multiselectMode = 0;
      this.selectedKeys = [];
      props.parentCallback(this.selectedKeys);
    } else {
      // only filter one item, if already selected then deselect, otherwise send filter
      if (this.selectedKeys[0] == d.key) {
        this.selectedKeys = [];
        props.parentCallback(this.selectedKeys);
      } else {
        this.selectedKeys = [];
        this.selectedKeys.push(d.key);
        props.parentCallback(this.selectedKeys);
      }
    };

    this.updateSelectedBars();

  };


  render() {
    return ( <svg ref = {node => this.node = node} width = {this.props.size[0]} height = {this.props.size[1]} > < /svg>

    )
  }

}

export default DataMap;
