export const regionCoords: RegionCoordsProps = {
    'en': {
        'Hokkaido': {
            ne: {lng: 149.0267, lat: 46.6586},
            sw: {lng: 139.2318, lat: 39.3838},
            centre: {lng: 144.1293, lat: 43.1292},
            zoom: 5.82
            },
        'Tohoku': {
            ne: {lng: 143.6525, lat: 41.8189},
            sw: {lng: 136.7416, lat: 36.3647},
            centre: {lng: 140.1971, lat: 39.1446},
            zoom: 6.54
        },
        'Kanto': {
            ne: {lng: 141.1903, lat: 37.1999},
            sw: {lng: 137.9070, lat: 34.4917},
            centre: {lng: 139.5487, lat: 35.8573},
            zoom: 7.40
        },
        'Chubu': {
            ne: {lng: 139.9911, lat: 38.6366},
            sw: {lng: 134.5788, lat: 34.2066},
            centre: {lng: 137.2850, lat: 36.4532},
            zoom: 6.68
        },
        'Kinki': {
            ne: {lng: 137.1053, lat: 35.8625},
            sw: {lng: 134.1147, lat: 33.3578},
            centre: {lng: 135.6100, lat: 34.6196},
            zoom: 7.54
        },
        'Chugoku': {
            ne: {lng: 134.7425, lat: 36.3609},
            sw: {lng: 130.6972, lat: 32.9757},
            centre: {lng: 132.7199, lat: 34.6856},
            zoom: 7.10
        },
        'Shikoki': {
            ne: {lng: 134.9304, lat: 34.7762},
            sw: {lng: 131.7623, lat: 32.0858},
            centre: {lng: 133.3464, lat: 33.4414},
            zoom: 7.45
        },
        'Kyushu': {
            ne: {lng: 134.5844, lat: 34.8763},
            sw: {lng: 121.9396, lat: 23.6803},
            centre: {lng: 128.2620, lat: 29.4324},
            zoom: 5.46
        }
    },
    'jp': {
        '北海道': {
            ne: {lng: 149.0267, lat: 46.6586},
            sw: {lng: 139.2318, lat: 39.3838},
            centre: {lng: 144.1293, lat: 43.1292},
            zoom: 5.82
        },
        '東北': {
            ne: {lng: 143.6525, lat: 41.8189},
            sw: {lng: 136.7416, lat: 36.3647},
            centre: {lng: 140.1971, lat: 39.1446},
            zoom: 6.54
        },
        '関東': {
            ne: {lng: 141.1903, lat: 37.1999},
            sw: {lng: 137.9070, lat: 34.4917},
            centre: {lng: 139.5487, lat: 35.8573},
            zoom: 7.40
        },
        '中部': {
            ne: {lng: 139.9911, lat: 38.6366},
            sw: {lng: 134.5788, lat: 34.2066},
            centre: {lng: 137.2850, lat: 36.4532},
            zoom: 6.68
        },
        '近畿': {
            ne: {lng: 137.1053, lat: 35.8625},
            sw: {lng: 134.1147, lat: 33.3578},
            centre: {lng: 135.6100, lat: 34.6196},
            zoom: 7.54
        },
        '中国': {
            ne: {lng: 134.7425, lat: 36.3609},
            sw: {lng: 130.6972, lat: 32.9757},
            centre: {lng: 132.7199, lat: 34.6856},
            zoom: 7.10
        },
        '四国': {
            ne: {lng: 134.9304, lat: 34.7762},
            sw: {lng: 131.7623, lat: 32.0858},
            centre: {lng: 133.3464, lat: 33.4414},
            zoom: 7.45
        },
        '九州': {
            ne: {lng: 134.5844, lat: 34.8763},
            sw: {lng: 121.9396, lat: 23.6803},
            centre: {lng: 128.2620, lat: 29.4324},
            zoom: 5.46
        }
    }
};


// Types setting.
export interface RegionCoordsProps {
    [index: string]: string | any,
}
