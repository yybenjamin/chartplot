// //var fname='https://gitcdn.xyz/repo/yyben/CoUserTracking/master/lecture_actions_test.csv';
// var fnames=['./lecture_actions_p1.csv','./lecture_actions_p2.csv','./lecture_actions_p3.csv','./lecture_actions_p4.csv','./lecture_actions_p5.csv','./lecture_actions_p6.csv'];

// queue(2) //load multiple files
//   .defer(d3.csv, fnames[0])
//   .defer(d3.csv, fnames[1])
//   .defer(d3.csv, fnames[2])
//   .defer(d3.csv, fnames[3])
//   .defer(d3.csv, fnames[4])
//   .defer(d3.csv, fnames[5])
//   .await(parseData);
// var userIDarr=[];
// var userList= new Set([]);//2467人
// function parseData(error, dataAll){
// 	console.log(dataAll.length)



// 	for(var i=0;i<dataAll.length;i++){
// 		userList.add(dataAll[i].username);

// 		dataAll[i].currentTime= parseFloat(dataAll[i].currentTime);
// 		dataAll[i].prevTime= parseFloat(dataAll[i].prevTime);
// 		dataAll[i].playbackRate= parseFloat(dataAll[i].playbackRate);
// 		dataAll[i].eventTimestamp= new Date(parseInt(dataAll[i].eventTimestamp));
// 		dataAll[i].timestamp= new Date(parseInt(dataAll[i].timestamp));
// 		dataAll[i].initTimestamp= new Date(parseInt(dataAll[i].initTimestamp));
// 	}
// 	console.log(dataAll[1]);
// 	console.log(dataAll[1].prevTime)
// 	let userIDarr = [...userList];
// 	console.log(userIDarr.length);



// }
var video = document.getElementById("video_element_first");
var vidInfoFin='./vidAllData.csv';
//var videoAllData=[{'sn':105,'title':'Video 103 Autocad標註形式設定','src':'http://d396qusza40orc.cloudfront.net/graph/recoded_videos%2F606%20AutoCAD%20%E6%A8%99%E8%A8%BB%E5%9E%8B%E5%BC%8F%E8%A8%AD%E5%AE%9A.e9ba21b0577411e4be9c4dc1240a9b05.webm'},{'sn':103,'title':'Video 103 Autocad標註形式設定','src':'http://d396qusza40orc.cloudfront.net/graph/recoded_videos%2F606%20AutoCAD%20%E6%A8%99%E8%A8%BB%E5%9E%8B%E5%BC%8F%E8%A8%AD%E5%AE%9A.e9ba21b0577411e4be9c4dc1240a9b05.webm'}];
var videoAllData=[];
readAllVidInfo();
var selectedVidSN;//SN of the targeted video for further visualisation

var fnames=['./alldata_available_seeked.csv'];

queue() //load multiple files
  .defer(d3.csv, fnames[0])
  .await(parseData);
var userIDarr=[];
var userList= new Set([]);//overall user amount 2467
var vidList= new Set([]);

var allUserAction={};
var inVidUserList= new Set([]);
var inVidUserIDarr=[];

var videoKeyObj={};
var videoSNarr=[];
var vidDuration;
var vidROInterest=[];

var userActHeight=30;//global variables of chart.js

var allUserTimeWatchN=[];
var allUserTimeSkipN=[];
// var userWatchSkipN=[];
// userWatchSkipN.push({'sn':videoAllData[idx].sn,'usersRecord':[]});//{userID:'',skipN:,watchN:}
// 		userWatchSkipN[userWatchSkipN.map(function(e){return e.sn;}).indexOf(selectedVidSN)].usersRecord.push({'userID':'','skipN':0,'watchN':0});



function parseData(error, dataAll){
	//console.log(dataAll.length)

	for(var i=0;i<dataAll.length;i++){
		userList.add(dataAll[i].username);

		dataAll[i].currentTime= parseFloat(dataAll[i].currentTime);
		dataAll[i].prevTime= parseFloat(dataAll[i].prevTime);
		dataAll[i].playbackRate= parseFloat(dataAll[i].playbackRate);
		dataAll[i].eventTimestamp= new Date(parseInt(dataAll[i].eventTimestamp));
		//dataAll[i].timestamp= new Date(parseInt(dataAll[i].timestamp));
		dataAll[i].initTimestamp= new Date(parseInt(dataAll[i].initTimestamp));

		var vidUrl=dataAll[i].page_url;
		var indexSubStr2=vidUrl.indexOf("&");
		var indexSubStr1=vidUrl.indexOf("=");
		var vidSN=0;
		if (indexSubStr2>0){
			vidUrl=vidUrl.substr(0, indexSubStr2);
			vidSN=parseInt(vidUrl.substr(indexSubStr1+1, indexSubStr2));
		}
		else{
			vidSN=parseInt(vidUrl.substr(indexSubStr1+1, vidUrl.length));
		}
		
		if(vidList.has(vidUrl)){
			videoKeyObj[vidUrl].push({'timestamp':dataAll[i].timestamp,'username':dataAll[i].username,'currentTime': parseFloat(dataAll[i].currentTime),'prevTime': parseFloat(dataAll[i].prevTime)});
		}
		else{
			videoSNarr.push({'sn':vidSN, 'url':vidUrl});
			vidList.add(vidUrl);
			videoKeyObj[vidUrl]=[{'timestamp':dataAll[i].timestamp,'username':dataAll[i].username,'currentTime': parseFloat(dataAll[i].currentTime),'prevTime': parseFloat(dataAll[i].prevTime)}];
		}
		
	}
	//console.log(videoKeyObj);
	videoSNarr.sort(sort_by('sn', true, parseInt));
	//console.log(videoSNarr);


	
	selectedVidSN=103;
	vidTargetChange();
	
	//setTimeout(function(){ $('#MainChart').html(''); selectedVidSN=105; vidTargetChange(); }, 10000);//for testing target changing
	
}

function readAllVidInfo(){

	d3.csv(vidInfoFin, function(data) {
  		//console.log(data);
  		data.forEach(function(d) {
		    d.sn = +d.sn;
		    videoAllData.push({'sn':d.sn,'title':d.title,'src':d.src})//{sn:,title:,src:}
		});
		showVidList();
	});

	

}
function showVidList(){
	var width=400,height=200,margin = {top: 10, right: 20, bottom: 30, left: 0};
	var listSvg = d3.select("#videoList").append("svg")
		.attr("width", width)
		.attr("height", height)
		.append("g")
	      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
	for(var idx=0;idx<videoAllData.length;idx++){
		//console.log(videoAllData.length)
		listSvg.append('text')
			.attr('id','item_'+(videoAllData[idx].sn).toString())
			.attr('font-size',10)
			.attr('x',10)
			.attr('y',10*(idx+1))
			.text(videoAllData[idx].title);

	}
	var titleH=10;
	var overlay=listSvg.append("g")
			.append('rect')
			.attr('class','overlay')
			.attr('width',200)
			.attr('height',videoAllData.length*titleH)
			.on("mousemove", function(){
				//var mx=d3.mouse(this)[0]; 
				for(var idx=0;idx<videoAllData.length;idx++){
						d3.select('#item_'+(videoAllData[idx].sn).toString()).attr('font-size',titleH);
				}

				var my=d3.mouse(this)[1]; 
				d3.select('#item_'+(videoAllData[Math.floor(my/titleH)].sn).toString()).attr('font-size',30);	


			})
			.on("mouseout", function(){
				//d3.select('#item_103').attr('font-size',titleH)
				for(var idx=0;idx<videoAllData.length;idx++){
					d3.select('#item_'+(videoAllData[idx].sn).toString()).attr('font-size',titleH);	
				}
			})
			.on("click", function(){
				var my=d3.mouse(this)[1]; 
				var TestselectedVidSN=videoAllData[Math.floor(my/titleH)].sn;
				//console.log(TestselectedVidSN)
			});

}



function vidTargetChange(){

	vidAcquire(selectedVidSN);
	var idxArr=videoSNarr.map(function(e){return e.sn;}).indexOf(selectedVidSN);
	//console.log(videoKeyObj[videoSNarr[idxArr].url]);//get video url of id=101
	vidROInterest=videoKeyObj[videoSNarr[idxArr].url];//fetch video no.103 and its attached data
	console.log(vidROInterest);
	
	//plotPTCT for plotting watchingAreas 
	for (var i=0;i<vidROInterest.length;i++){  
		if(inVidUserList.has(vidROInterest[i].username)){
			allUserAction[vidROInterest[i].username].push({'plotPTCT':{'cT':0,'pT':0,'R':(vidROInterest[i].currentTime-vidROInterest[i].prevTime)*(vidROInterest[i].currentTime-vidROInterest[i].prevTime)/(8*userActHeight)+userActHeight/2},'timestamp':vidROInterest[i].timestamp, 'currentTime':vidROInterest[i].currentTime,'prevTime':vidROInterest[i].prevTime});
		}
		else{
			inVidUserList.add(vidROInterest[i].username);
			allUserAction[vidROInterest[i].username]=[{'plotPTCT':{'cT':0,'pT':0,'R':(vidROInterest[i].currentTime-vidROInterest[i].prevTime)*(vidROInterest[i].currentTime-vidROInterest[i].prevTime)/(8*userActHeight)+userActHeight/2},'timestamp':vidROInterest[i].timestamp, 'currentTime':vidROInterest[i].currentTime,'prevTime':vidROInterest[i].prevTime}];
		}

	}
	for (let item of inVidUserList) {allUserAction[item].sort(sort_by('timestamp', true, parseInt));allUserAction[item].push({'plotPTCT':{'cT':0,'pT':0,'R':0},'timestamp':'-1', 'currentTime':-1,'prevTime':-1})}

	video.addEventListener('loadedmetadata', function() {
    	//console.log(video.duration);
    	vidDuration=video.duration;//seconds
    	video.currentTime=1;
    	for (var t=0;t<vidDuration;t++){ //Math.floor(time)
        	allUserTimeWatchN.push(0);
			allUserTimeSkipN.push(0);
		}
    	draw();
    	
	});
	


}

function vidAcquire(vidSN){
	//get the link
	var vidData=videoAllData[videoAllData.map(function(e){return e.sn;}).indexOf(vidSN)];
	video.src=vidData.src;
	//put the label
	$('#videoInfo').html('Video tutorial: Autocad Dimension Style');//vidData.title
}

// var filterVelRange={'upper':1000,'lower':1};
// function dataFilter(d){
// 	if(d.velocity>filterVelRange.upper || d.velocity<filterVelRange.lower){
// 		return false;
// 	}
// 	else return true;
// }
var sort_by = function(field, reverse, primer){
   var key = function (x) {return primer ? primer(x[field]) : x[field]};

   return function (a,b) {
	  var A = key(a), B = key(b);
	  return ( (A < B) ? -1 : ((A > B) ? 1 : 0) ) * [-1,1][+!!reverse];                  
   }
}
