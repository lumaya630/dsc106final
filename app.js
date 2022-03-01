function final(){
    var filePath="ctdc_data041420.csv";
    bar_plot_forms(filePath);
    steamgraph(filePath);
    scatter_plot(filePath);
    bar_plot_recruiters(filePath);
    network_plot(filePath);
    choropleth_plot(filePath)
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
			gender: d.gender,
			age: d.ageBroad,
			CountryOfExploitation: d.CountryOfExploitation,
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

        var margin = {top: 20, right: 20, bottom: 20, left: 40},
        width = svgwidth - margin.left - margin.right,
        height = svgheight - margin.bottom;
        
        // scales and axis
        var xScale = d3.scaleBand().domain(d3.map(d3.sort(formsExploit, (a,b) => b.value-a.value), d => d.key))
        .range([margin.left, width])
        .padding(0.3)
        var yScale = d3.scaleLinear().domain([d3.min(d3.map(formsExploit, d => d.value))
        	, d3.max(d3.map(formsExploit, d => d.value))])
        	.range([height, margin.top])
       	var xAxis = d3.axisBottom().scale(xScale)
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

	        var margin = {top: 20, right: 20, bottom: 20, left: 40},
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
	       	}


	       	var mouseout = function(e,d){
	       		d3.selectAll(".layers")
	       		.transition().duration(200)
	       		.style("opacity", 1)

	       		d3.select(this).transition(300)
	    			.duration(200)
	    			.style("stroke", "none")
	       	}

	    	//draw box
	        var svg = d3
	            .select("#steamgraph").append("svg")
	            .attr("class","box")
	            .attr("width", svgwidth)
	            .attr("height", svgheight)

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

	        svg.selectAll("text")
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
	      
	      d3.selectAll("input")
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
					if (d.isForcedMarriage == -99){
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

        var margin = {top: 40, right: 40, bottom: 40, left: 40},
        width = svgwidth - margin.left - margin.right,
        height = svgheight - margin.bottom;
        
        // scales and axis
        var xScale = d3.scaleLinear().domain([0, d3.max(by_country, (d) => d.value["Forced Labour"])])
        .range([margin.left, width])
        var yScale = d3.scaleLinear().domain([0, d3.max(d3.map(by_country, 
        	d => d.value["Sexual Exploitation"]))])
        	.range([height, margin.top])
       	var xAxis = d3.axisBottom().scale(xScale)
       	var yAxis = d3.axisLeft().scale(yScale)

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

        svg.append("g")
        .attr("class", "yAxis")
       	.attr("transform", "translate(" + margin.left + "," + 0 + ")")
        .call(yAxis)

        // plots circles
        svg.selectAll(".circles")
        .data(by_country)
        .enter()
        .append('circle')
        .attr("class", "circles")
        .attr("cx", d => xScale(d.value["Forced Labour"]))
        .attr("cy", d => yScale(d.value["Sexual Exploitation"]))
        .attr("r", 5)
        .attr("fill", "#117A65")
        .style("opacity", 0.5)

        console.log(by_country)

      
	})	



}

// **************************************
   
var bar_plot_recruiters = function(filePath){

}

// **************************************

var network_plot = function(filePath){
}

// **************************************
    
var choropleth_plot = function(filePath){

}
