import React, {Component} from 'react';
// Does not contian d3 prefix when importing classes
import {scaleLinear, scaleBand, scaleOrdinal} from 'd3-scale';
import {range, max, group, sum, rollups} from 'd3-array';
import {keys, values} from 'd3-collection';
import {select, filter, event as d3event} from 'd3-selection';
import {axisBottom, axisLeft} from 'd3-axis';
import {transition, interrupt} from 'd3-transition';
import {geoPath, geoEquirectangular, geoMercator} from 'd3-geo';
import {zoom, zoomTransform, zoomIdentity} from 'd3-zoom';
import rewind from '@mapbox/geojson-rewind';

class DataMap extends Component {
  constructor(props) {
    super(props);
    this.drawMapOutline = this
      .drawMapOutline
      .bind(this);
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
      .attr("id", "zoomTransform")
      .append("g")
      .attr("class", "dataMap")

    this.drawMapOutline();
    //this.reshapeData();
    //this.createDataMap();
    //his.addTitle();
    //this.addSubTitle();
    // options for map
    this.centerXOffset = 1;
    this.centerYOffset = 1;
    this.scale = 200;
    this.t = {
      x: 10,
      y: 10,
      k: 1

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

    this
      .props
      .data
      .sort((a, b) => (a.key - b.key));

    this.seriesDataRollup = Array.from(rollups(this.props.data, v => sum(v, d => d.value), (d) => d.series), ([key, value]) => ({key, value}));

    if (this.props.keysort != 0) {
      this
        .seriesDataRollup
        .sort((a, b) => (
          (a.value > b.value)
          ? this.props.keysort
          : (
            (b.value > a.value)
            ? this.props.keysort * -1
            : 0)));
    } else {
      this
        .seriesDataRollup
        .sort((a, b) => (
          (a.key > b.key)
          ? this.props.keysort
          : (
            (b.key > a.key)
            ? this.props.keysort * -1
            : 0)));
    }

  }

  drawMapOutline() {

    var that = this;

    function zoomed() {

      that.t = d3event.transform;

      select(that.node)
        .select(".dataMap")
        .attr("transform", "translate(" + [that.t.x, that.t.y] + ")scale(" + that.t.k + ")");

    }

    this.zoom = zoom().on("zoom", zoomed)

    select(that.node).select("#zoomTransform")
    // zoom event is bound to the upper most g container #zoomTransofrm which propogates
    // the zoom state to the child container datamap to keep track of a global transform
      .call(this.zoom);

    this.projection = geoEquirectangular()
      .clipAngle(180) // important for shading interior of polygon!
      .scale(this.scale)

    this.mapPathProjection = geoPath().projection(this.projection);

    // remove any groups that were removed from the data
    this
      .plot
      .selectAll(".mapBaseLayer")
      .data(this.props.data, function(d) {
        return d.properties.ADMIN
      })
      .exit()
      .remove()

    // update all country groups to reset stroke and highlights changes
    this
      .plot
      .selectAll(".mapBaseLayer")
      .select("path")
      .transition()
      .duration(1000)
      .attr(
        "stroke-width", (d) => this.props.highlightCountries.indexOf(d.properties.ADMIN) > -1
        ? "1px"
        : "0px")
      .attr(
        "fill", (d) => this.props.highlightCountries.indexOf(d.properties.ADMIN) > -1
        ? "#ff7f0e"
        : "#ababab")

    // update only filtered country groups with stroke and highlight changes
    this
      .plot
      .selectAll(".mapBaseLayer")
      .select("path")
      .filter((d) => this.props.highlightCountries.indexOf(d.properties.ADMIN) > -1)
      .attr("fill", "#ababab")
      .transition()
      .duration(1000)
      .attr(
        "fill", (d) => this.props.highlightCountries.indexOf(d.properties.ADMIN) > -1
        ? "#ff7f0e"
        : "#ababab")

    // add new country groups
    var countryGroups = this
      .plot
      .selectAll(".mapBaseLayer")
      .data(this.props.data, function(d) {
        return d.properties.ADMIN
      })
      .enter()
      .append("g")
      .attr("class", "mapBaseLayer")
      .attr("id", (d) => d.properties.ADMIN + "-mapBaseLayer")

    // draw the polygons based on the GeoJSON
    var countries = countryGroups
      .append("path")
      .attr("d", d => {
        return this.mapPathProjection(rewind(d.geometry, true))
      });

  };

  moveToCountry() {

    var selectedCountryPath = this
      .props
      .data
      .filter(d => this.props.highlightCountries.indexOf(d.properties.ADMIN) > -1);

    var selectedContinentPath = this
      .props
      .data
      .filter(d => this.props.continentCountries.indexOf(d.properties.ADMIN) > -1)

    var s = 1;
    var translateArr = [0,0];

    if (selectedCountryPath.length > 0) {
      var boundLL = [];
      var boundUR = [];

      for (const country of selectedCountryPath) {
        var bounds = this
          .mapPathProjection
          .bounds(country.geometry);
        boundLL.push(bounds[0]);
        boundUR.push(bounds[1]);

        var countryBounds = [
          boundLL.reduce(
            (a, b) => a[0] < b[0]
            ? a
            : b),
          boundUR.reduce(
            (a, b) => a[1] > b[1]
            ? a
            : b)
        ]
        //location of the country relative to the current projection

        var dx = countryBounds[1][0] - countryBounds[0][0];
        var dy = countryBounds[1][1] - countryBounds[0][1];
        var x = (countryBounds[0][0] + countryBounds[1][0]) / 2;
        var y = (countryBounds[0][1] + countryBounds[1][1]) / 2;
        var s = 0.35/ Math.max(dx / this.props.size[0], dy / this.props.size[1]);
        var translateArr = [
          (this.props.size[0] / 2) - s * x,
          (this.props.size[1] / 2) - s * y
        ];
      }

    }


      // if navigated programatically then reset the zoom state to the programmatic zoom to avoid jumps
      select(this.node)
        .select("#zoomTransform")
        .call(zoom().transform, zoomIdentity.translate(translateArr[0], translateArr[1]).scale(s));

      // zoom to the selected regions bounding box
      select(this.node)
        .select(".dataMap")
        .transition()
        .duration(1000)
        .attr("transform", "translate(" + translateArr[0] + "," + translateArr[1] + ") scale(" + s + ")");


      this.plot
        .selectAll(".mapBaseLayer")
        .select("text")
        .remove();

      // find the centroid of each country and add text to highlight the country name
      this
        .plot
        .selectAll(".mapBaseLayer")
        .filter((d) => this.props.highlightCountries.indexOf(d.properties.ADMIN) > -1)
        .append("text")
        .text(d => d.properties.ADMIN)
        .attr("font-size", (d) => 0.1*(this.mapPathProjection.bounds(d.geometry)[1][1] - this.mapPathProjection.bounds(d.geometry)[0][1]))
        .attr("x", (d,i,node) => this.mapPathProjection.bounds(d.geometry)[0][0] +  0.25 *(this.mapPathProjection.bounds(d.geometry)[1][0] - this.mapPathProjection.bounds(d.geometry)[0][0] ) )
        .attr("y", (d) => this.mapPathProjection.centroid(d.geometry)[1]);

      // add the effects for highlighin
      this
        .plot
        .selectAll(".mapBaseLayer")
        .selectAll("path")
        .attr("vector-effect", "non-scaling-stroke")
        .filter((d) => this.props.highlightCountries.indexOf(d.properties.ADMIN) > -1)
        .attr("stroke", "#000")
        .attr("stroke-width", "2px");

  }

  addTitle() {
    this
      .plot
      .append("text")
      .text(this.props.title)
      .attr("class", "bar-chart-title")
      .attr("x", 0)
      .attr("y", -this.props.padding / 1.5)

  };

  addSubTitle() {
    this
      .plot
      .append("text")
      .text(this.props.subtitle)
      .attr("class", "bar-chart-subtitle")
      .attr("x", 0)
      .attr("y", -this.props.padding / 1.5)
      .attr("dy", "1.2em")

  };

  addXAxisLabel() {

    this
      .plot
      .append("text")
      .text(this.props.xAxisLabel)
      .attr("class", "x-axis-label")
      .attr("x", (this.props.size[0] - 2 * this.props.padding) / 2)
      .attr("y", (this.props.size[1] - 2 * this.props.padding) - (this.props.padding / 2) + this.props.padding)
      .attr("dy", "1em")
      .style("text-anchor", "middle")

  }

  addYAxisLabel() {

    this
      .plot
      .append("text")
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
      this
        .selectedKeys
        .push(d.key);
      props.parentCallback(this.selectedKeys);

      // continute multiselect mode as long as cntrl is selected
    } else if (d3event.ctrlKey && this.multiselectMode == 1) {
      var keyPos = this
        .selectedKeys
        .indexOf(d.key);
      // remove key if already in list
      if (keyPos > -1) {
        this
          .selectedKeys
          .splice(keyPos, 1);
      } else {
        this
          .selectedKeys
          .push(d.key);
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
        this
          .selectedKeys
          .push(d.key);
        props.parentCallback(this.selectedKeys);
      }
    };

    this.updateSelectedBars();

  };


  render() {
    return ( <svg ref = {node => this.node = node} width = {this.props.size[0]} height = {this.props.size[1]} >
      < /svg>

    )
  }

}

export default DataMap;
