_GraphRing = function(){
	var _graphRing = {};
	// data 
	graphData = {}, arcData = [], arcDataWithPos = [];
	//place
	var divId, isG = false, gId, graphG, arcG;
	//size 
	var viewWidth, viewHeight, graphWidth, graphHeight, nodeSize = 5, isNodeSizeNum = true, nodeScaleFunc, innerRadius, outerRadius, arcSize, arcGap = 5, startAngle = 0, endAngle = 2 * Math.PI, piePadAngle = 2/180 * Math.PI;
	// var innerRadiusScale;
	//color for the node and the arc
	var arcColorMap, colorMapArr = [d3.scale.category20c(), d3.scale.category20b(), d3.scale.category20()];
	//basic configuration
	var bindEventFlag = true;
	// force
	var force = d3.layout.force();
	//parameter for force layout
	var charge = -30, linkDistance = 20, gravity = 0.1, linkStrength = 0.1;
	var selectedNodeArr = [], brushSelectedNodeArr = [], clickSelectedArcVal = {}, selectedArcVal = {};

	// Set graph data. The data format is {'nodes':[], 'links':[]}
	_graphRing._setGraphData = function(_data) {
		graphData = _data;
		return _graphRing;
	};

	// Set arc data. The data format is [{'name':, 'data':[{'name':, 'val':}, {}]}, {}]
	_graphRing._setArcData = function(_data){
		arcData = _data;
		return _graphRing;
	};

	// Set the svg place. The data should be an id of a div
	_graphRing._setDivId = function(_divId){
		divId = _divId;
		isG = false;
		return _graphRing;
	};

	// Set the g for drawing graph ring. The data should be an id of a g
	_graphRing._setG = function(_gId){
		gId = _gId;
		isG = true;
		return _graphRing;
	};

	// Set the size of the view. The input data should be a array. The first data is the size of width, another one is the size of height
	_graphRing._setViewSize = function(_sizeArr){
		viewWidth = _sizeArr[0];
		viewHeight = _sizeArr[1];
		return _graphRing;
	};

	//Set linkStrength. The data can be a number or a function
	_graphRing._setLinkStrength = function(_linkStrength){
		linkStrength = _linkStrength;
		return _graphRing;
	};

	//Set charge. The data can be a number or a function
	_graphRing._setCharge = function(_charge){
		charge = _charge;
		return _graphRing;
	};

	//Set linkDistance. The data can be a number or a function
	_graphRing._setLinkDistance = function(_linkDistance){
		linkDistance = _linkDistance;
		return _graphRing;
	};

	//Set gravity. The data can be a number or a function
	_graphRing._setGravity = function(_gravity){
		gravity = _gravity;
		return _graphRing;
	};

	//Get alpha
	_graphRing._getAlpha = function(){
		return force.alpha();
	};

	// Bind the event or not. The input data should be a bool
	_graphRing._bindEvent = function(_flag){

	};

	//Set the node size. The data can be a function or just a number
	_graphRing._setNodeSize = function(_nodeSize){
		if(isFinite(_nodeSize))
		{
			isNodeSizeNum = true;
		}
		else
		{
			isNodeSizeNum = false;
		}
		nodeSize = _nodeSize;
		return _graphRing;
	};

	//Set the innerRadius of arcs. The data should be a number
	_graphRing._setArcInnerRadius = function(_innerRadius){
		innerRadius = _innerRadius;
		return _graphRing;
	};

	//Set the outerRadius of arcs. The data should be a number
	_graphRing._setArcOuterRadius = function(_outerRadius){
		outerRadius = _outerRadius;
		return _graphRing;
	};

	//Set the gap between arc. The data should a number
	_graphRing._setArcGap = function(_arcGap){
		arcGap = _arcGap;
		return _graphRing;
	};

	//Set startAngle. The data should be in radian
	_graphRing._setStartAngle = function(_startAngle){
		startAngle = _startAngle;
		return _graphRing;
	};

	// Set endAngele. The data should be in radian
	_graphRing._setEndAngle = function(_endAngle){
		endAngle = _endAngle;
		return _graphRing;
	};

	//Set pie pad angle. The data should be in radian
	_graphRing._setPiePadAngle = function(_padAngle){
		piePadAngle = _padAngle;
		return _graphRing;
	};

	//Set the data to highlight. The data format is [nodeId, nodeId, ...]
	_graphRing._setNodeToHighlight = function(_data){
		brushSelectedNodeArr = [];
		var obj = {};
		_data.forEach(function(d_nodeId, i_nodeId){
			obj[d_nodeId] = 1;
		});
		graphData.nodes.forEach(function(d_node, i_node){
			if(obj[d_node.id] !== undefined)
			{
				brushSelectedNodeArr.push(d_node);
			}
		});
		dealWithSelectedData();
	};

	//Get the data which is highlight now. The data format is [nodeId, nodeId, ...]
	_graphRing._getNodeInHighlight = function(){
		return selectedNodeArr;
	};

	// Start to calculate the graph layout, draw the view
	_graphRing._start = function(){
		calElementPos();
		setViewPlace();
		drawView();
		addEvent();
		return _graphRing;
	};

	// forceStart used to recalculate the graph layout
	_graphRing._forceStart = function(){
		drawNodeLink();
		return _graphRing;
	};

	// Stop the calculation of graph layout
	_graphRing._stop = function(){
		force.stop();
		return _graphRing;
	};

	// Functions in the package

	function calElementPos(){
		calSize();
		calPie();
		calGraph();
	}

	function drawView(){
		drawNodeLink();
		drawArc();
	}

	//cal size
	function calSize (){
		if(viewWidth === undefined || viewHeight === undefined)
		{
			if(isG === false)
			{
				viewWidth = $('#' + divId).width();
				viewHeight = $('#' + divId).height();
			}
			else
			{
				viewWidth = 600;
				viewHeight = 600;
			}
		}

		viewWidth = d3.min([viewWidth, viewHeight]);
		viewHeight = viewWidth;

		if(innerRadius === undefined || outerRadius === undefined)
		{
			if(arcSize === undefined)
			{
				arcSize = 10;
			}
			outerRadius = viewWidth/2 - arcSize;
			innerRadius = outerRadius - arcSize - (arcData.length - 1) *(arcSize + arcGap);
		}

		window.innerRadiusScale = d3.scale.linear().domain([0, arcData.length - 1]).range([innerRadius, outerRadius - arcSize ]);
		arcData.forEach(function(d_arc, i_arc){
			d_arc.innerRadius = innerRadiusScale(i_arc);
			d_arc.outerRadius = d_arc.innerRadius + arcSize;
			d_arc.startAngle = startAngle;
			d_arc.endAngle = endAngle;
			d_arc.padAngle = piePadAngle;
		});

		graphWidth = innerRadius - 5;
		graphHeight = innerRadius - 5;
	}

	function setViewPlace (){
		if(isG === false)
		{
			//remove existing svg
			d3.select('#' + divId + ' svg').remove();
			d3.select('#' + divId).append('svg').attr('width', viewWidth).attr('height', viewHeight).append('g').attr('id', 'graphRingG').attr('class', 'graphRingG');
			gId = 'graphRingG';
		}

		var graphLeft = viewWidth/2, graphTop = viewHeight/2;

		graphG = d3.select('#' + gId).append('g').attr('id', 'graphG')
				   .attr('transform', 'translate(' + graphLeft + ',' + graphTop + ')');
		arcG = d3.select('#' + gId).append('g').attr('id', 'arcG')
		         .attr('transform', 'translate(' + graphLeft + ',' + graphTop + ')');
	}

	function calPie (){
		arcDataWithPos = [];
		arcData.forEach(function(d_arcData, i_arcData){
			var pie = d3.layout.pie().padAngle(d_arcData.padAngle)
						.startAngle(d_arcData.startAngle).endAngle(d_arcData.endAngle)
						.value(function(d){ return d.val;});
			var dataWithPos = pie(d_arcData.data);
			var obj = {};
			obj.name = d_arcData.name;
			obj.data = dataWithPos;
			obj.innerRadius = d_arcData.innerRadius;
			obj.outerRadius = d_arcData.outerRadius;
			obj.startAngle = d_arcData.startAngle;
			obj.endAngle = d_arcData.endAngle;
			obj.padAngle = d_arcData.padAngle;
			arcDataWithPos.push(obj);
		});
	}

	function calGraph (){
		var innerArcWithPos = arcDataWithPos[0].data;
		addVirtualNodeAndLink(innerArcWithPos, graphData);
	}

	function addVirtualNodeAndLink (innerArcWithPos, graphData){
		var self = this;
		var nodes = graphData.nodes;
		var links = graphData.links;
		var virtualNodeIndexObj = {};
		//set center virtual node
		var obj = {};
		obj.id = 'centerVirtual';
		obj.type = 'virtual';
		nodes.push(obj);
		virtualNodeIndexObj.centerVirtual = nodes.length - 1;
		// set virtual links between nodes and virtual center node
		for(var i = 0; i<nodes.length - 2; i++)
		{
			obj = {};
			obj.source = virtualNodeIndexObj.centerVirtual;
			obj.target = i;
			obj.type = 'virtual';
			links.push(obj);
		}

		// add virtual nodes for innerArc
		innerArcWithPos.forEach(function(d_data, i_data){
			var angle = (d_data.endAngle - d_data.startAngle)/2 + d_data.startAngle;
			var obj = {};
			obj.id = d_data.data.name;
			obj.type = 'virtual';
			obj.x = innerRadius * Math.sin(angle);
			obj.y = -innerRadius * Math.cos(angle);
			obj.cx = obj.x;
			obj.cy = obj.y;
			obj.fixed = true;
			nodes.push(obj);
			virtualNodeIndexObj[d_data.data.name] = nodes.length - 1;
		});
		// add virtual links
		nodes.forEach(function(d_node, i_node){
			var innerArcName = arcData[0].name;
			if(d_node.type === 'virtual' || d_node[innerArcName] === undefined) return;
			var obj = {};
			obj.source = virtualNodeIndexObj[d_node[innerArcName]];
			obj.target = i_node;
			obj.type = 'virtual';
			links.push(obj);
		});
	}

	function drawNodeLink(){
		var graphView = graphG;
		if(graphView.select('#linkG')[0][0] === null) graphView.append('g').attr('id', 'linkG');
		if(graphView.select('#nodeG')[0][0] === null) graphView.append('g').attr('id', 'nodeG');
		var linkView = graphView.select('#linkG'), nodeView = graphView.select('#nodeG');
		var linkData = graphData.links;
		var nodeData = graphData.nodes;

		force.nodes(nodeData).links(linkData).charge(charge).linkDistance(linkDistance).linkStrength(linkStrength).gravity(gravity);
		force.start();

		//draw link
		var link = linkView.selectAll('.graphLinkInGraphRing').data(linkData);
		//enter
		var newLink = link.enter().append('path');
		//update
		link.attr('class', function(d, i){
			if(d.type === undefined || d.type !== 'virtual') 
			{
				return 'graphLinkInGraphRing ' + d.source.id + ' ' + d.target.id;
			}
			return 'virtualLinkInGraphRing';
		})
		.attr('d', function(d, i){
			return 'M ' + d.source.x + ' ' + d.source.y + ' L ' + d.target.x + ' ' + d.target.y;
		});
		//exit
		link.exit().remove();

		//draw node
		var node = nodeView.selectAll('.graphNodeInGraphRing').data(nodeData);
		//enter
		var newNode = node.enter().append('circle');
		//update
		node.attr('class', function(d, i){
			if(d.type === undefined || d.type !== 'virtual')
			{
				return 'graphNodeInGraphRing ' + d.id + 'InGraphRing';
			}
			return 'virtualNodeInGraphRing';
		}).attr('index', function(d, i){ return i;})
		.attr('r', nodeSize).attr('cx', function(d, i){ return d.x;}).attr('cy', function(d, i){ return d.y;});
		//exit
		node.exit().remove();

		//graph update
		force.on('tick', function(){
			if(force.alpha() < 0.01)
			{
				force.stop();
			}
			if(force.alpha() < 0.02)
			{
				reCalNodePosFromOut();
			}
			if(force.alpha() < 0.07)
			{
				updateNodeAndLinkPos();
			}
		});

		function updateNodeAndLinkPos (){
			link.attr('d', function(d, i){
				return 'M ' + d.source.x + ' ' + d.source.y + ' L ' + d.target.x + ' ' + d.target.y;
			});
			node.attr('cx', function(d, i){ return d.x;}).attr('cy', function(d, i){ return d.y;});
		}

		function reCalNodePosFromOut(){
			var width = graphWidth, height = graphHeight;
			var nodeData = graphData.nodes;
			var linkData = graphData.links;
			var maxDis = width, radio;
			nodeData.forEach(function(d, i){
				if(d.type !== undefined && d.type === 'virtual') return;
				var dis = Math.sqrt(d.x * d.x + d.y * d.y);
				if(dis > maxDis) maxDis = dis;
			});
			if(maxDis <= width) return;
			radio = (width/maxDis);
			nodeData.forEach(function(d, i){
				if(d.type !== undefined && d.type === 'virtual') return;
				d.x = d.x * radio;
				d.y = d.y * radio;
				d.cx = d.cx * radio;
				d.cy = d.cy * radio;
			});
		}
	}

	function drawArc(){
		var ringData = arcDataWithPos;
		var arcView = arcG;
		//remove all exist arcG
		arcView.selectAll('.ringGInGraphRing').style('opacity', 1).transition().style('opacity', 0).remove();

		ringData.forEach(function(d_ring, i_ring){
			var arc = d3.svg.arc().outerRadius(d_ring.outerRadius).innerRadius(d_ring.innerRadius);
			var arcName = d_ring.name;
			var pieView = arcView.append('g').attr('id', arcName + 'RingGInGraphRing').attr('class', 'ringGInGraphRing').attr('name', arcName);
			var pieG = pieView.selectAll('.pieGInGraphRing').data(d_ring.data);
			//enter
			var newPie = pieG.enter().append('g');
			//update
			pieG.attr('class', function(d, i){ return d.data.name + 'PieGInGraphRing pieGInGraphRing'})
				.attr('value', function(d, i) { return d.data.val;})
				.attr('name', function(d, i){ return d.data.name;})
				.attr('color', function(d, i){ return colorMapArr[Math.floor(i_ring/colorMapArr.length)](d.data.name);})
				.attr('innerRadius', d_ring.innerRadius)
				.attr('outerRadius', d_ring.outerRadius)
				.attr('startAngle', function(d, i){ return d.startAngle;})
				.attr('endAngle', function(d, i){ return d.endAngle;});
			var newPiePath = newPie.append('path').attr('class', function(d, i){ return 'piePathInGraphRing ' + d.data.name + 'PiePathInGraphRing';});
			pieG.selectAll('.piePathInGraphRing').attr('d', arc).attr('id', function(d, i){ return d.data.name + 'PiePathInGraphRing';})
				.style('fill', function(d, i){ 
					return colorMapArr[Math.floor(i_ring/colorMapArr.length)](d.data.name);})
				.attr('class', function(d, i){ return 'piePathInGraphRing ' + d.data.name + 'PiePathInGraphRing';});

			var newSmallPiePath = newPie.append('path').attr('class', function(d, i){ return 'smallPiePathInGraphRing ' + d.data.name + 'SmallPiePathInGraphRing';});
			pieG.selectAll('.smallPieInGraphRing').attr('d', arc)
				.style('fill', function(d, i){ return colorMapArr[Math.floor(i_ring/colorMapArr.length)](d.data.name); })
				.attr('class', function(d, i){ return 'smallPiePathInGraphRing ' + d.data.name + 'SmallPiePathInGraphRing';});

			// add text
			var textG = newPie.append('text').attr('class', 'pieTextInGraphRing').attr('x', 6).attr('dy', 10);
			textG.append('textPath').attr('xlink:href', function(d, i){return '#' + d.data.name + 'PiePathInGraphRing';})
				 .text(function(d, i){ return d.data.name;});
			pieG.selectAll('textPath').attr('xlink:href', function(d, i){ return '#' + d.data.name + 'PiePathInGraphRing';})
				.text(function(d, i){ return d.data.name;});
			//remove the labels that don`t fit
			var pieText = d3.selectAll('.pieTextInGraphRing');
			var piePath = d3.selectAll('.piePathInGraphRing');
			pieText.filter(function(d, i){
				return piePath[0][i].getTotalLength()/2 - 40 < this.getComputedTextLength();
			})
			.select('textPath')
			.text(function(d, i){
				var name = d.data.name;
				if(name.length < 5) return name;
				else
					return name.substr(0, 5) + "...";
			});
			pieText.filter(function(d, i){ return piePath[0][i].getTotalLength() / 2 - 30 < this.getComputedTextLength();})
				   .remove();
			// move the text in the middle
			pieText.filter(function(d, i){ return piePath[0][i].getTotalLength()/2 - 10 > this.getComputedTextLength();})
			       .attr('x', function(d, i){ return (piePath[0][i].getTotalLength()/2 - 10 - this.getComputedTextLength())/2;});
			//exit
			pieG.exit().remove();
		});		 
	}

	function addEvent(){
		//init
		if(selectedNodeArr.length === 0) selectedNodeArr = graphData.nodes;

		hoverNodeEvent();
		hoverPieEvent();
		brushNodeEvent();
		clickPieEvent();
	}

	function hoverNodeEvent(){
		var tip = d3.tip().attr("class", "d3-tip-inGraphRing").offset([-10, 0]).html(function(d){return d;});
		var graphView = graphG;
		graphView.selectAll('.graphNodeInGraphRing').call(tip)
				 .on('mouseover', function(d, i) { var textInTip = d.id; tip.show(textInTip);}).on('mouseout', function(){ tip.hide();});
	}

	function hoverPieEvent(){
		var tip = d3.tip().attr('class', 'd3-tip-inGraphRing').offset([0, 0]).html(function(d){ return d;});
		var arcView = arcG;
		arcView.selectAll('.ringGInGraphRing .pieGInGraphRing').call(tip)
		       .on('mouseover', function(d, i){ var textInTip = d.data.name; tip.show(textInTip);}).on('mouseout', function(){ tip.hide();});
	}

	function brushNodeEvent(){
		var graphView = graphG;
		var graphNodeG = graphView.select("#nodeG");
		var node = graphView.selectAll('.graphNodeInGraphRing');
		var shiftKey;
            d3.select('body')
                .on("keydown.brush", keyflip)
                .on("keyup.brush", keyflip)
                .each(function() { this.focus(); });  
            node.on("mousedown", function(d) {
                if (shiftKey) d3.select(this).classed("brushSelectedInGraphRing", d.selected = !d.selected);
                else node.classed("brushSelectedInGraphRing", function(p) { return p.selected = d === p; });
              });

        var brush = graphNodeG
                        .datum(function() { return {brushSelectedInGraphRing: false, previouslySelected: false}; })
                        .attr("class", "brushNodeInGraphRing")
                        .call(d3.svg.brush()
                            .x(d3.scale.identity().domain([-(graphWidth - 25), (graphWidth - 25)]))
                            .y(d3.scale.identity().domain([-(graphWidth - 25), (graphWidth - 25)]))
                            .on("brushstart", function(d) {
                              node.each(function(d) { d.previouslySelected = shiftKey && d.selected; });
                            })
                        .on("brush", function() {
                              var extent = d3.event.target.extent();
                              node.classed("brushSelectedInGraphRing", function(d) {
                                return d.selected = d.previouslySelected ^
                                    (extent[0][0] <= d.x && d.x < extent[1][0]
                                    && extent[0][1] <= d.y && d.y < extent[1][1]);
                              });

                              node.classed('unselected', function(d){
                                 return !d3.select(this).classed('brushSelectedInGraphRing');
                              })
                            })
                        .on("brushend", function() {
                                d3.event.target.clear();
                                d3.select(this).call(d3.event.target);
                                dealWithBrush();
                            }));

        function keyflip() 
        {
          shiftKey = d3.event.shiftKey || d3.event.metaKey;
        }
	}

	function clickPieEvent(){
		var arcView = arcG;
		arcView.selectAll('.pieGInGraphRing').on('click', function(d, i){
			var parentNode = d3.select(this.parentNode);
			var arcName = parentNode.attr('name');
			var pieName = d3.select(this).attr('name');
			var status = d3.select(this).classed('clickSelectedInGraphRing');
			var index;
			if(clickSelectedArcVal[arcName] === undefined) clickSelectedArcVal[arcName] = [];
			if(status === false)
			{
				d3.select(this).classed('clickSelectedInGraphRing', true);
				clickSelectedArcVal[arcName].push(pieName);
			}
			else
			{	
				index = clickSelectedArcVal[arcName].indexOf(pieName);
				if(index !== -1)
				{
					clickSelectedArcVal[arcName].splice(index, 1);
					d3.select(this).classed('clickSelectedInGraphRing', false);
				}
			}
			dealWithSelectedData();
		});
	}

	function dealWithBrush(){
		brushSelectedNodeArr = [];
		brushSelectedNodeArr = getNameWithSpecificClassName('graphNodeInGraphRing', 'brushSelectedInGraphRing');
		dealWithSelectedData();

		function getNameWithSpecificClassName(basicElementName, className)
		{
			var nodeArr = graphData.nodes;
		    var node = d3.selectAll('.' + basicElementName);
		    var selectedNode = node.filter(function(d){
		                                var status = d3.select(this).classed(className);
		                                return status;
		                            });

		    var resultArr = [];
		    selectedNode.each(function(d){
		    	var index = d3.select(this).attr('index');
		    	index = (+index);
		        return resultArr.push(nodeArr[index]);
		    });
		    return resultArr;
		}
	}

	function dealWithSelectedData (){
		console.log('hello~~~and');
		andOperate();
		updateSelectedNode();
		updateSelectedArc();
	}

	function andOperate() {
		var allArcData = arcDataWithPos;
		var basicArc = clickSelectedArcVal;
		if(brushSelectedNodeArr.length === 0) brushSelectedNodeArr = graphData.nodes;
		var basicNode = brushSelectedNodeArr;
		selectedNodeArr = [], selectedArcVal = {};

		var basicArcName = Object.keys(basicArc);
		basicNode.forEach(function(d_node, i_node){
			var isSelectedFlag = true;
			var index;
			for(var i = 0; i< basicArcName.length; i++)
			{
				if(basicArc[basicArcName[i]] === undefined || basicArc[basicArcName[i]].length === 0) continue;
				if(d_node[basicArcName[i]] === undefined)
				{
					isSelectedFlag = false;
					break;
				}
				else
				{
					index = basicArc[basicArcName[i]].indexOf(d_node[basicArcName[i]]);
					if(index === -1)
					{
						isSelectedFlag = false;
						break;
					}
				}
			}
			if(isSelectedFlag === true)
			{
				selectedNodeArr.push(d_node);
			}
		});

		selectedNodeArr.forEach(function(d_node, i_node){
			var name;
			for(var i = 0; i< allArcData.length; i++)
			{
				name = allArcData[i].name;
				if(d_node[name] === undefined) continue;
				if(selectedArcVal[d_node[name]] === undefined) selectedArcVal[d_node[name]] = 0;
				selectedArcVal[d_node[name]] += 1;
			}
		});
		window.testNodeArr = selectedNodeArr;
		window.testArcVal = selectedArcVal;
	}

	function updateSelectedNode(){
		var data = selectedNodeArr;
		var graphView = graphG;
		graphView.selectAll('.graphNodeInGraphRing').classed('selected', false).classed('unselected', true);
		data.forEach(function(d_data, i_data){
			var id = d_data.id;
			graphView.select('.' + id + 'InGraphRing').classed('selected', true).classed('unselected', false);
		});
	}

	function updateSelectedArc() {
		var arcView = arcG;
		var selectedArcNameArr = Object.keys(selectedArcVal);
		window.testArcView = arcView;
		arcView.selectAll('.pieGInGraphRing').classed('selected', false).classed('unselected', true);
		selectedArcNameArr.forEach(function(d_arc, i_arc){
			arcView.select('.' + d_arc + 'PieGInGraphRing').classed('selected', true).classed('unselected', false);
			//add selected arc
			if(selectedArcVal[d_arc] !== undefined)
			{
				addSmallArc(arcView.select('.' + d_arc + 'PieGInGraphRing'), selectedArcVal[d_arc]);
			}
		});
	}

	function addSmallArc(place, val){
		var wholeVal = place.attr('value');
			wholeVal = (+wholeVal);
		var startAngle = place.attr('startAngle'), endAngle = place.attr('endAngle');
		    startAngle = (+startAngle);
		    endAngle = (+endAngle);
		var innerRadius = place.attr('innerRadius'), outerRadius = place.attr('outerRadius');
		var color = place.attr('color');
		var start = startAngle, end = (endAngle - startAngle) * (val/wholeVal) + startAngle;
		var arc = d3.svg.arc().outerRadius(outerRadius).innerRadius(innerRadius).startAngle(start).endAngle(end);
		place.select('.smallPiePathInGraphRing').attr('d', arc).style('fill', color);
	}

	function resetNodeStatus(){
		var graphView = graphG;
		selectedNodeArr = [];
		graphView.selectAll('.graphNodeInGraphRing').classed('selected', false).classed('unselected', false);
	}
	return _graphRing;
};