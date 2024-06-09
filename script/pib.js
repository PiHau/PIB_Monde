Promise.all([
    d3.json('data/world@1.json'), // Chemin vers le fichier GeoJSON
    d3.json('data/merged_indicators.json'), // Chemin vers le fichier des indicateurs pour la carte
    d3.json('data/indicators1960_2022.json') // Chemin vers le nouveau fichier des indicateurs pour le graphique
]).then(function(data) {
    const worldData = data[0];
    const mapIndicators = data[1];
    const graphIndicators = data[2];
    const svg = d3.select('#map').append('svg')
        .attr('width', '100%')
        .attr('height', '600px');

    const projection = d3.geoOrthographic()
        .scale(240)  // Réduit la taille de la sphère 
        .translate([svg.node().getBoundingClientRect().width / 2, svg.node().getBoundingClientRect().height / 2])
        .clipAngle(90);

    const path = d3.geoPath().projection(projection);

    const indicatorName = '2012_pib_hab'; // Indicateur fixe pour la démo
    const values = mapIndicators.map(d => d[indicatorName]).filter(v => v != null && v > 0);
    const maxVal = Math.max(...values);

    const colorScale = d3.scaleSequential(d3.interpolateReds)
        .domain([0, maxVal]);

    const graphContainer = d3.select('#graph1').append('svg')
        .attr('width', '100%')
        .attr('height', '100%'); // Utiliser toute la hauteur disponible

    const popup = d3.select('#popup');

    let lastRotation = [0, 0];
    const drag = d3.drag()
        .subject(function() {
            const r = projection.rotate();
            return {x: r[0] / 0.25, y: -r[1] / 0.25};
        })
        .on('drag', function(event) {
            const rotate = projection.rotate();
            projection.rotate([rotate[0] + event.dx * 0.25, rotate[1] - event.dy * 0.25]);
            svg.selectAll("path").attr("d", path);
        });

    svg.call(drag);

    // Ajouter un cercle derrière la sphère pour éviter le blanc sur blanc
    svg.append('circle')
        .attr('cx', projection.translate()[0])
        .attr('cy', projection.translate()[1])
        .attr('r', projection.scale())
        .attr('fill', 'lightgrey')
        .attr('stroke', 'dimgrey')
        .attr('stroke-opacity', 0.5)
        .attr('stroke-width', 0.5);

    svg.selectAll("path")
        .data(worldData.features)
        .enter().append("path")
        .attr("d", path)
        .attr("fill", d => {
            const countryIndicator = mapIndicators.find(c => c.Code === d.properties.ISO3_CODE);
            if (countryIndicator) {
                return countryIndicator[indicatorName] > 0 ? colorScale(countryIndicator[indicatorName]) : 'grey';
            } else {
                return 'lightgrey'; // Utilisez 'lightgrey' pour les pays sans données
            }
        })
        .attr("stroke", "dimgrey") // Contour constant pour tous les polygones
        .attr("stroke-width", 0.5)
        .attr("class", "country")
        .on('mouseover', function(event, d) {
            const countryIndicator = mapIndicators.find(c => c.Code === d.properties.ISO3_CODE);
            if (countryIndicator && countryIndicator[indicatorName] > 0) {
                d3.select(this)
                  .attr('fill', 'darkslateblue');

                const info = `<strong>${d.properties.NAME_FREN}</strong><br>PIB/hab : ${countryIndicator[indicatorName].toFixed(2)} USD`;
                showPopup(event, info);

                const graphIndicator = graphIndicators[d.properties.ISO3_CODE]?.Data?.PIB;
                if (graphIndicator) {
                    updateGraph(graphIndicator);
                }

                const suissePibHab = mapIndicators.find(c => c.Code === 'CHE')['2012_pib_hab'];
                const countryPibHab = countryIndicator['2012_pib_hab'];
                updateComparison(countryPibHab, suissePibHab, d.properties.NAME_FREN);
            }
        })
        .on('mouseout', function(event, d) {
            const countryIndicator = mapIndicators.find(c => c.Code === d.properties.ISO3_CODE);
            if (countryIndicator && countryIndicator[indicatorName] > 0) {
                d3.select(this)
                  .attr('fill', colorScale(countryIndicator[indicatorName]));

                hidePopup();
                clearGraph();
                clearComparison();
            }
        });

    function showPopup(event, info) {
        popup.style('display', 'block')
             .style('left', (event.pageX + 10) + 'px')
             .style('top', (event.pageY + 10) + 'px')
             .html(info);
    }

    function hidePopup() {
        popup.style('display', 'none');
    }

    function updateGraph(data) {
        const years = d3.range(1991, 2023); // De 1991 à 2022 inclus
        const values = years.map(year => data[year] / 1e9); // Convertir en milliards

        const margin = { top: 10, right: 20, bottom: 50, left: 50 };
        const width = graphContainer.node().getBoundingClientRect().width - margin.left - margin.right;
        const height = graphContainer.node().getBoundingClientRect().height - margin.top - margin.bottom;

        const x = d3.scaleLinear()
            .domain([1991, 2022])
            .range([0, width]);

        const y = d3.scaleLinear()
            .domain([0, Math.ceil(d3.max(values))])
            .range([height, 0]);

        const line = d3.line()
            .x((d, i) => x(years[i]))
            .y(d => y(d));

        graphContainer.selectAll('*').remove();

        const g = graphContainer.append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        g.append('g')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(x).ticks(10).tickFormat((d, i) => i % 2 === 0 ? d : "")); // Affiche une indication sur deux

        g.append('g')
            .call(d3.axisLeft(y).ticks(5).tickFormat(d3.format(".2s"))) // Adapter la légende pour éviter les nombres à virgule
            .append('text')
            .attr('fill', '#000')
            .attr('transform', 'rotate(-90)')
            .attr('y', -50)
            .attr('dy', '1em')
            .attr('text-anchor', 'middle')
            .attr('x', -height / 2) // Centrer le texte verticalement
            .text('PIB [Milliards de $]');

        g.append('path')
            .datum(values)
            .attr('fill', 'none')
            .attr('stroke', 'red')
            .attr('stroke-width', 1.5)
            .attr('d', line);
    }

    function clearGraph() {
        graphContainer.selectAll('*').remove();
    }

    function updateComparison(countryPibHab, suissePibHab, countryName) {
        const comparisonContainer = d3.select('#graph2');
        comparisonContainer.html('<h5>PIB par habitant en Suisse vs ' + countryName + '</h5>');
        // Aide de chatGPT pour toute la partie SVG que je ne connaissais pas du tout...
        // Prompt : Aide moi à dessiner un stickman en SVG, en expliquant le code de façon à ce que je puisse le comprendre et le modifier selon mes besoins
        const suisseStickman = `
            <svg width="12" height="24" viewBox="0 0 100 200" xmlns="http://www.w3.org/2000/svg">
              <circle cx="50" cy="20" r="20" fill="red"/>
              <line x1="50" y1="30" x2="50" y2="90" stroke="red" stroke-width="10"/>
              <line x1="50" y1="50" x2="20" y2="70" stroke="red" stroke-width="10"/>
              <line x1="50" y1="50" x2="80" y2="70" stroke="red" stroke-width="10"/>
              <line x1="50" y1="90" x2="30" y2="130" stroke="red" stroke-width="10"/>
              <line x1="50" y1="90" x2="70" y2="130" stroke="red" stroke-width="10"/>
            </svg>
        `;
        // Sur les bases de SVG que chatGTP m'a appris
        const suisseFlag = `
            <svg width="12" height="12" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
              <rect width="100" height="100" fill="#D52B1E"/>
              <rect x="35" y="10" width="30" height="80" fill="#FFFFFF"/>
              <rect x="10" y="35" width="80" height="30" fill="#FFFFFF"/>
            </svg>
        `;

        const darkslateblueStickman = `
            <svg width="12" height="24" viewBox="0 0 100 200" xmlns="http://www.w3.org/2000/svg">
              <circle cx="50" cy="20" r="20" fill="darkslateblue"/>
              <line x1="50" y1="30" x2="50" y2="90" stroke="darkslateblue" stroke-width="10"/>
              <line x1="50" y1="50" x2="20" y2="70" stroke="darkslateblue" stroke-width="10"/>
              <line x1="50" y1="50" x2="80" y2="70" stroke="darkslateblue" stroke-width="10"/>
              <line x1="50" y1="90" x2="30" y2="130" stroke="darkslateblue" stroke-width="10"/>
              <line x1="50" y1="90" x2="70" y2="130" stroke="darkslateblue" stroke-width="10"/>
            </svg>
        `;

        const numStickmen = Math.ceil(suissePibHab / countryPibHab); // Ratio suisse-pays

        const comparisonDiv = document.createElement('div');
        comparisonDiv.style.display = 'flex';
        comparisonDiv.style.flexWrap = 'wrap';
        comparisonDiv.style.alignItems = 'center';

        const suisseContainer = document.createElement('div');
        suisseContainer.innerHTML = suisseFlag + suisseStickman;
        suisseContainer.style.display = 'flex';
        suisseContainer.style.alignItems = 'center';
        suisseContainer.style.marginRight = '10px';
        comparisonDiv.appendChild(suisseContainer);

        const equalSign = document.createElement('span');
        equalSign.textContent = ' = ';
        equalSign.style.fontSize = '24px';
        equalSign.style.margin = '0 10px';
        equalSign.style.display = 'flex';
        equalSign.style.alignItems = 'center';
        comparisonDiv.appendChild(equalSign);

        // Eviter le surchargement lié a des valeurs très différentes entre la Suisse et les autres pays
        if (numStickmen > 45) {
            const stickmanContainer = document.createElement('div');
            stickmanContainer.innerHTML = darkslateblueStickman;
            stickmanContainer.style.margin = '2px';
            stickmanContainer.style.flexBasis = '8%'; // Pour limiterles stickmen par ligne
            comparisonDiv.appendChild(stickmanContainer);

            const stickmanCount = document.createElement('span');
            stickmanCount.textContent = ` x ${numStickmen}`;
            stickmanCount.style.fontSize = '24px';
            stickmanCount.style.marginLeft = '5px';
            stickmanCount.style.display = 'flex';
            stickmanCount.style.alignItems = 'center';
            comparisonDiv.appendChild(stickmanCount);
        } else {
            for (let i = 0; i < numStickmen; i++) {
                const stickmanContainer = document.createElement('div');
                stickmanContainer.innerHTML = darkslateblueStickman;
                stickmanContainer.style.margin = '2px';
                stickmanContainer.style.flexBasis = '8%'; // Pour limiter à 12 stickmen par ligne
                comparisonDiv.appendChild(stickmanContainer);
            }
        }

        comparisonContainer.node().appendChild(comparisonDiv);
    }

    function clearComparison() {
        d3.select('#graph2').html('<h5>PIB par habitant en Suisse vs d\'autres pays</h5><div></div>');
    }

    // Ajouter une colorbar à la carte
    const legendWidth = 300;
    const legendHeight = 20;
    const legendX = (svg.node().getBoundingClientRect().width - legendWidth) / 2;
    const legend = svg.append("g")
        .attr("id", "legend")
        .attr("transform", `translate(${legendX}, 570)`);

    const legendScale = d3.scaleLinear()
        .domain([0, maxVal])
        .range([0, legendWidth]);

    const legendAxis = d3.axisBottom(legendScale)
        .ticks(5)
        .tickFormat(d3.format("d")); // Adapte la légende pour éviter les nombres à virgule

    legend.call(legendAxis);

    legend.selectAll("rect")
        .data(d3.range(0, maxVal, maxVal / 10))
        .enter().append("rect")
        .attr("x", d => legendScale(d))
        .attr("y", -legendHeight)
        .attr("width", legendWidth / 10) // La largeur de chaque rectangle dans la légende
        .attr("height", legendHeight)
        .attr("fill", d => colorScale(d));

    // Ajouter une légende pour "No Data"
    const noDataX = legendX - 90;
    svg.append("rect")
        .attr("x", noDataX)
        .attr("y", 550)
        .attr("width", 30)
        .attr("height", 20)
        .attr('fill', 'grey');

    svg.append("text")
        .attr("x", noDataX + 35)
        .attr("y", 565)
        .attr('fill', 'black')
        .style('font-size', '12px')
        .text('No Data');

    // Ajouter la légende "PIB/habitant [$]" sous la légende
    svg.append("text")
        .attr("x", legendX + legendWidth / 2)
        .attr("y", 600)
        .attr('fill', 'black')
        .style('font-size', '12px')
        .style('text-anchor', 'middle')
        .text('PIB/habitant [$]');
});
