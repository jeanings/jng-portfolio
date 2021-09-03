import React, { useRef } from 'react';
import { useAppSelector } from '../hooks';
import { Bar, Line } from 'react-chartjs-2';
import { Chart, ChartEvent, ChartType, LegendItem, TooltipItem } from 'chart.js';
import { fadedColours, solidColours } from '../imports/chartColourSets';
import './DashboardCharts.css';



const DashboardCharts: React.FC = () => {
    /* -------------------------------------------------------------------------------
        Chart.js component that subscribes to {data} and {selection} states.
    ------------------------------------------------------------------------------- */
    const selectState = useAppSelector(state => state.selection.selected);
    const dataState = useAppSelector(state => state.data);
    const dataOptions = dataState.currentOptions;
    const refLine = useRef<any | null>(null);
    const refBar = useRef<any | null>(null);
    let dataSetRaw: any;
    let combinedChartData: Array<any> = [];

    // Check for data in state.
    let dataExists = dataState.collections?.[dataOptions.collection]?.[dataOptions.options];
    if (typeof(dataExists) !== 'undefined') {
        dataSetRaw = dataExists;
    } 

    // Build each {data} data set(s) of {selection} for charts.
    if (dataSetRaw !== undefined) {
        for (const [level, regionObj] of Object.entries(selectState)) {
            const selectedDataSet = getSelectedDataSet(regionObj as ChartDataSetProps);
            selectedDataSet.forEach(regionDataSet => {
                combinedChartData.push(regionDataSet);
            });
        }   
    }

    // Transform data structure for chartjs.
    let priceChartDataSet: Array<any> = [];
    let countChartDataSet: Array<any> = [];

    combinedChartData.forEach((regionItem, index) => {
        let priceRegionalData = {
            'label': regionItem.id,
            'data': regionItem.price,
            'borderColor': solidColours[index],
            'backgroundColor': fadedColours[index]
        };

        let countRegionalData = {
            'label': regionItem.id,
            'data': regionItem.count,
            'backgroundColor': fadedColours[index]
        };

        priceChartDataSet.push(priceRegionalData);
        countChartDataSet.push(countRegionalData);
    });


    /* =========================================
                Line chart configs.
    ========================================= */

    // Chart configs.
    const xAxisYears: Array<string>= [
        '2010年', '2011年', '2012年', '2013年', '2014年', 
        '2015年', '2016年', '2017年', '2018年', '2019年', 
        '2020年'
    ];
    
    const linePriceData = {
        labels: xAxisYears,
        datasets: priceChartDataSet
    }

    const linePriceOptions = {
        elements: {
            line: {
                borderWidth: 3,
                fill: false,
                spanGaps: false             // Misrepresents data, so keep at 'false'
            },
            point: {
                pointStyle: 'crossRot',
                radius: 7,
                hoverRadius: 12, 
                borderWidth: 1,
                hoverBorderWidth: 3,
                hitRadius: 8
            }
        },
        maintainAspectRatio: false,         // Important for responsiveness
        plugins: {
            title: {
                display: true,
                text: '取引平均価格（万円）',
                padding: {
                    bottom: 20
                },
                font: {
                    family: 'Kaisei Opti',
                    size: 18,
                    weight: 'normal'
                },
                color: '#483d8b'
            },
            legend: {
                position: 'bottom',
                labels: {
                    padding: 15             // Adds vertical space between legend items
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
                padding: 10,
                position: 'average'
            }
        },
        responsive: true,
        titleFontSize: 20,
    }
    

    /* =============================================
                    Bar chart configs.
    ============================================= */
    const barCountData = {
        labels: xAxisYears,
        datasets: countChartDataSet
    }

    const barCountOptions = {
        maintainAspectRatio: false,         // Important for responsiveness
        plugins: {
            title: {
                display: true,
                text: '取引件数',
                padding: {
                    top: 20,
                    bottom: 20
                },
                font: {
                    family: 'Kaisei Opti',
                    size: 18,
                    weight: 'normal'
                },
                color: '#483d8b'
            },
            legend: {
                display: false              // Taken over by and synced with Line's clicks
            },
            tooltip: {
                backgroundColor: '#311d6990',
                callbacks: {
                    footer: barCountSum     // Adds a total count on each bar
                },
                caretSize: 8,
                cornerRadius: 3,
                displayColors: true,
                intersect: true,
                padding: 10,
                position: 'average'
            },
        },
        responsive: true,
        scales: {
            x: {stacked: true},
            y: {stacked: true}
        }
    }


    /* ===========================================
                    Helper functions
    =========================================== */

    function getSelectedDataSet(regionObj: ChartDataSetProps) {
        /* -------------------------------------------------------------------------
            Builds array of data points of a region item for rendering in charts.
        ------------------------------------------------------------------------- */
        let dataSetArray: Array<DataSetArrayProps> = [];

        for (const [regionName, props] of Object.entries(regionObj)) {
            const yearRange: Array<string> = [
                '2010', '2011', '2012', '2013', '2014', '2015', '2016', '2017', '2018', '2019', '2020'
            ];
            const categoryMap: {[key: string]: string} = {
                'level 1': 'prefectures',
                'level 2': 'cities',
                'level 3': 'districts',
            }
            let data = null;
            
            // Initial point of chaining to retrieve correct level of data.
            // Retrieves 'regions' data.
            if (Object.keys(props.partOf).length === 0) {
                data = dataSetRaw[props.category][regionName];
            } else {
                data = dataSetRaw[props.partOf['level 1'].category][props.partOf['level 1'].name];
            }

            // Retrieves 'prefectures' data.
            if (props.partOf['level 1']) {
                let targetCategory = categoryMap['level 1'];
                let targetName = props.partOf['level 2'] !== undefined
                    ? props.partOf['level 2'].name
                    : regionName;

                data = getLevelData(props.category, regionName, targetCategory, targetName, data);
            }

            // Retrieves 'cities' data.
            if (props.partOf['level 2']) {
                let targetCategory = categoryMap['level 2'];
                let targetName = props.partOf['level 3'] !== undefined
                    ? props.partOf['level 3'].name
                    : regionName;

                data = getLevelData(props.category, regionName, targetCategory, targetName, data);
            }

            // Retrieves 'districts' data.
            if (props.partOf['level 3']) {
                let targetCategory = categoryMap['level 3'];
                let targetName = props.partOf['level 4'] !== undefined
                    ? props.partOf['level 4'].name
                    : regionName;

                data = getLevelData(props.category, regionName, targetCategory, targetName, data);
            }

            // Build separate arrays for x-axis (year) and y-axis (data points).
            let dataArray: Array<any> = [];
            let dataYears: Array<string> = [];
            for (const [year, dataObj] of Object.entries(data.transactYear)) {
                const yearObj = {[year]: dataObj};
                dataArray.push(yearObj);
                dataYears.push(year);
            }

            // Check for any year(s) with no data.
            let missingYears = yearRange.filter(function(year: any) {
                return dataYears.indexOf(year) === -1;
            });

            // Fill in all empty years for chart to (not) render.
            missingYears.forEach(year => {
                const yearObj = {
                    [year]: {
                        'count': null,
                        'priceMean': null
                    }
                }
                dataArray.push(yearObj);
            });

            // Prepare array by sorting year in ascending order.
            dataArray.sort((a, b) => (
                Object.keys(a) > Object.keys(b) ? 1 : -1
            ));

            // Convert data structure to one that's readable by chartjs.
            let priceMeanData: Array<number | null> = [];
            let countData: Array<number | null> = [];
            dataArray.forEach(item => {
                for (const value of Object.values(item)) {
                    let tempDataSet = value as DataSetProps;
                    countData.push(tempDataSet.count);
                    priceMeanData.push(tempDataSet.priceMean);
                }
            });

            dataSetArray.push({
                'id': regionName, 
                'price': priceMeanData, 
                'count': countData
            });
        }


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
        
        if (refLine.current !== null && refBar.current !== null) {
            let lineMeta = refLine.current.getDatasetMeta(itemIndex);   // Same data set --> index,
            let barMeta = refBar.current.getDatasetMeta(itemIndex);     // otherwise don't do this.
            
            // Toggle un/hide on click.
            if (lineMeta.hidden === null) {
                lineMeta.hidden = !lineMeta.hidden;
                barMeta.hidden = !barMeta.hidden;
            } else {
                lineMeta.hidden = null;
                barMeta.hidden = null;
            }
            // Update the charts.
            refLine.current.update();
            refBar.current.update();
        }
    }


    function handleLegendHover(event: any) {
        /* ----------------------------------------------
            Change mouse cursor into pointer on hover.
        ---------------------------------------------- */
        event.native.target.style.cursor = 'pointer';
    }


    function handleLegendLeave(event: any) {
        /* ----------------------------------------------
            Change mouse cursor into pointer on hover.
        ---------------------------------------------- */
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
                    chart.height / 3.8,
                    chart.width / 1.2
                );
                ctx.fillText(
                    "検索条件を確認してください😔",
                    chart.width / 4.2,
                    chart.height / 3.0,
                    chart.width / 1.2
                );
                ctx.fillText(
                    "１）検索条件を選んでセーブして💾",
                    chart.width / 3.9,
                    chart.height / 2.2,
                    chart.width / 1.2
                );
                ctx.fillText(
                    "２）🌏のタブを押して興味ある地域を選定、",
                    chart.width / 3.9,
                    chart.height / 1.875,
                    chart.width / 1.2
                );
                ctx.fillText(
                    "３）そのデータはここに表示します😎",
                    chart.width / 3.9,
                    chart.height / 1.63,
                    chart.width / 1.2
                );
                ctx.restore();
            }
        }
    }


    return (
        <div className="Dashboard_charts">
            <div className="Dashboard_charts_line-price">
                <Line
                    data={linePriceData}
                    options={linePriceOptions}
                    plugins={[noDataNotify]}
                    ref={refLine} />
            </div>
            <div className="Dashboard_charts_bar-count">
                <Bar
                    data={barCountData}
                    options={barCountOptions}
                    ref={refBar} />
            </div>
        </div>    
    );
}


/* ==========================================
                Types setting
========================================== */

interface ChartDataSetProps {
    [index: string] : string | any
    category: string,
    partOf: {
        'level 1': PartOfProps | null,
        'level 2': PartOfProps | null,
        'level 3': PartOfProps | null,
        'level 4': PartOfProps | null,
    }
}

type PartOfProps = {
    [index: string] : string | any,
    category: string,
    name: string
}

type DataSetArrayProps = {
    'id': string, 
    'price': Array<number | null>,
    'count': Array<number | null>
}

type DataSetProps = {
    [index: string] : string | any,
    count: number | null,
    priceMean: number | null
}


export default DashboardCharts;