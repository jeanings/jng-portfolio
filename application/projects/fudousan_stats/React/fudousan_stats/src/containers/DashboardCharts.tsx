import React from 'react';
import { useAppSelector } from '../hooks';
import { Line, Bar } from 'react-chartjs-2';
import './DashboardCharts.css';



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

            const categoryMap: { [key: string]: string} = {
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


        // Helper: dives deeper in to dataSet object.
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


    const colours = [
        'rgba(119,45,134,1)', 'rgba(93,31,227,1))', 'rgba(85,126,244,1)', 'rgba(85,126,244,1)', 'rgba(85,198,244,1)', 'rgba(154,187,187,1)',
        'rgba(213,210,137,1)', 'rgba(226,166,62,1)', 'rgba(246,109,55,1)', 'rgba(255,8,0,1)', 'rgba(251,47,226,1)'
    ]
    const bgColours = [
        'rgba(119,45,134,0.5)', 'rgba(93,31,227,0.5)', 'rgba(85,126,244,0.5)', 'rgba(85,126,244,0.5)', 'rgba(85,198,244,0.5)', 'rgba(154,187,187,0.5)',
        'rgba(213,210,137,0.5)', 'rgba(226,166,62,0.5)', 'rgba(246,109,55,0.5)', 'rgba(255,8,0,0.5)', 'rgba(251,47,226,0.5)'
    ]

    // Transform chart data into suitable data structure for chartjs.
    const xAxisYears: Array<string>= [
        '2010年', '2011年', '2012年', '2013年', '2014年', '2015年',
        '2016年', '2017年', '2018年', '2019年', '2020年'
    ];
    
    let priceDataSet: Array<any> = [];
    let countDataSet: Array<any> = [];
    chartData.forEach((item, index) => {
        let priceDataPoint = {
            'label': item.id,
            'data': item.price,
            'borderColor': colours[index],
            'backgroundColor': bgColours[index]
        };

        let countDataPoint = {
            'label': item.id,
            'data': item.count,
            'borderColor': colours[index],
            'backgroundColor': bgColours[index]
        };

        priceDataSet.push(priceDataPoint);
        countDataSet.push(countDataPoint);
    });
   

    // Chart configs.
    const linePriceData = {
        labels: xAxisYears,
        datasets: priceDataSet
    }

    const linePriceOptions = {
        elements: {
            line: {
                cubicInterpolationMode: 'monotone',
                fill: false,
                // spanGaps: true,
                tension: 0.3
            },
            point: {
                borderWidth: 0,
                pointStyle: 'circle',
                radius: 4,
            }
        },
        maintainAspectRatio: true,
        plugins: {
            title: {
                display: true,
                text: '取引平均価格（万円）'
            },
            tooltip: {
                caretSize: 8,
                cornerRadius: 3,
                displayColors: true,
                intersect: false,
                position: 'nearest'
            }
        },
        responsive: true,
        scales: {
            yAxes: [
                {
                    ticks: {
                        beginAtZero: true,
                    },
                },
            ],
        }
    }
    
    const barCountData = {
        labels: xAxisYears,
        datasets: countDataSet
    }
    
    const barCountOptions = {
        maintainAspectRatio: true,
        plugins: {
            title: {
                display: true,
                text: '取引件数'
            },
            tooltip: {
                caretSize: 8,
                cornerRadius: 3,
                displayColors: true,
                // intersect: false,
                position: 'nearest'
            }
        },
        responsive: true,
        scales: {
            x: {
                stacked: true,
                // ticks: {
                //     beginAtZero: true
                // }
            },
            y: {
                stacked: true,
                // ticks: {
                //     beginAtZero: true,
                // },
            },
        
        }
    }


    return (
        <>
            <div className="Dashboard_chart_line-price">
                <Line
                    data={linePriceData}
                    options={linePriceOptions} />
            </div>
            <div className="Dashboard_chart_bar-count">
                <Bar
                    data={barCountData}
                    options={barCountOptions} />
            </div>
        </>    
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