
function final(){
    var filePath="ctdc_data_final.csv";
    bar_plot_forms(filePath);
    steamgraph(filePath);
    scatter_plot(filePath);
    network_plot(filePath);
    choropleth_plot(filePath);
    yuh(filePath);
}

// helper function to read in data
var read_data = function(filePath){
	var other = function(d) {
		if (d.isAbduction == "1" || 
			d.isForcedMarriage == "1" ||
			d.isOrganRemoval == "1" ||
			d.isOtherExploit == "1" ||
			d.isForcedMilitary == "1"){
			return 1} 
		else {
			return 0}
		}
	
	var rowConverter = function(d) {
		return {
			yearOfRegistration: d.yearOfRegistration,
			citizenship: d.citizenship,
			citizenshipName: d.citizenshipName,
			citizenshipAlpha3: d.citizenshipAlpha3,
			gender: d.gender,
			age: d.ageBroad,
			CountryOfExploitation: d.CountryOfExploitation,
			CountryOfExploitationName: d.CountryOfExploitationName ,
			CountryOfExploitationAlpha3: d.CountryOfExploitationAlpha3,
			isForcedLabour: parseFloat(d.isForcedLabour),
			isAbduction: parseFloat(d.isAbduction),
			isSexualExploit: parseFloat(d.isSexualExploit),
			isForcedMarriage: parseFloat(d.isForcedMarriage),
			isOrganRemoval: parseFloat(d.isOrganRemoval),
			isOtherExploit: parseFloat(d.isOtherExploit),
			isForcedMilitary: parseFloat(d.isForcedMilitary),
			isOther: other(d),
			typeOfExploitConcatenated: d.typeOfExploitConcatenated,
			RecruiterRelationship: d.RecruiterRelationship,
			recruiterRelationFamily: parseFloat(d.recruiterRelationFamily),
			recruiterRelationFriend: parseFloat(d.recruiterRelationFriend),
			recruiterRelationIntimatePartner: parseFloat(d.recruiterRelationIntimatePartner),
			recruiterRelationOther: parseFloat(d.recruiterRelationUnknown)				
		}
	}

    let data = d3.csv(filePath, rowConverter);

    return data
}

// **************************************

var bar_plot_forms = function(filePath){
	let data = read_data(filePath);	
	data.then(function(d){
		// ************
		// PROCESS DATA
		// ************		

		let formsExploit = ["isSexualExploit", "isForcedLabour", "isAbduction",
		"isForcedMarriage", "isOrganRemoval", "isOtherExploit", "isForcedMilitary"]

		// create new array of object that records total values for each form of exploitation
		formsExploit = d3.map(formsExploit, function(e) {
			return{
				key: e,
				value: (d3.sum(d3.map(d, function(f) {
					if (f[e] == -99){
						return 0}
					else {return f[e]}
				})))
			
			}})

		// view data
		console.log(formsExploit)

		// ******+++
		// PLOT SVG
		// ******+++

		// PREPPING ELEMENTS
		// set dimensions
		var svgwidth = 700;
        var svgheight = 300;

        var margin = {top: 20, right: 20, bottom: 20, left: 75},
        width = svgwidth - margin.left - margin.right,
        height = svgheight - margin.bottom;
        
        // scales and axis
        var xScale = d3.scaleBand().domain(d3.map(d3.sort(formsExploit, (a,b) => b.value-a.value), d => d.key))
        .range([margin.left, width])
        .padding(0.3)
        var yScale = d3.scaleLinear().domain([d3.min(d3.map(formsExploit, d => d.value))
        	, d3.max(d3.map(formsExploit, d => d.value))])
        	.range([height, margin.top])

        var tickLabels = ["Sexual Exploitation", "Forced Labor", "Other", "Forced Marriage", 
        "Abduction", "Organ Removal", "Forced Military" ]
       	var xAxis = d3.axisBottom().scale(xScale).
       	tickFormat((d,i) => tickLabels[i])
       	var yAxis = d3.axisLeft().scale(yScale)

       	// tooltip
       	var tooltip= d3.select("#bar_plot_forms")
       		.append("div")
       		.attr("class", "tooltip")

       	var mouseover = function(e,d){
       		d3.select(this).transition()
    			.duration(200).attr("fill", "#B03A2E")

    		tooltip.transition().duration(300)
    		.style("opacity", 1)
       	}

       	var mousemove = function(e,d){
       		tooltip
       		.text("Instances: " + d.value)
       		.style("left", d3.select(this).attr("x") - 300 + "px")
    		.style("top", d3.select(this).attr("y") + "px")
       	}

       	var mouseout = function(e,d){
       		d3.select(this).transition(300)
    			.duration(200).attr("fill", "#E74C3C")


    		tooltip.transition().duration(300)
    		.style("opacity", 0)
       	}

       	// DRAWING SVG
        //draw box
        var svg = d3
            .select("#bar_plot_forms").append("svg")
            .attr("class","box")
            .attr("width", svgwidth)
            .attr("height", svgheight)

        //plot xaxis
        svg.append("g")
        .attr("class", "xAxis")
        .attr("transform", "translate(" + 0 + "," + height + ")")
        .call(xAxis)


        svg.append("g")
        .attr("class", "yAxis")
       	.attr("transform", "translate(" + margin.left + "," + 0 + ")")
        .call(yAxis)

        svg.append("text")
		    .attr("class", "y-label")
		    .attr("text-anchor", "end")
		    .attr("x", -100)
		    .attr("y", 20)
		    .attr("transform", "rotate(-90)")
		    .text("Instances Reported");

        //append bars      
        let bars = svg.selectAll(".bars")
        .data(formsExploit)
        .enter()
        .append("rect")
        .attr("class", "bars")
        .attr("x", (d) => xScale(d.key))
        .attr("y", height)
        .attr("width", xScale.bandwidth())
        .attr("height", 0)
        .attr("fill", "#E74C3C")
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseout", mouseout)

        svg.append("text")
            .attr("class", "x label")
            .attr("x", 30)
            .attr("y", 290)
		    .attr("text-anchor", "end")
            .style("font-size", 15)
            .text("Type")

        bars
          .transition("growth")
          .duration(1000)
          .attr("y", (d) => yScale(d.value)) 
          .attr("height", (d) => height - yScale(d.value));
	})

}

// **************************************

var steamgraph = function(filePath){
	let data = read_data(filePath);	

	data.then(function(data){
		let by_year = d3.rollup(data, function(v) {
				return {
					"Sexual Exploitation": d3.sum(v, function(d) {
						if (d.isSexualExploit == -99){
							return 0
						} else {return d.isSexualExploit}
					}),

					"Forced Labour": d3.sum(v, function(d){
						if (d.isForcedLabour == -99){
							return 0
						} else {return d.isForcedLabour}
					}),

					"Other": d3.sum(v, function(d){
						if (d.isOther == -99){
							return 0
						} else {return d.isOther}
					})
				}}, d => d.yearOfRegistration)


			// create array from object
			by_year = Array.from(by_year, ([year, value]) => ({year, value}) )

			// long format
			by_year = d3.map(by_year, function(d){return {
				year: d.year,
				"Sexual Exploitation": d.value["Sexual Exploitation"],
				"Forced Labour": d.value["Forced Labour"],
				"Other": d.value["Other"]
			}})

			// sort
			by_year = d3.sort(by_year, (a,b) => a.Year - b.Year)

		// PREPPING ELEMENTS
			// set dimensions
			var svgwidth = 700;
	        var svgheight = 300;

	        var margin = {top: 20, right: 20, bottom: 20, left: 75},
	        width = svgwidth - margin.left - margin.right,
	        height = svgheight - margin.bottom;
	        
	        // scales and axis
	        var xScale = d3.scaleBand().domain(d3.map(by_year, d => d.year))
	        .range([margin.left, width])
	        .padding(0.3)
	        var yScale = d3.scaleLinear()
	        	.range([height, margin.top])

	       	var xAxis = d3.axisBottom().scale(xScale)
	       	var yAxis = d3.axisLeft().scale(yScale)

	       	// colors
	       	var colors = d3.scaleOrdinal(d3.schemeAccent).domain(d3.map(Array.from(d3.group(data, d => d.yearOfRegistration),
	       		([year, value]) => ({year, value})), d => d.year))
	       
	       	var mouseover = function(e,d){	       		
	       		d3.selectAll(".layers")
	       		.transition()
	       		.duration(200)
	       		.style("opacity", 0.5)

	       		d3.select(this).transition()
	    			.duration(200)
	    			.style("stroke", "black")
	    			.style("opacity", 1)

	    		d3.selectAll(".legend_text")
	    		.filter( f =>  f == d.key)
	    		.transition().duration(200)
	    		.style("font-weight", 600)
	       	}


	       	var mouseout = function(e,d){
	       		d3.selectAll(".layers")
	       		.transition().duration(200)
	       		.style("opacity", 1)

	       		d3.select(this).transition(300)
	    			.duration(200)
	    			.style("stroke", "none")

	    		d3.selectAll(".legend_text")
	    		.filter( f =>  f == d.key)
	    		.transition().duration(200)
	    		.style("font-weight", 400)
	       	}

	    	//draw box
	        var svg = d3
	            .select("#steamgraph").append("svg")
	            .attr("class","box")
	            .attr("width", svgwidth)
	            .attr("height", svgheight)

	        svg.append("text")
		    .attr("class", "y-label")
		    .attr("text-anchor", "end")
		    .attr("x", -100)
		    .attr("y", 20)
		    .attr("transform", "rotate(-90)")
		    .text("Instances Reported");

		    svg.append("text")
            .attr("class", "x label")
            .attr("x", 30)
            .attr("y", 290)
		    .attr("text-anchor", "end")
            .style("font-size", 15)
            .text("Year")

	        // add legend
	        svg.selectAll("circle")
	        .data(["Sexual Exploitation", "Forced Labour", "Other"])
	        .enter()
	        .append("circle")
	        .attr("class", "legend_dots")
	        .attr("cx", 550)
	        .attr("cy", function(d,i) {return 50 + 25 * i})
	        .attr("r", 4)
	        .attr("fill", (d) => colors(d))

	        svg.selectAll("legend_text")
	        .data(["Sexual Exploitation", "Forced Labour", "Other"])
	        .enter()
	        .append("text")
	        .attr("class", "legend_text")
	        .attr("x", 570)
	        .attr("y", function(d,i) {return 50 + 25 * i})
	        .attr("fill", "black")
	        .text(function(d) {return d})

		//**************
		// PROCESS DATA
		// *************

		let plot = function(gender){


			subset = d3.filter(data, d =>(d.gender == gender))

			let by_year = d3.rollup(subset, function(v) {
				return {
					"Sexual Exploitation": d3.sum(v, function(d) {
						if (d.isSexualExploit == -99){
							return 0
						} else {return d.isSexualExploit}
					}),

					"Forced Labour": d3.sum(v, function(d){
						if (d.isForcedLabour == -99){
							return 0
						} else {return d.isForcedLabour}
					}),

					"Other": d3.sum(v, function(d){
						if (d.isOther == -99){
							return 0
						} else {return d.isOther}
					})
				}}, d => d.yearOfRegistration)


			// create array from object
			by_year = Array.from(by_year, ([year, value]) => ({year, value}) )

			// long format
			by_year = d3.map(by_year, function(d){return {
				year: d.year,
				"Sexual Exploitation": d.value["Sexual Exploitation"],
				"Forced Labour": d.value["Forced Labour"],
				"Other": d.value["Other"]
			}})

			// sort
			by_year = d3.sort(by_year, (a,b) => a.Year - b.Year)

			// create stacked data for steamgraph
			var stackedData = d3.stack()
	    	.keys(["Sexual Exploitation", "Forced Labour", "Other"])
	    	(by_year)


	    	// EXIT OLD DATA
	    	var areas = svg.selectAll(".layers").data(stackedData)
	    	areas.exit().remove()
			svg.selectAll("g").data(stackedData).exit().remove()

	    	// ********
	    	// PLOT SVG
	    	// ********
	    	yScale.domain([0, d3.max(d3.map(by_year, 
	        	function(d) {return d["Sexual Exploitation"] + d["Forced Labour"] + d["Other"]}))])

	    	//plot axes
	        svg.append("g")
	        .attr("class", "xAxis")
	        .attr("transform", "translate(" + 0 + "," + height + ")")
	        .call(xAxis)

	        svg.append("g")
	        .attr("class", "yAxis")
	       	.attr("transform", "translate(" + margin.left + "," + 0 + ")")
	        .call(yAxis)

	        
	        // UPDATE old element present in new data
	        // draw areas
	       areas
	        .enter()
	        .append("path")
	        .attr("class", "layers")
	        .merge(areas)
	        .attr("fill", d => colors(d.key))
	        .attr("d", d3.area()
	         	.x(function(d,i) {return xScale(d.data.year)})
	        	.y0(function(d) {return yScale(d[0])})
	        	.y1(function(d) {return yScale(d[1])}))
	        .on("mouseover", mouseover)
	        .on("mouseout", mouseout)
	       }

	      plot("Female")
	      
	      d3.selectAll("#steam_radio")
    		.on("change", function(d){
    		gender = d.target.defaultValue
    		plot(gender)})
	})

}

// **************************************
   
var scatter_plot = function(filePath){
	let data = read_data(filePath);

	data.then(function(data){
		let by_country = d3.rollup(data, function(v){
			return{
				"Sexual Exploitation": d3.sum(v, function(d) {
					if (d.isSexualExploit == -99){
						return 0
					} else {return d.isSexualExploit}
				}),

				"Forced Labour": d3.sum(v, function(d) {
					if (d.isForcedLabour == -99){
						return 0
					} else {return d.isForcedLabour}
				})}
		}, d => d.citizenship)

		by_country = Array.from(by_country, ([country, value]) => ({country, value}))

		// ********
    	// PLOT SVG
    	// ********
    	
    	// PREPPING ELEMENTS
		// set dimensions
		var svgwidth = 550;
        var svgheight = 550;

        var margin = {top: 40, right: 40, bottom: 75, left: 75},
        width = svgwidth - margin.left - margin.right,
        height = svgheight - margin.bottom;
        
        // scales and axis
        var xScale = d3.scaleLinear().domain([0, (d3.max(by_country, (d) => d.value["Forced Labour"]))])
        .range([margin.left, width])
        var yScale = d3.scaleLinear().domain([0, d3.max(d3.map(by_country, 
        	d => (d.value["Sexual Exploitation"])))])
        	.range([height, margin.top])
       	var xAxis = d3.axisBottom().scale(xScale)
       	var yAxis = d3.axisLeft().scale(yScale)

       	console.log((d3.map(by_country, 
        	d => Math.log(d.value["Sexual Exploitation"]))))
       	console.log((d3.map(by_country, 
        	d => (d.value["Sexual Exploitation"]))))

       	// colors
       	//var colors = d3.scaleOrdinal(d3.schemeAccent).domain(d3.map(b, d => d.year))
		//draw box
        var svg = d3
            .select("#scatter_plot").append("svg")
            .attr("class","box")
            .attr("width", svgwidth)
            .attr("height", svgheight)

        //plot xaxis
        svg.append("g")
        .attr("class", "xAxis")
        .attr("transform", "translate(" + 0 + "," + height + ")")
        .call(xAxis)

        svg.append("text")
	    .attr("class", "x-label")
	    .attr("text-anchor", "middle")
	   	.attr("x", 250)
	    .attr("y", 525)
	    .text("Instances of Forced Labor Reported");

        svg.append("g")
        .attr("class", "yAxis")
       	.attr("transform", "translate(" + margin.left + "," + 0 + ")")
        .call(yAxis)

        svg.append("text")
		    .attr("class", "y-label")
		    .attr("text-anchor", "middle")
		    .attr("x", -250)
		    .attr("y", 20)
		    .attr("transform", "rotate(-90)")
		    .text("Instances of Sexual Exploitation Reported");

        // plots circles
        svg.selectAll(".circles")
        .data(by_country)
        .enter()
        .append('circle')
        .attr("class", "circles")
        .attr("cx", d => xScale((d.value["Forced Labour"])))
        .attr("cy", d => yScale((d.value["Sexual Exploitation"])))
        .attr("r", 5)
        .attr("fill", "#117A65")
        .style("opacity", 0.5)
      
	})	
}

// **************************************
   
var bar_plot_recruiters = function(filePath){

}


// **************************************

var network_plot = function(filePath){
	let data = read_data(filePath);

	// ***************
	// PREPROCESS DATA
	// ***************

	networkData = [
	]
	data.then(function(data){
		console.log(data)
		// find nodes (id, name)
		let countries_exploit = d3.map(data.filter(d => d.CountryOfExploitation != '-99'), 
			function(d){
				return{
					id: d.CountryOfExploitation,
					name: d.CountryOfExploitationName
				}
			})

		countries_exploit = [...new Map(countries_exploit.map(item => [item["id"], item])).values()]

		let countries_origin = d3.map(data.filter(d => d.citizenship != '-99'), 
			function(d){
				return{
					id: d.citizenship,
					name: d.citizenshipName
				}
			})

		countries_origin = [...new Map(countries_origin.map(item => [item["id"], item])).values()]

		node_id = countries_exploit.concat(countries_origin)
		node_id = [... new Map(node_id.map(item => [item["id"], item])).values()].filter(d => (d.id != "-99" && d.id != "00"))
		networkData.nodes = node_id

		console.log(node_id)

		// find edges
		edges = d3.flatRollup(data, v => v.length, d => d.citizenship, d=> d.CountryOfExploitation)
		networkData.links = d3.map(edges, function(d){
			return{
				source: d[0],
				target: d[1],
				value: d[2] 
			}
		}).filter(d => d.target != '-99' && d.source != '00' && d.source != '-99' && d.target != "00" && d.target != d.source)

		let links_copy = JSON.parse(JSON.stringify(networkData.links))

		// create function to normalize values in links (strength of node) 
		let max = d3.max(d3.map(networkData.links, d => d.value))
		let min = d3.min(d3.map(networkData.links, d => d.value))
		let norm = function(val, max, min){
			return (val - min) / (max - min)
		}
		console.log(max)
		// *********************** ^^ DONT EDIT ^^ **************************
		
		// tooltip
	    var tooltip= d3.select("#network")
	       		.append("div")
	       		.attr("class", "tooltip")

	       var mouseover = function(event, d) {
	    			tooltip
	    			.transition()
	    			.duration(200)
	    			.style("opacity", 1)
	    			}

	    	var mousemove = function(event, d){
	    			tooltip
	    			.text(d.name)
	    			.style("left", (d3.select(this).attr("cx")-100 ) + "px")
	    			.style("top", d3.select(this).attr("cy") + "px")
	    	}

	    	var mouseout = function(event, d){
	    			tooltip
	    			.transition()
	    			.duration(300)
	    			.style("opacity", 0)
	    	}

		// ********
		// DRAW SVG
		// ********
		// set up dimensions
   		var svgwidth = 500;
    	var svgheight = 500;

    	var margin = {top: 30, right: 30, bottom: 30, left: 30},
    	width = svgwidth - margin.left - margin.right,
   		height = svgheight - margin.bottom;

   		// draw base svg
    	var svg= d3
    	.select("#network").append("svg")
    	.attr("class","box")
    	.attr("width", svgwidth)
    	.attr("height", svgheight)
    	.attr("viewBox", [0, 0, width, height])

    	//simulation
    	var simulation = d3.forceSimulation()
    	.force("charge", d3.forceManyBody().strength(-3))
	    .force("center", d3.forceCenter().x(width/2).y(height/2).strength(0.5) ) 
	    .force("link", d3.forceLink()
	    	.id((d) => d.id)
	    	.distance(30)
	    	.strength(10))

	    simulation.nodes(networkData.nodes)
	    .force("link", d3.forceLink().links(networkData.links).id((d) => d.id))
	    .on("tick", ticked)

	    // link and nodes
	    var link = svg.selectAll(".link")
			.data(networkData.links)
			.enter().append("line")
			.attr("class", "link")
			.style("opacity", 0.7)
			//.style("stroke-width", function (d) {return norm(d.value, max, min) * 10})


		var node = svg.selectAll(".node")
			.data(networkData.nodes)
			.enter().append("circle")
			.attr("class", "node")
			.attr("r", 8)

		// add coordinates
		function ticked() {
		    link
		    .attr("x1", function (d) {return d.source.x;})
		    .attr("y1", function (d) {return d.source.y;})
		    .attr("x2", function (d) {return d.target.x;})
		    .attr("y2", function (d) {return d.target.y;});
		    
		    node
		    .attr("cx", function (d) {return d.x;})
		    .attr("cy", function (d) {return d.y;})
		    .style("fill", function(d) { if 
		    	(d3.map(d3.map(networkData.links, d=> d.source), d => d.id)
		    	.concat(d3.map(d3.map(networkData.links, d=> d.target), d => d.id))
		    	.includes(d.id)){return "#2282BA"}
		    	else {return "gray"}
		    })
		    .on("mouseover", mouseover)
		    .on("mousemove", mousemove)
		    .on("mouseout", mouseout)
		  }

		 // threshold
		function threshold(thresh) {
			console.log(thresh)
			
			// delete all data
		    networkData.links.splice(0, networkData.links.length);

		   	// push in only data that is above the treshold
			for (var i = 0; i < links_copy.length; i++) {
				if (links_copy[i].value > thresh) {networkData.links.push(links_copy[i]);}
			}

			console.log(networkData.links)
		    restart();
		}
		console.log(norm(1676, max, min))
		// restart after there are any changes to node/links
		function restart() {
		    //DATA JOIN
		    link = link.data(networkData.links);
		    //EXIT
		    link.exit().remove();
		    // ENTER 
		    link = link.enter().append("line")
			.attr("class", "link")
			.style("opacity", 1)
			//.style("stroke-width", function (d) {return norm(d.value, max, min) * 10})
		    .merge(link);		    
		    
		    // DATA JOIN
		    node = node.data(networkData.nodes);
		    
		    // run simulation
		    simulation.
		    nodes(networkData.nodes).
		    on("tick", ticked);

		    simulation.force("link").
		    links(networkData.links);
		    simulation.alpha(0.5).restart();
		  }

		 // when change slider
		 document.getElementById("thresholdSlider").onchange = function () {threshold(this.value);};

		// END OF DATA.THEN
	})
}

// **************************************
    
function choropleth_plot(filePath){
	let data = read_data(filePath);
	let topo = d3.json("world-110m.geojson")

	//let topo = JSON.parse("world-110m.geojson")
	topo.then(function(topo){
		data.then(function(data){
			// ***************
			// PREPROCESS DATA
			// ***************
			let exploitation = d3.flatRollup(data, 
				v => v.length, 
				d => d.CountryOfExploitationName, d => d.CountryOfExploitationAlpha3)
			exploitation = Array.from(exploitation, ([Country, Code, Instances]) => ({Country, Code, Instances}))

			// SET UP ELEMENTS
			const projection = d3.geoRobinson()
			.scale(130)
			//.translate([width / 2, height / 2]);

			const colorScale = d3.scaleThreshold()
			.domain([0, 10, 100, 200, 1000, 5000, 10000])
			//.domain([0, d3.max(d3.map(exploitation, d => d.Instances))])
			.range([ "#FEF9E7" ,"#fff7ec","#F7DC6F","#F5B041","#DC7633","#943126", "#66033c"])

			console.log(d3.max(d3.map(exploitation, d => d.Instances)))
			console.log(colorScale(200))

			// add tooltip
			const tooltip = d3.select("#choropleth_plot").append("div")
			.attr("class", "tooltip")
			.style("opacity", 0);

			// tooltip
	    	let mouseOver = function(e, d) {
			d3.selectAll(".Country")
				.transition()
				.duration(200)
				.style("opacity", .5)
				.style("stroke", "transparent");
			d3.select(this)
				.transition()
				.duration(200)
				.style("opacity", 1)
				.style("stroke", "black")

			tooltip.style("left", (e.pageX-500) + "px")
				.style("top", (e.pageY-2000) + "px")
				.transition().duration(400)
				.style("opacity", 1)
				.text(d.properties.name + ': ' + Math.round(d.instances));
			}

			let mouseLeave = function() {
				d3.selectAll(".Country")
					.transition()
					.duration(200)
					.style("opacity", 1)
					.style("stroke", "transparent");
				tooltip.transition().duration(300)
					.style("opacity", 0);
			}
			
			// ********
			// DRAW SVG
			// ********
			// set up dimensions
	   		var svgwidth = 800;
	    	var svgheight = 450;

	    	var margin = {top: 30, right: 30, bottom: 30, left: 30},
	    	width = svgwidth - margin.left - margin.right,
	   		height = svgheight - margin.bottom;
	   		path = d3.geoPath()

	   		// draw base svg
	    	var svg= d3
	    	.select("#choropleth_plot").append("svg")
	    	.attr("class","box")
	    	.attr("width", svgwidth)
	    	.attr("height", svgheight)

	    	world = svg.append("g")
	    	.attr("class", "world");
			world.selectAll("path")
					.data(topo.features)
					.enter()
					.append("path")
					
					// draw each country
					.attr("d", d3.geoPath().projection(projection))


					//retrieve the name of the country from data
					.attr("data-name", function(d) {
						return d.properties.name
					})

					// set the color of each country
					.attr("fill", function(d) {
						subset = d3.filter(exploitation, dat => dat.Code == d.id)
						if (subset.length == 0){
							d.instances = 0
						} else{
							d.instances = subset[0].Instances
						}

						return colorScale(d.instances);
					})
					

					// add a class, styling and mouseover/mouseleave and click functions
					.style("stroke", "transparent")
					.attr("class", function(d) {
						return "Country"
					})
					.attr("id", function(d) {
						return d.id
					})
					.style("opacity", 1)
					.on("mouseover", mouseOver)
					.on("mouseleave", mouseLeave)	 

			//legend
			var labels = ["0-10", "10-100", "100-200", "200-1000", "1000-5000", "5000-10000", "10000+" ]

			
			var legend = svg.selectAll('g.legendEntry')
    		.data(colorScale.range().reverse())
   			.enter()
    		.append('g')
    		.attr('class', 'legendEntry');

	
			legend.append("rect")
			.attr("x", 40 )
    		.attr("y", function(d, i) {
       			return i * 20;})
       		.attr("width", 10)
		   .attr("height", 10)
		   .style("stroke", "black")
		   .style("stroke-width", 1)
		   .style("fill", function(d){return d;}); 

		   legend
		    .append('text')
		    .attr("class", "legend_text")
		    .attr("x", 55) //leave 5 pixel space after the <rect>
		    .attr("y", function(d, i) {
		       return i * 20;})
		    .attr("dy", "0.5em") //place text one line *below* the x,y point
		    .text(function(d,i) {
		        return labels.reverse()[i];})

		    // end of topo then
		    })
		//end of data then
		})

}

// **************************************

var yuh = function(filePath) {
    tmp = [];

    let data = read_data(filePath);
//making the unique age bracket keys
    data.then(function(data) {
    	for (let a = 0; a < data.length; a++) {
    		if (data[a].age != "-99") {
    			tmp.push(data[a].age);

    		}
    	}
		let ageBrackets = [...new Set(tmp)];
		var groups = ageBrackets;


	    //making dictionary
	    dct = {}
	    for (let a = 0; a < ageBrackets.length; a++) {
	    	dct[ageBrackets[a]] = {"isForcedLabour": 0,
			"isAbduction": 0,
			"isSexualExploit": 0,
			"isForcedMarriage": 0,
			"isOrganRemoval": 0,
			"isOtherExploit": 0,
			"isForcedMilitary": 0,
			"isOther": 0}
	    }
	    
		
	    for (let a = 0; a < data.length; a++) {
	    	if (data[a].age != "-99") {
	    		if (data[a].isForcedLabour == 0) {
	    			dct[data[a].age]["isForcedLabour"] +=1;
	    		}
	    		if (data[a].isAbduction == 0) {
	    			dct[data[a].age]["isAbduction"] +=1;
	    		}
	    		if (data[a].isSexualExploit == 0) {
	    			dct[data[a].age]["isSexualExploit"] +=1;
	    		}
	    		if (data[a].isForcedMarriage == 0) {
	    			dct[data[a].age]["isForcedMarriage"] +=1;
	    		}
	    		if (data[a].isOrganRemoval == 0) {
	    			dct[data[a].age]["isOrganRemoval"] +=1;
	    		}
	    		if (data[a].isOtherExploit == 0) {
	    			dct[data[a].age]["isOtherExploit"] +=1;
	    		}
	    		if (data[a].isForcedMilitary == 0) {
	    			dct[data[a].age]["isForcedMilitary"] +=1;
	    		}
	    		if (data[a].isOther == 0) {
	    			dct[data[a].age]["isOther"] +=1;
	    		}
	    	}
	    }
		var margin = {top: 20, right: 50, bottom: 30, left: 0},
            width = 350 - margin.left - margin.right,
            height = 300 - margin.top - margin.bottom;


        function newdct(tmp) {



            var s = Object.keys(tmp).map(function(x) {
              return tmp[x];
            });

            var rs = Object.keys(tmp).map(function(y) {
              return y;
            });

            
        var svg = d3.select("#yuh")
              .append("svg").attr("id", "tempp")
                .attr("height", 450)
                .attr("width", 460)
              .append("g")
                .attr("transform",
                      "translate(60,30)");
            var y_Scale = d3.scaleLinear()
              .domain([0, 3000])
              .range([ 300, 10]);

            svg.append("g")
              .call(d3.axisLeft(y_Scale));

            var x_Scale = d3.scaleBand()
              .range([0,370])
              .domain(rs)
              .padding(0.15);

            svg.append("g")
                .style("text-anchor", "end")
              .attr("transform", "translate(0,300)")
              .call(d3.axisBottom(x_Scale))
              .selectAll("text")
                .attr("transform", "translate(-10,0)rotate(-45)");
            var yx = svg.selectAll("mybar")
              .data(s);
            yx.exit().remove();

            
            var Tooltip = d3.select('#yuh').append('div').style('opacity', 0).attr('class', 'tooltip');


       	
            yx.enter()
              .append("circle")
                .attr("cy", function(tmp) { return y_Scale(tmp); })
                .attr("cx", function(tmp) { return 26 + x_Scale(rs[s.indexOf(tmp)]); })
                .attr("r", 5)
                .on("mouseover", (e,d)=> {
                    Tooltip.transition().duration(100).style("opacity", 0.8);
                    Tooltip.html(d.toFixed(2)).style("left", e.pageX - 100 + "px").style("top", -3050 + e.pageY + "px");
                })
                .on("mousemove", (e,d)=> {
                    Tooltip.transition().duration(100).style("opacity", 0.8);
                    Tooltip.html(d.toFixed(2)).style("left", e.pageX  - 100 + "px").style("top", -3050 + e.pageY + "px");
                })
                .on("mouseout", function(d) {
    				d3.select(this).attr('fill', 'orange').style("opacity", 1);})
 
                .attr("stroke", "none")
                .attr("class", "circle")
                .attr("fill", "orange");
            svg.append("text")
            .attr("class", "x label")
            .attr("x", 200)
            .attr("y", 400)
		    .attr("text-anchor", "end")
            .style("font-size", 15)
            .text("Exploitation Type")


            svg.append("text")
            .attr("text-anchor", "end")
            .attr("class", "y label")
            .attr("y", -50)
            .attr("x", -80)
            .style("font-size", 15)
            .attr("transform", "rotate(-90)")
            .text("Instances Reported")

//start from here
            



        }

        d3.selectAll("#scatter_radio").on("change", tmp=>{
        	d3.select("#tempp").remove()
        	var age = tmp.target.value;

        	newdct(dct[age])
        })
        newdct(dct["0--8"]);
    }
)}
