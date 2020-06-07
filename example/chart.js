var sizeRatio=1.0; 
var userActHeightD=30;//the userActHeightD between two charts
var userActHeightU=30;//the height of a watchingArea
var gap=10;

var playing=false;// the video is playing or not

var markPause=false;

function draw(){

	let userIDarr = [...userList];//convert set into array  
	let inVidUserIDarr = [...inVidUserList];
	//prepare the dataset for plotting watchingArea
	for(var useridx=0;useridx<inVidUserIDarr.length;useridx++){ 
		var cT=0,pT=0;	
		for (var i=0;i<allUserAction[inVidUserIDarr[useridx]].length;i++){ 
				if(i==allUserAction[inVidUserIDarr[useridx]].length-1){
					allUserAction[inVidUserIDarr[useridx]][i].plotPTCT.pT=vidDuration;
					allUserAction[inVidUserIDarr[useridx]][i].plotPTCT.cT=cT;
				}
				else{
					pT=allUserAction[inVidUserIDarr[useridx]][i].prevTime;
					allUserAction[inVidUserIDarr[useridx]][i].plotPTCT.pT=pT;
					allUserAction[inVidUserIDarr[useridx]][i].plotPTCT.cT=cT;
					cT=allUserAction[inVidUserIDarr[useridx]][i].currentTime;
				}
		}
	}

	//initialize the svg
	var margin = {top: 40, right: 260, bottom: 30, left: 80},
    width = vidDuration*sizeRatio+margin.right+margin.left,
    height = inVidUserIDarr.length*(userActHeightU+userActHeightD+gap)+margin.top+margin.bottom;

    
	var x = d3.scale.ordinal()
    	.rangeRoundBands([0, width], 1.0);

	var y = d3.scale.linear()
	      .range([height, 0]);

	var svg = d3.select("#MainChart").append("svg")
		.attr("width", width)
		.attr("height", height)
		.append("g")
	      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
	
	
	//inVidUserIDarr includes allusername watching the video
	//in vid 103 user_id=e14e28f60fd46d462b2b0bfdebd356a90581114e==>29 actions
	//in vid 103 user_id=406c15e80072132fdfb17f9c0e290c8ba38aad74=>138 actions
	//in vid 103 user_id=ef67afdc46b22ce32093c8eda6d660dd2f468798 =>14 actions
	
	var sumH;//accumulate the position of y for curves
	
	for(var useridx=0;useridx<inVidUserIDarr.length;useridx++){
		var prevTimeWatchN=allUserTimeWatchN.reduce(function(a, b) { return a + b; }, 0);
		var preTimeSkipN=allUserTimeSkipN.reduce(function(a, b) { return a + b; }, 0);
		var cT=0,pT=0;	
		sumH=useridx*userActHeightU;//y position of every user history diagram
		var pi = Math.PI;
		var actionIDcountArea=0;
		//plot watchingArea


		var watchingArea = svg.append("g")
				.attr("transform", "translate(" + (-25).toString() + "," + (gap*useridx+sumH-userActHeightU).toString() + ")");		
		watchingArea.selectAll('rect')
				.data(allUserAction[inVidUserIDarr[useridx]])
				.enter()
				.append("rect")
				.attr('id',function(){actionIDcountArea++; return 'area_u'+(useridx).toString()+'_'+(actionIDcountArea-1).toString();})
				.attr('fill','black')
				.attr('opacity','0.2')
				.attr('x',function(d){return d.plotPTCT.cT*sizeRatio;})
				.attr('y',function(){return useridx*userActHeightU})
				.attr("width", function(d){
					for(var idx=Math.floor(d.plotPTCT.cT);idx<Math.floor(d.plotPTCT.pT);idx++){
						allUserTimeWatchN[idx]++;
					}
					return sizeRatio*(d.plotPTCT.pT-d.plotPTCT.cT);
				}) 
				.attr("height", userActHeightU);

		actionIDcountArea=0;//for skippedArea
		var skippedArea = svg.append("g")
				.attr("transform", "translate(" + (-25).toString() + "," + (gap*useridx+sumH).toString() + ")");		
		skippedArea.selectAll('rect')
				.data(allUserAction[inVidUserIDarr[useridx]])
				.enter()
				.append("rect")
				.attr('id',function(){actionIDcountArea++; return 'sArea_u'+(useridx).toString()+'_'+(actionIDcountArea-1).toString();})
				.attr('fill','black')
				.attr('opacity','0.2')
				.attr('x',function(d){return d.prevTime*sizeRatio;})
				.attr('y',function(){return useridx*userActHeightU})
				.attr("width", function(d){
					if(d.currentTime-d.prevTime>0){
						for(var idx=Math.floor(d.prevTime);idx<Math.floor(d.currentTime);idx++){
							allUserTimeSkipN[idx]++;
						}
					}
					return d.currentTime-d.prevTime>0?sizeRatio*(d.currentTime-d.prevTime):0;
				}) 
				.attr("height", userActHeightU);
		
		var userTimeWatchN=allUserTimeWatchN.reduce(function(a, b) { return a + b; }, 0)-prevTimeWatchN; //sum up number of overlapped watching areas
		var userTimeSkipN=allUserTimeSkipN.reduce(function(a, b) { return a + b; }, 0)-preTimeSkipN;	 //sum up number of skipped areas


	    var arc=d3.svg.arc()
				    .innerRadius(function(d){return d.plotPTCT.R>=userActHeightU ? d.plotPTCT.R-1 : Math.abs(d.currentTime-d.prevTime)/2-1;})
				    .outerRadius(function(d){return d.plotPTCT.R>=userActHeightU ? d.plotPTCT.R+1 : Math.abs(d.currentTime-d.prevTime)/2+1;})
				    .startAngle(function(d){var theta=Math.atan(2*Math.abs(d.plotPTCT.R-userActHeightU)/Math.abs(d.currentTime-d.prevTime)); var plus=(d.currentTime-d.prevTime>0?pi:0);return d.plotPTCT.R>=userActHeightU ? theta-pi/2+plus : -pi/2+plus;}) //converting from degs to radians
				    .endAngle(function(d){var theta=Math.atan(2*Math.abs(d.plotPTCT.R-userActHeightU)/Math.abs(d.currentTime-d.prevTime)); var plus=(d.currentTime-d.prevTime>0?pi:0);return d.plotPTCT.R>=userActHeightU ? pi/2-theta+plus : pi/2+plus;}); //just radians
		var actionIDcountCurve=0;//to record the sn of every action
		var watchingCurve=svg.append('g')
			.attr("transform", "translate(" + (-25).toString() + "," + (0).toString() + ")")		
			.selectAll('path')
			.data(allUserAction[inVidUserIDarr[useridx]])
			.enter()
			.append('path')
			.attr('id',function(){actionIDcountCurve++; return 'path_u'+(useridx).toString()+'_'+(actionIDcountCurve-1).toString();})
			.attr('d',arc)
			.attr('opacity','1.0')
		    .attr("fill", function(d){ return d.currentTime-d.prevTime>0?'black':'black';})
		    .attr("transform", function(d){
		    	var tranY=(d.currentTime-d.prevTime>0?userActHeightU-d.plotPTCT.R:Math.abs(d.plotPTCT.R-userActHeightU));
		    	return d.plotPTCT.R>=userActHeightU ? 'translate(' +(Math.min(d.currentTime,d.prevTime)+Math.abs((d.currentTime-d.prevTime)/2)).toString()+','+(gap*useridx+useridx*userActHeightD+sumH+tranY).toString()+')' : 'translate(' + (Math.min(d.currentTime,d.prevTime)+Math.abs(d.currentTime-d.prevTime)/2+1-1).toString()+','+(gap*useridx+useridx*userActHeightD+sumH).toString()+')';
		    });
		
	
		
		var x = d3.scale.linear().range([0,vidDuration*sizeRatio]);
	    	
		x.domain([0,vidDuration]);      
		var xAxis = d3.svg.axis()
	      .scale(x)
	      .orient("bottom")
	      .tickFormat(function(d,i){ return i==0?'':'';});
	      
	    svg.append("g")
	      .attr("class", "x axis")
	      .attr("transform", "translate(-25," + (gap*useridx+useridx*(userActHeightU+userActHeightD)).toString() + ")")
	      .call(xAxis)
	    // svg.append("g")
	    //   .attr("class", "x axis")
	    //   .attr("transform", "translate(0," + (gap*useridx+useridx*(userActHeightU+userActHeightD)).toString() + ")")
	    //   .append("text")
	    //     .attr("transform", "rotate(0)")
	    //     .attr("y", -5+useridx*(userActHeightU-userActHeightD))
	    //     .attr("x",10+vidDuration*sizeRatio)
	    //     .text(function(){return useridx>0? userTimeWatchN.toString():userTimeWatchN.toString()+'';})//+', userID:'+inVidUserIDarr[useridx]  sec watching at the video.
	    // svg.append("g")
	    //   .attr("class", "x axis")
	    //   .attr("transform", "translate(0," + (gap*useridx+useridx*(userActHeightU+userActHeightD)).toString() + ")")
	    //   .append("text")
	    //     .attr("transform", "rotate(0)")
	    //     .attr("y", 20+useridx*(userActHeightU-userActHeightD))
	    //     .attr("x",10+vidDuration*sizeRatio)
	    //     .text(function(){return useridx>0? userTimeSkipN.toString():userTimeSkipN.toString()+'';})// sec skipped.
	    svg.append("g") 
	      .attr("class", "x axis")
	      .attr("transform", "translate(0," + (gap*useridx+useridx*(userActHeightU+userActHeightD)).toString() + ")")
	      .append("text")
	        .attr("transform", "rotate(0)")
	        .attr("y", 10+useridx*(userActHeightU-userActHeightD))
	        .attr("x",-70)
	      	.text('ID:'+(useridx).toString());
	    svg.append('g')
	    	.attr("transform", "translate(" + (-25).toString() + "," + (gap*useridx+useridx*(userActHeightU+userActHeightD)).toString() + ")")				
	    	.append("rect")
			.attr('class','tmark')
			.attr('id','tmark')
			.attr('width', 3)
			.attr('height',6)
			.attr('x',0)
			.attr('y',useridx*(userActHeightU-userActHeightD)-3);
	}


	var overlay = svg.append("g")
			.attr("transform", "translate(" + (-25).toString() + "," + (-userActHeightU).toString() + ")");					
		
	overlay.append("rect")
		.attr("class", "overlay")
		.attr("width", vidDuration*sizeRatio)
		.attr("height",(inVidUserIDarr.length)*(gap+userActHeightU+userActHeightD))//.attr("height", 3*height + 2*margin.bottom)
		.on("click", function(){
			markPause=true;
			setTimeout(changeMarkState, 3000);
			var mx=d3.mouse(this)[0]; 
			var my=d3.mouse(this)[1]; 
			//console.log('Click x: '+(mx).toString()+',y: '+(my).toString())
			var uid=Math.floor(my/(gap+userActHeightU+userActHeightD));
			//console.log('uid:'+(uid).toString());
			//console.log(allUserAction[inVidUserIDarr[uid]].length);//allUserAction[inVidUserIDarr[uid]].length
			for(var ix=0;ix<allUserAction[inVidUserIDarr[uid]].length;ix++){
				d3.select('#path_u'+uid.toString()+'_'+ix.toString()).attr('opacity',0); 
				d3.select('#area_u'+uid.toString()+'_'+ix.toString()).attr('opacity',0); 
				d3.select('#sArea_u'+uid.toString()+'_'+ix.toString()).attr('opacity',0); 
			}
			for(var ix=0;ix<allUserAction[inVidUserIDarr[uid]].length;ix++){
				d3.select('#path_u'+uid.toString()+'_'+ix.toString()).transition().delay((ix+3)*500).duration(500).attr('opacity',1.0);	
				d3.select('#area_u'+uid.toString()+'_'+ix.toString()).transition().delay((ix+3)*500).duration(500).attr('opacity',0.2);	
				d3.select('#sArea_u'+uid.toString()+'_'+ix.toString()).transition().delay((ix+3)*500).duration(500).attr('opacity',0.2);	
			}	
			var taText=$('#Note').val()
			$('#Note').val(taText+String.fromCharCode(13)+'id:'+(uid).toString()+' @t='+(Math.round(video.currentTime)).toString()+'s ')
			
		})
		.on("mousemove", mousemove)
		.on('mouseout', mouseout);

		//console.log(allUserTimeWatchN)
		//console.log(allUserTimeSkipN)
	overlay.append('text')
		.attr('id','tmark-text')
		.attr('class','tmark-text')
		.attr('x',0)
		.attr('y',0)
		.text('');	
		
	var sizeRatioMain=792/vidDuration;
	var marginMain = {top: 15, right: 37, bottom: 15, left: 20},
    widthMain = vidDuration*sizeRatioMain+marginMain.right+marginMain.left,
    heightWMain = 200,heightSMain=200;

    
	// var xMain = d3.scale.ordinal()
 //    	.rangeRoundBands([0, widthMain], 1.0);
 	var maxWatchMain=d3.max(allUserTimeWatchN);
 	var xMain = d3.scale.linear().range([0,vidDuration*sizeRatioMain]);
 	xMain.domain([0,vidDuration]);  
	var yWMain = d3.scale.linear()
	      .range([heightWMain-marginMain.top-marginMain.bottom, 0]);

	yWMain.domain([0,maxWatchMain]);  

	var svgMain = d3.select("#MainHistogram").append("svg")
		.attr("width", widthMain)
		.attr("height", heightWMain+heightSMain)
		.append("g")
	      .attr("transform", "translate(" + (marginMain.left).toString() + "," + (0).toString() + ")");
	
	    	
	    
	var xAxisMain = d3.svg.axis()
	      .scale(xMain)
	      .orient("bottom")
	      .tickFormat(function(d,i){return i>0 && d%100==0 ?  (d).toString():'';});
	var yAxisWMain = d3.svg.axis()
	      .scale(yWMain)
	      .orient("left");
	     // .tickFormat(function(d,i){ return i==0?'':'';});


	svgMain.append('g')
		.attr('class','x axis')
		.attr('transform','translate(30,'+(heightWMain-marginMain.bottom).toString()+')')
		.call(xAxisMain)
		.append('text')
		.attr('transform','translate('+(widthMain-marginMain.right-marginMain.left-50).toString()+','+(-5).toString()+')')
		.text('time[s]');

	svgMain.append('g')
		.attr('class','y axis')
		.attr('transform','translate(30,'+(marginMain.top).toString()+')')
		.call(yAxisWMain)
		.append('text')
		.attr("text-anchor", "middle")
		.attr('transform','translate('+(-marginMain.left-13).toString()+','+(marginMain.top+90).toString()+') rotate(-90)')
		.text('total # of views');

	var histWMain=svgMain.append('g')
		.attr('transform','translate(30,'+(marginMain.top).toString()+')')
		.selectAll('rect')
		.data(allUserTimeWatchN)
		.enter()
		.append('rect')
		.attr('id',function(d,i){return 'wHisto_'+(i).toString();})//start from 0
		.attr('fill','black')
		.attr('opacity','0.2')
		.attr('x',function(d,i){return xMain(i);})
		.attr('y',function(d){return yWMain(0)-yWMain(maxWatchMain-d);})
		.attr('width',xMain(1))
		.attr('height',function(d){ return yWMain(maxWatchMain-d);});
	
	svgMain.append('g')
	    .append('text')
	    .attr('id','vc-tooltip')
	    .attr('x',20)
	    .attr('y',20)
	    .attr('opacity',0)
		.text('');

	var maxSkipMain=d3.max(allUserTimeSkipN);
	var ySMain = d3.scale.linear()
	      .range([heightSMain-marginMain.top-marginMain.bottom, 0]);

	ySMain.domain([maxSkipMain,0]);  	
	var yAxisSMain = d3.svg.axis()
	      .scale(ySMain)
	      .orient("left");
	svgMain.append('g')
		.attr('class','y axis')
		.attr('transform','translate(30,'+(heightWMain-marginMain.bottom).toString()+')')
		.call(yAxisSMain)
		.append('text')
		.attr("text-anchor", "middle")
		.attr('transform','translate('+(-marginMain.left-13).toString()+','+(marginMain.top+95).toString()+') rotate(-90)')
		.text('total # of skips');
	var histSMain=svgMain.append('g')
		.attr('transform','translate(30,'+(heightWMain-marginMain.bottom).toString()+')')
		.selectAll('rect')
		.data(allUserTimeSkipN)
		.enter()
		.append('rect')
		.attr('id',function(d,i){return 'sHisto_'+(i).toString();})//start from 0
		.attr('fill','black')
		.attr('opacity','0.2')
		.attr('x',function(d,i){return xMain(i);})
		.attr('y',function(d){return ySMain(0);})
		.attr('width',xMain(1))
		.attr('height',function(d){ return ySMain(d);});
	svgMain.append('g')
	    .append('text')
	    .attr('id','sc-tooltip')
	    .attr('x',20)
	    .attr('y',120)
	    .attr('opacity',0)
		.text('');

	var overlayHisto = svgMain.append("g")
			.attr("transform", "translate(" + (33).toString() + "," + (0).toString() + ")");	

	overlayHisto.append("rect")
		.attr("class", "overlay")
		.attr("width", xMain(792))
		.attr("height",ySMain(11)+yWMain(0))//.attr("height", 3*height + 2*margin.bottom)
		.on("mousemove", mousemoveHisto)
		.on('mouseout', mouseoutHisto);		
	overlayHisto.append('text')
		.attr('id','histotmark-text')
		.attr('class','tmark-text')
		.attr('x',0)
		.attr('y',0)
		.text('');		
	overlayHisto.append('text')
		.attr('id','tmark-textMain')
		.attr('class','tmark-text')
		.attr('x',0)
		.attr('y',ySMain(13)+yWMain(0))
		.text('');
	var svgGuide = d3.select("#Guidance").append("svg")
		.attr('class','guidance')
		.attr("width", screen.width)
		.attr("height", screen.height);

	svgGuide.append('rect')
		.attr('width','100%')
		.attr('height','100%')
		.attr('fill','black')
		.attr('opacity',0.1)
		.on("click", function(){
			$('#Guidance').html('');
		});
	svgGuide.append('text')
		.attr('transform','translate(150,'+(200).toString()+')')
		.attr('class','annotation')
		.append('tspan')	
		.text('The frequency of being watched')
		.attr('x',0).attr('dy','15')
		.append('tspan')	
		.text('')
		.attr('x',0).attr('dy','30');

	svgGuide.append('text')
		.attr('transform','translate(150,'+(370).toString()+')')
		.attr('class','annotation')
		.append('tspan')	
		.text('The frequency of being skipped')
		.attr('x',0).attr('dy','15')
		.append('tspan')	
		.text('')
		.attr('x',0).attr('dy','30');

	svgGuide.append('text')
		.attr('transform','translate(1050,'+(200).toString()+')')
		.attr('class','annotation')
		.append('tspan')	
		.text('Video data')
		.attr('x',0).attr('dy','15')
		.append('tspan')	
		.text('')
		.attr('x',0).attr('dy','20');	

	svgGuide.append('text')
		.attr('transform','translate(400,'+(600).toString()+')')
		.attr('class','annotation')
		.append('tspan')	
		.text("Individual time history")
		.attr('x',0).attr('dy','15')
		.append('tspan')	
		.text('')
		.attr('x',0).attr('dy','20');
}
var preSelectedWHistoID;
var preSelectedSHistoID;
setInterval(function() {
	var mx=video.currentTime*sizeRatio;		
	d3.selectAll('#tmark')
			.attr('x',mx);
	
	d3.select(preSelectedWHistoID)
			.attr('fill','black')
			.attr('opacity',0.2);
	d3.select(preSelectedSHistoID)
			.attr('fill','black')
			.attr('opacity',0.2);
	
	d3.select('#wHisto_'+(Math.floor(video.currentTime)).toString())
		.attr('fill','blue')
		.attr('opacity',1.0);
	d3.select('#sHisto_'+(Math.floor(video.currentTime)).toString())
		.attr('fill','blue')
		.attr('opacity',1.0);
	preSelectedWHistoID='#wHisto_'+(Math.floor(video.currentTime)).toString();
	preSelectedSHistoID='#sHisto_'+(Math.floor(video.currentTime)).toString();
	d3.selectAll('#sc-tooltip')
				.attr('x',parseFloat(d3.select('#sHisto_'+(Math.floor(video.currentTime)).toString()).attr('x'))+25)
				.attr('y',parseFloat(d3.select('#sHisto_'+(Math.floor(video.currentTime)).toString()).attr('height'))+200)
				.attr('opacity',1.0)
				.text((allUserTimeSkipN[Math.floor(video.currentTime)]).toString());
	d3.selectAll('#vc-tooltip')
		.attr('x',parseFloat(d3.select('#wHisto_'+(Math.floor(video.currentTime)).toString()).attr('x'))+23)
		.attr('y',parseFloat(d3.select('#wHisto_'+(Math.floor(video.currentTime)).toString()).attr('y'))+10)
		.attr('opacity',1.0)
		.text((allUserTimeWatchN[Math.floor(video.currentTime)]).toString());
	d3.selectAll('#tmark')
		.attr('x',video.currentTime*sizeRatio);
	d3.selectAll('#tmark-textMain')
		.attr('x',video.currentTime*sizeRatio)
		//.attr('y',ySMain(11)+yWMain(0))
		.text('t='+Math.round(video.currentTime).toString());		
}, 20);

video.onplay = function(){
	playing=true;
	var mx=video.currentTime*sizeRatio;
	d3.selectAll('#tmark')
		.attr('x',mx);


}
video.onpause = function(){
	playing=false;
	//console.log(video.paused)
	for(var ix=0;ix<Math.floor(vidDuration);ix++){
  		d3.select('#wHisto_'+(Math.floor(video.currentTime)).toString())
			.attr('fill','black');
		d3.select('#sHisto_'+(Math.floor(video.currentTime)).toString())
			.attr('fill','black');
  }
}
function changeMarkState(){
	markPause=false;
}
function mousemoveHisto() {
		var mx=d3.mouse(this)[0]; 
		var my=d3.mouse(this)[1]; 

		//console.log('Move x: '+(mx).toString()+',y: '+(my).toString())
		if(markPause){
			//do nothing
		}
		else{
			video.currentTime=mx/sizeRatio;
			d3.selectAll('#tmark')
				.attr('x',mx);

			d3.selectAll('#tmark-textMain')
				.attr('opacity',0);

			d3.selectAll('#histotmark-text')
				.attr('opacity',1)
				.attr('x',mx-35)
				.attr('y',my-15)
				.text('t='+Math.round(video.currentTime).toString());
	
		}
}
function mouseoutHisto() {

		d3.selectAll('#tmark-textMain')
				.attr('opacity',1);
		d3.selectAll('#histotmark-text')
			.attr('opacity',0);
		
}
function mousemove() {
		var mx=d3.mouse(this)[0]; 
		var my=d3.mouse(this)[1]; 

		//console.log('Move x: '+(mx).toString()+',y: '+(my).toString())
		if(markPause){
			//do nothing
		}
		else{
			video.currentTime=mx/sizeRatio;
			d3.selectAll('#tmark')
				.attr('x',mx);
			d3.selectAll('#tmark-text')
				.attr('opacity',1)
				.attr('x',mx)
				.attr('y',my+35)
				.text('t='+Math.round(video.currentTime).toString());
			d3.selectAll('#tmark-textMain')
				.attr('opacity',0);
		}
}
function mouseout() {
		d3.selectAll('#tmark-textMain')
				.attr('opacity',1);
		d3.selectAll('#tmark-text')
			.attr('opacity',0);
		
}