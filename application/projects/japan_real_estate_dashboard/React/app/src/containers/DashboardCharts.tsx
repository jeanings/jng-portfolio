import React, { useEffect, useRef } from 'react';
import { useAppSelector } from '../hooks';
import { fontHinaMincho, fontMPlus } from '../index';
import { Chart, LineElement, BarElement, ChartType, 
            Title, Legend, LegendItem, Tooltip, TooltipItem, CategoryScale, LinearScale,
            PointElement, ChartEvent, LineController, BarController, ChartDataset } from 'chart.js';
import { fadedColours, solidColours } from '../imports/chartColourSets';
import { DashboardChartsSet } from '../imports/languageSet';
import { chartConfigs, widthToFontSize, widthToLineSpacing } from '../imports/chartMediaQueryPresets';
import { LocaleProps } from '../slices/languageSlice';
import { DEV_LANG, getMediaQueries  } from '../App';
import './DashboardCharts.css';


// Register the required chart components.
Chart.register(LineElement, BarElement, PointElement, 
    LineController, BarController, CategoryScale, LinearScale, 
    Title, Legend, Tooltip);



const DashboardCharts: React.FC = () => {
    /* --------------------------------------------------------------------------
        Chart.js component that builds charts on regions addition and removal. 
        Subscribes to {data}, {selection}, {language} states.
    -------------------------------------------------------------------------- */
    // Dispatch, selector hooks.
    const selectState = useAppSelector(state => state.selection);
    const dataState = useAppSelector(state => state.dataApi);
    // Chart refs.
    const refLineChartContainer = useRef<any>(null);
    const refLineChart = useRef<any>(null);
    const refBarChartContainer = useRef<any>(null);
    const refBarChart = useRef<any>(null);
    // Get language (can't get charts to work well with language state)
    const hrefBase = window.location.href;
    const hrefEN = process.env.REACT_APP_HREF_EN;
    const hrefJP = process.env.REACT_APP_HREF_JP;
    const localhost = process.env.REACT_APP_LOCALHOST;
    const viewportWidth = window.innerWidth;
    const locale: LocaleProps["lang"] = hrefBase === hrefEN
        ? 'en'
        : hrefBase === hrefJP
            ? 'jp'
            : hrefBase === localhost
                ? DEV_LANG      // set for dev
                : 'jp';     // placeholder, ignore


    useEffect(() => {
        /* -------------------------------------------------
            Instantiate chartjs canvas on initial render.
        ------------------------------------------------- */
        if (refLineChart.current === null) {
            // Require title, axes font to load first.
            fontMPlus.load(null, 4000)
                .then(function() {
                    refLineChart.current = new Chart(refLineChartContainer.current, {
                        type: 'line',
                        data: linePriceData,
                        options: linePriceOptions,
                        plugins: [noDataNotify]
                    });

                    refBarChart.current = new Chart(refBarChartContainer.current, {
                        type: 'bar',
                        data: barCountData,
                        options: barCountOptions
                    });
                }, function() {
                    console.error("Charts font 'M Plus' timed out.");
                });
        }
    }, []);


    useEffect(() => {
        /* -----------------------------------
            Update charts' data sets.
            Build when selection increases.
        ----------------------------------- */
        if (refLineChart.current) {
            // Array lengths for state-selected and chart-drawn elements.
            let chartDataSets: Array<ChartDataSetProps | null> = refLineChart.current.data.datasets;
            let toBeDrawnDataLength: number = selectState.count;
            let drawnDataLength: number = refLineChart.current.data.datasets.length !== undefined
                ? refLineChart.current.data.datasets.length : 0;
            // Arrays for drawn elements.
            let drawnElementsNames: Array<string> = [];
            let drawnFadedColours: Array<string> = [];
            let drawnSolidColours: Array<string> = [];
        
            
            // Get names and colours of drawn elements.
            chartDataSets.forEach(dataSet => {
                if (dataSet) {
                    drawnElementsNames.push(dataSet.label);
                    
                    if (dataSet.borderColor) {
                        drawnSolidColours.push(dataSet.borderColor);
                    }

                    if (dataSet.backgroundColor) {
                        drawnFadedColours.push(dataSet.backgroundColor);
                    }
                }
            });

            if (toBeDrawnDataLength !== 0 && toBeDrawnDataLength >= drawnDataLength) {
                // Build chart data on selection increment.
                let regionDataSet = buildChartDataSet(drawnElementsNames)!;

                // Add colour options to make data set ready for Chartjs.
                let chartDataSet = transformDataSet(regionDataSet, drawnFadedColours)!;

                // Push to chart data.
                refLineChart.current.data.datasets.push(chartDataSet.price);
                refBarChart.current.data.datasets.push(chartDataSet.count);

            } else if (toBeDrawnDataLength !==0 && toBeDrawnDataLength < drawnDataLength) {
                // Remove unselected region element from charts.
                const removalTarget: string = selectState.prevRemoved !== null
                    ? selectState.prevRemoved : '';

                refLineChart.current.data.datasets.forEach((dataSet: ChartDataset, index: number) => {
                    if (dataSet.label === removalTarget) {
                        refLineChart.current.data.datasets.splice(index, 1);
                        refBarChart.current.data.datasets.splice(index, 1)
                    }
                });                
            } else if (toBeDrawnDataLength === 0) {
                refLineChart.current.data.datasets = [];
                refBarChart.current.data.datasets = [];
            }
            
            // Redraw charts.
            refLineChart.current.update();
            refBarChart.current.update();
        }
    });


    /* =========================================
                Line chart configs.
    ========================================= */

    // X axis labels shared with bar chart.
    var xAxisYearNum: Array<string> = [
        '2010', '2011', '2012', '2013', '2014', 
        '2015', '2016', '2017', '2018', '2019', 
        '2020'
    ];
    const xAxisYears = xAxisYearNum.map(yearNum => yearNum.concat(DashboardChartsSet[locale].xAxis));
    

    const linePriceData = {
        labels: xAxisYears,
        datasets: []
    };


    // Chart grid elements options.
    const linePriceOptionElements = {
        line: {
            borderWidth: getChartMediaQuery(viewportWidth, chartConfigs.line.elements.line.borderWidth),
            fill: false,
            spanGaps: false             // Misrepresents data, so keep at 'false'
        },
        point: {
            pointStyle: 'crossRot',
            radius: getChartMediaQuery(viewportWidth, chartConfigs.line.elements.point.radius),
            borderWidth: getChartMediaQuery(viewportWidth, chartConfigs.line.elements.point.borderWidth),
            hoverBorderWidth: getChartMediaQuery(viewportWidth, chartConfigs.line.elements.point.hoverBorderWidth),
            hoverRadius: getChartMediaQuery(viewportWidth, chartConfigs.line.elements.point.hoverRadius),
            hitRadius: getChartMediaQuery(viewportWidth, chartConfigs.line.elements.point.hitRadius)                // Increases proximity range of hover.
        }
    };


    // Axes elements options.
    const linePriceOptionScales = {
        x: {
            display: true,
            // grid: {
            //     color: '#9c9c9c'
            // },
            ticks: {
                font: {
                    family: "'M PLUS 1p', sans-serif",
                    size: getChartMediaQuery(viewportWidth, chartConfigs.line.scales.x.tickSize)            // Font size in px.
                }
            }
        },
        y: {
            display: true,
            ticks: {
                font: {
                    family: "'M PLUS 1p', sans-serif",
                    size: getChartMediaQuery(viewportWidth, chartConfigs.line.scales.y.tickSize) 
                }
            }
        }
    };
    
    
    // Chart UI elements options.
    const linePriceOptionPlugins = {
        title: {
            display: true,
            text: DashboardChartsSet[locale].linePriceOptionPlugins.title,
            padding: {
                bottom: getChartMediaQuery(viewportWidth, chartConfigs.line.plugins.title.paddingBottom) 
            },
            font: {
                family: "'Kaisei Opti', serif",
                size: getChartMediaQuery(viewportWidth, chartConfigs.line.plugins.title.fontSize),               // Font size in px.
                weight: 'normal'
            },
            color: '#0c3f42'
        },
        legend: {
            display: true,
            position: 'bottom' as 'bottom',
            labels: {
                padding: getChartMediaQuery(viewportWidth, chartConfigs.line.plugins.legend.labels.padding),            // Adds vertical space between legend items
                boxHeight: getChartMediaQuery(viewportWidth, chartConfigs.line.plugins.legend.labels.box.height),          // Height of coloured box in px.
                boxWidth: getChartMediaQuery(viewportWidth, chartConfigs.line.plugins.legend.labels.box.width),
                font: {
                    family: "'M PLUS 1p', sans-serif",
                    size: getChartMediaQuery(viewportWidth, chartConfigs.line.plugins.legend.labels.fontSize)
                }
            },
            onClick: handleLegendClick, // Syncs both charts' clicks under Line's
            onHover: handleLegendHover, // Changes cursor into pointer
            onLeave: handleLegendLeave  // Undo above
        },
        tooltip: {
            backgroundColor: '#0c3f4290',
            caretSize: getChartMediaQuery(viewportWidth, chartConfigs.line.plugins.tooltip.caret.size),
            caretPadding: getChartMediaQuery(viewportWidth, chartConfigs.line.plugins.tooltip.caret.padding),
            cornerRadius: getChartMediaQuery(viewportWidth, chartConfigs.line.plugins.tooltip.cornerRadius),
            displayColors: true,
            intersect: false,           // Tooltip shows when in proximity of point
            multiKeyBackground: '#00000000',
            padding: getChartMediaQuery(viewportWidth, chartConfigs.line.plugins.tooltip.padding),
            position: 'average' as 'average',
            titleFont: {
                family: "'M PLUS 1p', sans-serif",
                size: getChartMediaQuery(viewportWidth, chartConfigs.line.plugins.tooltip.titleFontSize)
            },
            bodyFont: {
                family: "'M PLUS 1p', sans-serif",
                size: getChartMediaQuery(viewportWidth, chartConfigs.line.plugins.tooltip.bodyFontSize)
            },
            yAlign: 'bottom' as 'bottom'
        }
    };


    // Main options object.
    const linePriceOptions = {
        elements: linePriceOptionElements,
        maintainAspectRatio: false,         // Important for responsiveness
        plugins: linePriceOptionPlugins,
        responsive: true,
        scales: linePriceOptionScales
    }
    

    /* =============================================
                    Bar chart configs.
    ============================================= */

    const barCountData = {
        labels: xAxisYears,
        datasets: []
    };


    // Axes elements options.
    const barCountOptionScales = {
        x: {
            display: true,
            stacked: true,
            ticks: {
                font: {
                    family: "'M PLUS 1p', sans-serif",
                    size: getChartMediaQuery(viewportWidth, chartConfigs.bar.scales.x.tickSize)       // Font size in px.
                }
            }
        },
        y: {
            display: true,
            stacked: true,
            ticks: {
                font: {
                    family: "'M PLUS 1p', sans-serif",
                    size: getChartMediaQuery(viewportWidth, chartConfigs.bar.scales.y.tickSize)
                }
            }
        }
    };


    // Chart UI elements options.
    const barCountOptionPlugins = {
        title: {
            display: true,
            text: DashboardChartsSet[locale].barCountOptionPlugins.title,
            padding: {
                top: getChartMediaQuery(viewportWidth, chartConfigs.bar.plugins.title.padding.top),
                bottom: getChartMediaQuery(viewportWidth, chartConfigs.bar.plugins.title.padding.bottom)
            },
            font: {
                family: "'Kaisei Opti', serif",
                size: getChartMediaQuery(viewportWidth, chartConfigs.bar.plugins.title.fontSize),               // Font size in px.
                weight: 'normal'
            },
            color: '#0c3f42'
        },
        legend: {
            display: false
        },
        tooltip: {
            backgroundColor: '#0c3f4290',
            caretSize: getChartMediaQuery(viewportWidth, chartConfigs.bar.plugins.tooltip.caretSize),
            cornerRadius: getChartMediaQuery(viewportWidth, chartConfigs.bar.plugins.tooltip.cornerRadius),
            displayColors: true,
            intersect: true,
            multiKeyBackground: '#00000000',
            padding: getChartMediaQuery(viewportWidth, chartConfigs.bar.plugins.tooltip.padding),
            position: 'average' as 'average',
            titleFont: {
                family: "'M PLUS 1p', sans-serif",
                size: getChartMediaQuery(viewportWidth, chartConfigs.bar.plugins.tooltip.titleFontSize)
            },
            bodyFont: {
                family: "'M PLUS 1p', sans-serif",
                size: getChartMediaQuery(viewportWidth, chartConfigs.bar.plugins.tooltip.bodyFontSize)
            },
            footerFont: {
                family: "'M PLUS 1p', sans-serif",
                weight: 'normal',
                size: getChartMediaQuery(viewportWidth, chartConfigs.bar.plugins.tooltip.footerFontSize)
            },
            yAlign: 'bottom' as 'bottom',
            callbacks: {
                footer: barCountSum     // Adds a total count on each bar
            },
            
        }
    };


    // Main options object.
    const barCountOptions = {
        maintainAspectRatio: false,         // Important for responsiveness
        plugins: barCountOptionPlugins,
        responsive: true,
        scales: barCountOptionScales
    };


    /* ===========================================
                    Helper functions
    =========================================== */

    function getSelectedDataSet(regionName: string, props: StateDataSetProps, dataSetRaw: any) {
        /* -------------------------------------------------------------------------
            Builds array of data points of a region item for rendering in charts.
        ------------------------------------------------------------------------- */
        let dataSetArray: DataSetArrayProps;
        let data;

        const yearRange: Array<string> = [
            '2010', '2011', '2012', '2013', '2014', '2015', '2016', '2017', '2018', '2019', '2020'
        ];
        const categoryMap: {[key: string]: string} = {
            'level 1': 'prefectures',
            'level 2': 'cities',
            'level 3': 'districts',
        };
        
        
        // Initial point of chaining to retrieve correct level of data.
        // Retrieves 'regions' data.
        if (Object.keys(props.partOf).length === 0) {
            data = dataSetRaw[props.category][regionName];
        } else {
            data = dataSetRaw[props.partOf['level 1']!.category][props.partOf['level 1']!.name];
        }

        // Retrieves 'prefectures' data.
        if (props.partOf['level 1']) {
            let targetCategory = categoryMap['level 1'];
            let targetName = props.partOf['level 2'] !== undefined
                ? props.partOf['level 2']!.name
                : regionName;

            data = getLevelData(props.category, regionName, targetCategory, targetName, data);
        }

        // Retrieves 'cities' data.
        if (props.partOf['level 2']) {
            let targetCategory = categoryMap['level 2'];
            let targetName = props.partOf['level 3'] !== undefined
                ? props.partOf['level 3']!.name
                : regionName;

            data = getLevelData(props.category, regionName, targetCategory, targetName, data);
        }

        // Retrieves 'districts' data.
        if (props.partOf['level 3']) {
            let targetCategory = categoryMap['level 3'];
            let targetName = props.partOf['level 4'] !== undefined
                ? props.partOf['level 4']!.name
                : regionName;

            data = getLevelData(props.category, regionName, targetCategory, targetName, data);
        }

        let yAxisCombinedData: Array<any> = [];
        let xAxisYears: Array<string> = [];
        // Build separate arrays for x-axis (year) and y-axis (data points).
        for (const [year, dataObj] of Object.entries(data.transactYear)) {
            const yearObj = {[year]: dataObj};

            yAxisCombinedData.push(yearObj);
            xAxisYears.push(year);
        }

        // Build array of missing years (if any).
        let missingYears: Array<string> = yearRange.filter(function(year: any) {
            return xAxisYears.indexOf(year) === -1;
        });

        // Fill in all empty years for chart to (not) render.
        missingYears.forEach((year: string) => {
            const missingYearObj = {
                [year]: {
                    'count': null,
                    'priceMean': null
                }
            };

            yAxisCombinedData.push(missingYearObj);
        });

        // Prepare array by sorting year in ascending order.
        yAxisCombinedData.sort((a, b) => (
            Object.keys(a) > Object.keys(b) ? 1 : -1
        ));

        let priceMeanData: Array<number | null> = [];
        let countData: Array<number | null> = [];
        // Separate into 'count' and 'price' data sets. 
        yAxisCombinedData.forEach(dataSet => {
            for (const value of Object.values(dataSet)) {
                let dataPoint = value as DataSetProps;

                countData.push(dataPoint.count);
                priceMeanData.push(dataPoint.priceMean);
            }
        });

        // Bundle combined sets of cleaned data for the region. 
        dataSetArray = {
            'id': regionName, 
            'price': priceMeanData, 
            'count': countData
        };
        

        function getLevelData(selfCategory: string, selfName: string, 
            targetCategory: string, targetName: string, data: any) {
            /* --------------------------------------------
                Helper: dives deeper into dataSet object.
            --------------------------------------------- */
            let category: string = '';
            let name: string = '';

            if (selfCategory === targetCategory) {
                category = selfCategory;
                name = selfName;
            } else {
                category = targetCategory;
                name = targetName;
            }

            return data[category][name];
        }

        return dataSetArray;
    }


    function buildChartDataSet(names: Array<string>) {
        /* ---------------------------------------------
            Build base data set for requested region.
        --------------------------------------------- */
        let request = dataState.currentOptions;
        let dataExists = dataState.collections[request.collection][request.options];
        let dataSetRaw: any = typeof(dataExists) !== 'undefined' ? dataExists : null;
        let selectedDataSet: DataSetArrayProps;

        // Build each {data} set(s) of {selection} for charts.
        if (dataSetRaw) {
            for (const [dummyLevel, regionObjs] of Object.entries(selectState.selected)) {
                for (const [regionName, props] of Object.entries(regionObjs as StateDataSetProps)) {
                    if (names.length === 0 || names.includes(regionName) === false) {
                        // Build for region that isn't currently drawn in charts.
                        selectedDataSet = getSelectedDataSet(regionName, props, dataSetRaw) as DataSetArrayProps;
                        
                        return selectedDataSet;
                    }
                }
            }
        }
    }


    function transformDataSet(regionItem: DataSetArrayProps, drawnFadedColours: Array<string>) {
        /* ---------------------------------------------------
            Transform data sets to Chartjs' requirements.
            Adds colour options to line and point elements.
        --------------------------------------------------- */
        for (let i = 0; i < fadedColours.length; i++) {
            const useFaded: string = fadedColours[i];
            const useSolid: string = solidColours[i];


            if (drawnFadedColours.length >= fadedColours.length) {
                // When user's number of selections exceed colours in set.
                const randomSolid = randomHsl() as string;
                const randomFaded = randomSolid.replace(/1[)]/, '0.7)');

                // For line chart.
                let priceRegionalData: ChartDataSetProps = {
                    'label': regionItem.id,
                    'data': regionItem.price,
                    'borderColor': randomSolid,
                    'backgroundColor': randomFaded,
                };
        
                // For bar chart.
                let countRegionalData: ChartDataSetProps = {
                    'label': regionItem.id,
                    'data': regionItem.count,
                    'backgroundColor': randomFaded
                };
                
                // Return as combined object.
                let chartDataSet: RegionSetProps = {
                    'price': priceRegionalData,
                    'count': countRegionalData
                };

                return chartDataSet;
            } else if (drawnFadedColours.includes(useFaded) === true) {
                continue;
            } else if (drawnFadedColours.includes(useFaded) === false) {
                // For line chart.
                let priceRegionalData: ChartDataSetProps = {
                    'label': regionItem.id,
                    'data': regionItem.price,
                    'borderColor': useSolid,
                    'backgroundColor': useFaded,
                };
        
                // For bar chart.
                let countRegionalData: ChartDataSetProps = {
                    'label': regionItem.id,
                    'data': regionItem.count,
                    'backgroundColor': useFaded
                };
                
                // Return as combined object.
                let chartDataSet: RegionSetProps = {
                    'price': priceRegionalData,
                    'count': countRegionalData
                };

                return chartDataSet;
            }
        }


        function randomHsl() {
            /* ---------------------------
                Random colour generator. hsla(235, 100%, 50%, .5)
            --------------------------- */
            const hue: string = Math.floor((Math.random() * 360)).toString();
            const saturation: string = getRandomIntInclusive(70, 99).toString() + '%';
            const lightness: string = getRandomIntInclusive(35, 70).toString() + '%';
            const alpha: string = '1';

            const hslaValue: string = 
                'hsla'.concat('(',
                    hue, ',',
                    saturation, ',',
                    lightness, ',',
                    alpha, ')'
                );

            return hslaValue;
        }


        function getRandomIntInclusive(min: number, max: number) {
            /* ------------------------------------------------------------------------------------------------
                https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random 
            ------------------------------------------------------------------------------------------------ */
            min = Math.ceil(min);
            max = Math.floor(max);
            return Math.floor(Math.random() * (max - min + 1) + min); //The maximum is inclusive and the minimum is inclusive
        }
    }


    function getChartMediaQuery(viewportWidth: number, preset: ChartMediaQueryPreset) {
        /* ----------------------------------------------------------------------------
            Helper function that spits out the preset values for responsive styling.
        ---------------------------------------------------------------------------- */
        const queryConstant: number = 
            viewportWidth <= 1000
                ? preset.isPortrait
                : viewportWidth <= 1700
                    ? preset.isPortableLandscape
                    : viewportWidth <= 2000
                        ? preset.isScreen1080
                        : viewportWidth <= 2800
                            ? preset.isScreen1440
                            : viewportWidth >= 2900
                                ? preset.isScreen4k
                                : preset.fallback;
    
        return queryConstant;
    }


    /* ==============================================
            Chartjs event, callback functions
    ============================================== */

    function barCountSum(tooltipItems: Array<TooltipItem<ChartType>>) {
        /* -----------------------------------------
            Adds a simple total count on each bar.
        ----------------------------------------- */
        let sum = 0;

        tooltipItems.forEach(function(tooltipItem) {
            sum += tooltipItem.parsed.y;
        });

        return DashboardChartsSet[locale].barCountSum + sum;
    }


    function handleLegendClick(event: ChartEvent, legendItem: LegendItem) {
        /* -----------------------------------------------------------
            Change mouse cursor into pointer on hover.
            Reference: https://stackoverflow.com/a/45343334/14181584
        ----------------------------------------------------------- */
        let itemIndex: number = legendItem.datasetIndex;
        
        if (refLineChart.current !== null && refBarChart.current !== null) {
            let lineMeta = refLineChart.current.getDatasetMeta(itemIndex);   // Same data set, index
            let barMeta = refBarChart.current.getDatasetMeta(itemIndex);     // otherwise don't do this.
            
            // Toggle un/hide on click.
            if (lineMeta.hidden === null) {
                lineMeta.hidden = !lineMeta.hidden;
                barMeta.hidden = !barMeta.hidden;
            } else {
                lineMeta.hidden = null;
                barMeta.hidden = null;
            }

            // Redraw charts.
            refLineChart.current.update();
            refBarChart.current.update();
        }
    }


    function handleLegendHover(event: any) {
        /* ----------------------------------------------
            Change mouse cursor into pointer on hover.
        ---------------------------------------------- */
        event.native.target.style.cursor = 'pointer';
    }


    function handleLegendLeave(event: any) {
        /* -------------------------------------------------
            Change mouse cursor back to default on leave.
        ------------------------------------------------- */
        event.native.target.style.cursor = 'default';
    }


    /* ===========================================
                Custom Chartjs plugins
    =========================================== */

    const noDataNotify = {
        /* ------------------------------------------------------------------------
            Chartjs custom plugin to display "no data" text when none is loaded.
            Reference: https://stackoverflow.com/questions/60183607/
            API: https://www.chartjs.org/docs/next/developers/plugins.html
                 https://www.chartjs.org/docs/latest/api/interfaces/Plugin.html
        ------------------------------------------------------------------------ */
        id: 'noDataNotify',
        afterDraw: (chart: Chart) => {
            let dataSet: number = chart.data.datasets.length;
            const fontSize = getChartMediaQuery(viewportWidth, widthToFontSize) + 'px';
            const ySpacingMultiple = getChartMediaQuery(viewportWidth, widthToLineSpacing);
            const preferredFont: string = "'Hina Mincho', serif";
            const fallbackFont: string = "'Meiryo'";

            // Require notification text to load first.
            fontHinaMincho.load(null, 4000)
                .then(function() {
                    drawGraph(preferredFont);
                }, function() {
                    console.error("'Hina Mincho' font download timed out.  Using fallback 'Meiryo'.");
                    drawGraph(fallbackFont);
                });

            
            function drawGraph(fontStr: string) {
                /* ---------------------------------------
                    Helper: draws graph with preset text.
                --------------------------------------- */
                if (dataSet === 0) {
                    let ctx = chart.ctx;
                    ctx.save();

                    // Canvas drawing styling.
                    const xInitial: number = chart.width / 6;
                    const xMax: number = chart.width / 1.2;
                    const yInitial: number = chart.height / 4.20;
                    

                    ctx.textAlign = 'start';
                    ctx.textBaseline = 'middle';
                    ctx.fillStyle = '#828a81';
                    // 'M PLUS 1p', san-serif    // too clinical
                    // 'Kaisei Opti', serif      // too bold
                    ctx.font = fontSize.concat(fontStr);

                    const lines: Array<string> = DashboardChartsSet[locale].noDataNotify;

                    // Draw text lines.
                    lines.forEach((line: string, index:number) => {
                        const ySpacing: number = yInitial + index * ySpacingMultiple;

                        ctx.fillText(
                            line,                                   // text
                            xInitial,                               // x position
                            index === 0 ? yInitial : ySpacing,      // y position
                            xMax                                    // x constraint
                        );
                    });

                    ctx.restore();
                }
            }
        }
    }


    /* -----------------------------------------------------
                        CSS classes
    ------------------------------------------------------*/
    const classBase: string = 'Dashboard_charts';



    return (
        <div className={getMediaQueries(classBase, locale)}>
            <div className={getMediaQueries(classBase.concat('_line-price'), locale)}>

                <canvas id="Dashboard_charts_line-price_chart" 
                        ref={refLineChartContainer} />

            </div>
            <div className={getMediaQueries(classBase.concat('_bar-count'), locale)}>

                <canvas id="Dashboard_charts_bar-count_chart"
                        ref={refBarChartContainer} />
                        
            </div>
            <div className={getMediaQueries(classBase.concat('_citation'), locale)}>

                {DashboardChartsSet[locale].citation.lineA}
                <a href="https://www.land.mlit.go.jp/webland/servlet/MainServlet" target="_blank">
                    {DashboardChartsSet[locale].citation.link}
                </a>
                {DashboardChartsSet[locale].citation.lineB}

            </div>
        </div>    
    );
}


/* ==========================================
                Types setting
========================================== */

interface StateDataSetProps {
    [index: string]: string | any
    category: string,
    partOf: {
        'level 1': PartOfProps | null,
        'level 2': PartOfProps | null,
        'level 3': PartOfProps | null,
        'level 4': PartOfProps | null,
    }
}

type PartOfProps = {
    [index: string]: string | any,
    category: string,
    name: string
}

type DataSetArrayProps = {
    'id': string, 
    'price': Array<number | null>,
    'count': Array<number | null>
}

type DataSetProps = {
    [index: string]: string | any,
    count: number | null,
    priceMean: number | null
}

type RegionSetProps = {
    [index: string]: string | any,
    price: ChartDataSetProps,
    count: ChartDataSetProps
}

type ChartDataSetProps = {
    [index: string]: string | any,
    label: string,
    data: Array<number | null>,
    backgroundColor?: string,
    borderColor?: string
}

type ChartMediaQueryPreset = {
    isPortrait: number,
    isPortableLandscape: number,
    isScreen1080: number,
    isScreen1440: number,
    isScreen4k: number,
    fallback: number
};


export default DashboardCharts;