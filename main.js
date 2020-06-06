
var title = "Comments on Posts",
  data = [{type: "Post A", amount: 4},
         {type: "Post B", amount: 2},
         {type: "Post C", amount: 7},
         {type: "Post D", amount: 5},
         {type: "Post E", amount: 6}];

d3.select("body")
  .append("h3")
  .text(title);

d3.select("body")
  .selectAll("div")
  .data(data)
  .enter()
  .append("div")
  .style("width", function(d) { return d.amount * 40 + "px"; })
  .style("height", "15px");


d3.csv('https://s3-ap-northeast-1.amazonaws.com/www.yyben.tw/prices.csv', d3.autoType).then(function (data) {
  d3.select("body")
    .selectAll("div")
    .data(data)
    .enter()
    .append("div")
    .style("width", function(d) { return d.amount * 40 + "px"; })
    .style("height", "15px");

  console.log(data)
});

//https://raw.githubusercontent.com/sdaityari/my_git_project/master/posts.csv