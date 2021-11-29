export const HeaderSet = {
    'en': {
        'main': {
            'title': 'Real Estate',
            'sub': 'JAPANESE MARKET DATA'
        },
        'year': {
            'unit': ''
        }
    },
    'jp': {
        'main': {
            'title': '不動産取引',
            'sub': 'ダッシュボード'
        },
        'year': {
            'unit': '年'
        }
    }
};


export const SidebarRegSelectSet = {
    'en': {
        'header': 'Selection',
        'region': 'Regions',
        'prefecture': 'Prefectures',
        'city': 'Cities',
        'district': 'Districts'
    },
    'jp': {
        'header': '選択した地域',
        'region': '地方',
        'prefecture': '都道府県',
        'city': '市区町村',
        'district': '地区'
    }
};


export const SidebarOptSet = {
    'en': {
        'buildingType': 'Category',
        'buildingMatch': {
            'house': 'detached house',
            'condo': 'apartment, condo'
        },
        'stationDist': 'Nearest station on foot',
        'stationDistSelect': {
            'under': 'under',
            'above': 'over',
            'min': 'min'
        },
        'material': 'Building structure',
        'materialMatch': {
            'wood': 'wooden',
            'stFrame': 'steel frame',
            'reCon': 'rebar concrete',
            'con':　'concrete block'
        },
        'age': 'Building age',
        'ageSelect': {
            'before': 'before',
            'year': ''
        },
        'floorArea': 'Floor area',
        'floorSelect': {
            'above': 'above'
        },
        'onSaving': 'Search'
    },
    'jp': {
        'buildingType': '住宅種類',
        'buildingMatch': {
            'house': '一戸建て',
            'condo': 'マンション等'
        },
        'stationDist': '駅徒歩分',
        'stationDistSelect': {
            'under': '分以下',
            'above': '分以上',
            'min': '分'
        },
        'material': '建物構造',
        'materialMatch': {
            'wood': '木造',
            'stFrame': '鉄骨造',
            'reCon': '鉄筋コンクリート造',
            'con':　'ブロック造'
        },
        'age': '建築年',
        'ageSelect': {
            'before': '年前',
            'year': '年'
        },
        'floorArea': '面積',
        'floorSelect': {
            'above': '以上'
        },
        'onSaving': '検索！'
    }
};


export const SidebarRegSet = {
    'en': {
        'backBtn': {
            'generalReg': 'regions',
            'toReturn': 'Return to'
        },
        'noDataNotify': {
            'note': 'No data found for requested options. Please give these a try:',
            'houseRec': {
                'type': 'detached house',
                'material': 'wooden', 
                'station': 'under 15min', 
                'age': '1980~1990', 
                'area': '120~130m²'
            },
            'condoRec': {
                'type': 'apartment',
                'material': 'rebar concrete',
                'station': 'under 15min',
                'age': '2000~2010',
                'area': '90~100m²'
            }
        }
    },
    'jp': {
        'backBtn': {
            'generalReg': '地域全体',
            'toReturn': 'に戻る'
        },
        'noDataNotify': {
            'note': '申し訳ありませんが、その条件のデータは存在しませんでした。ぜひ以下の条件を試してみてください。',
            'houseRec': {
                'type': '一戸建て',
                'material': '木造', 
                'station': '15分以下', 
                'age': '1980～1990年', 
                'area': '120～130m²'
            },
            'condoRec': {
                'type': 'マンション',
                'material': '鉄筋コンクリート造',
                'station': '15分以下',
                'age': '2000～2010年',
                'area': '90～100m²'
            }
        }
    }
};


export const DashboardChartsSet = {
    'en': {
        'xAxis': '',
        'linePriceOptionPlugins': {
            'title': 'Average transaction price (¥10,000)'
        },
        'barCountOptionPlugins': {
            'title': 'Number of transactions'
        },
        'barCountSum': 'Total: ',
        'noDataNotify': [
            "Sorry! Unable to draw any data...😔",
            "There will be combinations with no data,",
            "so please try a different set of options.",
            "1) Pick search conditions via sliders",
            "2) Switch to 🌏 tab and select regions of interest",
            "3) Colourful lines and bars will be graphed! 😎"
        ],
        'citation': {
            'lineA': '*Data from： ',
            'link': 'Japan MLIT',
            'lineB': ''
        }
    },
    'jp': {
        'xAxis': '年',
        'linePriceOptionPlugins': {
            'title': '取引平均価格（万円）'
        },
        'barCountOptionPlugins': {
            'title': '取引件数'
        },
        'barCountSum': '総計: ',
        'noDataNotify': [
            "Sorry! データが指定されていません😔",
            "データがない場合はありますので",
            "他の検索条件を選んでください。",
            "１）検索条件を選んで",
            "２）🌏のタブを押して興味ある地域を選定、",
            "３）データはここに表示します😎"
        ],
        'citation': {
            'lineA': '※資料： ',
            'link': '国土交通省',
            'lineB': 'から作成。',
        }
    }
};







// Types setting.
export interface RegionCoordsProps {
    [index: string]: string | any,
};


