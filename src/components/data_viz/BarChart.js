import React, {Component} from 'react';
// Does not contian d3 prefix when importing classes
import {scaleLinear, scaleBand, scaleOrdinal} from 'd3-scale';
import {range, max, group, sum, rollups, min} from 'd3-array';
import {keys, values} from 'd3-collection';
import {select, event as d3event, selectAll} from 'd3-selection';
import {axisBottom, axisLeft} from 'd3-axis'
import {transition, interrupt} from 'd3-transition'

class BarChart extends Component {
  constructor(props) {
    super(props);
    this.createBarChart = this.createBarChart.bind(this);
  }

  static defaultProps = {
    orientation: "horizontal",
    yAxisLabelLocation:'left',
    showYAxis:true,
    showXAxis:true,
    xAdjust:0
  };


  componentDidMount() {
    const node = this.node;

    this.plot = select(node)
      .append("g")
      .attr("id", "shapes")
      .attr("transform", "translate(" + (this.props.xAdjust + this.props.padding)+ ","+this.props.padding + ")");
    
    this.plot
      .append("g")
      .attr("id","chart-rects")
    
    this.reshapeData();
    this.createScales();
    this.createAxis();
    this.createBarChart();
    this.addTitle();
    this.addXAxisLabel();
    this.addYAxisLabel();
    this.addSubTitle();
    this.selectedKeys = [];
    this.multiselectMode = 0;
    this.unfilterCount = this.props.unfilter;

  }

  shouldComponentUpdate(nextProps){
    let update = false;
    if(this.props.data.length>0 && nextProps.data.length>0){
      let minLen = Math.min(this.props.data.length,nextProps.data.length);
      for(var i =0; i<minLen; i++){
        if(this.props.data[i].value != nextProps.data[0].value){
          update = true;
          break;
        }
      }
    }

    return update
  }

  componentDidUpdate() {

    this.reshapeData();
    this.createScales();
    this.updateAxis();
    this.createBarChart();
    this.updateSelectedBars();
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

  createScales() {

    this.dataMax = (typeof this.props.dataMax == 'undefined'? max(this.seriesDataRollup.map((d) => d.value)) * 1.2:this.props.dataMax);

    if (this.props.orientation == "vertical") {

      this.yScale = scaleLinear()
        .domain([0, this.dataMax])
        .range([this.props.size[1] - 2* this.props.padding, 0]);

      this.yAxis = axisLeft().scale(this.yScale);

      this.xScale = scaleBand()
        .domain(this.seriesDataRollup.map((d) => d.key).sort((a, b) => a - b))
        .range([0, this.props.size[0] - 2 * this.props.padding])
        .paddingInner(0.1)
        .paddingOuter(0.1);

      this.xAxis = axisBottom().scale(this.xScale);
    } else {

      this.xScale = scaleLinear()
        .domain([0, this.dataMax])
        .range([0, this.props.size[0] - 2 * this.props.padding]);

      this.xAxis = axisBottom().scale(this.xScale).ticks(5);

      this.yScale = scaleBand()
        .domain(this.seriesDataRollup.map((d) => d.key).sort((a, b) => a - b))
        .range([0, this.props.size[1] - 2 * this.props.padding])
        .paddingInner(0.1)
        .paddingOuter(0.1);

      this.yAxis = axisLeft().scale(this.yScale);

    }
    this.colorPalette = [{
        "key": 1,
        "color": "#1f77b4"
      },
      {
        "key": 2,
        "color": "#ff7f0e"
      },
      {
        "key": 3,
        "color": "#2ca02c"
      },
      {
        "key": 4,
        "color": "#9467bd"
      },
      {
        "key": 5,
        "color": "#8c564b"
      },
      {
        "key": 6,
        "color": "#e377c2"
      },
      {
        "key": 7,
        "color": "#7f7f7f"
      },
      {
        "key": 8,
        "color": "#bcbd22"
      },
      {
        "key": 9,
        "color": "#17becf"
      }
    ];

    this.colorScale = scaleOrdinal()
      .domain(range(1, 10))
      .range(this.colorPalette.map(function(d) {
        return d.color;
      }));

  };

  createAxis() {

    if(this.props.showXAxis == true){

      this.plot
        .append('g')
        .attr("id", "x-axisGroup")
        .attr("class", "x-axis")
        .attr("transform", "translate(" + "0" + "," + (this.props.size[1] - 2 * this.props.padding) + ")");

      this.plot
        .select(".x-axis")
        .transition()
        .duration(this.props.speed)
        .call(this.xAxis)

    }
    
    if(this.props.showYAxis == true){

      this.plot.append("g")
        .attr("id", "y-axisGroup")
        .attr("class", "y-axis")
        .attr("transform", "translate(0,0)");

    }
    
  };

updateAxis() {

    if(this.props.showXAxis == true){

    this.plot
      .select(".x-axis")
      .attr("transform", "translate(" + "0" + "," + (this.props.size[1] - 2 * this.props.padding) + ")");

    this.plot
      .select(".x-axis")
      .transition()
      .duration(this.props.speed)
      .call(this.xAxis);
    
    }


    if(this.props.showYAxis == true){
    
    this.plot
      .select(".y-axis")
      .attr("transform", "translate(0,0)");
      
    this.plot.select(".y-axis")
      .transition()
      .duration(this.props.speed)
      .call(this.yAxis)
      .selectAll('.tick text')
      .attr('dx',(d)=> this.props.yAxisLabelLocation == 'right' ? '13':0 );

    this.plot.select('#y-axisGroup')
      .attr('text-anchor', (this.props.yAxisLabelLocation == 'right' ? 'start':'end'));
      
    }

  }


  createBarChart() {
    
    const rect = this.plot
      .select("#chart-rects")
      .selectAll("rect")
      .data(this.seriesDataRollup, (d) => d.key + d.series);

    rect
      .exit()
      .transition('bar-chart-update')
      .duration(900)
      .style("opacity", 0)
      .remove();

    if (this.props.orientation == "vertical") {

      rect
        .attr("x", (d) => this.xScale(d.key) + 1)
        .attr("width", this.xScale.bandwidth())
        .transition()
        .duration(this.props.speed)
        .attr("x", (d) => this.xScale(d.key) + 1)
        .attr("y", d => this.yScale(d.value))
        .attr("height", d => this.props.size[1] - this.yScale(d.value) - 2 * this.props.padding)
        .attr("width", this.xScale.bandwidth());

      rect
        .enter()
        .append("rect")
        .attr("x", (d) => this.xScale(d.key) + 1)
        .attr("y", d => this.props.size[1] - 2 * this.props.padding)
        .attr("width", this.xScale.bandwidth())
        .on("mouseover", this.onHover)
        .on("mouseout", this.onHoverOut)
        .on("click", (d) => this.sendClicked(this.props, d))
        .style("fill", (d) => "#ababab")
        .transition()
        .duration(this.props.speed)
        .attr("x", (d) => this.xScale(d.key) + 1)
        .attr("y", d => this.yScale(d.value))
        .attr("height", d => this.props.size[1] - this.yScale(d.value) - 2 * this.props.padding)
        .attr("width", this.xScale.bandwidth())

    } else {

      rect
        .attr("x", (d) => this.xScale(0) + 1)
        .attr("height", d => this.yScale.bandwidth())
        .transition('bar-chart-update')
        .duration(this.props.speed)
        .attr("x", (d) => this.xScale(0) + 1)
        .attr("y", d => this.yScale(d.key))
        .attr("height", d => this.yScale.bandwidth())
        .attr("width", (d) => this.xScale(d.value));

      rect
        .enter()
        .append("rect")
        .attr("x", (d) => this.xScale(0) + 1)
        .attr("y", d => this.yScale(d.key))
        .attr("height", d => this.yScale.bandwidth())
        .attr("width", 0)
        .on("mouseover", (d, i, nodes) => select(nodes[i]).style("fill", "orange"))
        .on("mouseout", (d, i, nodes) => select(nodes[i]).transition("colour-out").duration(500).style("fill", (d) => this.selectedKeys.indexOf(d.key) > -1 ? this.props.highlightColor : "#ababab"))
        .on("click", (d) => this.props.selection == 1 ? this.sendClicked(this.props, d) : 0)
        .on("onkeydown", (d) => this.sendMultiSelect(this.props, d))
        .style("fill", (d) => "#ababab")
        .transition('bar-chart-update')
        .duration(this.props.speed)
        .attr("x", (d) => this.xScale(0) + 1)
        .attr("y", d => this.yScale(d.key))
        .attr("height", d => this.yScale.bandwidth())
        .attr("width", (d) => this.xScale(d.value))

    }


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

  updateSelectedBars() {

    if (this.props.unfilter > this.unfilterCount) {
      this.selectedKeys = [];
      this.unfilterCount = this.props.unfilter;
    };

    this.plot.selectAll("rect")
      .style("fill", (d) => this.selectedKeys.indexOf(d.key) > -1 ? this.props.highlightColor : "#ababab")
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
    return ( <svg ref = {node => this.node = node}
      width = {
        this.props.size[0]
      }
      height = {
        this.props.size[1]
      } >
      </svg>

    )
  }

}

export default BarChart;
