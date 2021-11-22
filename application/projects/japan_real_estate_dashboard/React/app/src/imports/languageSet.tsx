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
            'house': 'single-family house',
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
        } 
    },
    'jp': {
        'backBtn': {
            'generalReg': '地域全体',
            'toReturn': 'に戻る'
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


