import React, { useEffect, useRef } from 'react';
import { useAppSelector } from '../hooks';
import { Chart, LineElement, BarElement, ChartType, 
            Title, Legend, LegendItem, Tooltip, TooltipItem, CategoryScale, LinearScale,
            PointElement, ChartEvent, LineController, BarController, ChartDataset } from 'chart.js';
import { fadedColours, solidColours } from '../imports/chartColourSets';
import './DashboardCharts.css';

Chart.register(LineElement, BarElement, PointElement, 
    LineController, BarController, CategoryScale, LinearScale, 
    Title, Legend, Tooltip);



const DashboardCharts: React.FC = () => {
    /* -------------------------------------------------------------------------------
        Chart.js component that subscribes to {data} and {selection} states.
    ------------------------------------------------------------------------------- */
    // Dispatch, selector hooks.
    const selectState = useAppSelector(state => state.selection);
    const dataState = useAppSelector(state => state.data);
    // Chart refs.
    const refLineChartContainer = useRef<any>(null);
    const refLineChart = useRef<any>(null);
    const refBarChartContainer = useRef<any>(null);
    const refBarChart = useRef<any>(null);


    useEffect(() => {
        /* -------------------------------------------------
            Instantiate chartjs canvas on initial render.
        ------------------------------------------------- */
        if (refLineChart.current === null) {
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

            } else if (toBeDrawnDataLength < drawnDataLength) {
                // Remove unselected region element from charts.
                const removalTarget: string = selectState.prevRemoved !== null
                    ? selectState.prevRemoved : '';
                // console.log('--removing: ', removalTarget, refLineChart.current);

                refLineChart.current.data.datasets.forEach((dataSet: ChartDataset, index: number) => {
                    if (dataSet.label === removalTarget) {
                        refLineChart.current.data.datasets.splice(index, 1);
                        refBarChart.current.data.datasets.splice(index, 1)
                    }
                });                
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
    const xAxisYears: Array<string> = [
        '2010年', '2011年', '2012年', '2013年', '2014年', 
        '2015年', '2016年', '2017年', '2018年', '2019年', 
        '2020年'
    ];
    

    const linePriceData = {
        labels: xAxisYears,
        datasets: []
    };


    // Chart grid elements options.
    const linePriceOptionElements = {
        line: {
            borderWidth: 3,
            fill: false,
            spanGaps: false             // Misrepresents data, so keep at 'false'
        },
        point: {
            pointStyle: 'crossRot',
            radius: 7,
            borderWidth: 1,
            hoverBorderWidth: 3,
            hoverRadius: 12,
            hitRadius: 8                // Increases proximity range of hover.
        }
    };


    // Axes elements options.
    const linePriceOptionScales = {
        x: {
            display: true,
            ticks: {
                font: {
                    family: "'M PLUS 1p', sans-serif",
                    size: 12            // Font size in px.
                }
            }
        },
        y: {
            display: true,
            ticks: {
                font: {
                    family: "'M PLUS 1p', sans-serif",
                    size: 12
                }
            }
        }
    };
    
    
    // Chart UI elements options.
    const linePriceOptionPlugins = {
        title: {
            display: true,
            text: '取引平均価格（万円）',
            padding: {
                bottom: 20
            },
            font: {
                family: "'M PLUS 1p', sans-serif",
                size: 24,               // Font size in px.
                weight: 'normal'
            },
            color: '#483d8b'
        },
        legend: {
            display: true,
            position: 'bottom' as 'bottom',
            labels: {
                padding: 15,            // Adds vertical space between legend items
                boxHeight: 13,          // Height of coloured box in px.
                boxWidth: 30,
                font: {
                    family: "'M PLUS 1p', sans-serif",
                    size: 15
                }
            },
            onClick: handleLegendClick, // Syncs both charts' clicks under Line's
            onHover: handleLegendHover, // Changes cursor into pointer
            onLeave: handleLegendLeave  // Undo above
        },
        tooltip: {
            backgroundColor: '#311d6990',
            caretSize: 8,
            caretPadding: 10,
            cornerRadius: 3,
            displayColors: true,
            intersect: false,           // Tooltip shows when in proximity of point
            multiKeyBackground: '#00000000',
            padding: 10,
            position: 'average' as 'average',
            titleFont: {
                family: "'M PLUS 1p', sans-serif",
                size: 15
            },
            bodyFont: {
                family: "'M PLUS 1p', sans-serif",
                size: 13
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
                    size: 12        // Font size in px.
                }
            }
        },
        y: {
            display: true,
            stacked: true,
            ticks: {
                font: {
                    family: "'M PLUS 1p', sans-serif",
                    size: 12
                }
            }
        }
    };


    // Chart UI elements options.
    const barCountOptionPlugins = {
        title: {
            display: true,
            text: '取引件数',
            padding: {
                top: 20,
                bottom: 20
            },
            font: {
                family: "'M PLUS 1p', sans-serif",
                size: 24,               // Font size in px.
                weight: 'normal'
            },
            color: '#483d8b'
        },
        legend: {
            display: false
        },
        tooltip: {
            backgroundColor: '#311d6990',
            caretSize: 8,
            cornerRadius: 3,
            displayColors: true,
            intersect: true,
            multiKeyBackground: '#00000000',
            padding: 10,
            position: 'average' as 'average',
            titleFont: {
                family: "'M PLUS 1p', sans-serif",
                size: 15
            },
            bodyFont: {
                family: "'M PLUS 1p', sans-serif",
                size: 13
            },
            footerFont: {
                family: "'M PLUS 1p', sans-serif",
                weight: 'normal',
                size: 14
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
        let dataExists = dataState.collections?.[request.collection]?.[request.options];
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

            if (drawnFadedColours.includes(useFaded) === true) {
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

        return '総計: ' + sum;
    }


    function handleLegendClick(event: ChartEvent, legendItem: LegendItem) {
        /* -----------------------------------------------------------
            Change mouse cursor into pointer on hover.
            Reference: https://stackoverflow.com/a/45343334/14181584
        ----------------------------------------------------------- */
        let itemIndex: number = legendItem.datasetIndex;
        
        if (refLineChart.current !== null && refBarChart.current !== null) {
            let lineMeta = refLineChart.current.getDatasetMeta(itemIndex);   // Same data set --> index,
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
            if (dataSet === 0) {
                let ctx = chart.ctx;
                ctx.save();

                // Canvas drawing styling.
                ctx.textAlign = 'start';
                ctx.textBaseline = 'middle';
                ctx.font = "24px DotGothic16";
                ctx.fillStyle = "gray";

                // Text drawn when no data is selected.
                // Using it as a readme on how to use app.
                ctx.fillText(
                    "Sorry! データが指定されていません",
                    chart.width / 4.2,
                    chart.height / 4.1,
                    chart.width / 1.2
                );
                ctx.fillText(
                    "検索条件を確認してください😔",
                    chart.width / 4.2,
                    chart.height / 3.1,
                    chart.width / 1.2
                );
                ctx.fillText(
                    "１）検索条件を選んでセーブして💾",
                    chart.width / 3.7,
                    chart.height / 2.08,
                    chart.width / 1.2
                );
                ctx.fillText(
                    "２）🌏のタブを押して興味ある地域を選定、",
                    chart.width / 3.7,
                    chart.height / 1.79,
                    chart.width / 1.2
                );
                ctx.fillText(
                    "３）データはここに表示します😎",
                    chart.width / 3.7,
                    chart.height / 1.565,
                    chart.width / 1.2
                );
                ctx.restore();
            }
        }
    }


    return (
        <div className="Dashboard_charts">
            <div className="Dashboard_charts_line-price">
                <canvas id="Dashboard_charts_line-price_chart" 
                        ref={refLineChartContainer} />
            </div>
            <div className="Dashboard_charts_bar-count">
                <canvas id="Dashboard_charts_bar-count_chart"
                        ref={refBarChartContainer} />
            </div>
            <div className="Dashboard_charts_citation">
                ※資料： <a href="https://www.land.mlit.go.jp/webland/servlet/MainServlet" target="_blank">国土交通省</a>から作成。
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


export default DashboardCharts;