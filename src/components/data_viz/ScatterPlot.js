import React, {Component} from 'react';
import {scaleLinear, scaleBand,scaleOrdinal} from 'd3-scale';
import {range,max,min,mean,extent,group} from 'd3-array';
import {keys,values} from 'd3-collection';
import {curveBasis,curveLinear, line as d3line} from 'd3-shape';
import {select,selectAll,local} from 'd3-selection';
import {axisBottom, axisLeft} from 'd3-axis';
import {transition} from 'd3-transition';
import {easeCubic} from 'd3-ease';
import {format} from 'd3-format';

class ScatterPlot extends Component {
  constructor (props){
    super (props);
    this.createScatterPlot = this.createScatterPlot.bind(this);
    this.data = [];
    this.orientation = 'vertical';
    this.r = 3;
    this.padding = this.props.padding;
    this.speed = this.props.speed;
    this.xTicksNum = 5;
    this.yTicksNum = 5;
    this.barPaddingInner = 0.1;
    this.optionalColorPalette =[];
    this.centerNodes = [];
    this.k = 5;



  }

componentDidMount(){
    const node = this.node;

    this.plot  = select(node)
                  .append("g")
                  .attr("id","line")
                  .attr("transform", "translate(" + this.props.padding + "," + this.props.padding + ")");


    this.createScatterPlot();
    this.addTitle();
    this.addSubTitle();
    this.addXAxisLabel();
    this.addYAxisLabel();

  };

  componentDidUpdate(){

    this.generateXScale();
    this.generateYScale();
    this.addAxis();
    this.generateCircles();

    };


createScatterPlot(){
  this.padding = 50;

  this.generateData();
  this.generateXScale();
  this.generateYScale();
  this.generateColorScale();
  this.addAxis();
  this.generateButtons();
  this.generateCircles();
  this.addReferenceLines();

};

generateXScale() {
  if(this.orientation=='vertical'){
  this.xScale = scaleLinear()
    .domain([0,max(this.data,function(d) {
      return d.x;
    })*1.2])
    .range([0, this.props.size[0] - 2 * this.padding])
  }else if (this.orientation=='horizontal'){
  this.xScale = scaleLinear()
    .domain([0,max(this.data,function(d){
      return d.y;
    })*1.2])
    .range([0, this.props.size[0] - 2 * this.padding])
  };

  this.xAxis = axisBottom().ticks(this.xTicksNum).scale(this.xScale);
};

generateYScale(){
  if(this.orientation =='vertical'){
  this.yScale = scaleLinear()
    .domain([0, max(this.data, function(d) {
      return d.y ;
    }) * 1.2])
    .range([this.props.size[1] - 2 * this.padding, 0])
}else if(this.orientation=='horizontal'){
  this.yScale = scaleLinear()
    .domain(this.data.map(function(d) {
      return d.x;
    }))
    .range([this.props.size[1] - 2 * this.padding, 0])
    .paddingInner(this.barPaddingInner);
}
    this.yAxis = axisLeft().ticks(this.yTicksNum).scale(this.yScale);
};

generateColorScale() {

  var that=this;

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
      "color": "#2ca02c"
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

    this.optionalColorPalette.map(function(d){
      var curKey = d.key;
      var curColor = d.color;

      that.colorPalette.map(function(d){
        if(d.key == curKey){
          d.color = curColor;
        }
      }
      )

    });



  this.colorScale = scaleOrdinal()
    .domain(this.data.map(function(d) {
      return d.x;
    }))
    .range(this.colorPalette.map(function(d) {
      return d.color;
    }));

};


addAxis() {
  this.plot.append("g")
    .attr("id", "x-axisGroup")
    .attr("class", "x-axis")
    .attr("transform", "translate(" + "0" + "," + (this.props.size[1] - 2 * this.padding) + ")");

  this.plot.select(".x-axis")
    .transition()
    .duration(1000)
    .call(this.xAxis)

  this.plot.append("g")
    .attr("id", "y-axisGroup")
    .attr("class", "y-axis")
    .attr("transform", "translate(0,0)");

  this.plot.select(".y-axis")
    .transition()
    .duration(1000)
    .call(this.yAxis)

};

updateAxis() {
  this.plot.select(".x-axis")
    .transition()
    .duration(1000)
    .call(this.xAxis)

  this.plot.select(".y-axis")
    .transition()
    .duration(1000)
    .call(this.yAxis)

}


generateCircles() {

  if(this.orientation == 'vertical'){
      var that = this;

      var rect = this.plot.selectAll(".chartCircle")
        .data(this.data,function(d){return d.x});

      //remove any elements that don't have data
      rect.exit().remove();

      //update elements that do have Data
      rect
        .transition().duration(this.speed)
        .attr("cx", function(d) {
          return that.xScale(d.x);
        })
        .attr("cy", function(d) {
          return that.yScale(d.y);
        })
        .attr("r",this.r)

      //create new elements for data that is new
      rect.enter().append("circle")
        .attr("class","chartCircle")
        .attr("cx", function(d) {
          return that.xScale(d.x);
        })
        .attr("cy", function(d){
          return that.yScale(d.y);
        })
        .on("mouseover", function(d) {
        })
        .on("mouseout", function(d) {
        })
        .transition().duration(this.speed) // start at "y=0" then transition to the top of the grpah while the height increases
        .attr("cx", function(d) {
          return that.xScale(d.x)
        })
        .attr("cy", function(d) {
          return that.yScale(d.y)
        })
        .attr("r", this.r)
        .attr("fill", function(d) {
          return that.colorScale(d.x)
        });


    }else if (this.orientation =='horizontal'){
      var that = this;

      var rect = this.plot.selectAll("rect")
        .data(this.data,function(d){return d.x});

      //remove any elements that don't have data
      rect.exit().remove();

      //update elements that do have Data
      rect
        .transition().duration(this.speed)
        .attr("x", 1)
        .attr("y", function(d) {
          return that.yScale(d.x)
        })
        .attr("height",this.yScale.bandwidth())
        .attr("width", function(d){
        return that.xScale(d.y);
        })

      //create new elements for data that is new
      rect.enter().append("rect")
        .attr("x", 1)
        .attr("y", function(d) {
          return that.yScale(d.x) + 5
        })
        .attr("height",this.yScale.bandwidth())
        .on("mouseover", function(d) {
        })
        .on("mouseout", function(d) {
        })
        .transition().duration(this.speed) // start at "y=0" then transition to the top of the grpah while the height increases
        .attr("y", function(d) {
          return that.yScale(d.x)
        })
        .attr("height",this.yScale.bandwidth())
        .attr("width", function(d) {
          return that.xScale(d.y) ;
        })
        .attr("fill", function(d) {
          return that.colorScale(d.x)
        });

  }

};

calculateDataParameters(){
  if(this.orientation == 'vertical'){

    this.avgX = mean(this.data,function(d){return d.x});
    this.maxY = max(this.data,function(d){return d.y})*1.2;
    this.avgY = mean(this.data,function(d){return d.y});
    this.maxX = max(this.data,function(d){return d.x});
    this.minX = min(this.data,function(d){return d.x});

  };

  this.xRefLineData = [
    {x:this.avgX,
     y:0
    },
    {x:this.avgX,
     y:this.maxY
    },
  ];

  this.yRefLineData = [
    {x:0,
     y:this.avgY
    },
    {x:this.maxX*1.2,
     y:this.avgY
    },
  ];



};

addReferenceLines(){

  this.calculateDataParameters();

  if(this.orientation == 'vertical'){
    var that = this;

    var refLineGenerator = d3line()
      .x(function(d){
        return that.xScale(d.x)
      })
      .y(function(d){
        return that.yScale(d.y)
      });


    this.plot
      .append("path")
      .attr("d",refLineGenerator(this.xRefLineData))
      .attr("id","xRefLine")
      .attr("stroke","#a7a7a7")
      .attr("stroke-width","1px");


    this.plot
      .append("path")
      .attr("d",refLineGenerator(this.yRefLineData))
      .attr("id","yRefLine")
      .attr("stroke","#a7a7a7")
      .attr("stroke-width","1px");

  };

};

updateReferenceLines(){

  this.calculateDataParameters();

  if(this.orientation == 'vertical'){

  var that=this;

  var refLineGenerator = d3line()
    .x(function(d){
      return that.xScale(d.x)
    })
    .y(function(d){
      return that.yScale(d.y)
    });

  this.plot.selectAll("#xRefLine")
    .transition()
    .duration(this.speed)
    .attr("d",refLineGenerator(this.xRefLineData));


    this.plot.selectAll("#yRefLine")
      .transition()
      .duration(this.speed)
      .attr("d",refLineGenerator(this.yRefLineData));

};


};


addKMeansClusters(){

  var that = this;
  this.kmeans = new KMeans(this.data,this.k);
  this.clusterData = this.kmeans.centroidList;

  this.plot.selectAll(".clusterCircle")
    .data(this.clusterData)
    .enter()
    .append("circle")
    .attr("class","clusterCircle")
    .attr("cx",function(d){return that.xScale(d.x);})
    .attr("cy",function(d){return that.yScale(d.y);})
    .attr("r",3)
    .attr("fill","Purple")

};

greyColors(){

  this.plot.selectAll(".chartCircle")
    .transition()
    .duration(100)
    .attr("fill","#a7a7a7")
};

updateColors(){

  var that=this;

  this.plot.selectAll(".chartCircle")
    .transition()
    .duration(100)
    .attr("fill",function(d){
      var key = d.cluster+1
      return that.colorScale(key);

    });


    this.plot.selectAll(".clusterCircle")
      .transition()
      .duration(100)
      .attr("cx",function(d){return that.xScale(d.x);})
      .attr("cy",function(d){return that.yScale(d.y);})
      .attr("r",5)
      .attr("fill","#000");

};



updateBars() {
  this.generateXScale();
  this.generateYScale();
  this.generateColorScale();
  this.updateAxis();
  this.generateCircles();
  this.updateReferenceLines();

};

boxMuller(mu,sigma,u1){
  //var u1 = Math.random();
  var u2 = Math.random();

  var z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(Math.PI*2 * u2);
  //var z1 = Math.sqrt(-2.0 * Math.log(u1)) * Math.sin(Math.PI*2 * u2);

  return z0 * sigma + mu

}

generateData(){

  for(var i=0; i<this.k;i++){
      var centerNode = {
        x:Math.floor(Math.random() * (20 - 0 + 1)) + 0,
        y:Math.floor(Math.random() * (20 - 0 + 1)) + 0,
        mu:Math.floor(Math.random() * (2 - 0 + 1)) + 0,
        sigma:Math.floor(Math.random() * (0 - 2 + 1)) + 0
      }

      this.centerNodes.push(centerNode);
      this.data.push(centerNode);

  };

    this.updateBars();

};

updateData(){

  var i=0;

  for(i=0;i<=50;i++){
    var u1 = Math.random();

    for(var j=0; j<3;j++){
      var newEntry = {
        x: this.centerNodes[j].x + this.boxMuller(this.centerNodes[j].mu,this.centerNodes[j].sigma,u1),
        y: this.centerNodes[j].y + this.boxMuller(this.centerNodes[j].mu,this.centerNodes[j].sigma,u1)
      }

      this.data.push(newEntry);
    }
  };

  this.updateBars();


};

addTitle(){
  this.plot.append("text")
    .text(this.props.title)
    .attr("class","line-chart-title")
    .attr("x",0)
    .attr("y",-this.props.padding/1.5)

};


addSubTitle(){
  this.plot.append("text")
    .text(this.props.subtitle)
    .attr("class","line-chart-subtitle")
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

};

addYAxisLabel(){

  this.plot.append("text")
    .text(this.props.yAxisLabel)
    .attr("class","y-axis-label")
    .attr("x",-(this.props.size[1] - this.props.padding )/2)
    .attr("y",-this.props.padding /2)
    .attr("dy","-0.5em")
    .style("text-anchor","middle")
    .style("transform","rotate(270deg)")

};






showToolTip(d) {

  if (this.tooltipNode != undefined) {
    this.tooltipNode.remove()
  };

  this.tooltipNode = this.plot.append("g")


  this.tooltipNode.append("text")
    .attr("id","tooltiptext")
    .attr("opacity",1)
    .attr("x", "0.5em")
    .text(d.x + " | "+ d.y );

  var text_width = select("#tooltiptext").node().getComputedTextLength()+15;
  if(this.orientation == 'vertical'){

    this.tooltipNode
      .attr("transform", "translate(" + (this.xScale(d.x) * 1 + 5) + "," + (this.yScale(d.y) * 1 - 10) + ")")
      .style("opacity", 0);
  }else if(this.orientation == 'horizontal'){
    this.tooltipNode
      .attr("transform", "translate(" + Math.min(this.xScale(d.y)+5,this.xScale(d.y)+5-text_width) + "," + (this.yScale(d.x) * 1 - 10) + ")")
      .style("opacity", 0);

  };

  this.tooltipNode
    .append("rect")
    .attr("width", text_width)
    .attr("height", "1.6em")
    .attr("y", "-1.25em")
    .attr("fill", "lightgray")
    .attr("rx", 4)
    .style("pointer-events", "none");

  this.tooltipNode.append("text")
    .attr("x", "0.5em")
    .style("opacity",0.9)
    .style("background", "lightgray")
    .text(d.x + " | "+ d.y);

  this.tooltipNode
    .transition().duration(200)
    .style("opacity", 1);

};

hideToolTip() {
  var that = this;
  that.tooltipNode.remove();
};

generateButtons() {
  var that = this;
  select(".button-container").append("button")
    .text("Add Data")
    .on("click", function() {
      that.updateData()
    });
  select(".button-container").append("button")
    .text("Initialize Clusters")
    .on("click", function() {
      that.addKMeansClusters();
      that.greyColors();
    });
  select(".button-container").append("button")
    .text("KMeans Iteration")
    .on("click", function() {
      that.kmeans.euclideanDistance();
      that.updateColors();
    });
};

removeData() {
  this.data.pop();
  this.updateBars();

};


rotateChart(){
  if(this.orientation=='vertical'){
    this.orientation='horizontal';
  }else{
    this.orientation='vertical';
  };
  this.updateBars();


};

render(){
  return <svg ref={node => this.node  = node}
          width = {this.props.size[0]} height = {this.props.size[1]}>
         </svg>;
  }

}


/////////////////////////////////////
////New class for k means clustering
/////////////////////////////////


var KMeans = function(dataset,k){
  this.k = k-2;
  this.dataset = dataset;
  this.centroidList = [];

  this.xData = this.dataset.map(function(d){return d.x});
  this.yData = this.dataset.map(function(d){return d.y});

  for(var i=0; i<this.k; i++){

    var centroid = {
      x:(i+1)*((Math.max.apply(null,this.xData) - Math.min.apply(null,this.xData))/(this.k)),
      y:(i+1)*((Math.max.apply(null,this.yData) - Math.min.apply(null,this.yData))/(this.k))
    };
    this.centroidList.push(centroid)
  };

};

KMeans.prototype.euclideanDistance = function(){

  this.xData = this.dataset.map(function(d){return d.x});
  this.yData = this.dataset.map(function(d){return d.y});
  this.center1xDiff = 0;
  this.center1yDiff = 0;
  this.center2Diff = 0;


  //iterate over each point
  for(var i=0; i < this.dataset.length; i++){
     var pointDistanceList = [];
     for(var k=0; k< this.centroidList.length; k++){
        var pointDistance = Math.sqrt(Math.pow((this.xData[i] - this.centroidList[k].x),2) + Math.pow((this.yData[i] - this.centroidList[k].y),2));
        pointDistanceList.push(pointDistance);
        };

     //find the arg min of the pointDistanceList
     var argMin = pointDistanceList.map((x, i) => [x, i]).reduce((r, a) => (a[0] < r[0] ? a : r))[1];

     //assign point to cluster
     this.dataset[i].cluster = argMin;
   };

   //move the centroid to the average of it's data points;
   for(k=0; k<this.centroidList.length; k++){

     this.centroidList[k].x = mean(this.dataset.filter(d=>d.cluster == k),function(d){return d.x});

     this.centroidList[k].y = mean(this.dataset.filter(d=>d.cluster == k),function(d){return d.y});
   }
};

export default ScatterPlot;
