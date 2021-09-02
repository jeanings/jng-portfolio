import React from 'react';
import { useAppSelector } from '../hooks';
import { Line, Bar } from 'react-chartjs-2';
import './DashboardCharts.css';
import { ChartType, TooltipItem } from 'chart.js';



const DashboardCharts: React.FC = () => {
    const selectState = useAppSelector(state => state.selection.selected);
    const dataState = useAppSelector(state => state.data);
    const dataOptions = dataState.currentOptions;
    let dataSet: any;
    let chartData: Array<any> = [];


    let dataExists = dataState.collections?.[dataOptions.collection]?.[dataOptions.options];
    if (typeof(dataExists) !== 'undefined') {
        dataSet = dataExists;
    } 

    if (dataSet !== undefined) {
        // Build selected data set for charts.
        for (const [level, itemsObj] of Object.entries(selectState)) {
            const selectedDataSet = getSelectedDataSet(itemsObj as ChartDataSetProps);
            selectedDataSet.forEach(item => {
                chartData.push(item);
            });
        }   
    }
    

    // Helper: builds array of sales data for rendering in charts.
    function getSelectedDataSet(items: ChartDataSetProps) {
        let dataSetArray: Array<DataSetArrayProps> = [];

        for (const [item, props] of Object.entries(items)) {
            const yearRange: Array<string> = [
                '2010', '2011', '2012', '2013', '2014', '2015', '2016', '2017', '2018', '2019', '2020'
            ];
            let data;
            
            // Initial point of chaining to retrieve correct level of data.
            // Retrieves 'regions' data.
            if (Object.keys(props.partOf).length === 0) {
                data = dataSet[props.category][item];
            } else {
                data = dataSet[props.partOf['level 1'].category][props.partOf['level 1'].name];
            }

            const categoryMap: {[key: string]: string} = {
                'level 1': 'prefectures',
                'level 2': 'cities',
                'level 3': 'districts',
            }

            // Retrieves 'prefectures' data.
            if (props.partOf['level 1']) {
                let targetCategory = categoryMap['level 1'];
                let targetName = props.partOf['level 2'] !== undefined
                    ? props.partOf['level 2'].name
                    : item;

                data = getLevelData(props.category, item, targetCategory, targetName, data);
            }

            // Retrieves 'cities' data.
            if (props.partOf['level 2']) {
                let targetCategory = categoryMap['level 2'];
                let targetName = props.partOf['level 3'] !== undefined
                    ? props.partOf['level 3'].name
                    : item;

                data = getLevelData(props.category, item, targetCategory, targetName, data);
            }

            // Retrieves 'districts' data.
            if (props.partOf['level 3']) {
                let targetCategory = categoryMap['level 3'];
                let targetName = props.partOf['level 4'] !== undefined
                    ? props.partOf['level 4'].name
                    : item;

                data = getLevelData(props.category, item, targetCategory, targetName, data);
            }


            // Build separate arrays for year and actual data.
            let dataArray: Array<any> = [];
            let dataYears: Array<string> = [];
            for (const [year, dataObj] of Object.entries(data.transactYear)) {
                const yearObj = {[year]: dataObj};
                dataArray.push(yearObj);
                dataYears.push(year);
            }

            // Check for any missing years.
            let missingYears = yearRange.filter(function(year: any) {
                return dataYears.indexOf(year) === -1;
            });

            // Fill in all missing years.
            missingYears.forEach(year => {
                const yearObj = {
                    [year]: {
                        'count': null,
                        'priceMean': null
                    }
                }
                dataArray.push(yearObj);
            });


            // Prepare array: sort by year in ascending order.
            dataArray.sort((a, b) => (
                Object.keys(a) > Object.keys(b) ? 1 : -1
            ));

            // Convert data structure to one that's readable by chartjs.
            let priceMeanData: Array<number | null> = [];
            let countData: Array<number | null> = [];
            dataArray.forEach(item => {
                for (const value of Object.values(item)) {
                    let dataType = value as DataTypeProp;
                    countData.push(dataType.count);
                    priceMeanData.push(dataType.priceMean);
                }
            });

            dataSetArray.push({
                'id': item, 
                'price': priceMeanData, 
                'count': countData
            });
        }


        // Helper: dives deeper into dataSet object.
        function getLevelData(selfCategory: string, selfName: string, 
            targetCategory: string, targetName: string, data: any) {
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


    // Colour set for chart items.
    const solidAlpha: string = '0.95' + ')';
    const solidColours: Array<string> = [
        'rgba(18,17,18,' + solidAlpha,     // black
        'rgba(119,45,134,' + solidAlpha,   // purple, wine
        'rgba(93,31,227,' + solidAlpha,    // purple
        'rgba(85,126,244,' + solidAlpha,   // blue-sky
        'rgba(85,198,244,' + solidAlpha,   // blue, robin egg
        'rgba(154,187,187,' + solidAlpha,  // blue-green, sea foam
        'rgba(213,210,137,' + solidAlpha,  // yellow-green, dry grass
        'rgba(226,166,62,' + solidAlpha,   // orange-yellow, egg yolk
        'rgba(246,109,55,' + solidAlpha,   // orange, candied orange 
        'rgba(255,8,0,' + solidAlpha,      // red
        'rgba(251,47,226,' + solidAlpha,   // pink, hot
        'rgba(253,144,125,' + solidAlpha,  // pink, lemonade
        'rgba(255,241,23,' + solidAlpha,   // yellow, lemon
        'rgba(168,186,24,' + solidAlpha,   // green, bright moss
        'rgba(46,110,26,' + solidAlpha,    // green, British racing
        'rgba(12,62,107,' + solidAlpha     // blue, navy
    ];
    const fadedAlpha: string = '0.70' + ')';
    const fadedColours: Array<string> = [
        'rgba(18,17,18,' + fadedAlpha,     // black
        'rgba(119,45,134,' + fadedAlpha,   // purple, wine
        'rgba(93,31,227,' + fadedAlpha,    // purple
        'rgba(85,126,244,' + fadedAlpha,   // blue-sky
        'rgba(85,198,244,' + fadedAlpha,   // blue, robin egg
        'rgba(154,187,187,' + fadedAlpha,  // blue-green, sea foam
        'rgba(213,210,137,' + fadedAlpha,  // yellow-green, dry grass
        'rgba(226,166,62,' + fadedAlpha,   // orange-yellow, egg yolk
        'rgba(246,109,55,' + fadedAlpha,   // orange, candied orange 
        'rgba(255,8,0,' + fadedAlpha,      // red
        'rgba(251,47,226,' + fadedAlpha,   // pink, hot
        'rgba(253,144,125,' + fadedAlpha,  // pink, lemonade
        'rgba(255,241,23,' + fadedAlpha,   // yellow, lemon
        'rgba(168,186,24,' + fadedAlpha,   // green, bright moss
        'rgba(46,110,26,' + fadedAlpha,    // green, British racing
        'rgba(12,62,107,' + fadedAlpha     // blue, navy
    ];


    // Transform chart data into suitable data structure for chartjs.
    let priceDataSet: Array<any> = [];
    let countDataSet: Array<any> = [];

    chartData.forEach((item, index) => {
        let priceDataPoint = {
            'label': item.id,
            'data': item.price,
            'borderColor': solidColours[index],
            'backgroundColor': fadedColours[index]
        };

        let countDataPoint = {
            'label': item.id,
            'data': item.count,
            'backgroundColor': fadedColours[index]
        };

        priceDataSet.push(priceDataPoint);
        countDataSet.push(countDataPoint);
    });
   

    // Chart configs.
    const xAxisYears: Array<string>= [
        '2010年', '2011年', '2012年', '2013年', '2014年', '2015年',
        '2016年', '2017年', '2018年', '2019年', '2020年'
    ];
    const linePriceData = {
        labels: xAxisYears,
        datasets: priceDataSet
    }

    const linePriceOptions = {
        elements: {
            line: {
                borderWidth: 3,
                fill: false,
                // spanGaps: true           // Misrepresents data
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
                    font: {
                        // family: 'Kaisei Opti',
                        // size: 13
                    },
                    padding: 15             // Adds vertical space between legend items
                }
            },
            tooltip: {
                backgroundColor: '#311d6990',
                caretSize: 8,
                caretPadding: 10,
                cornerRadius: 3,
                displayColors: true,
                intersect: false,
                padding: 10,
                position: 'average'
            }
        },
        responsive: true,
        titleFontSize: 20
    }
    

    const barCountData = {
        labels: xAxisYears,
        datasets: countDataSet
    }

    const barCountSum = (tooltipItems: Array<TooltipItem<ChartType>>) => {
        let sum = 0;

        tooltipItems.forEach(function(tooltipItem) {
            sum += tooltipItem.parsed.y;
        });
        return '総計: ' + sum;
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
                display: false              // Using the same one from line chart
            },
            tooltip: {
                backgroundColor: '#311d6990',
                callbacks: {
                    footer: barCountSum     // Adds a total amount on each bar
                },
                caretSize: 8,
                cornerRadius: 3,
                displayColors: true,
                intersect: true,
                padding: 10,
                position: 'average'
            }
        },
        responsive: true,
        scales: {
            x: {
                stacked: true,
            },
            y: {
                stacked: true,
            },
        }
    }


    return (
        <div className="Dashboard_charts">
            <div className="Dashboard_charts_line-price">
                <Line
                    data={linePriceData}
                    options={linePriceOptions} />
            </div>
            <div className="Dashboard_charts_bar-count">
                <Bar
                    data={barCountData}
                    options={barCountOptions} />
            </div>
        </div>    
    );
}


// Types setting.
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

type PartOfObj = {
    [index: string] : string | any
    category: string,
    name: string
}

type DataTypeProp = {
    [index: string] : string | any,
    count: number | null,
    priceMean: number | null
}


export default DashboardCharts;